export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  reputation: number;
  joinDate: string;
  language: 'en' | 'hi';
  isVerified: boolean;
  preferences: UserPreferences;
  followedTags: string[];
  blockedUsers: string[];
}

export interface UserPreferences {
  contentLanguage: 'en' | 'hi' | 'both';
  emailNotifications: boolean;
  pushNotifications: boolean;
  mentionNotifications: boolean;
  answerNotifications: boolean;
  followNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface Question {
  id: string;
  title: string;
  content: string;
  images: string[];
  author: User;
  tags: string[];
  votes: number;
  upvotes: string[]; // user IDs who upvoted
  downvotes: string[]; // user IDs who downvoted
  answers: Answer[];
  views: number;
  createdAt: string;
  updatedAt: string;
  language: 'en' | 'hi';
  isModerated: boolean;
  isPinned: boolean;
  isClosed: boolean;
  followers: string[]; // user IDs following this question
}

export interface Answer {
  id: string;
  content: string;
  images: string[];
  author: User;
  votes: number;
  upvotes: string[];
  downvotes: string[];
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  questionId: string;
  mentions: string[]; // user IDs mentioned in the answer
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  votes: number;
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
  answerId?: string;
  questionId?: string;
  mentions: string[];
}

export interface Notification {
  id: string;
  type: 'answer' | 'mention' | 'comment' | 'vote' | 'follow' | 'badge';
  title: string;
  message: string;
  userId: string;
  fromUser?: User;
  relatedId: string; // question/answer/comment ID
  isRead: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Language {
  code: 'en' | 'hi';
  name: string;
  nativeName: string;
}

export interface Tag {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  followers: string[];
  color: string;
}