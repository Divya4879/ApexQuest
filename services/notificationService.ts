import { supabase } from './supabaseService';

export interface Notification {
  id: string;
  user_id: string;
  type: 'warning' | 'ban' | 'channel_approved' | 'channel_rejected';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  },

  async getUnreadCount(userId: string): Promise<number> {
    if (!supabase) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return count || 0;
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string
  ): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message
      });

    if (error) {
      console.error('Error creating notification:', error);
    }
  }
};
