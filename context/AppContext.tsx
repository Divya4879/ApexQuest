import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User, Channel, Post } from '../services/supabaseService';

interface AppContextType {
  user: User | null;
  channels: Channel[];
  posts: Post[];
  updateUser: (user: User) => void;
  addPost: (content: string, channelId: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  markAsSpam: (postId: string) => void;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  updateUserAvatar: (newAvatarUrl: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ 
  user: initialUser, 
  userChannels, 
  children 
}: { 
  user: User | null; 
  userChannels: Channel[]; 
  children: ReactNode 
}) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [posts, setPosts] = useState<Post[]>([]);
  const [channels] = useState<Channel[]>(userChannels);

  // Update user when prop changes
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const addPost = (content: string, channelId: string) => {
    // TODO: Implement with Supabase
    console.log('Add post:', content, channelId);
  };

  const toggleLike = (postId: string) => {
    // TODO: Implement with Supabase
    console.log('Toggle like:', postId);
  };
  
  const addComment = (postId: string, text: string) => {
    // TODO: Implement with Supabase
    console.log('Add comment:', postId, text);
  };

  const markAsSpam = (postId: string) => {
    // TODO: Implement with Supabase
    console.log('Mark as spam:', postId);
    alert('Post reported as spam. Thank you for helping keep the community safe.');
  };

  const joinChannel = (channelId: string) => {
    // TODO: Implement with Supabase
    console.log('Join channel:', channelId);
  };

  const leaveChannel = (channelId: string) => {
    // TODO: Implement with Supabase
    console.log('Leave channel:', channelId);
  };

  const updateUserAvatar = (newAvatarUrl: string) => {
    // TODO: Implement with Supabase
    console.log('Update avatar:', newAvatarUrl);
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      posts, 
      channels, 
      updateUser,
      addPost, 
      toggleLike, 
      addComment, 
      markAsSpam, 
      joinChannel, 
      leaveChannel, 
      updateUserAvatar 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
