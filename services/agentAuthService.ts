// Mock Auth0 for AI Agents - Demonstrates the concept without network calls
interface AgentCredentials {
  clientId: string;
  clientSecret: string;
  requiredScope: string;
}

class AgentAuthService {
  private readonly domain = import.meta.env.VITE_AUTH0_AGENTS_DOMAIN;
  private readonly audience = import.meta.env.VITE_AUTH0_AGENTS_AUDIENCE;
  
  private readonly agents: Record<string, AgentCredentials> = {
    admin: {
      clientId: import.meta.env.VITE_ADMIN_AGENT_CLIENT_ID,
      clientSecret: import.meta.env.VITE_ADMIN_AGENT_CLIENT_SECRET,
      requiredScope: 'admin:manage'
    },
    mod: {
      clientId: import.meta.env.VITE_MOD_AGENT_CLIENT_ID,
      clientSecret: import.meta.env.VITE_MOD_AGENT_CLIENT_SECRET,
      requiredScope: 'mod:warn'
    },
    user: {
      clientId: import.meta.env.VITE_USER_AGENT_CLIENT_ID,
      clientSecret: import.meta.env.VITE_USER_AGENT_CLIENT_SECRET,
      requiredScope: 'user:post'
    }
  };

  async authenticateAgent(agentType: 'admin' | 'mod' | 'user'): Promise<string> {
    const agent = this.agents[agentType];
    if (!agent) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    console.log(`🔐 Authenticating ${agentType} agent with Auth0...`);
    console.log(`📋 Client ID: ${agent.clientId}`);
    console.log(`🎯 Required Scope: ${agent.requiredScope}`);
    console.log(`🌐 Auth0 Domain: ${this.domain}`);
    console.log(`🎪 Audience: ${this.audience}`);

    // Mock successful authentication (in production, this would be a real Auth0 call)
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    const mockToken = `mock_token_${agentType}_${Date.now()}`;
    
    console.log(`✅ ${agentType} agent authenticated successfully`);
    console.log(`🔑 Mock Token: ${mockToken.substring(0, 20)}...`);
    console.log(`🔑 Granted scopes: ${agent.requiredScope}`);
    
    return mockToken;
  }

  async validateAgentAction(agentType: 'admin' | 'mod' | 'user', action: string): Promise<boolean> {
    try {
      const token = await this.authenticateAgent(agentType);
      
      // Log the action attempt
      this.logAgentActivity(agentType, action, 'attempted');
      
      // Mock validation - always succeeds for demo
      console.log(`🛡️ Agent ${agentType} authorized for action: ${action}`);
      console.log(`🔐 Token validated: ${token.substring(0, 20)}...`);
      
      this.logAgentActivity(agentType, action, 'authorized');
      return true;
    } catch (error) {
      console.error(`🚫 Agent ${agentType} unauthorized for action: ${action}`, error);
      this.logAgentActivity(agentType, action, 'denied');
      return false;
    }
  }

  private logAgentActivity(agentType: string, action: string, status: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      agent: agentType,
      action,
      status,
      sessionId: this.getSessionId(),
      auth0Domain: this.domain,
      clientId: this.agents[agentType as keyof typeof this.agents]?.clientId || 'unknown'
    };
    
    console.log(`📊 Agent Activity:`, logEntry);
    
    // Store in localStorage for demo
    const logs = JSON.parse(localStorage.getItem('agentLogs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('agentLogs', JSON.stringify(logs));
  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem('agentSessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('agentSessionId', sessionId);
    }
    return sessionId;
  }

  getAgentLogs(): any[] {
    return JSON.parse(localStorage.getItem('agentLogs') || '[]');
  }

  clearAgentLogs(): void {
    localStorage.removeItem('agentLogs');
    console.log('🗑️ Agent logs cleared');
  }

  // Demo method to show Auth0 configuration
  getAuth0Config(): any {
    return {
      domain: this.domain,
      audience: this.audience,
      agents: Object.entries(this.agents).map(([type, config]) => ({
        type,
        clientId: config.clientId,
        scope: config.requiredScope,
        configured: !!(config.clientId && config.clientSecret)
      }))
    };
  }
}

export const agentAuthService = new AgentAuthService();
