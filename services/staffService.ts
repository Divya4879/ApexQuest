import { supabase } from './supabaseService';
import { notificationService } from './notificationService';
import { banService } from './banService';
import { agentAuthService } from './agentAuthService';

export interface ChannelAnalytics {
  id: string;
  name: string;
  emoji: string;
  post_count: number;
  total_likes: number;
  total_replies: number;
  last_activity: string;
  engagement_score: number;
}

export interface FlaggedPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  user_name: string;
  channel_name: string;
  created_at: string;
  flag_count: number;
  type: 'post' | 'reply';
}

export const staffService = {
  // Analytics for admin/mod - show ALL channels
  async getChannelAnalytics(): Promise<ChannelAnalytics[]> {
    if (!supabase) return [];

    // Get ALL channels first
    const { data: allChannels, error: channelsError } = await supabase
      .from('channels')
      .select('id, name, emoji')
      .order('name');

    if (channelsError) {
      console.error('Error fetching channels:', channelsError);
      return [];
    }

    // Get posts data for each channel
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id, channel_id, created_at, likes_count, replies_count');

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return [];
    }

    // Build analytics for all channels
    return allChannels.map(channel => {
      const channelPosts = postsData?.filter(post => post.channel_id === channel.id) || [];
      const totalLikes = channelPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
      const totalReplies = channelPosts.reduce((sum, post) => sum + (post.replies_count || 0), 0);
      const lastActivity = channelPosts.length > 0 
        ? Math.max(...channelPosts.map(p => new Date(p.created_at).getTime()))
        : 0;
      
      return {
        id: channel.id,
        name: channel.name,
        emoji: channel.emoji,
        post_count: channelPosts.length,
        total_likes: totalLikes,
        total_replies: totalReplies,
        last_activity: lastActivity > 0 ? new Date(lastActivity).toISOString() : '',
        engagement_score: totalLikes + totalReplies + channelPosts.length
      };
    }).sort((a, b) => b.engagement_score - a.engagement_score);
  },

  // Get flagged posts AND replies for mod/admin
  async getFlaggedPosts(): Promise<FlaggedPost[]> {
    if (!supabase) return [];

    // Get all flagged post/reply IDs
    const { data: flaggedIds, error: flagsError } = await supabase
      .from('post_flags')
      .select('post_id');

    if (flagsError) {
      console.error('Error fetching flags:', flagsError);
      return [];
    }

    if (!flaggedIds || flaggedIds.length === 0) {
      return [];
    }

    const ids = flaggedIds.map(f => f.post_id);
    const flaggedItems: FlaggedPost[] = [];

    // Get flagged posts
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        user_id,
        created_at,
        user:users(name),
        channel:channels(name)
      `)
      .in('id', ids)
      .eq('is_flagged', true);

    // Get flagged replies
    const { data: replies } = await supabase
      .from('replies')
      .select(`
        id,
        content,
        user_id,
        created_at,
        user:users(name),
        post:posts(title, channel:channels(name))
      `)
      .in('id', ids);

    // Add posts
    if (posts) {
      posts.forEach(post => {
        flaggedItems.push({
          id: post.id,
          title: post.title || 'Untitled Post',
          content: post.content,
          user_id: post.user_id,
          user_name: post.user?.name || 'Unknown',
          channel_name: post.channel?.name || 'Unknown',
          created_at: post.created_at,
          flag_count: 1,
          type: 'post'
        });
      });
    }

    // Add replies
    if (replies) {
      replies.forEach(reply => {
        flaggedItems.push({
          id: reply.id,
          title: `Reply to: ${reply.post?.title || 'Untitled Post'}`,
          content: reply.content,
          user_id: reply.user_id,
          user_name: reply.user?.name || 'Unknown',
          channel_name: reply.post?.channel?.name || 'Unknown',
          created_at: reply.created_at,
          flag_count: 1,
          type: 'reply'
        });
      });
    }

    // Sort by creation date (newest first)
    return flaggedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Moderator actions
  async warnUser(postId: string, userId: string, moderatorId: string, reason: string): Promise<void> {
    // 🔐 Auth0 for AI Agents - Authenticate mod agent
    const isAuthorized = await agentAuthService.validateAgentAction('mod', 'warn_user');
    if (!isAuthorized) {
      throw new Error('Moderator agent not authorized to warn users');
    }

    if (!supabase) throw new Error('Supabase not configured');

    // Create warning
    const { error: warningError } = await supabase
      .from('user_warnings')
      .insert({
        user_id: userId,
        post_id: postId,
        reason
      });

    if (warningError) throw warningError;

    // Check if user has 3 warnings in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: warnings, error: countError } = await supabase
      .from('user_warnings')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo);

    if (countError) throw countError;

    const warningCount = warnings?.length || 0;

    // Create warning notification
    try {
      await notificationService.createNotification(
        userId,
        'warning',
        'Content Warning',
        `Your content has been flagged: ${reason}. Warning ${warningCount}/3.`
      );
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    // Auto-ban if 3+ warnings
    if (warningCount >= 3) {
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (user?.email) {
        await banService.banUserByEmail(user.email, moderatorId, 'Automatic ban: 3 warnings in 30 days');
        console.log(`User ${userId} auto-banned for 3 warnings`);
      }
    }

    console.log(`🤖 Mod agent successfully warned user. Total warnings: ${warningCount}`);
  },

  async dismissFlag(postId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    // Remove flag
    const { error: updateError } = await supabase
      .from('posts')
      .update({ is_flagged: false })
      .eq('id', postId);

    if (updateError) throw updateError;

    // Remove flag records
    await supabase
      .from('post_flags')
      .delete()
      .eq('post_id', postId);
  },

  // Admin actions
  // Admin actions
  async banUser(userId: string, adminId: string, reason: string): Promise<void> {
    // 🔐 Auth0 for AI Agents - Authenticate admin agent
    const isAuthorized = await agentAuthService.validateAgentAction('admin', 'ban_user');
    if (!isAuthorized) {
      throw new Error('Admin agent not authorized to ban users');
    }

    // Get user email first
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (user?.email) {
      await banService.banUserByEmail(user.email, adminId, reason);
      console.log(`🤖 Admin agent successfully banned user: ${user.email}`);
    }
  },

  // Staff messaging
  async sendStaffMessage(fromId: string, toId: string, message: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    await notificationService.createNotification(
      toId,
      'warning', // Using warning type for staff messages
      'Staff Message',
      message
    );
  },

  // Message all users (for moderators)
  async messageAllUsers(fromId: string, message: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: users } = await supabase
      .from('users')
      .select('id')
      .neq('id', fromId); // Don't message yourself

    if (users) {
      for (const user of users) {
        await notificationService.createNotification(
          user.id,
          'warning',
          'Platform Announcement',
          message
        );
      }
    }
  },

  // Get staff users (admin/mod)
  async getStaffUsers(): Promise<any[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .in('role', ['admin', 'moderator']);

    if (error) {
      console.error('Error fetching staff:', error);
      return [];
    }

    return data || [];
  },

  // Get all users (for mod messaging)
  async getAllUsers(): Promise<any[]> {
    if (!supabase) return [];

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at');

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    // Get ban status for each user using Supabase
    const usersWithBanStatus = await Promise.all(
      (users || []).map(async (user) => {
        const banStatus = await banService.isEmailBanned(user.email);
        return {
          ...user,
          is_banned: banStatus.banned,
          ban_info: banStatus.ban || null
        };
      })
    );

    return usersWithBanStatus;
  },

  // Unban user (admin only)
  async unbanUser(userId: string, adminId: string): Promise<void> {
    // 🔐 Auth0 for AI Agents - Authenticate admin agent
    const isAuthorized = await agentAuthService.validateAgentAction('admin', 'unban_user');
    if (!isAuthorized) {
      throw new Error('Admin agent not authorized to unban users');
    }

    // Get user email first
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (user?.email) {
      await banService.unbanEmail(user.email);
      console.log(`🤖 Admin agent successfully unbanned user: ${user.email}`);
    }
  }
};
