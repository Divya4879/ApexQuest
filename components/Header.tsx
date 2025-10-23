import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppContext } from '../context/AppContext';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  onLogout: () => void;
  onMenuClick: () => void;
  onProfileClick: () => void;
  onAgentClick: () => void;
}

const Header = ({ onLogout, onMenuClick, onProfileClick, onAgentClick }: HeaderProps) => {
  const { logout } = useAuth0();
  const { user } = useAppContext();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-xl font-bold text-white">ApexQuest</h1>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3">
              <button
                onClick={onAgentClick}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                title="AI Agent"
              >
                <span className="text-lg">🤖</span>
                <span className="hidden sm:block">Agent</span>
              </button>

              <NotificationBell />

              <button
                onClick={onProfileClick}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden sm:block">{user.name}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
