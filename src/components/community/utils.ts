"use client";

import {
  CommunityMember,
  Badge,
  DiscussionTopic,
  DiscussionReply,
  EditSuggestion,
  CommunityEvent,
  MentorshipProgram,
  CommunityProject,
  CommunityAnnouncement
} from './types';

// Return empty arrays until backend integration is complete
export const getCommunityMembers = (): CommunityMember[] => {
  return [];
};

export const getDiscussionTopics = (): DiscussionTopic[] => {
  return [];
};

export const getDiscussionReplies = (topicId: string): DiscussionReply[] => {
  return [];
};

export const getEditSuggestions = (): EditSuggestion[] => {
  return [];
};

export const getCommunityEvents = (): CommunityEvent[] => {
  return [];
};

export const getMentorshipPrograms = (): MentorshipProgram[] => {
  return [];
};

export const getCommunityProjects = (): CommunityProject[] => {
  return [];
};

export const getCommunityAnnouncements = (): CommunityAnnouncement[] => {
  return [];
};