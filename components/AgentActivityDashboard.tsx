import React, { useState, useEffect } from 'react';
import { agentAuthService } from '../services/agentAuthService';

interface AgentLog {
  timestamp: string;
  agent: string;
  action: string;
  status: string;
  sessionId: string;
}

export const AgentActivityDashboard: React.FC = () => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const agentLogs = agentAuthService.getAgentLogs();
      setLogs(agentLogs.reverse()); // Show newest first
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

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'admin': return '👑';
      case 'mod': return '🛡️';
      case 'user': return '👤';
      default: return '🤖';
    }
  };

  const clearLogs = () => {
    agentAuthService.clearAgentLogs();
    setLogs([]);
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
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🔐 Auth0 for AI Agents Activity
          </h2>
          <div className="flex gap-2">
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Clear Logs
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
            <strong>Auth0 Integration Status:</strong>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-1">👑</div>
              <div className="text-yellow-400 font-medium">Admin Agent</div>
              <div className="text-gray-400">admin:manage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="text-blue-400 font-medium">Mod Agent</div>
              <div className="text-gray-400">mod:warn</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">👤</div>
              <div className="text-green-400 font-medium">User Agent</div>
              <div className="text-gray-400">user:post</div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-96">
          {logs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No agent activity yet. Perform some actions to see logs here.
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
          )}
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          🔐 Secured by Auth0 for AI Agents • Machine-to-Machine Authentication
        </div>
      </div>
    </div>
  );
};

export default AgentActivityDashboard;
