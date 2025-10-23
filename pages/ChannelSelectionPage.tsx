import React, { useState, useEffect } from 'react';
import { channelService } from '../services/supabaseService';
import type { Channel, User } from '../services/supabaseService';

interface ChannelSelectionPageProps {
  user: User | null;
  onChannelsSelected: (selectedChannels: Channel[]) => void;
}

const ChannelSelectionPage = ({ user, onChannelsSelected }: ChannelSelectionPageProps) => {
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  const [availableChannels, setAvailableChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const minSelection = 2;

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const channels = await channelService.getAllChannels();
      setAvailableChannels(channels);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChannel = (channel: Channel) => {
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

  const canContinue = selectedChannels.length >= minSelection;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading channels...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Choose Your Channels</h1>
          <p className="text-gray-400 text-lg">
            Select at least {minSelection} channels to get started 
            {user?.role === 'admin' || user?.role === 'moderator' 
              ? '' 
              : ' (max 9 + Channel Requests = 10 total)'
            }
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {availableChannels.map(channel => {
            const isSelected = selectedChannels.some(c => c.id === channel.id);
            return (
              <button
                key={channel.id}
                onClick={() => handleToggleChannel(channel)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
              >
                <span className="text-3xl mb-2 block">{channel.emoji}</span>
                <h3 className="font-bold text-sm">{channel.name}</h3>
                <p className="text-gray-400 mt-1 text-xs hidden sm:block">{channel.description}</p>
              </button>
            );
          })}
        </div>
        
        <div className="text-center">
          <button
            onClick={() => onChannelsSelected(selectedChannels)}
            disabled={!canContinue}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            Continue ({selectedChannels.length}/{minSelection})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelSelectionPage;
