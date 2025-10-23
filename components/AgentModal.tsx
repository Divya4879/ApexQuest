import React, { useState, useCallback } from 'react';
import { Post } from '../types';
import { analyzePostWithGemini } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';

interface AgentModalProps {
  post: Post;
  onClose: () => void;
}

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
);

const AgentModal = ({ post, onClose }: AgentModalProps) => {
  const { user } = useAppContext();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setResponse('');
    const res = await analyzePostWithGemini(post, question, user);
    setResponse(res);
    setIsLoading(false);
  }, [question, post, user]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Ask AI Agent</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">{'×'}</button>
        </header>
        
        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-gray-400 mb-2">Your Post:</p>
          <div className="bg-gray-700/50 p-3 rounded-md mb-6 max-h-32 overflow-y-auto">
            <p className="text-gray-300 italic">"{post.content}"</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="agent-question" className="block text-sm font-medium text-gray-300 mb-2">Your Question:</label>
            <textarea
              id="agent-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What is the overall sentiment of the comments?"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition"
              rows={2}
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="mt-3 w-full px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
              {isLoading ? 'Analyzing...' : 'Get Insights'}
            </button>
          </form>

          {isLoading && (
            <div className="flex justify-center items-center mt-6">
              <LoadingSpinner />
            </div>
          )}

          {response && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Agent's Response:</h3>
              <div className="bg-gray-900/50 p-4 rounded-md border border-gray-700">
                <p className="text-gray-300 whitespace-pre-wrap">{response}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentModal;
