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

// Mock data for community members
export const getCommunityMembers = (): CommunityMember[] => {
  return [
    {
      id: 'user-1',
      name: 'Amina Johnson',
      username: 'aminaj',
      role: 'Editor',
      avatarUrl: undefined,
      contributions: 347,
      joinDate: '2024-06-15',
      lastActive: '2025-02-28',
      badges: [
        {
          id: 'badge-1',
          name: 'Content Creator',
          description: 'Created 100+ articles',
          icon: 'edit',
          level: 'gold'
        },
        {
          id: 'badge-2',
          name: 'Fact Checker',
          description: 'Verified 500+ facts',
          icon: 'check-circle',
          level: 'silver'
        }
      ],
      expertise: ['History', 'Literature', 'Civil Rights']
    },
    {
      id: 'user-2',
      name: 'Marcus Williams',
      username: 'marcusw',
      role: 'Admin',
      avatarUrl: undefined,
      contributions: 892,
      joinDate: '2023-11-03',
      lastActive: '2025-03-01',
      badges: [
        {
          id: 'badge-3',
          name: 'Admin',
          description: 'Platform administrator',
          icon: 'shield',
          level: 'platinum'
        },
        {
          id: 'badge-4',
          name: 'Mentor',
          description: 'Mentored 20+ new editors',
          icon: 'users',
          level: 'gold'
        }
      ],
      expertise: ['Technology', 'Community Building', 'Education']
    },
    {
      id: 'user-3',
      name: 'Zainab Mensah',
      username: 'zainabm',
      role: 'Moderator',
      avatarUrl: undefined,
      contributions: 523,
      joinDate: '2024-02-20',
      lastActive: '2025-02-27',
      badges: [
        {
          id: 'badge-5',
          name: 'Moderator',
          description: 'Community moderator',
          icon: 'shield',
          level: 'gold'
        },
        {
          id: 'badge-6',
          name: 'Quality Guardian',
          description: 'Maintained high content standards',
          icon: 'award',
          level: 'silver'
        }
      ],
      expertise: ['Community Management', 'Content Moderation', 'Cultural Studies']
    },
    {
      id: 'user-4',
      name: 'David Chen',
      username: 'davidc',
      role: 'Contributor',
      avatarUrl: undefined,
      contributions: 156,
      joinDate: '2024-09-12',
      lastActive: '2025-02-25',
      badges: [
        {
          id: 'badge-7',
          name: 'Rising Star',
          description: 'New contributor with high-quality edits',
          icon: 'star',
          level: 'bronze'
        }
      ],
      expertise: ['Music', 'Art', 'Cultural Exchange']
    },
    {
      id: 'user-5',
      name: 'Fatima Al-Hassan',
      username: 'fatimah',
      role: 'Reviewer',
      avatarUrl: undefined,
      contributions: 412,
      joinDate: '2024-04-30',
      lastActive: '2025-02-28',
      badges: [
        {
          id: 'badge-8',
          name: 'Expert Reviewer',
          description: 'Reviewed 200+ article changes',
          icon: 'eye',
          level: 'silver'
        },
        {
          id: 'badge-9',
          name: 'Citation Master',
          description: 'Added 1000+ citations',
          icon: 'bookmark',
          level: 'gold'
        }
      ],
      expertise: ['Academic Research', 'Citation Standards', 'African History']
    }
  ];
};

// Mock data for discussion topics
export const getDiscussionTopics = (): DiscussionTopic[] => {
  return [
    {
      id: 'topic-1',
      title: 'Improving coverage of pre-colonial African kingdoms',
      author: {
        id: 'user-1',
        name: 'Amina Johnson',
        username: 'aminaj',
        avatarUrl: undefined
      },
      createdAt: '2025-02-15T14:32:00Z',
      lastActivity: '2025-03-01T09:45:00Z',
      category: 'Content Development',
      tags: ['history', 'africa', 'pre-colonial', 'kingdoms'],
      replies: 24,
      views: 342,
      isPinned: true
    },
    {
      id: 'topic-2',
      title: 'Guidelines for verifying oral history sources',
      author: {
        id: 'user-5',
        name: 'Fatima Al-Hassan',
        username: 'fatimah',
        avatarUrl: undefined
      },
      createdAt: '2025-02-20T10:15:00Z',
      lastActivity: '2025-02-28T16:22:00Z',
      category: 'Policies & Guidelines',
      tags: ['sources', 'oral-history', 'verification', 'guidelines'],
      replies: 18,
      views: 256
    },
    {
      id: 'topic-3',
      title: 'Upcoming virtual edit-a-thon: Black scientists and inventors',
      author: {
        id: 'user-2',
        name: 'Marcus Williams',
        username: 'marcusw',
        avatarUrl: undefined
      },
      createdAt: '2025-02-25T08:45:00Z',
      lastActivity: '2025-03-01T11:30:00Z',
      category: 'Events',
      tags: ['edit-a-thon', 'science', 'inventors', 'virtual-event'],
      replies: 32,
      views: 478,
      isPinned: true
    },
    {
      id: 'topic-4',
      title: 'Proposal: New template for musician biographies',
      author: {
        id: 'user-4',
        name: 'David Chen',
        username: 'davidc',
        avatarUrl: undefined
      },
      createdAt: '2025-02-26T15:20:00Z',
      lastActivity: '2025-02-28T19:15:00Z',
      category: 'Templates & Tools',
      tags: ['templates', 'music', 'biographies', 'proposal'],
      replies: 12,
      views: 187
    },
    {
      id: 'topic-5',
      title: 'Welcome new editors! Introduce yourself here',
      author: {
        id: 'user-3',
        name: 'Zainab Mensah',
        username: 'zainabm',
        avatarUrl: undefined
      },
      createdAt: '2025-01-05T12:00:00Z',
      lastActivity: '2025-03-01T08:10:00Z',
      category: 'Community',
      tags: ['welcome', 'introductions', 'new-editors'],
      replies: 87,
      views: 1245,
      isPinned: true
    },
    {
      id: 'topic-6',
      title: 'Discussion: Handling controversial historical figures',
      author: {
        id: 'user-2',
        name: 'Marcus Williams',
        username: 'marcusw',
        avatarUrl: undefined
      },
      createdAt: '2025-02-18T09:30:00Z',
      lastActivity: '2025-02-27T14:45:00Z',
      category: 'Content Development',
      tags: ['controversial', 'history', 'neutrality', 'guidelines'],
      replies: 45,
      views: 532
    },
    {
      id: 'topic-7',
      title: 'Technical update: New citation verification tool',
      author: {
        id: 'user-2',
        name: 'Marcus Williams',
        username: 'marcusw',
        avatarUrl: undefined
      },
      createdAt: '2025-02-28T16:40:00Z',
      lastActivity: '2025-03-01T10:25:00Z',
      category: 'Technical',
      tags: ['tools', 'citations', 'verification', 'update'],
      replies: 8,
      views: 156
    }
  ];
};

// Mock data for discussion replies
export const getDiscussionReplies = (topicId: string): DiscussionReply[] => {
  const repliesMap: Record<string, DiscussionReply[]> = {
    'topic-1': [
      {
        id: 'reply-1',
        content: 'I think we should start by focusing on the major kingdoms like Great Zimbabwe, Mali Empire, and Songhai Empire, which already have some coverage but could be significantly expanded.',
        author: {
          id: 'user-5',
          name: 'Fatima Al-Hassan',
          username: 'fatimah',
        avatarUrl: undefined
        },
        createdAt: '2025-02-15T15:10:00Z',
        likes: 12,
        isAccepted: true
      },
      {
        id: 'reply-2',
        content: 'Agreed. We should also consider creating a standardized template for these kingdom articles to ensure consistent coverage of governance structures, cultural achievements, economic systems, etc.',
        author: {
          id: 'user-3',
          name: 'Zainab Mensah',
          username: 'zainabm',
        avatarUrl: undefined
        },
        createdAt: '2025-02-15T16:45:00Z',
        likes: 8
      },
      {
        id: 'reply-3',
        content: 'I can help with research on the Kongo Kingdom and Benin Empire. I have access to some academic resources through my university that might be helpful.',
        author: {
          id: 'user-4',
          name: 'David Chen',
          username: 'davidc',
        avatarUrl: undefined
        },
        createdAt: '2025-02-16T09:20:00Z',
        likes: 5
      }
    ],
    'topic-3': [
      {
        id: 'reply-4',
        content: 'I\'m excited about this event! Will there be any training sessions for new editors before the edit-a-thon?',
        author: {
          id: 'user-4',
          name: 'David Chen',
          username: 'davidc',
        avatarUrl: undefined
        },
        createdAt: '2025-02-25T09:15:00Z',
        likes: 3
      },
      {
        id: 'reply-5',
        content: 'Yes, we\'ll be hosting two training sessions: one on March 5th at 6pm EST and another on March 6th at 10am EST. I\'ll update the event page with these details.',
        author: {
          id: 'user-2',
          name: 'Marcus Williams',
          username: 'marcusw',
        avatarUrl: undefined
        },
        createdAt: '2025-02-25T10:30:00Z',
        editedAt: '2025-02-25T10:35:00Z',
        likes: 7
      },
      {
        id: 'reply-6',
        content: 'I\'ve created a shared document with a list of potential articles to create or improve during the edit-a-thon. Feel free to add suggestions: [link to document]',
        author: {
          id: 'user-1',
          name: 'Amina Johnson',
          username: 'aminaj',
          avatarUrl: '/images/avatars/amina.jpg'
        },
        createdAt: '2025-02-25T14:50:00Z',
        likes: 15,
        isAccepted: true
      }
    ]
  };
  
  return repliesMap[topicId] || [];
};

// Mock data for edit suggestions
export const getEditSuggestions = (): EditSuggestion[] => {
  return [
    {
      id: 'edit-1',
      articleId: 'article-1',
      articleTitle: 'Harlem Renaissance',
      author: {
        id: 'user-4',
        name: 'David Chen',
        username: 'davidc',
        avatarUrl: '/images/avatars/david.jpg'
      },
      createdAt: '2025-02-28T11:20:00Z',
      status: 'pending',
      summary: 'Added section on musical contributions and expanded the literature section',
      changes: {
        added: 1250,
        removed: 340
      },
      reviewers: [
        {
          id: 'user-1',
          name: 'Amina Johnson',
          username: 'aminaj',
          avatarUrl: '/images/avatars/amina.jpg'
        }
      ]
    },
    {
      id: 'edit-2',
      articleId: 'article-2',
      articleTitle: 'Civil Rights Movement',
      author: {
        id: 'user-1',
        name: 'Amina Johnson',
        username: 'aminaj',
        avatarUrl: '/images/avatars/amina.jpg'
      },
      createdAt: '2025-02-27T09:45:00Z',
      status: 'approved',
      summary: 'Updated information about the Montgomery Bus Boycott with new sources',
      changes: {
        added: 780,
        removed: 520
      },
      reviewers: [
        {
          id: 'user-5',
          name: 'Fatima Al-Hassan',
          username: 'fatimah',
          avatarUrl: '/images/avatars/fatima.jpg'
        },
        {
          id: 'user-3',
          name: 'Zainab Mensah',
          username: 'zainabm',
          avatarUrl: '/images/avatars/zainab.jpg'
        }
      ]
    },
    {
      id: 'edit-3',
      articleId: 'article-3',
      articleTitle: 'Great Migration',
      author: {
        id: 'user-5',
        name: 'Fatima Al-Hassan',
        username: 'fatimah',
        avatarUrl: '/images/avatars/fatima.jpg'
      },
      createdAt: '2025-02-26T14:30:00Z',
      status: 'merged',
      summary: 'Added demographic data and maps showing migration patterns',
      changes: {
        added: 1540,
        removed: 120
      },
      reviewers: [
        {
          id: 'user-2',
          name: 'Marcus Williams',
          username: 'marcusw',
          avatarUrl: '/images/avatars/marcus.jpg'
        }
      ]
    },
    {
      id: 'edit-4',
      articleId: 'article-4',
      articleTitle: 'Jazz History',
      author: {
        id: 'user-3',
        name: 'Zainab Mensah',
        username: 'zainabm',
        avatarUrl: '/images/avatars/zainab.jpg'
      },
      createdAt: '2025-02-25T16:15:00Z',
      status: 'rejected',
      summary: 'Reorganized article structure and added new section on fusion genres',
      changes: {
        added: 2100,
        removed: 1850
      },
      reviewers: [
        {
          id: 'user-4',
          name: 'David Chen',
          username: 'davidc',
          avatarUrl: '/images/avatars/david.jpg'
        },
        {
          id: 'user-1',
          name: 'Amina Johnson',
          username: 'aminaj',
          avatarUrl: '/images/avatars/amina.jpg'
        }
      ]
    },
    {
      id: 'edit-5',
      articleId: 'article-5',
      articleTitle: 'African Diaspora',
      author: {
        id: 'user-2',
        name: 'Marcus Williams',
        username: 'marcusw',
        avatarUrl: '/images/avatars/marcus.jpg'
      },
      createdAt: '2025-02-28T08:50:00Z',
      status: 'pending',
      summary: 'Added comprehensive section on cultural impacts across the Americas',
      changes: {
        added: 3200,
        removed: 450
      },
      reviewers: [
        {
          id: 'user-5',
          name: 'Fatima Al-Hassan',
          username: 'fatimah',
          avatarUrl: '/images/avatars/fatima.jpg'
        }
      ]
    }
  ];
};

// Mock data for community events
export const getCommunityEvents = (): CommunityEvent[] => {
  return [
    {
      id: 'event-1',
      title: 'Black Scientists and Inventors Edit-a-thon',
      description: 'Join us for a virtual edit-a-thon focused on improving and creating articles about Black scientists, inventors, and their contributions. Training sessions will be provided for new editors.',
      startDate: '2025-03-15T14:00:00Z',
      endDate: '2025-03-15T20:00:00Z',
      location: 'Virtual (Zoom)',
      isVirtual: true,
      organizer: {
        id: 'user-2',
        name: 'Marcus Williams',
        username: 'marcusw'
      },
      attendees: 42,
      maxAttendees: 100,
      tags: ['edit-a-thon', 'science', 'technology', 'virtual'],
      imageUrl: undefined
    },
    {
      id: 'event-2',
      title: 'AfroWiki Community Conference 2025',
      description: 'Our annual conference bringing together editors, contributors, and readers from around the world to discuss the future of AfroWiki and share knowledge about Black history and culture.',
      startDate: '2025-06-10T09:00:00Z',
      endDate: '2025-06-12T18:00:00Z',
      location: 'Howard University, Washington D.C.',
      isVirtual: false,
      organizer: {
        id: 'user-2',
        name: 'Marcus Williams',
        username: 'marcusw'
      },
      attendees: 156,
      maxAttendees: 300,
      tags: ['conference', 'in-person', 'annual', 'community'],
      imageUrl: undefined
    },
    {
      id: 'event-3',
      title: 'New Editor Training Workshop',
      description: 'Learn the basics of editing on AfroWiki in this interactive workshop. Topics include article creation, editing, citing sources, and community guidelines.',
      startDate: '2025-03-05T18:00:00Z',
      endDate: '2025-03-05T20:00:00Z',
      location: 'Virtual (Zoom)',
      isVirtual: true,
      organizer: {
        id: 'user-3',
        name: 'Zainab Mensah',
        username: 'zainabm'
      },
      attendees: 28,
      maxAttendees: 50,
      tags: ['training', 'workshop', 'beginners', 'virtual'],
      imageUrl: undefined
    },
    {
      id: 'event-4',
      title: 'African Literature Roundtable',
      description: 'Join our discussion on improving coverage of African literature on AfroWiki. We\'ll identify gaps in our current content and develop strategies for better representation.',
      startDate: '2025-03-20T15:00:00Z',
      endDate: '2025-03-20T17:00:00Z',
      location: 'Virtual (Discord)',
      isVirtual: true,
      organizer: {
        id: 'user-1',
        name: 'Amina Johnson',
        username: 'aminaj'
      },
      attendees: 18,
      tags: ['literature', 'discussion', 'content-planning', 'virtual']
    },
    {
      id: 'event-5',
      title: 'AfroWiki Local Meetup: New York City',
      description: 'Meet fellow AfroWiki editors and contributors in the NYC area. Network, share ideas, and collaborate on local history projects.',
      startDate: '2025-04-08T18:30:00Z',
      endDate: '2025-04-08T21:00:00Z',
      location: 'Schomburg Center for Research in Black Culture, New York',
      isVirtual: false,
      organizer: {
        id: 'user-4',
        name: 'David Chen',
        username: 'davidc'
      },
      attendees: 15,
      maxAttendees: 30,
      tags: ['meetup', 'in-person', 'networking', 'local'],
      imageUrl: undefined
    }
  ];
};

// Mock data for mentorship programs
export const getMentorshipPrograms = (): MentorshipProgram[] => {
  return [
    {
      id: 'mentorship-1',
      title: 'New Editor Mentorship Program',
      description: 'A six-week program designed to help new editors learn the basics of contributing to AfroWiki through one-on-one guidance from an experienced editor.',
      mentor: {
        id: 'user-1',
        name: 'Amina Johnson',
        username: 'aminaj',
        avatarUrl: '/images/avatars/amina.jpg',
        expertise: ['Editing', 'Research', 'Content Development']
      },
      duration: '6 weeks',
      topics: ['Basic Editing', 'Research Methods', 'Citation Standards', 'Community Guidelines'],
      capacity: 5,
      enrolled: 3,
      status: 'active'
    },
    {
      id: 'mentorship-2',
      title: 'Advanced Research Techniques',
      description: 'Learn advanced research methods for finding reliable sources on African history and culture, with a focus on academic databases and primary sources.',
      mentor: {
        id: 'user-5',
        name: 'Fatima Al-Hassan',
        username: 'fatimah',
        avatarUrl: '/images/avatars/fatima.jpg',
        expertise: ['Academic Research', 'Primary Sources', 'African History']
      },
      duration: '4 weeks',
      topics: ['Academic Databases', 'Primary Sources', 'Oral History Documentation', 'Source Evaluation'],
      capacity: 8,
      enrolled: 8,
      status: 'active'
    },
    {
      id: 'mentorship-3',
      title: 'Content Quality Improvement',
      description: 'A mentorship focused on improving existing articles to meet AfroWiki\'s quality standards, including proper sourcing, neutral point of view, and comprehensive coverage.',
      mentor: {
        id: 'user-3',
        name: 'Zainab Mensah',
        username: 'zainabm',
        avatarUrl: '/images/avatars/zainab.jpg',
        expertise: ['Content Quality', 'Editing', 'Neutrality']
      },
      duration: '8 weeks',
      topics: ['Content Assessment', 'Quality Standards', 'Neutrality', 'Comprehensive Coverage'],
      capacity: 6,
      enrolled: 4,
      status: 'active'
    },
    {
      id: 'mentorship-4',
      title: 'Technical Skills for Wiki Editing',
      description: 'Learn the technical aspects of wiki editing, including templates, infoboxes, categories, and basic HTML/CSS for formatting.',
      mentor: {
        id: 'user-2',
        name: 'Marcus Williams',
        username: 'marcusw',
        avatarUrl: '/images/avatars/marcus.jpg',
        expertise: ['Technical Skills', 'Templates', 'Wiki Syntax']
      },
      duration: '5 weeks',
      topics: ['Wiki Syntax', 'Templates', 'Infoboxes', 'Categories', 'Basic HTML/CSS'],
      capacity: 10,
      enrolled: 7,
      status: 'upcoming'
    },
    {
      id: 'mentorship-5',
      title: 'Cultural Arts Documentation',
      description: 'Specialized mentorship on documenting various forms of Black cultural arts, including music, visual arts, dance, and literature.',
      mentor: {
        id: 'user-4',
        name: 'David Chen',
        username: 'davidc',
        avatarUrl: '/images/avatars/david.jpg',
        expertise: ['Arts', 'Music', 'Cultural Documentation']
      },
      duration: '10 weeks',
      topics: ['Music Documentation', 'Visual Arts', 'Performance Arts', 'Literary Analysis'],
      capacity: 4,
      enrolled: 4,
      status: 'completed'
    }
  ];
};

// Mock data for community projects
export const getCommunityProjects = (): CommunityProject[] => {
  return [
    {
      id: 'project-1',
      title: 'African Kingdoms Portal',
      description: 'A comprehensive portal covering pre-colonial African kingdoms, with standardized templates, maps, and timelines to improve navigation and content discovery.',
      status: 'in-progress',
      startDate: '2025-01-15',
      lead: {
        id: 'user-5',
        name: 'Fatima Al-Hassan',
        username: 'fatimah'
      },
      members: 12,
      progress: 65,
      tags: ['portal', 'history', 'kingdoms', 'pre-colonial']
    },
    {
      id: 'project-2',
      title: 'Black Scientists Database',
      description: 'Creating a structured database of Black scientists and their contributions throughout history, with standardized biographical information and achievement metrics.',
      status: 'planning',
      startDate: '2025-03-01',
      lead: {
        id: 'user-2',
        name: 'Marcus Williams',
        username: 'marcusw'
      },
      members: 8,
      progress: 25,
      tags: ['database', 'science', 'biography', 'achievements']
    },
    {
      id: 'project-3',
      title: 'Diaspora Music Documentation',
      description: 'Documenting the evolution and impact of music across the African diaspora, including genres, influential artists, and cultural significance.',
      status: 'in-progress',
      startDate: '2024-11-10',
      lead: {
        id: 'user-4',
        name: 'David Chen',
        username: 'davidc'
      },
      members: 15,
      progress: 40,
      tags: ['music', 'diaspora', 'cultural-impact', 'documentation']
    },
    {
      id: 'project-4',
      title: 'Civil Rights Movement Timeline',
      description: 'Creating an interactive timeline of the Civil Rights Movement, with detailed articles for key events, figures, and legislative changes.',
      status: 'completed',
      startDate: '2024-08-15',
      endDate: '2025-02-20',
      lead: {
        id: 'user-1',
        name: 'Amina Johnson',
        username: 'aminaj'
      },
      members: 10,
      progress: 100,
      tags: ['civil-rights', 'timeline', 'history', 'interactive']
    },
    {
      id: 'project-5',
      title: 'African Literature Translation',
      description: 'Translating key articles about African literature into multiple languages to improve accessibility and global reach.',
      status: 'in-progress',
      startDate: '2025-02-01',
      lead: {
        id: 'user-3',
        name: 'Zainab Mensah',
        username: 'zainabm'
      },
      members: 20,
      progress: 30,
      tags: ['translation', 'literature', 'accessibility', 'multilingual']
    }
  ];
};

// Mock data for community announcements
export const getCommunityAnnouncements = (): CommunityAnnouncement[] => {
  return [
    {
      id: 'announcement-1',
      title: 'Platform Update: New Citation Verification Tool',
      content: 'We\'re excited to announce the launch of our new citation verification tool, which automatically checks citations against reliable sources and identifies potential issues. This tool is now available in the editor toolbar.',
      author: {
        id: 'user-2',
        name: 'Marcus Williams',
        role: 'Admin'
      },
      publishedAt: '2025-02-28T10:00:00Z',
      category: 'Technical',
      importance: 'high'
    },
    {
      id: 'announcement-2',
      title: 'Community Conference 2025: Registration Now Open',
      content: 'Registration for the AfroWiki Community Conference 2025 is now open! Join us June 10-12 at Howard University in Washington D.C. for three days of workshops, discussions, and networking. Early bird registration is available until April 15.',
      author: {
        id: 'user-2',
        name: 'Marcus Williams',
        role: 'Admin'
      },
      publishedAt: '2025-02-25T14:30:00Z',
      category: 'Events',
      importance: 'medium'
    },
    {
      id: 'announcement-3',
      title: 'Updated Community Guidelines',
      content: 'We\'ve updated our community guidelines to provide clearer guidance on neutrality, verifiability, and respectful communication. All editors are encouraged to review the changes, which go into effect on March 15.',
      author: {
        id: 'user-3',
        name: 'Zainab Mensah',
        role: 'Moderator'
      },
      publishedAt: '2025-02-20T09:15:00Z',
      category: 'Policies',
      importance: 'high'
    },
    {
      id: 'announcement-4',
      title: 'New Mentorship Programs Available',
      content: 'We\'ve launched several new mentorship programs to help editors develop their skills in specific areas. Check out the Mentorship Portal to see available programs and apply.',
      author: {
        id: 'user-1',
        name: 'Amina Johnson',
        role: 'Editor'
      },
      publishedAt: '2025-02-18T11:45:00Z',
      category: 'Community',
      importance: 'medium'
    },
    {
      id: 'announcement-5',
      title: 'Content Drive: African Literature',
      content: 'We\'re launching a focused content drive to improve our coverage of African literature. Join us in creating and expanding articles on authors, works, literary movements, and traditions from across the continent.',
      author: {
        id: 'user-5',
        name: 'Fatima Al-Hassan',
        role: 'Reviewer'
      },
      publishedAt: '2025-02-15T13:20:00Z',
      category: 'Content',
      importance: 'medium'
    }
  ];
};
