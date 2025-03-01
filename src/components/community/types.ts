"use client";

export interface CommunityMember {
  id: string;
  name: string;
  username: string;
  role: string;
  avatarUrl?: string;
  contributions: number;
  joinDate: string;
  lastActive: string;
  badges: Badge[];
  expertise: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface DiscussionTopic {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
  lastActivity: string;
  category: string;
  tags: string[];
  replies: number;
  views: number;
  isPinned?: boolean;
  isLocked?: boolean;
}

export interface DiscussionReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
  editedAt?: string;
  likes: number;
  isAccepted?: boolean;
}

export interface EditSuggestion {
  id: string;
  articleId: string;
  articleTitle: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'merged';
  summary: string;
  changes: {
    added: number;
    removed: number;
  };
  reviewers: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  }[];
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  isVirtual: boolean;
  organizer: {
    id: string;
    name: string;
    username: string;
  };
  attendees: number;
  maxAttendees?: number;
  tags: string[];
  imageUrl?: string;
}

export interface MentorshipProgram {
  id: string;
  title: string;
  description: string;
  mentor: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    expertise: string[];
  };
  duration: string;
  topics: string[];
  capacity: number;
  enrolled: number;
  status: 'upcoming' | 'active' | 'completed';
}

export interface CommunityProject {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed';
  startDate: string;
  endDate?: string;
  lead: {
    id: string;
    name: string;
    username: string;
  };
  members: number;
  progress: number;
  tags: string[];
}

export interface CommunityAnnouncement {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: string;
  };
  publishedAt: string;
  category: string;
  importance: 'low' | 'medium' | 'high';
}
