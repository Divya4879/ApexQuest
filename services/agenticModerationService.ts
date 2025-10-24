import { analyzePostWithGemini } from './geminiService';
import { staffService } from './staffService';
import { agentAuthService } from './agentAuthService';
import { supabase } from './supabaseService';

interface ModerationDecision {
  action: 'warn' | 'remove' | 'ban' | 'escalate' | 'dismiss';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  confidence: number;
}

interface AgentReport {
  agentType: 'moderator' | 'admin';
  postId: string;
  userId: string;
  decision: ModerationDecision;
  executedActions: string[];
  timestamp: string;
}

class AgenticModerationService {
  
  async moderatorAgentProcess(postId: string, flagReason: string, moderatorId: string): Promise<AgentReport> {
    console.log(`🤖 Moderator Agent: Starting autonomous moderation for post ${postId}`);
    
    // Step 1: Authenticate agent
    const isAuthorized = await agentAuthService.validateAgentAction('mod', 'autonomous_moderation');
    if (!isAuthorized) {
      throw new Error('Moderator agent not authorized for autonomous moderation');
    }

    // Step 2: Gather context
    const postData = await this.getPostContext(postId);
    if (!postData) {
      throw new Error('Post not found');
    }

    // Step 3: Analyze content with AI
    const decision = await this.analyzeContentForModeration(postData, flagReason);
    
    // Step 4: Execute decision
    const executedActions = await this.executeModeratorDecision(decision, postId, postData.user_id, moderatorId);
    
    // Step 5: Generate report
    const report: AgentReport = {
      agentType: 'moderator',
      postId,
      userId: postData.user_id,
      decision,
      executedActions,
      timestamp: new Date().toISOString()
    };

    console.log(`🤖 Moderator Agent: Completed autonomous moderation`, report);
    return report;
  }

  async adminAgentProcess(escalatedCase: AgentReport, adminId: string): Promise<AgentReport> {
    console.log(`👑 Admin Agent: Processing escalated case from moderator`);
    
    // Step 1: Authenticate agent
    const isAuthorized = await agentAuthService.validateAgentAction('admin', 'escalated_moderation');
    if (!isAuthorized) {
      throw new Error('Admin agent not authorized for escalated moderation');
    }

    // Step 2: Review user history
    const userHistory = await this.getUserModerationHistory(escalatedCase.userId);
    
    // Step 3: Make admin-level decision
    const decision = await this.makeAdminDecision(escalatedCase, userHistory);
    
    // Step 4: Execute admin decision
    const executedActions = await this.executeAdminDecision(decision, escalatedCase.postId, escalatedCase.userId, adminId);
    
    // Step 5: Generate admin report
    const report: AgentReport = {
      agentType: 'admin',
      postId: escalatedCase.postId,
      userId: escalatedCase.userId,
      decision,
      executedActions,
      timestamp: new Date().toISOString()
    };

    console.log(`👑 Admin Agent: Completed escalated moderation`, report);
    return report;
  }

  private async analyzeContentForModeration(postData: any, flagReason: string): Promise<ModerationDecision> {
    const analysisPrompt = `
    Analyze this flagged content for moderation:
    
    Content: "${postData.content}"
    Flag Reason: "${flagReason}"
    
    Determine:
    1. Severity (low/medium/high/critical)
    2. Recommended action (warn/remove/ban/escalate/dismiss)
    3. Confidence level (0-100)
    4. Reasoning
    
    Respond in JSON format:
    {
      "severity": "low|medium|high|critical",
      "action": "warn|remove|ban|escalate|dismiss",
      "confidence": 85,
      "reasoning": "Explanation of decision"
    }
    `;

    try {
      const aiResponse = await analyzePostWithGemini(postData, analysisPrompt, { id: 'mod-agent', name: 'Moderator Agent', role: 'moderator' } as any);
      
      // Parse AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          action: parsed.action,
          severity: parsed.severity,
          reasoning: parsed.reasoning,
          confidence: parsed.confidence
        };
      }
    } catch (error) {
      console.error('AI analysis failed, using fallback logic:', error);
    }

    // Fallback decision logic
    return this.getFallbackDecision(flagReason);
  }

  private getFallbackDecision(flagReason: string): ModerationDecision {
    const reason = flagReason.toLowerCase();
    
    if (reason.includes('spam') || reason.includes('inappropriate')) {
      return {
        action: 'warn',
        severity: 'low',
        reasoning: 'Automated decision: Minor policy violation detected',
        confidence: 70
      };
    }
    
    if (reason.includes('harassment') || reason.includes('abuse')) {
      return {
        action: 'escalate',
        severity: 'high',
        reasoning: 'Automated decision: Serious violation requires admin review',
        confidence: 80
      };
    }

    return {
      action: 'warn',
      severity: 'medium',
      reasoning: 'Automated decision: General policy violation',
      confidence: 60
    };
  }

  private async executeModeratorDecision(decision: ModerationDecision, postId: string, userId: string, moderatorId: string): Promise<string[]> {
    const actions: string[] = [];

    switch (decision.action) {
      case 'warn':
        await staffService.warnUser(postId, userId, moderatorId, decision.reasoning);
        actions.push(`Warned user: ${decision.reasoning}`);
        break;

      case 'remove':
        await staffService.warnUser(postId, userId, moderatorId, decision.reasoning);
        // TODO: Add content removal logic
        actions.push(`Warned user and flagged for removal: ${decision.reasoning}`);
        break;

      case 'escalate':
        actions.push(`Escalated to admin: ${decision.reasoning}`);
        // Escalation handled by caller
        break;

      case 'dismiss':
        await staffService.dismissFlag(postId);
        actions.push(`Dismissed flag: ${decision.reasoning}`);
        break;

      default:
        actions.push(`No action taken: ${decision.reasoning}`);
    }

    return actions;
  }

  private async makeAdminDecision(escalatedCase: AgentReport, userHistory: any): Promise<ModerationDecision> {
    const warningCount = userHistory.warnings || 0;
    const previousBans = userHistory.bans || 0;

    // Admin decision logic based on history
    if (previousBans > 0 || warningCount >= 2) {
      return {
        action: 'ban',
        severity: 'critical',
        reasoning: `User has ${warningCount} warnings and ${previousBans} previous bans. Escalated case requires ban.`,
        confidence: 95
      };
    }

    if (escalatedCase.decision.severity === 'critical') {
      return {
        action: 'ban',
        severity: 'critical',
        reasoning: 'Critical violation detected by moderator agent. Immediate ban required.',
        confidence: 90
      };
    }

    return {
      action: 'warn',
      severity: 'high',
      reasoning: 'First-time serious violation. Final warning issued.',
      confidence: 85
    };
  }

  private async executeAdminDecision(decision: ModerationDecision, postId: string, userId: string, adminId: string): Promise<string[]> {
    const actions: string[] = [];

    switch (decision.action) {
      case 'ban':
        await staffService.banUser(userId, adminId, decision.reasoning);
        actions.push(`Banned user: ${decision.reasoning}`);
        break;

      case 'warn':
        await staffService.warnUser(postId, userId, adminId, decision.reasoning);
        actions.push(`Final warning issued: ${decision.reasoning}`);
        break;

      default:
        actions.push(`Admin review completed: ${decision.reasoning}`);
    }

    return actions;
  }

  private async getPostContext(postId: string): Promise<any> {
    if (!supabase) return null;

    const { data } = await supabase
      .from('posts')
      .select('*, user:users(*)')
      .eq('id', postId)
      .single();

    return data;
  }

  private async getUserModerationHistory(userId: string): Promise<any> {
    if (!supabase) return { warnings: 0, bans: 0 };

    // Get warning count
    const { data: warnings } = await supabase
      .from('user_warnings')
      .select('id')
      .eq('user_id', userId);

    // Get ban count (simplified - just check if currently banned)
    const { data: bans } = await supabase
      .from('banned_users')
      .select('id')
      .eq('email', userId); // This would need user email lookup in real implementation

    return {
      warnings: warnings?.length || 0,
      bans: bans?.length || 0
    };
  }

  // Store agent reports for dashboard
  storeAgentReport(report: AgentReport): void {
    const reports = JSON.parse(localStorage.getItem('agentReports') || '[]');
    reports.push(report);
    
    // Keep only last 50 reports
    if (reports.length > 50) {
      reports.splice(0, reports.length - 50);
    }
    
    localStorage.setItem('agentReports', JSON.stringify(reports));
  }

  getAgentReports(): AgentReport[] {
    return JSON.parse(localStorage.getItem('agentReports') || '[]');
  }
}

export const agenticModerationService = new AgenticModerationService();
