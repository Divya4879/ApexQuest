import { supabase } from './supabaseService';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
  updated_at: string;
  // Auth0 for AI Agents - User agent credentials
  agent_client_id?: string;
  agent_client_secret?: string;
}

class UserService {
  async createOrUpdateUser(auth0User: any): Promise<User> {
    if (!supabase) throw new Error('Supabase not configured');

    const userData = {
      id: auth0User.sub,
      name: auth0User.name || auth0User.nickname || 'Anonymous',
      email: auth0User.email,
      avatar_url: auth0User.picture,
      role: this.determineUserRole(auth0User.email),
      // Assign user agent credentials to every user
      agent_client_id: import.meta.env.VITE_USER_AGENT_CLIENT_ID,
      agent_client_secret: import.meta.env.VITE_USER_AGENT_CLIENT_SECRET
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`🔐 User agent credentials assigned to: ${userData.email}`);
    console.log(`🤖 User Agent Client ID: ${userData.agent_client_id}`);
    
    return data;
  }

  private determineUserRole(email: string): 'user' | 'moderator' | 'admin' {
    if (email === 'admin@apexquest.com') return 'admin';
    if (email === 'mod@apexquest.com') return 'moderator';
    return 'user';
  }

  async getUserById(userId: string): Promise<User | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async updateUserRole(userId: string, newRole: 'user' | 'moderator' | 'admin'): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    // Update role and assign appropriate agent credentials
    let agentClientId = import.meta.env.VITE_USER_AGENT_CLIENT_ID;
    let agentClientSecret = import.meta.env.VITE_USER_AGENT_CLIENT_SECRET;

    if (newRole === 'moderator') {
      agentClientId = import.meta.env.VITE_MOD_AGENT_CLIENT_ID;
      agentClientSecret = import.meta.env.VITE_MOD_AGENT_CLIENT_SECRET;
    } else if (newRole === 'admin') {
      agentClientId = import.meta.env.VITE_ADMIN_AGENT_CLIENT_ID;
      agentClientSecret = import.meta.env.VITE_ADMIN_AGENT_CLIENT_SECRET;
    }

    const { error } = await supabase
      .from('users')
      .update({ 
        role: newRole,
        agent_client_id: agentClientId,
        agent_client_secret: agentClientSecret
      })
      .eq('id', userId);

    if (error) throw error;

    console.log(`🔐 Updated user role to ${newRole} with appropriate agent credentials`);
  }
}

export const userService = new UserService();
