import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { postService, replyService } from '../services/supabaseService';
import type { Post, Reply } from '../services/supabaseService';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAppContext();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [repliesCount, setRepliesCount] = useState(post.replies_count);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Load replies when comments are shown
  useEffect(() => {
    if (showComments && replies.length === 0) {
      loadReplies();
    }
  }, [showComments]);

  const loadReplies = async () => {
    setLoadingReplies(true);
    try {
      console.log('Loading replies for post:', post.id);
      const postReplies = await replyService.getPostReplies(post.id);
      console.log('Loaded replies:', postReplies);
      setReplies(postReplies);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleLike = async () => {
    if (!user || isLiking) return;
    
    setIsLiking(true);
    try {
      const result = await postService.likePost(user.id, post.id);
      
      if (result.action === 'liked') {
        setLikesCount(prev => prev + 1);
      } else {
        setLikesCount(prev => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      console.error('Error with like:', error);
      alert('Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!user || !newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      await replyService.createReply({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim()
      });
      
      setNewComment('');
      setRepliesCount(prev => prev + 1);
      
      // Reload replies to get the latest data
      await loadReplies();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      // Show ban messages and other errors as alerts
      if (error.message && error.message.includes('banned')) {
        alert(error.message);
      } else {
        alert('Failed to add comment. Please try again.');
      }
    } finally {
      setIsCommenting(false);
    }
  };

  const handleFlag = async () => {
    if (!user) return;
    
    try {
      await postService.flagPost(post.id, user.id);
      alert('Post reported. Thank you for helping keep the community safe.');
    } catch (error) {
      console.error('Error flagging post:', error);
      alert('Failed to report post. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== post.user_id) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;
    
    try {
      await postService.deletePost(post.id);
      alert('Post deleted successfully');
      // Refresh the page or trigger a reload
      window.location.reload();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'progress': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'challenges': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'wins': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleReplyFlag = async (replyId: string) => {
    if (!user) return;
    
    try {
      await replyService.flagReply(replyId, user.id);
      alert('Reply reported. Thank you for helping keep the community safe.');
    } catch (error) {
      console.error('Error flagging reply:', error);
      alert('Failed to report reply. Please try again.');
    }
  };

  const handleReplyDelete = async (replyId: string, replyUserId: string) => {
    if (!user || user.id !== replyUserId) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this reply?');
    if (!confirmed) return;
    
    try {
      await replyService.deleteReply(replyId);
      alert('Reply deleted successfully');
      await loadReplies(); // Reload replies instead of full page
      setRepliesCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply. Please try again.');
    }
  };

  const ReplyItem = ({ reply }: { reply: Reply }) => (
    <div className="flex space-x-3 py-2">
      <img
        src={reply.user?.avatar_url || `https://ui-avatars.com/api/?name=${reply.user?.name}&background=6366f1&color=fff`}
        alt={reply.user?.name}
        className="w-6 h-6 rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">{reply.user?.name}</span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
          </span>
          <span className="text-gray-400">•</span>
          {user && user.id === reply.user?.id && (
            <button
              onClick={() => handleReplyDelete(reply.id, reply.user.id)}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Delete reply"
            >
              🗑️
            </button>
          )}
          {user && (
            user.id !== reply.user?.id || user.role === 'admin' || user.role === 'moderator'
          ) && reply.user?.role !== 'admin' && (
            <button
              onClick={() => handleReplyFlag(reply.id)}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Report reply"
            >
              🚩
            </button>
          )}
        </div>
        <p className="text-sm text-gray-300 mt-1">{reply.content}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.user?.avatar_url || `https://ui-avatars.com/api/?name=${post.user?.name}&background=6366f1&color=fff`}
            alt={post.user?.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-white">{post.user?.name}</h3>
            <p className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs border ${getTagColor(post.tag)}`}>
            {post.tag}
          </span>
          {user && user.id === post.user_id && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Delete post"
            >
              🗑️
            </button>
          )}
          {user && (
            user.id !== post.user_id || user.role === 'admin' || user.role === 'moderator'
          ) && post.user?.role !== 'admin' && (
            <button
              onClick={handleFlag}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Report post"
            >
              🚩
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-white mb-2">{post.title}</h4>
        <p className="text-gray-300 leading-relaxed">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 transition-colors ${
              isLiking ? 'text-gray-500' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <span>❤️</span>
            <span>{likesCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <span>💬</span>
            <span>{repliesCount}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="space-y-3 mb-4">
            {loadingReplies ? (
              <div className="text-gray-400 text-sm">Loading comments...</div>
            ) : replies.length === 0 ? (
              <div className="text-gray-400 text-sm">No comments yet.</div>
            ) : (
              replies.map(reply => (
                <ReplyItem key={reply.id} reply={reply} />
              ))
            )}
          </div>
          
          {user && (
            <div className="flex space-x-3">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
                <button
                  onClick={handleComment}
                  disabled={!newComment.trim() || isCommenting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCommenting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
