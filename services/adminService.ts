import { supabase } from './supabaseService';
import { notificationService } from './notificationService';

export const adminService = {
  async warnUser(
    userId: string,
    moderatorId: string,
    postId: string,
    reason: string
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    // Get current active warnings
    const { data: warningCount } = await supabase
      .rpc('get_active_warnings', { user_uuid: userId });

    const newWarningLevel = (warningCount || 0) + 1;

    // Create warning
    const { error: warningError } = await supabase
      .from('user_warnings')
      .insert({
        user_id: userId,
        moderator_id: moderatorId,
        post_id: postId,
        warning_level: newWarningLevel,
        reason
      });

    if (warningError) throw warningError;

    // Create notification
    let title = `Warning ${newWarningLevel}`;
    if (newWarningLevel === 3) title = 'Final Warning';

    await notificationService.createNotification(
      userId,
      'warning',
      title,
      `You have received a warning for: ${reason}`
    );

    // Auto-ban if 3 warnings
    if (newWarningLevel >= 3) {
      await this.banUser(userId, moderatorId, 'Exceeded warning limit (3 warnings)');
    }
  },

  async banUser(
    userId: string,
    bannedBy: string,
    reason: string,
    permanent = false
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const expiresAt = permanent 
      ? null 
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 1 day

    const { error } = await supabase
      .from('user_bans')
      .insert({
        user_id: userId,
        banned_by: bannedBy,
        ban_type: permanent ? 'permanent' : 'temp',
        reason,
        expires_at: expiresAt
      });

    if (error) throw error;

    // Notify user
    const banDuration = permanent ? 'permanently' : 'for 1 day';
    await notificationService.createNotification(
      userId,
      'ban',
      `Account ${permanent ? 'Permanently ' : ''}Banned`,
      `You have been banned ${banDuration} for: ${reason}`
    );
  },

  async unbanUser(userId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('user_bans')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  async deletePost(postId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },

  async unflagPost(postId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('posts')
      .update({ is_flagged: false })
      .eq('id', postId);

    if (error) throw error;

    // Remove flag records
    await supabase
      .from('post_flags')
      .delete()
      .eq('post_id', postId);
  },

  async getFlaggedPosts(): Promise<any[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, name, email),
        channel:channels(name),
        flags:post_flags(
          flagged_by,
          reason,
          created_at,
          user:users(name)
        )
      `)
      .eq('is_flagged', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flagged posts:', error);
      return [];
    }

    return data || [];
  },

  async getUserWarnings(userId: string): Promise<any[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('user_warnings')
      .select(`
        *,
        moderator:users!moderator_id(name),
        post:posts(title, content)
      `)
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user warnings:', error);
      return [];
    }

    return data || [];
  },

  async isUserBanned(userId: string): Promise<boolean> {
    if (!supabase) return false;

    const { data } = await supabase
      .rpc('is_user_banned', { user_uuid: userId });

    return data || false;
  }
};
