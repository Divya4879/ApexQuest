import { supabase } from './supabaseService';
import type { User } from './supabaseService';

const GEMINI_API_KEY = 'AIzaSyDL38fa92tZpPkxpoRJaiNp5MHwSgHn0xU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface AgentUsage {
  user_id: string;
  question: string;
  response: string;
  usage_date: string;
}

export const agentService = {
  async checkUsageLimit(userId: string): Promise<{ canUse: boolean; usageCount: number; lastUsed?: Date }> {
    if (!supabase) return { canUse: true, usageCount: 0 };

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('agent_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('usage_date', today)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Usage check error:', error);
        return { canUse: true, usageCount: 0 }; // Allow usage if check fails
      }

      const usageCount = data?.length || 0;
      const lastUsed = data?.[0]?.created_at ? new Date(data[0].created_at) : undefined;
      
      // Check 5-second cooldown
      if (lastUsed && Date.now() - lastUsed.getTime() < 5000) {
        return { canUse: false, usageCount, lastUsed };
      }

      return { canUse: usageCount < 20, usageCount, lastUsed };
    } catch (error) {
      console.error('Usage limit check failed:', error);
      return { canUse: true, usageCount: 0 }; // Allow usage if check fails
    }
  },

  async getUserData(userId: string, userRole: string): Promise<any> {
    if (!supabase) return {};

    const data: any = {};

    try {
      if (userRole === 'user') {
        // User can only see their own data
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            *,
            channel:channels(name)
          `)
          .eq('user_id', userId);

        const { data: replies } = await supabase
          .from('replies')
          .select('*')
          .eq('user_id', userId);

        data.userPosts = posts || [];
        data.userReplies = replies || [];
      } else if (userRole === 'moderator') {
        // Moderator can see all data + flagged content
        const { data: allPosts } = await supabase
          .from('posts')
          .select(`
            *,
            user:users(name, email),
            channel:channels(name)
          `);

        const { data: flaggedPosts } = await supabase
          .from('posts')
          .select(`
            *,
            user:users(name, email),
            channel:channels(name)
          `)
          .eq('is_flagged', true);

        data.allPosts = allPosts || [];
        data.flaggedPosts = flaggedPosts || [];
      } else if (userRole === 'admin') {
        // Admin can see everything
        const { data: allUsers } = await supabase
          .from('users')
          .select('*');

        const { data: allPosts } = await supabase
          .from('posts')
          .select(`
            *,
            user:users(name, email),
            channel:channels(name)
          `);

        const { data: channels } = await supabase
          .from('channels')
          .select('*');

        data.allUsers = allUsers || [];
        data.allPosts = allPosts || [];
        data.channels = channels || [];
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    return data;
  },

  async askAgent(user: User, question: string): Promise<string> {
    // Check usage limits
    const { canUse, usageCount, lastUsed } = await this.checkUsageLimit(user.id);
    
    if (!canUse) {
      if (lastUsed && Date.now() - lastUsed.getTime() < 5000) {
        return "Whoa there, speed racer! 🏎️ Wait 5 seconds between questions. I need time to think!";
      }
      return "You've hit your daily limit of 20 questions! Come back tomorrow for more insights. 📊";
    }

    // Get user's data based on role
    const userData = await this.getUserData(user.id, user.role);

    // Create role-specific system prompt
    let systemPrompt = '';
    let personality = '';

    if (user.role === 'user') {
      personality = "You are a friendly, slightly sarcastic AI assistant with a sense of humor. You can be playful and roast users gently while being helpful. IMPORTANT: Do not use markdown formatting, asterisks, hashtags, or special characters. Use plain text with simple line breaks and spacing for structure.";
      systemPrompt = `${personality}

You can help this user analyze their own activity on ApexQuest:
- Their posts: ${userData.userPosts?.length || 0} posts
- Their replies: ${userData.userReplies?.length || 0} replies
- Post engagement and patterns

Be encouraging about their progress but don't hesitate to playfully tease them if they're not posting much! Format your response in plain text with clear sections using line breaks and simple formatting.`;
    } else if (user.role === 'moderator') {
      personality = "You are a professional, analytical AI assistant focused on moderation and community management. Use plain text formatting only - no markdown, asterisks, or special characters.";
      systemPrompt = `${personality}

You help moderators manage the ApexQuest community:
- Total posts: ${userData.allPosts?.length || 0}
- Flagged posts: ${userData.flaggedPosts?.length || 0}
- User warnings issued: ${userData.warnings?.length || 0}

Provide clear, actionable insights for community moderation in plain text format.`;
    } else if (user.role === 'admin') {
      personality = "You are a professional, strategic AI assistant focused on platform administration and analytics. Use plain text formatting only - no markdown, asterisks, or special characters.";
      systemPrompt = `${personality}

You help admins manage the entire ApexQuest platform:
- Total users: ${userData.allUsers?.length || 0}
- Total posts: ${userData.allPosts?.length || 0}
- Active channels: ${userData.channels?.length || 0}

IMPORTANT: When users ask about creating channels, flagged posts, or administrative actions, respond with:
"ADMIN ACTIONS AVAILABLE - Use the interactive buttons below to perform actions."

Then add sections:
FLAGGED POSTS: (if any flagged posts exist)
CHANNEL REQUESTS: (if any pending requests exist)

Provide strategic insights and platform analytics in plain text format with clear sections.`;
    }

    // Call Gemini API
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser Question: ${question}\n\nUser Data: ${JSON.stringify(userData, null, 2)}`
            }]
          }]
        })
      });

      const result = await response.json();
      const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that question.";

      // Log usage
      await supabase?.from('agent_usage').insert({
        user_id: user.id,
        question,
        response: aiResponse,
        usage_date: new Date().toISOString().split('T')[0]
      });

      return aiResponse;
    } catch (error) {
      console.error('Gemini API error:', error);
      return "Oops! My brain is taking a coffee break ☕. Try again in a moment!";
    }
  }
};
