import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PostFeed from '../components/PostFeed';
import { useAppContext } from '../context/AppContext';
import type { Channel } from '../services/supabaseService';

interface HomePageProps {
    onNavigate: (page: 'home' | 'profile' | 'agent') => void;
}

const HomePage = ({ onNavigate }: HomePageProps) => {
  const { channels, user } = useAppContext();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Set the first channel as the default
    if (channels.length > 0) {
      setSelectedChannel(channels[0]);
    }
  }, [channels]);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      <Sidebar 
        selectedChannel={selectedChannel} 
        onSelectChannel={setSelectedChannel}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onLogout={() => {}} 
          onMenuClick={() => setSidebarOpen(!isSidebarOpen)} 
          onProfileClick={() => onNavigate('profile')} 
          onAgentClick={() => onNavigate('agent')}
        />
        <main className="flex-1 overflow-y-auto bg-gray-800/50">
          {selectedChannel ? (
            <PostFeed selectedChannel={selectedChannel} />
          ) : (
             <div className="container mx-auto max-w-3xl p-4 sm:p-6 lg:p-8 text-center">
                <div className="bg-gray-800 rounded-lg shadow-xl p-8 mt-10">
                    <h2 className="text-2xl font-bold text-white mb-4">Welcome to ApexQuest!</h2>
                    <p className="text-gray-400">You haven't joined any channels yet. Go to your profile to explore and join communities!</p>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;