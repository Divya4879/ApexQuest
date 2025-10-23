import { Channel, Post, User, Role } from './types';

export const CHANNELS: Channel[] = [
  { id: 'fitness-health', name: 'Fitness & Health', description: 'Workout progress, meal prep', emoji: '💪' },
  { id: 'learning-skills', name: 'Learning & Skills', description: 'Coding, languages, certifications', emoji: '📚' },
  { id: 'creative-projects', name: 'Creative Projects', description: 'Art, music, writing', emoji: '🎨' },
  { id: 'career-growth', name: 'Career Growth', description: 'Job search, networking, promotions', emoji: '📈' },
  { id: 'financial-goals', name: 'Financial Goals', description: 'Saving, investing, debt reduction', emoji: '💰' },
  { id: 'relationships', name: 'Relationships', description: 'Dating, family, friendships', emoji: '❤️' },
  { id: 'mental-health', name: 'Mental Health', description: 'Meditation, therapy, self-care', emoji: '🧘' },
  { id: 'home-lifestyle', name: 'Home & Lifestyle', description: 'Organization, cooking, gardening', emoji: '🏡' },
  { id: 'travel-adventure', name: 'Travel & Adventure', description: 'Trip planning, experiences', emoji: '✈️' },
  { id: 'entrepreneurship', name: 'Entrepreneurship', description: 'Startup progress, side hustles', emoji: '🚀' },
];

// No mock users - the app will start with a fresh state.
export const MOCK_USERS: User[] = [];

// No mock posts - channels will be empty initially.
export const MOCK_POSTS: Post[] = [];
