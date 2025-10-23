import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import CreatePostForm from './CreatePostForm';
import { useAppContext } from '../context/AppContext';
import type { Channel, Post } from '../services/supabaseService';
import { postService } from '../services/supabaseService';

interface PostFeedProps {
  selectedChannel: Channel;
}

const PostFeed = ({ selectedChannel }: PostFeedProps) => {
  const { user } = useAppContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedChannel) {
      loadPosts();
    }
  }, [selectedChannel]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== PostFeed Debug ===');
      console.log('Selected channel:', selectedChannel);
      console.log('Channel ID:', selectedChannel.id);
      console.log('User:', user);
      
      // Test Supabase connection first
      console.log('Testing Supabase connection...');
      const { supabase } = await import('../services/supabaseService');
      console.log('Supabase client:', supabase);
      
      if (!supabase) {
        throw new Error('Supabase client is null');
      }
      
      // Try a simple query first
      console.log('Testing simple query...');
      const { data: testData, error: testError } = await supabase
        .from('posts')
        .select('count')
        .eq('channel_id', selectedChannel.id);
      
      console.log('Test query result:', { testData, testError });
      
      if (testError) {
        throw new Error(`Supabase test failed: ${testError.message}`);
      }
      
      console.log('Loading posts for channel:', selectedChannel.id);
      const channelPosts = await postService.getChannelPosts(selectedChannel.id);
      console.log('Loaded posts:', channelPosts);
      
      setPosts(channelPosts);
    } catch (error) {
      console.error('=== PostFeed Error ===');
      console.error('Error details:', error);
      setError(`Failed to load posts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-400">{error}</div>
        <button 
          onClick={loadPosts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Channel Header */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-xl font-bold mb-2 flex items-center">
          <span className="text-2xl mr-2">{selectedChannel.emoji}</span>
          {selectedChannel.name}
        </h2>
        <p className="text-gray-400 text-sm">{selectedChannel.description}</p>
      </div>

      {/* Create Post Form - More Prominent */}
      {user && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Share Your Progress
          </h3>
          <CreatePostForm 
            channelId={selectedChannel.id}
            onPostCreated={handlePostCreated}
          />
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p>Be the first to share something in this channel!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default PostFeed;
