import React, { useState, useEffect } from 'react';
import { agentAuthService } from '../services/agentAuthService';
import { agenticModerationService } from '../services/agenticModerationService';

interface AgentLog {
  timestamp: string;
  agent: string;
  action: string;
  status: string;
  sessionId: string;
}

interface AgentReport {
  agentType: 'moderator' | 'admin';
  postId: string;
  userId: string;
  decision: {
    action: string;
    severity: string;
    reasoning: string;
    confidence: number;
  };
  executedActions: string[];
  timestamp: string;
}

export const AgentActivityDashboard: React.FC = () => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [activeTab, setActiveTab] = useState<'auth' | 'decisions'>('decisions');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const agentLogs = agentAuthService.getAgentLogs();
      const agentReports = agenticModerationService.getAgentReports();
      setLogs(agentLogs.reverse());
      setReports(agentReports.reverse());
    }
  }, [isVisible]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authorized': return 'text-green-400';
      case 'denied': return 'text-red-400';
      case 'attempted': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'warn': return 'text-yellow-400';
      case 'ban': return 'text-red-400';
      case 'escalate': return 'text-orange-400';
      case 'dismiss': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'admin': return '👑';
      case 'moderator': return '🛡️';
      case 'mod': return '🛡️';
      case 'user': return '👤';
      default: return '🤖';
    }
  };

  const clearLogs = () => {
    agentAuthService.clearAgentLogs();
    localStorage.removeItem('agentReports');
    setLogs([]);
    setReports([]);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-50"
      >
        🤖 Agent Activity
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🔐 Agentic AI with Auth0 Security
          </h2>
          <div className="flex gap-2">
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded p-4 mb-4">
          <div className="text-sm text-gray-300 mb-2">
            <strong>Autonomous AI Agents with Auth0 Security:</strong>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-1">👑</div>
              <div className="text-yellow-400 font-medium">Admin Agent</div>
              <div className="text-gray-400">Autonomous escalation handling</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="text-blue-400 font-medium">Moderator Agent</div>
              <div className="text-gray-400">AI-powered content analysis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🤖</div>
              <div className="text-green-400 font-medium">Multi-Step Workflows</div>
              <div className="text-gray-400">Analyze → Decide → Act → Report</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              activeTab === 'decisions' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🧠 Agent Decisions ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              activeTab === 'auth' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🔐 Auth Logs ({logs.length})
          </button>
        </div>

        <div className="overflow-y-auto max-h-96">
          {activeTab === 'decisions' ? (
            reports.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No autonomous decisions yet. Use "🤖 Auto-Moderate" or "👑 Admin Auto-Review" to see agentic behavior.
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 rounded p-4 border-l-4 border-blue-500"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getAgentIcon(report.agentType)}</span>
                        <div>
                          <div className="text-white font-medium">
                            {report.agentType.toUpperCase()} AGENT DECISION
                          </div>
                          <div className="text-gray-300 text-sm">
                            Post: {report.postId.substring(0, 8)}... | User: {report.userId.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getActionColor(report.decision.action)}`}>
                          {report.decision.action.toUpperCase()}
                        </div>
                        <div className={`text-sm ${getSeverityColor(report.decision.severity)}`}>
                          {report.decision.severity} severity
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded p-3 mb-2">
                      <div className="text-gray-300 text-sm mb-1">
                        <strong>AI Reasoning:</strong>
                      </div>
                      <div className="text-white text-sm">
                        {report.decision.reasoning}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        Confidence: {report.decision.confidence}%
                      </div>
                    </div>

                    <div className="text-gray-300 text-sm">
                      <strong>Actions Executed:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {report.executedActions.map((action, i) => (
                          <li key={i} className="text-gray-400">{action}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-gray-400 text-xs mt-2">
                      {new Date(report.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            logs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No authentication logs yet. Agent actions will appear here.
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 rounded p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getAgentIcon(log.agent)}</span>
                      <div>
                        <div className="text-white font-medium">
                          {log.agent.toUpperCase()} Agent
                        </div>
                        <div className="text-gray-300 text-sm">
                          Action: {log.action}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${getStatusColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          🤖 Autonomous AI Agents • 🔐 Secured by Auth0 • 🧠 Multi-Step Decision Making
        </div>
      </div>
    </div>
  );
};

export default AgentActivityDashboard;
