import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LandingPage from './pages/LandingPage';
import ChannelSelectionPage from './pages/ChannelSelectionPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import AgentPage from './pages/AgentPage';
import { AppProvider } from './context/AppContext';
import { userService, channelService } from './services/supabaseService';
import type { User, Channel } from './services/supabaseService';

type Page = 'landing' | 'channel-selection' | 'home' | 'profile' | 'agent' | 'banned';

import { banService } from './services/banService';
import BannedPage from './components/BannedPage';

function App() {
  const { isAuthenticated, isLoading, loginWithRedirect, user: auth0User } = useAuth0();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [userChannels, setUserChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && auth0User && !user) {
      handleUserAuthentication();
    }
  }, [isAuthenticated, auth0User, user]);

  const handleUserAuthentication = async () => {
    if (!auth0User) return;
    
    setLoading(true);
    try {
      // Create or update user in Supabase
      const supabaseUser = await userService.createOrUpdateUser(auth0User);
      setUser(supabaseUser);

      // Check if user is banned
      const banStatus = await banService.isEmailBanned(supabaseUser.email);
      if (banStatus.banned && banStatus.ban) {
        setCurrentPage('banned');
        setLoading(false);
        return;
      }

      // Get user's channels
      const channels = await channelService.getUserChannels(supabaseUser.id);
      setUserChannels(channels);

      // Navigate based on channel selection
      if (channels.length === 0) {
        setCurrentPage('channel-selection');
      } else {
        setCurrentPage('home');
      }
    } catch (error) {
      console.error('Error setting up user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleChannelsSelected = async (selectedChannels: Channel[]) => {
    if (!user) return;

    setLoading(true);
    try {
      // Join selected channels
      for (const channel of selectedChannels) {
        await channelService.joinChannel(user.id, channel.id);
      }
      
      setUserChannels(selectedChannels);
      setCurrentPage('home');
    } catch (error) {
      console.error('Error joining channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    console.log('Updating user in App:', updatedUser);
    setUser(updatedUser);
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  // Show loading spinner
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // Show channel selection if user has no channels
  if (currentPage === 'channel-selection') {
    return (
      <ChannelSelectionPage 
        onChannelsSelected={handleChannelsSelected}
        user={user}
      />
    );
  }

  // Show banned page if user is banned
  if (currentPage === 'banned' && user) {
    // We already checked ban status in handleUserAuthentication
    // Just show the banned page - the ban info will be fetched there
    return <BannedPage reason="Violation of community guidelines" expiresAt={new Date(Date.now() + 24 * 60 * 60 * 1000)} />;
  }

  // Show main app with context
  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <AppProvider user={user} userChannels={userChannels}>
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}
        {currentPage === 'profile' && (
          <ProfilePage 
            onNavigate={handleNavigate}
            onChannelsUpdated={setUserChannels}
          />
        )}
        {currentPage === 'agent' && (
          <AgentPage onNavigate={handleNavigate} />
        )}
      </AppProvider>
    </div>
  );
}

export default App;