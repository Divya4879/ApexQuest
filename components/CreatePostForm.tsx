import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { postService } from '../services/supabaseService';
import type { Post } from '../services/supabaseService';

interface CreatePostFormProps {
  channelId: string;
  onPostCreated: (post: Post) => void;
}

const CreatePostForm = ({ channelId, onPostCreated }: CreatePostFormProps) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<'progress' | 'challenges' | 'wins' | 'miscellaneous'>('miscellaneous');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const newPost = await postService.createPost({
        user_id: user.id,
        channel_id: channelId,
        title: title.trim(),
        content: content.trim(),
        tag
      });
      
      onPostCreated(newPost);
      setTitle('');
      setContent('');
      setTag('miscellaneous');
    } catch (error: any) {
      console.error('Error creating post:', error);
      // Show ban messages and other errors as alerts
      if (error.message && error.message.includes('banned')) {
        alert(error.message);
      } else {
        alert('Failed to create post. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <img
          src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
          alt={user.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-white">{user.name}</p>
          <p className="text-sm text-gray-400">Share your progress</p>
        </div>
      </div>

      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your update about?"
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          maxLength={100}
        />
      </div>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts, progress, or ask for help..."
          rows={4}
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
          maxLength={500}
        />
      </div>

      <div className="flex items-center justify-between">
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value as any)}
          className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="miscellaneous">💬 General</option>
          <option value="progress">📈 Progress</option>
          <option value="challenges">⚡ Challenge</option>
          <option value="wins">🎉 Win</option>
        </select>

        <button
          type="submit"
          disabled={!title.trim() || !content.trim() || isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
};

export default CreatePostForm;
