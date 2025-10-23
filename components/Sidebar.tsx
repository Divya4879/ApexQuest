import React, { useMemo } from 'react';
import type { Channel } from '../services/supabaseService';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const XIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface ChannelButtonProps {
  channel: Channel;
  selected: boolean;
  onClick: () => void;
}

const ChannelButton = ({ channel, selected, onClick }: ChannelButtonProps) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors duration-200 ${
        selected
          ? 'bg-gradient-to-r from-blue-500/30 to-purple-600/30 text-white'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
      }`}
    >
      <span className="mr-3 text-lg">{channel.emoji}</span>
      <span>{channel.name}</span>
    </button>
);

const Sidebar = ({ selectedChannel, onSelectChannel, isSidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { channels, user } = useAppContext();

  const joinedChannels = useMemo(() => {
    // channels is now the user's joined channels from context
    return channels || [];
  }, [channels]);

  const handleChannelClick = (channel: Channel) => {
    onSelectChannel(channel);
    setSidebarOpen(false); // Close sidebar on selection in mobile view
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`absolute md:relative z-40 md:z-auto flex flex-col w-64 bg-gray-900 border-r border-gray-700/50 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 h-full`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <h2 className="font-bold text-lg text-white">ApexQuest</h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                <XIcon className="h-6 w-6" />
            </button>
        </div>
        <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
          <div>
            <h3 className="px-3 py-2 text-xs font-bold uppercase text-gray-500">Your Channels</h3>
            <div className="space-y-1 mt-1">
              {joinedChannels.length > 0 ? (
                joinedChannels.map((channel) => (
                  <ChannelButton
                    key={channel.id}
                    channel={channel}
                    selected={selectedChannel?.id === channel.id}
                    onClick={() => handleChannelClick(channel)}
                  />
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">You haven't joined any channels yet.</div>
              )}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;