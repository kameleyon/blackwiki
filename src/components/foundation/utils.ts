"use client";

import { 
  Policy, 
  DonationTier, 
  OrganizationMember, 
  WikipediaStylePage, 
  SpecialPage, 
  WikipediaStyleTool,
  HelpDocumentation,
  LegalDocument,
  LanguageOption,
  StatisticMetric
} from './types';

// Mock data for policies
export const getPolicies = (): Policy[] => {
  return [
    {
      id: 'policy-1',
      title: 'Universal Code of Conduct',
      description: 'Guidelines for participation in the AfroWiki community, promoting respectful and inclusive behavior.',
      lastUpdated: '2025-02-15',
      url: '/policies/code-of-conduct',
    },
    {
      id: 'policy-2',
      title: 'Content Policy',
      description: 'Standards for content creation, editing, and maintenance on AfroWiki.',
      lastUpdated: '2025-02-10',
      url: '/policies/content',
    },
    {
      id: 'policy-3',
      title: 'Privacy Policy',
      description: 'How AfroWiki collects, uses, and protects user data and information.',
      lastUpdated: '2025-01-20',
      url: '/privacy',
    },
    {
      id: 'policy-4',
      title: 'Terms of Service',
      description: 'Legal agreement between users and AfroWiki governing the use of the platform.',
      lastUpdated: '2025-01-20',
      url: '/terms',
    },
    {
      id: 'policy-5',
      title: 'Copyright Policy',
      description: 'Guidelines for copyright compliance and handling of copyrighted material.',
      lastUpdated: '2025-01-15',
      url: '/policies/copyright',
    },
    {
      id: 'policy-6',
      title: 'General Disclaimer',
      description: 'Limitations of liability and disclaimers regarding content accuracy and use.',
      lastUpdated: '2025-01-10',
      url: '/policies/disclaimer',
    },
    {
      id: 'policy-7',
      title: 'Cookie Statement',
      description: 'Information about how AfroWiki uses cookies and similar technologies.',
      lastUpdated: '2025-01-05',
      url: '/policies/cookies',
    },
  ];
};

// Mock data for donation tiers
export const getDonationTiers = (): DonationTier[] => {
  return [
    {
      id: 'tier-1',
      name: 'Supporter',
      amount: 5,
      description: 'Support AfroWiki with a small monthly contribution.',
      benefits: ['Ad-free browsing', 'Supporter badge on profile'],
      isRecurring: true,
    },
    {
      id: 'tier-2',
      name: 'Contributor',
      amount: 10,
      description: 'Help sustain AfroWiki with a regular contribution.',
      benefits: ['Ad-free browsing', 'Contributor badge on profile', 'Early access to new features'],
      isRecurring: true,
    },
    {
      id: 'tier-3',
      name: 'Sustainer',
      amount: 25,
      description: 'Provide substantial support for AfroWiki\'s mission.',
      benefits: [
        'Ad-free browsing', 
        'Sustainer badge on profile', 
        'Early access to new features',
        'Invitation to quarterly community meetings'
      ],
      isRecurring: true,
    },
    {
      id: 'tier-4',
      name: 'Patron',
      amount: 100,
      description: 'Make a significant impact with your support.',
      benefits: [
        'Ad-free browsing', 
        'Patron badge on profile', 
        'Early access to new features',
        'Invitation to quarterly community meetings',
        'Name listed on supporters page',
        'Annual impact report'
      ],
      isRecurring: true,
    },
    {
      id: 'tier-5',
      name: 'One-time Donation',
      amount: 0,
      description: 'Support AfroWiki with a one-time donation of any amount.',
      benefits: ['Ad-free browsing for 30 days', 'Supporter badge for 30 days'],
      isRecurring: false,
    },
  ];
};

// Mock data for organization members
export const getOrganizationMembers = (): OrganizationMember[] => {
  return [
    {
      id: 'member-1',
      name: 'Dr. Amara Johnson',
      role: 'Board Chair',
      bio: 'Dr. Johnson is a historian specializing in African diaspora studies with over 20 years of experience in academia.',
      imageUrl: '/images/members/amara-johnson.jpg',
      socialLinks: {
        website: 'https://example.com/amara',
        twitter: 'https://twitter.com/amarajohnson',
        linkedin: 'https://linkedin.com/in/amarajohnson',
      },
    },
    {
      id: 'member-2',
      name: 'Marcus Williams',
      role: 'Executive Director',
      bio: 'Marcus has led digital knowledge initiatives for 15 years and is passionate about making information accessible to all.',
      imageUrl: '/images/members/marcus-williams.jpg',
      socialLinks: {
        website: 'https://example.com/marcus',
        linkedin: 'https://linkedin.com/in/marcuswilliams',
      },
    },
    {
      id: 'member-3',
      name: 'Dr. Nadia Okafor',
      role: 'Content Director',
      bio: 'Dr. Okafor oversees content quality and accuracy, bringing her expertise as a professor of African Studies.',
      imageUrl: '/images/members/nadia-okafor.jpg',
      socialLinks: {
        website: 'https://example.com/nadia',
        twitter: 'https://twitter.com/nadiaokafor',
      },
    },
    {
      id: 'member-4',
      name: 'James Carter',
      role: 'Technology Director',
      bio: 'James leads the technical development of AfroWiki, with a background in open-source knowledge platforms.',
      imageUrl: '/images/members/james-carter.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/jamescarter',
      },
    },
    {
      id: 'member-5',
      name: 'Zainab Mensah',
      role: 'Community Director',
      bio: 'Zainab manages community engagement and volunteer coordination, with experience in community-driven projects.',
      imageUrl: '/images/members/zainab-mensah.jpg',
      socialLinks: {
        twitter: 'https://twitter.com/zainabmensah',
        linkedin: 'https://linkedin.com/in/zainabmensah',
      },
    },
  ];
};

// Mock data for Wikipedia-style pages
export const getWikipediaStylePages = (): WikipediaStylePage[] => {
  return [
    {
      id: 'page-1',
      title: 'Main Page',
      description: 'The landing page with featured content and highlights.',
      url: '/',
      icon: 'home',
    },
    {
      id: 'page-2',
      title: 'About AfroWiki',
      description: 'Information about the AfroWiki project and its mission.',
      url: '/about',
      icon: 'info',
    },
    {
      id: 'page-3',
      title: 'Community Portal',
      description: 'Central hub for community members and contributors.',
      url: '/community',
      icon: 'users',
    },
    {
      id: 'page-4',
      title: 'Village Pump',
      description: 'Forum for discussions about AfroWiki policies and operations.',
      url: '/village-pump',
      icon: 'message-square',
    },
    {
      id: 'page-5',
      title: 'Reference Desk',
      description: 'Place to ask factual questions about topics covered by AfroWiki.',
      url: '/reference-desk',
      icon: 'book-open',
    },
    {
      id: 'page-6',
      title: 'New Contributors Help',
      description: 'Guidance for new contributors on how to get started.',
      url: '/help/new-contributors',
      icon: 'help-circle',
    },
    {
      id: 'page-7',
      title: 'Sandbox',
      description: 'Practice area for editing and formatting.',
      url: '/sandbox',
      icon: 'edit-3',
    },
    {
      id: 'page-8',
      title: 'Teahouse',
      description: 'Friendly space for newcomers to ask questions.',
      url: '/teahouse',
      icon: 'coffee',
    },
    {
      id: 'page-9',
      title: 'Notability Guidelines',
      description: 'Criteria for determining if a topic merits an article.',
      url: '/notability',
      icon: 'check-square',
    },
    {
      id: 'page-10',
      title: 'Reliable Sources Guide',
      description: 'Guidelines for identifying and using reliable sources.',
      url: '/reliable-sources',
      icon: 'file-text',
    },
  ];
};

// Mock data for special pages
export const getSpecialPages = (): SpecialPage[] => {
  return [
    {
      id: 'special-1',
      title: 'Recent Changes',
      description: 'List of recent edits to AfroWiki articles.',
      url: '/special/recent-changes',
      icon: 'clock',
    },
    {
      id: 'special-2',
      title: 'Random Article',
      description: 'Load a random article from AfroWiki.',
      url: '/special/random',
      icon: 'shuffle',
    },
    {
      id: 'special-3',
      title: 'Statistics',
      description: 'Statistics about AfroWiki content and users.',
      url: '/special/statistics',
      icon: 'bar-chart-2',
    },
    {
      id: 'special-4',
      title: 'Maintenance Reports',
      description: 'Reports on articles needing maintenance or improvement.',
      url: '/special/maintenance',
      icon: 'tool',
    },
    {
      id: 'special-5',
      title: 'Page Logs',
      description: 'Logs of actions performed on pages.',
      url: '/special/logs',
      icon: 'list',
    },
    {
      id: 'special-6',
      title: 'User Contributions',
      description: 'View contributions made by a specific user.',
      url: '/special/contributions',
      icon: 'user',
    },
    {
      id: 'special-7',
      title: 'What Links Here',
      description: 'Find pages that link to a specific page.',
      url: '/special/what-links-here',
      icon: 'link',
    },
    {
      id: 'special-8',
      title: 'Export/Import',
      description: 'Tools for exporting and importing wiki content.',
      url: '/special/export-import',
      icon: 'download',
    },
  ];
};

// Mock data for Wikipedia-style tools
export const getWikipediaStyleTools = (): WikipediaStyleTool[] => {
  return [
    {
      id: 'tool-1',
      name: 'Page History Comparison',
      description: 'Compare different versions of a page.',
      url: '/tools/history-comparison',
      icon: 'git-branch',
    },
    {
      id: 'tool-2',
      name: 'Edit Conflict Resolution',
      description: 'Resolve conflicts when multiple users edit the same page.',
      url: '/tools/edit-conflict',
      icon: 'git-merge',
    },
    {
      id: 'tool-3',
      name: 'Category Tree Navigation',
      description: 'Navigate through the hierarchy of categories.',
      url: '/tools/category-tree',
      icon: 'folder-tree',
    },
    {
      id: 'tool-4',
      name: 'Interwiki Linking',
      description: 'Link to pages on other wikis or external sites.',
      url: '/tools/interwiki',
      icon: 'external-link',
    },
    {
      id: 'tool-5',
      name: 'Template System',
      description: 'Create and manage reusable content templates.',
      url: '/tools/templates',
      icon: 'copy',
    },
    {
      id: 'tool-6',
      name: 'Transclusion Support',
      description: 'Include content from one page in another.',
      url: '/tools/transclusion',
      icon: 'layers',
    },
    {
      id: 'tool-7',
      name: 'Special Character Insertion',
      description: 'Insert special characters and symbols.',
      url: '/tools/special-characters',
      icon: 'type',
    },
    {
      id: 'tool-8',
      name: 'Citation Templates',
      description: 'Templates for formatting citations and references.',
      url: '/tools/citation-templates',
      icon: 'bookmark',
    },
    {
      id: 'tool-9',
      name: 'Navigation Templates',
      description: 'Templates for creating navigation boxes.',
      url: '/tools/navigation-templates',
      icon: 'navigation',
    },
    {
      id: 'tool-10',
      name: 'Infobox System',
      description: 'Create and manage infoboxes for articles.',
      url: '/tools/infoboxes',
      icon: 'box',
    },
  ];
};

// Mock data for help documentation
export const getHelpDocumentation = (): HelpDocumentation[] => {
  return [
    {
      id: 'help-1',
      title: 'Editing Basics',
      description: 'Learn the basics of editing articles on AfroWiki.',
      url: '/help/editing-basics',
      category: 'Editing',
    },
    {
      id: 'help-2',
      title: 'Formatting Guide',
      description: 'Guide to formatting text, lists, tables, and more.',
      url: '/help/formatting',
      category: 'Editing',
    },
    {
      id: 'help-3',
      title: 'Adding Citations',
      description: 'How to add citations and references to articles.',
      url: '/help/citations',
      category: 'Editing',
    },
    {
      id: 'help-4',
      title: 'Uploading Images',
      description: 'Guidelines for uploading and using images.',
      url: '/help/images',
      category: 'Media',
    },
    {
      id: 'help-5',
      title: 'Creating New Articles',
      description: 'Step-by-step guide to creating new articles.',
      url: '/help/creating-articles',
      category: 'Content Creation',
    },
    {
      id: 'help-6',
      title: 'Categories and Tags',
      description: 'How to use categories and tags for organization.',
      url: '/help/categories-tags',
      category: 'Organization',
    },
    {
      id: 'help-7',
      title: 'Talk Pages',
      description: 'Using talk pages for discussion about articles.',
      url: '/help/talk-pages',
      category: 'Community',
    },
    {
      id: 'help-8',
      title: 'User Pages',
      description: 'Creating and customizing your user page.',
      url: '/help/user-pages',
      category: 'Community',
    },
    {
      id: 'help-9',
      title: 'Reverting Vandalism',
      description: 'How to identify and revert vandalism.',
      url: '/help/vandalism',
      category: 'Moderation',
    },
    {
      id: 'help-10',
      title: 'Manual of Style',
      description: 'Comprehensive guide to AfroWiki\'s style conventions.',
      url: '/help/manual-of-style',
      category: 'Style',
    },
  ];
};

// Mock data for legal documents
export const getLegalDocuments = (): LegalDocument[] => {
  return [
    {
      id: 'legal-1',
      title: 'Terms of Service',
      description: 'Legal agreement governing the use of AfroWiki.',
      lastUpdated: '2025-01-20',
      url: '/terms',
    },
    {
      id: 'legal-2',
      title: 'Privacy Policy',
      description: 'How AfroWiki collects, uses, and protects user data.',
      lastUpdated: '2025-01-20',
      url: '/privacy',
    },
    {
      id: 'legal-3',
      title: 'Content Licensing',
      description: 'Licensing terms for content contributed to AfroWiki.',
      lastUpdated: '2025-01-15',
      url: '/licensing',
    },
    {
      id: 'legal-4',
      title: 'DMCA Policy',
      description: 'Procedures for reporting copyright infringement.',
      lastUpdated: '2025-01-10',
      url: '/dmca',
    },
    {
      id: 'legal-5',
      title: 'Contributor Agreement',
      description: 'Terms for contributing content to AfroWiki.',
      lastUpdated: '2025-01-05',
      url: '/contributor-agreement',
    },
    {
      id: 'legal-6',
      title: 'Cookie Policy',
      description: 'Information about how AfroWiki uses cookies.',
      lastUpdated: '2025-01-01',
      url: '/cookies',
    },
    {
      id: 'legal-7',
      title: 'Data Retention Policy',
      description: 'How long AfroWiki retains different types of data.',
      lastUpdated: '2024-12-20',
      url: '/data-retention',
    },
  ];
};

// Mock data for language options
export const getLanguageOptions = (): LanguageOption[] => {
  return [
    { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
    { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
    { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRTL: false },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', isRTL: false },
    { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', isRTL: false },
    { code: 'ha', name: 'Hausa', nativeName: 'Hausa', isRTL: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', isRTL: false },
    { code: 'ig', name: 'Igbo', nativeName: 'Igbo', isRTL: false },
    { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', isRTL: false },
    { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', isRTL: false },
    { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', isRTL: false },
  ];
};

// Mock data for statistics
export const getStatistics = (): StatisticMetric[] => {
  return [
    {
      id: 'stat-1',
      name: 'Total Articles',
      value: 15782,
      change: 3.2,
      changeType: 'increase',
      description: 'Total number of articles on AfroWiki',
      icon: 'file-text',
    },
    {
      id: 'stat-2',
      name: 'Active Editors',
      value: 1243,
      change: 5.7,
      changeType: 'increase',
      description: 'Users who made at least one edit in the last 30 days',
      icon: 'edit-2',
    },
    {
      id: 'stat-3',
      name: 'Total Edits',
      value: 287459,
      change: 2.8,
      changeType: 'increase',
      description: 'Total number of edits made to all articles',
      icon: 'edit-3',
    },
    {
      id: 'stat-4',
      name: 'New Users',
      value: 342,
      change: 1.5,
      changeType: 'decrease',
      description: 'New user registrations in the last 30 days',
      icon: 'user-plus',
    },
    {
      id: 'stat-5',
      name: 'Page Views',
      value: '1.2M',
      change: 4.3,
      changeType: 'increase',
      description: 'Total page views in the last 30 days',
      icon: 'eye',
    },
    {
      id: 'stat-6',
      name: 'Featured Articles',
      value: 87,
      change: 2,
      changeType: 'increase',
      description: 'Articles that have achieved featured status',
      icon: 'star',
    },
    {
      id: 'stat-7',
      name: 'Languages',
      value: 13,
      change: 8.3,
      changeType: 'increase',
      description: 'Number of languages supported',
      icon: 'globe',
    },
    {
      id: 'stat-8',
      name: 'Citations',
      value: 423891,
      change: 3.9,
      changeType: 'increase',
      description: 'Total number of citations across all articles',
      icon: 'bookmark',
    },
  ];
};
