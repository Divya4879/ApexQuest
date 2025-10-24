// Auth0 for AI Agents - Machine to Machine Authentication with User-Specific Credentials
interface AgentToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface AgentCredentials {
  clientId: string;
  clientSecret: string;
  requiredScope: string;
}

class AgentAuthService {
  private readonly domain = import.meta.env.VITE_AUTH0_AGENTS_DOMAIN;
  private readonly audience = import.meta.env.VITE_AUTH0_AGENTS_AUDIENCE;
  
  private readonly defaultAgents: Record<string, AgentCredentials> = {
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

  private tokenCache: Record<string, { token: AgentToken; expiresAt: number }> = {};

  async authenticateAgent(agentType: 'admin' | 'mod' | 'user', userCredentials?: { clientId: string; clientSecret: string }): Promise<string> {
    // Use user-specific credentials if provided, otherwise use default
    const agent = userCredentials ? {
      clientId: userCredentials.clientId,
      clientSecret: userCredentials.clientSecret,
      requiredScope: this.defaultAgents[agentType].requiredScope
    } : this.defaultAgents[agentType];

    if (!agent) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Create cache key based on client ID
    const cacheKey = `${agentType}_${agent.clientId}`;

    // Check cache first
    const cached = this.tokenCache[cacheKey];
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`🔐 Using cached token for ${agentType} agent (${agent.clientId})`);
      return cached.token.access_token;
    }

    console.log(`🔐 Authenticating ${agentType} agent with Auth0...`);
    console.log(`👤 Client ID: ${agent.clientId}`);

    try {
      const response = await fetch(`https://${this.domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: agent.clientId,
          client_secret: agent.clientSecret,
          audience: this.audience,
          grant_type: 'client_credentials',
          scope: agent.requiredScope
        }),
      });

      if (!response.ok) {
        throw new Error(`Auth0 authentication failed: ${response.statusText}`);
      }

      const token: AgentToken = await response.json();
      
      // Cache token (expires 5 minutes before actual expiry)
      this.tokenCache[cacheKey] = {
        token,
        expiresAt: Date.now() + (token.expires_in - 300) * 1000
      };

      console.log(`✅ ${agentType} agent authenticated successfully`);
      console.log(`🔑 Granted scopes: ${token.scope}`);
      
      return token.access_token;
    } catch (error) {
      console.error(`❌ Failed to authenticate ${agentType} agent:`, error);
      throw error;
    }
  }

  async validateAgentAction(agentType: 'admin' | 'mod' | 'user', action: string, userCredentials?: { clientId: string; clientSecret: string }): Promise<boolean> {
    try {
      const token = await this.authenticateAgent(agentType, userCredentials);
      
      // Log the action attempt
      this.logAgentActivity(agentType, action, 'attempted', userCredentials?.clientId);
      
      // For demo purposes, we trust the token if authentication succeeded
      console.log(`🛡️ Agent ${agentType} authorized for action: ${action}`);
      
      this.logAgentActivity(agentType, action, 'authorized', userCredentials?.clientId);
      return true;
    } catch (error) {
      console.error(`🚫 Agent ${agentType} unauthorized for action: ${action}`, error);
      this.logAgentActivity(agentType, action, 'denied', userCredentials?.clientId);
      return false;
    }
  }

  private logAgentActivity(agentType: string, action: string, status: string, clientId?: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      agent: agentType,
      action,
      status,
      sessionId: this.getSessionId(),
      clientId: clientId || 'default'
    };
    
    console.log(`📊 Agent Activity:`, logEntry);
    
    // Store in localStorage for demo (in production, send to logging service)
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
      agents: Object.entries(this.defaultAgents).map(([type, config]) => ({
        type,
        clientId: config.clientId,
        scope: config.requiredScope,
        configured: !!(config.clientId && config.clientSecret)
      }))
    };
  }
}

export const agentAuthService = new AgentAuthService();
