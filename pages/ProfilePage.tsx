import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { channelService } from '../services/supabaseService';
import type { Channel, User } from '../services/supabaseService';

interface ProfilePageProps {
  onNavigate: (page: 'home' | 'profile') => void;
  onChannelsUpdated: (channels: Channel[]) => void;
}

const ProfilePage = ({ onNavigate, onChannelsUpdated }: ProfilePageProps) => {
  const { user: contextUser, channels: userChannels } = useAppContext();
  const [user, setUser] = useState<User | null>(contextUser);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(userChannels);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUser(contextUser);
  }, [contextUser]);

  useEffect(() => {
    loadAllChannels();
  }, []);

  const loadAllChannels = async () => {
    try {
      const channels = await channelService.getAllChannels();
      setAllChannels(channels);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (channel: Channel) => {
    setSelectedChannels(prev => {
      const isSelected = prev.some(c => c.id === channel.id);
      if (isSelected) {
        return prev.filter(c => c.id !== channel.id);
      } else if (user?.role === 'admin' || user?.role === 'moderator' || prev.length < 10) {
        return [...prev, channel];
      }
      return prev;
    });
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Leave all current channels
      for (const channel of userChannels) {
        if (!selectedChannels.some(c => c.id === channel.id)) {
          await channelService.leaveChannel(user.id, channel.id);
        }
      }

      // Join new channels
      for (const channel of selectedChannels) {
        if (!userChannels.some(c => c.id === channel.id)) {
          await channelService.joinChannel(user.id, channel.id);
        }
      }

      onChannelsUpdated(selectedChannels);
      alert('Channels updated successfully!');
    } catch (error) {
      console.error('Error updating channels:', error);
      alert('Failed to update channels. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </button>
          
          <h1 className="text-3xl font-bold">Profile</h1>
          <div></div>
        </div>

        {/* User Info */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-8">
          <div className="flex items-start space-x-6">
            <div className="flex flex-col items-center">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=200`}
                alt={user.name}
                className="w-24 h-24 rounded-full border-2 border-gray-600 object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500">Role:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                  user.role === 'moderator' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              {user.bio && (
                <p className="text-gray-300 mt-2">{user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Channel Management */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold mb-4">Manage Your Channels</h3>
          <p className="text-gray-400 mb-6">
            {user?.role === 'admin' || user?.role === 'moderator' 
              ? `Select channels you want to participate in (${selectedChannels.length} selected)`
              : `Channel Requests + max 9 others (${selectedChannels.length}/10 total)`
            }
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {allChannels.map(channel => {
              const isSelected = selectedChannels.some(c => c.id === channel.id);
              return (
                <button
                  key={channel.id}
                  onClick={() => handleChannelToggle(channel)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <span className="text-3xl mb-2 block">{channel.emoji}</span>
                  <h4 className="font-bold text-sm">{channel.name}</h4>
                  <p className="text-gray-400 mt-1 text-xs hidden sm:block">{channel.description}</p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setSelectedChannels(userChannels)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving || selectedChannels.length < 2}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
