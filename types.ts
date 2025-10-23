export enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: Role;
  joinedChannelIds: string[];
}

export interface Comment {
  id: string;
  text: string;
  author: User;
  createdAt: string;
}

export interface Post {
  id: string;
  channelId: string;
  author: User;
  content: string;
  createdAt: string;
  likes: string[]; // Array of user IDs
  comments: Comment[];
  spamReports: number;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  emoji: string;
}