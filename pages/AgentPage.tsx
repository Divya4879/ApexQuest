import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { agentService } from '../services/agentService';
import { adminService } from '../services/adminService';
import { channelRequestService } from '../services/channelRequestService';
import InteractiveAgent from '../components/InteractiveAgent';

interface AgentPageProps {
  onNavigate: (page: 'home' | 'profile' | 'agent') => void;
}

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  flaggedPosts?: any[];
  channelRequests?: any[];
}

const AgentPage = ({ onNavigate }: AgentPageProps) => {
  const { user } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{ count: number; limit: number }>({ count: 0, limit: 20 });
  const [flaggedPosts, setFlaggedPosts] = useState<any[]>([]);
  const [channelRequests, setChannelRequests] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadUsageInfo();
      loadAdminData();
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'agent',
        content: getWelcomeMessage(),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  const loadAdminData = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      const [flagged, requests] = await Promise.all([
        adminService.getFlaggedPosts(),
        channelRequestService.getAllPendingRequests()
      ]);
      
      setFlaggedPosts(flagged);
      setChannelRequests(requests);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUsageInfo = async () => {
    if (!user) return;
    try {
      const { usageCount } = await agentService.checkUsageLimit(user.id);
      setUsageInfo({ count: usageCount, limit: 20 });
    } catch (error) {
      console.error('Error loading usage info:', error);
    }
  };

  const getWelcomeMessage = () => {
    if (!user) return "Hello! I'm your AI assistant.";

    switch (user.role) {
      case 'admin':
        return `Welcome, Admin ${user.name}! 👑 I'm your strategic AI assistant. I can help you analyze platform metrics, user management, channel requests, and provide administrative insights. What would you like to know about ApexQuest?`;
      case 'moderator':
        return `Hello, Moderator ${user.name}! 🛡️ I'm your professional moderation assistant. I can help you track flagged content, analyze user behavior, review warnings, and maintain community standards. How can I assist with moderation today?`;
      default:
        return `Hey there, ${user.name}! 😄 I'm your personal AI buddy here to roast... I mean, help you track your ApexQuest journey! Want to see how you're doing with your posts, comments, or just need some motivation? Fire away! 🚀`;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-500/20';
      case 'moderator': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await agentService.askAgent(user, userMessage.content);
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response,
        timestamp: new Date(),
        flaggedPosts: user.role === 'admin' ? flaggedPosts : undefined,
        channelRequests: user.role === 'admin' ? channelRequests : undefined
      };

      setMessages(prev => [...prev, agentMessage]);
      await loadUsageInfo(); // Refresh usage count
      if (user.role === 'admin') {
        await loadAdminData(); // Refresh admin data
      }
    } catch (error) {
      console.error('Error asking agent:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "Oops! Something went wrong. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Please log in to access the Agent.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">🤖 AI Agent</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          </div>

          <div className="text-sm text-gray-400">
            {usageInfo.count}/{usageInfo.limit} questions today
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl p-4 rounded-xl ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                {message.type === 'agent' && user ? (
                  <InteractiveAgent
                    content={message.content}
                    userId={user.id}
                    userRole={user.role}
                    onUpdate={loadAdminData}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask me anything about ${
                user.role === 'admin' ? 'platform management...' :
                user.role === 'moderator' ? 'community moderation...' :
                'your ApexQuest journey...'
              }`}
              className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              disabled={isLoading || usageInfo.count >= usageInfo.limit}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading || usageInfo.count >= usageInfo.limit}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Asking...' : 'Ask'}
            </button>
          </form>
          
          {usageInfo.count >= usageInfo.limit && (
            <div className="mt-2 text-center text-red-400 text-sm">
              Daily question limit reached. Come back tomorrow!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentPage;
