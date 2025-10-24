import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { channelRequestService } from '../services/channelRequestService';
import { supabase } from '../services/supabaseService';
import { notificationService } from '../services/notificationService';
import { staffService, type ChannelAnalytics, type FlaggedPost } from '../services/staffService';
import { agenticModerationService } from '../services/agenticModerationService';

interface ActionButtonProps {
  label: string;
  onClick: () => Promise<void>;
  variant: 'delete' | 'warn' | 'approve' | 'reject' | 'create' | 'ban' | 'dismiss';
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, variant, disabled }) => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleClick = async () => {
    if (loading || completed || disabled) return;
    
    const confirmed = window.confirm(`Are you sure you want to ${label.toLowerCase()}?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await onClick();
      setCompleted(true);
      setTimeout(() => setCompleted(false), 3000);
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyle = () => {
    if (completed) return 'bg-green-600 text-white';
    if (loading) return 'bg-gray-600 text-gray-300';
    
    switch (variant) {
      case 'delete': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warn': return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'ban': return 'bg-red-700 hover:bg-red-800 text-white';
      case 'dismiss': return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'approve': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'reject': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'create': return 'bg-blue-600 hover:bg-blue-700 text-white';
      default: return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getButtonText = () => {
    if (completed) return '✅ Done';
    if (loading) return '⏳ Processing...';
    return label;
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || completed || disabled}
      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${getButtonStyle()} ${
        (loading || completed || disabled) ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {getButtonText()}
    </button>
  );
};

interface InteractiveAgentProps {
  content: string;
  userId: string;
  userRole: string;
  onUpdate?: () => void;
}

export const InteractiveAgent: React.FC<InteractiveAgentProps> = ({
  content,
  userId,
  userRole,
  onUpdate
}) => {
  const [analytics, setAnalytics] = useState<ChannelAnalytics[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPost[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageTarget, setMessageTarget] = useState<'staff' | 'all' | 'specific'>('staff');
  const [messageContent, setMessageContent] = useState('');

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'moderator') {
      loadStaffData();
    }
  }, [userRole]);

  const loadStaffData = async () => {
    try {
      const [analyticsData, flaggedData, staffData, usersData] = await Promise.all([
        staffService.getChannelAnalytics(),
        staffService.getFlaggedPosts(),
        staffService.getStaffUsers(),
        staffService.getAllUsers() // Load all users for both admin and moderator
      ]);
      
      setAnalytics(analyticsData);
      setFlaggedPosts(flaggedData);
      setStaffUsers(staffData);
      setAllUsers(usersData);
    } catch (error) {
      console.error('Error loading staff data:', error);
    }
  };

  const createChannel = async (name: string, description: string) => {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('channels')
      .insert({
        name,
        description,
        emoji: '💬'
      });

    if (error) throw error;
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      if (messageTarget === 'all' && userRole === 'moderator') {
        await staffService.messageAllUsers(userId, messageContent);
        alert(`Message sent to all ${allUsers.length} users`);
      } else if (messageTarget === 'staff') {
        const targets = staffUsers.filter(user => user.id !== userId);
        for (const target of targets) {
          await staffService.sendStaffMessage(userId, target.id, messageContent);
        }
        alert(`Message sent to ${targets.length} staff members`);
      }
      
      setMessageContent('');
      setShowMessageForm(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const renderUserOverview = () => {
    if (allUsers.length === 0) return null;
    
    return (
      <div className="bg-gray-800/50 p-4 rounded mt-2 border-l-4 border-blue-500">
        <div className="text-white font-medium mb-3">👥 User Management ({allUsers.length} users)</div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {allUsers.map(user => (
            <div key={user.id} className="border border-gray-600 p-3 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-gray-300 text-sm">{user.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.role === 'admin' ? 'bg-red-600' : 
                      user.role === 'moderator' ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.is_banned ? 'bg-red-600' : 'bg-green-600'
                    }`}>
                      {user.is_banned ? 'BANNED' : 'ACTIVE'}
                    </span>
                  </div>
                  {user.is_banned && user.ban_info && (
                    <div className="text-red-400 text-xs mt-1">
                      Until: {user.ban_info.expiresAt ? new Date(user.ban_info.expiresAt).toLocaleString() : 'Unknown'}
                      <br />Reason: {user.ban_info.reason}
                    </div>
                  )}
                </div>
                {userRole === 'admin' && user.is_banned && (
                  <ActionButton
                    label="🔓 Unban"
                    variant="approve"
                    onClick={async () => {
                      await staffService.unbanUser(user.id, userId);
                      await loadStaffData();
                      alert(`${user.name} has been unbanned`);
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMessagingInterface = () => (
    <div className="bg-gray-800/50 p-4 rounded mt-2 border-l-4 border-purple-500">
      <div className="text-white font-medium mb-3">💬 Staff Messaging</div>
      
      {!showMessageForm ? (
        <div className="flex gap-2">
          <ActionButton
            label="📨 Message Staff"
            variant="create"
            onClick={async () => {
              setMessageTarget('staff');
              setShowMessageForm(true);
            }}
          />
          {userRole === 'moderator' && (
            <ActionButton
              label="📢 Message All Users"
              variant="warn"
              onClick={async () => {
                setMessageTarget('all');
                setShowMessageForm(true);
              }}
            />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              {messageTarget === 'all' ? 'Message to All Users' : 'Message to Staff'}
            </label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Enter your message..."
              rows={3}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium"
            >
              Send Message
            </button>
            <button
              onClick={() => {
                setShowMessageForm(false);
                setMessageContent('');
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-gray-800/50 p-4 rounded mt-2 border-l-4 border-blue-500">
      <div className="text-white font-medium mb-3">📊 Channel Analytics</div>
      <div className="space-y-2">
        {analytics.slice(0, 5).map(channel => (
          <div key={channel.id} className="text-sm">
            <span className="text-blue-400">{channel.emoji} {channel.name}:</span>
            <span className="text-gray-300 ml-2">
              {channel.post_count} posts, {channel.total_likes} likes, {channel.total_replies} replies
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFlaggedPosts = () => (
    <div className="bg-gray-800/50 p-4 rounded mt-2 border-l-4 border-red-500">
      <div className="text-white font-medium mb-3">🚩 Flagged Content ({flaggedPosts.length})</div>
      {flaggedPosts.length === 0 ? (
        <div className="text-gray-400 text-sm">No flagged content</div>
      ) : (
        <div className="space-y-3">
          {flaggedPosts.slice(0, 5).map(item => (
            <div key={item.id} className="border border-gray-600 p-3 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                  {item.type === 'post' ? '📝 POST' : '💬 REPLY'}
                </span>
                <div className="text-white font-medium">{item.title}</div>
              </div>
              <div className="text-gray-300 text-sm">By: {item.user_name} in #{item.channel_name}</div>
              <div className="text-gray-400 text-sm mt-1">{item.content.substring(0, 100)}...</div>
              <div className="flex gap-2 mt-2">
                {userRole === 'moderator' && (
                  <>
                    <ActionButton
                      label="🤖 Auto-Moderate"
                      variant="warn"
                      onClick={async () => {
                        const reason = prompt('Flag reason for AI analysis:') || 'Policy violation';
                        console.log(`🤖 Starting autonomous moderation for post ${item.id}`);
                        
                        const report = await agenticModerationService.moderatorAgentProcess(item.id, reason, userId);
                        agenticModerationService.storeAgentReport(report);
                        
                        // Check if escalation needed
                        if (report.decision.action === 'escalate') {
                          console.log(`🚨 Escalating to admin agent...`);
                          // Auto-escalate to admin if available
                          const adminReport = await agenticModerationService.adminAgentProcess(report, userId);
                          agenticModerationService.storeAgentReport(adminReport);
                        }
                        
                        await loadStaffData();
                      }}
                    />
                    <ActionButton
                      label="✅ Dismiss Flag"
                      variant="dismiss"
                      onClick={async () => {
                        await staffService.dismissFlag(item.id);
                        await loadStaffData();
                      }}
                    />
                  </>
                )}
                {userRole === 'admin' && (
                  <>
                    <ActionButton
                      label="👑 Admin Auto-Review"
                      variant="ban"
                      onClick={async () => {
                        const reason = prompt('Flag reason for admin AI analysis:') || 'Serious violation';
                        console.log(`👑 Starting admin autonomous review for post ${item.id}`);
                        
                        // Create mock escalated case for admin review
                        const mockEscalation = {
                          agentType: 'moderator' as const,
                          postId: item.id,
                          userId: item.user_id,
                          decision: {
                            action: 'escalate' as const,
                            severity: 'high' as const,
                            reasoning: reason,
                            confidence: 85
                          },
                          executedActions: ['Flagged for admin review'],
                          timestamp: new Date().toISOString()
                        };
                        
                        const adminReport = await agenticModerationService.adminAgentProcess(mockEscalation, userId);
                        agenticModerationService.storeAgentReport(adminReport);
                        
                        await loadStaffData();
                      }}
                    />
                    <ActionButton
                      label="✅ Dismiss Flag"
                      variant="dismiss"
                      onClick={async () => {
                        await staffService.dismissFlag(item.id);
                        await loadStaffData();
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderManualChannelCreation = () => (
    <div className="bg-gray-800/50 p-3 rounded mt-2 border-l-4 border-green-500">
      <div className="text-white font-medium">Create New Channel</div>
      <div className="text-gray-300 text-sm">Manually create a new channel</div>
      <div className="flex flex-wrap gap-2 mt-2">
        <ActionButton
          label="➕ Create New Channel"
          variant="create"
          onClick={async () => {
            const channelName = prompt('Channel name:');
            if (!channelName) return;
            
            const description = prompt('Channel description:') || `Discussions about ${channelName}`;
            
            await createChannel(channelName, description);
            alert(`Channel "${channelName}" created successfully!`);
            onUpdate?.();
          }}
        />
      </div>
    </div>
  );

  const handleStaffMessage = async (message: string) => {
    // Parse message like "message admin about server issues"
    const match = message.match(/message\s+(admin|moderator|mod)\s+(.+)/i);
    if (!match) return;

    const targetRole = match[1].toLowerCase() === 'mod' ? 'moderator' : match[1].toLowerCase();
    const messageContent = match[2];

    const targetUsers = staffUsers.filter(user => 
      user.role === targetRole && user.id !== userId
    );

    if (targetUsers.length === 0) {
      alert(`No ${targetRole}s found`);
      return;
    }

    // Send to first available target (or all if multiple)
    for (const target of targetUsers) {
      await staffService.sendStaffMessage(userId, target.id, messageContent);
    }

    alert(`Message sent to ${targetUsers.length} ${targetRole}(s)`);
  };

  // Check if content contains staff messaging
  useEffect(() => {
    if (content.match(/message\s+(admin|moderator|mod)\s+/i)) {
      handleStaffMessage(content);
    }
  }, [content]);

  return (
    <div className="whitespace-pre-wrap">
      <div>{content}</div>
      
      {/* Admin/Mod Dashboard */}
      {(userRole === 'admin' || userRole === 'moderator') && (
        <div className="mt-4 space-y-4">
          {renderAnalytics()}
          {renderFlaggedPosts()}
          {renderUserOverview()}
          {renderMessagingInterface()}
          
          {userRole === 'admin' && (
            <div className="mt-4">
              <div className="font-bold text-green-400">ADMIN ACTIONS</div>
              {renderManualChannelCreation()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveAgent;
