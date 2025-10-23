import { supabase } from './supabaseService';
import { notificationService } from './notificationService';

export interface ChannelRequest {
  id: string;
  user_id: string;
  channel_name: string;
  description: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_info';
  admin_response?: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export const channelRequestService = {
  async createRequest(
    userId: string,
    channelName: string,
    description: string,
    reason: string
  ): Promise<ChannelRequest> {
    if (!supabase) throw new Error('Supabase not configured');

    // Check if user has pending request
    const { data: existing } = await supabase
      .from('channel_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (existing) {
      throw new Error('You already have a pending channel request');
    }

    const { data, error } = await supabase
      .from('channel_requests')
      .insert({
        user_id: userId,
        channel_name: channelName,
        description,
        reason
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserRequests(userId: string): Promise<ChannelRequest[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('channel_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user requests:', error);
      return [];
    }

    return data || [];
  },

  async getAllPendingRequests(): Promise<ChannelRequest[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('channel_requests')
      .select(`
        *,
        user:users(name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }

    return data || [];
  },

  async approveRequest(requestId: string, adminId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    // Get request details
    const { data: request } = await supabase
      .from('channel_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Request not found');

    // Create the channel
    const { error: channelError } = await supabase
      .from('channels')
      .insert({
        name: request.channel_name,
        description: request.description,
        created_by: adminId
      });

    if (channelError) throw channelError;

    // Update request status
    const { error: updateError } = await supabase
      .from('channel_requests')
      .update({
        status: 'approved',
        admin_response: 'Channel created successfully',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Notify user
    await notificationService.createNotification(
      request.user_id,
      'channel_approved',
      'Channel Request Approved',
      `Your channel "${request.channel_name}" has been created!`
    );
  },

  async rejectRequest(requestId: string, reason: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    // Get request details
    const { data: request } = await supabase
      .from('channel_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Request not found');

    // Update request status
    const { error } = await supabase
      .from('channel_requests')
      .update({
        status: 'rejected',
        admin_response: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;

    // Notify user
    await notificationService.createNotification(
      request.user_id,
      'channel_rejected',
      'Channel Request Rejected',
      `Your channel request "${request.channel_name}" was rejected: ${reason}`
    );
  },

  async updateRequest(
    requestId: string,
    channelName: string,
    description: string,
    reason: string
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('channel_requests')
      .update({
        channel_name: channelName,
        description,
        reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  },

  async cancelRequest(requestId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('channel_requests')
      .delete()
      .eq('id', requestId);

    if (error) throw error;
  }
};
