import { createClient } from '@supabase/supabase-js';
import { banService } from './banService';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create client if both values are provided and valid
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase not configured properly. Please check your environment variables.');
}

export { supabase };

// Types
export interface User {
  id: string;
  auth0_id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin';
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  emoji: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  channel_id: string;
  title: string;
  content: string;
  tag: 'progress' | 'challenges' | 'wins' | 'miscellaneous';
  likes_count: number;
  replies_count: number;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  channel?: Channel;
}

export interface Reply {
  id: string;
  post_id: string;
  parent_reply_id?: string;
  user_id: string;
  content: string;
  level: number;
  likes_count: number;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: Reply[];
}

// User Services
export const userService = {
  async createOrUpdateUser(auth0User: any): Promise<User> {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Determine role based on email
    let role = 'user';
    if (auth0User.email === 'admin@apexquest.com') {
      role = 'admin';
    } else if (auth0User.email === 'mod@apexquest.com') {
      role = 'moderator';
    }

    // Only create default avatar if no picture from Gmail/Auth0 or if it's a Gravatar default
    let avatarUrl = auth0User.picture;
    
    // Check if it's a Gravatar default URL (these usually contain 'd=' parameter for default)
    const isGravatarDefault = avatarUrl && (
      avatarUrl.includes('gravatar.com') && 
      (avatarUrl.includes('d=') || avatarUrl.includes('default'))
    );
    
    if (!avatarUrl || isGravatarDefault) {
      // Create avatar with first 2 characters of email
      const emailInitials = auth0User.email.substring(0, 2).toUpperCase();
      const colors = ['6366f1', '8b5cf6', 'ec4899', 'f59e0b', '10b981', 'ef4444', '3b82f6', '84cc16'];
      const colorIndex = auth0User.email.charCodeAt(0) % colors.length;
      const bgColor = colors[colorIndex];
      
      avatarUrl = `https://ui-avatars.com/api/?name=${emailInitials}&background=${bgColor}&color=fff&size=200&bold=true`;
      console.log('Created initials avatar for', auth0User.email, ':', avatarUrl);
    } else {
      console.log('Using existing picture for', auth0User.email, ':', avatarUrl);
    }
    
    const { data, error } = await supabase
      .from('users')
      .upsert({
        auth0_id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name || auth0User.email,
        avatar_url: avatarUrl,
        role: role,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'auth0_id'
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-join new users to Channel Requests channel
    try {
      const { data: channelRequestsChannel } = await supabase
        .from('channels')
        .select('id')
        .eq('name', 'Channel Requests')
        .single();

      if (channelRequestsChannel) {
        await supabase
          .from('user_channels')
          .upsert({
            user_id: data.id,
            channel_id: channelRequestsChannel.id
          }, {
            onConflict: 'user_id,channel_id'
          });
      }
    } catch (error) {
      console.log('Failed to auto-join Channel Requests channel:', error);
    }

    return data;
  },

  async getUserByAuth0Id(auth0Id: string): Promise<User | null> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Channel Services
export const channelService = {
  async getAllChannels(): Promise<Channel[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getUserChannels(userId: string): Promise<Channel[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('user_channels')
      .select(`
        channel_id,
        channels (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(uc => uc.channels).filter(Boolean) || [];
  },

  async joinChannel(userId: string, channelId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('user_channels')
      .insert({
        user_id: userId,
        channel_id: channelId
      });

    if (error) throw error;
  },

  async leaveChannel(userId: string, channelId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('user_channels')
      .delete()
      .eq('user_id', userId)
      .eq('channel_id', channelId);

    if (error) throw error;
  }
};

// Post Services
export const postService = {
  async getChannelPosts(channelId: string, limit = 20): Promise<Post[]> {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty posts');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(*),
          channel:channels(*)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching posts:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Error in getChannelPosts:', err);
      return [];
    }
  },

  async createPost(post: Omit<Post, 'id' | 'likes_count' | 'replies_count' | 'is_flagged' | 'created_at' | 'updated_at'>): Promise<Post> {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Get user email and check if banned
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', post.user_id)
      .single();
    
    if (user?.email) {
      const banStatus = await banService.isEmailBanned(user.email);
      if (banStatus.banned && banStatus.ban) {
        throw new Error(`You are banned until ${banStatus.ban.expiresAt.toLocaleString()}. Reason: ${banStatus.ban.reason}`);
      }
    }
    
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select(`
        *,
        user:users(*),
        channel:channels(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async likePost(userId: string, postId: string): Promise<{ action: 'liked' | 'unliked' }> {
    if (!supabase) throw new Error('Supabase not configured');
    
    // First check if user already liked this post
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // User already liked, so unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);

      if (error) throw error;

      // Update likes count
      await supabase.rpc('decrement_post_likes', { post_id: postId });
      return { action: 'unliked' };
    } else {
      // User hasn't liked, so like
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: userId,
          post_id: postId
        });

      if (error) throw error;

      // Update likes count
      await supabase.rpc('increment_post_likes', { post_id: postId });
      return { action: 'liked' };
    }
  },

  async unlikePost(userId: string, postId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;

    // Update likes count
    await supabase.rpc('decrement_post_likes', { post_id: postId });
  },

  async deletePost(postId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },

  async flagPost(postId: string, userId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Update post to flagged
    const { error: updateError } = await supabase
      .from('posts')
      .update({ is_flagged: true })
      .eq('id', postId);

    if (updateError) throw updateError;

    // Log the flag action (optional - will fail silently if table doesn't exist)
    try {
      await supabase
        .from('post_flags')
        .insert({
          post_id: postId,
          flagged_by: userId,
          reason: 'inappropriate_content'
        });
    } catch (error) {
      console.log('Flag logging failed (table may not exist):', error);
    }
  }
};

// Reply Services
export const replyService = {
  async getPostReplies(postId: string): Promise<Reply[]> {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty replies');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('replies')
        .select(`
          *,
          user:users(*)
        `)
        .eq('post_id', postId)
        .eq('is_flagged', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        return [];
      }
      
      // Build nested reply structure
      const repliesMap = new Map<string, Reply>();
      const rootReplies: Reply[] = [];

      data?.forEach(reply => {
        reply.replies = [];
        repliesMap.set(reply.id, reply);
        
        if (!reply.parent_reply_id) {
          rootReplies.push(reply);
        }
      });

      data?.forEach(reply => {
        if (reply.parent_reply_id) {
          const parent = repliesMap.get(reply.parent_reply_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(reply);
          }
        }
      });

      return rootReplies;
    } catch (err) {
      console.error('Error in getPostReplies:', err);
      return [];
    }
  },

  async createReply(reply: Omit<Reply, 'id' | 'level' | 'likes_count' | 'is_flagged' | 'created_at' | 'updated_at'>): Promise<Reply> {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Get user email and check if banned
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', reply.user_id)
      .single();
    
    if (user?.email) {
      const banStatus = await banService.isEmailBanned(user.email);
      if (banStatus.banned && banStatus.ban) {
        throw new Error(`You are banned until ${banStatus.ban.expiresAt.toLocaleString()}. Reason: ${banStatus.ban.reason}`);
      }
    }
    
    const { data, error } = await supabase
      .from('replies')
      .insert(reply)
      .select(`
        *,
        user:users(*)
      `)
      .single();

    if (error) throw error;

    // Update replies count on post
    await supabase.rpc('increment_post_replies', { post_id: reply.post_id });

    return data;
  },

  async deleteReply(replyId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    // First get the reply to find the post_id
    const { data: reply } = await supabase
      .from('replies')
      .select('post_id')
      .eq('id', replyId)
      .single();

    // Delete the reply
    const { error } = await supabase
      .from('replies')
      .delete()
      .eq('id', replyId);

    if (error) throw error;

    // Update the post's reply count
    if (reply?.post_id) {
      await supabase.rpc('decrement_post_replies', { post_id: reply.post_id });
    }
  },

  async flagReply(replyId: string, userId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Check if user already flagged this reply
    const { data: existingFlag } = await supabase
      .from('post_flags')
      .select('id')
      .eq('post_id', replyId)
      .eq('user_id', userId)
      .single();

    if (existingFlag) {
      throw new Error('You have already flagged this reply');
    }

    // Create flag record (using post_flags table for both posts and replies)
    const { error: flagError } = await supabase
      .from('post_flags')
      .insert({
        post_id: replyId, // Using post_id field for reply ID
        user_id: userId,
        reason: 'Inappropriate content'
      });

    if (flagError) throw flagError;
  }
};

// Real-time subscriptions
export const subscribeToChannelPosts = (channelId: string, callback: (post: Post) => void) => {
  return supabase
    .channel(`posts:${channelId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'posts', filter: `channel_id=eq.${channelId}` },
      (payload) => callback(payload.new as Post)
    )
    .subscribe();
};

export const subscribeToPostReplies = (postId: string, callback: (reply: Reply) => void) => {
  return supabase
    .channel(`replies:${postId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'replies', filter: `post_id=eq.${postId}` },
      (payload) => callback(payload.new as Reply)
    )
    .subscribe();
};
