import { supabase } from './supabaseService';

// Supabase-based ban system
interface Ban {
  email: string;
  reason: string;
  expiresAt: Date;
  bannedBy: string;
}

class BanService {
  async banUserByEmail(email: string, adminId: string, reason: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const { error } = await supabase
      .from('banned_users')
      .upsert({
        email,
        reason,
        expires_at: expiresAt,
        banned_by: adminId
      });

    if (error) throw error;
    console.log(`Email ${email} banned until ${new Date(expiresAt).toLocaleString()}`);
  }

  async isEmailBanned(email: string): Promise<{ banned: boolean; ban?: Ban }> {
    if (!supabase) return { banned: false };

    const { data, error } = await supabase
      .from('banned_users')
      .select('*')
      .eq('email', email)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return { banned: false };
    }

    return {
      banned: true,
      ban: {
        email: data.email,
        reason: data.reason,
        expiresAt: new Date(data.expires_at),
        bannedBy: data.banned_by
      }
    };
  }

  async unbanEmail(email: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('banned_users')
      .delete()
      .eq('email', email);

    if (error) throw error;
    console.log(`Email ${email} unbanned`);
  }

  async getAllBans(): Promise<Ban[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('banned_users')
      .select('*')
      .gt('expires_at', new Date().toISOString());

    if (error || !data) return [];

    return data.map(row => ({
      email: row.email,
      reason: row.reason,
      expiresAt: new Date(row.expires_at),
      bannedBy: row.banned_by
    }));
  }
}

export const banService = new BanService();
