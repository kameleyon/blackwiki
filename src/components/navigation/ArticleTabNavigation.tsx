"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiFileText, FiMessageSquare, FiEdit, FiClock } from 'react-icons/fi';

interface ArticleTabNavigationProps {
  articleSlug: string;
  articleTitle: string;
}

export default function ArticleTabNavigation({ articleSlug, articleTitle }: ArticleTabNavigationProps) {
  const pathname = usePathname();
  
  const tabs = [
    {
      key: 'article',
      label: 'Article',
      href: `/articles/${articleSlug}`,
      icon: FiFileText,
      description: 'Read the main content'
    },
    {
      key: 'talk',
      label: 'Discussion',
      href: `/articles/${articleSlug}/talk`,
      icon: FiMessageSquare,
      description: 'Community discussion'
    },
    {
      key: 'edit',
      label: 'Edit',
      href: `/articles/${articleSlug}/edit`,
      icon: FiEdit,
      description: 'Edit this article'
    },
    {
      key: 'history',
      label: 'History',
      href: `/articles/${articleSlug}#history`,
      icon: FiClock,
      description: 'View edit history'
    }
  ];

  return (
    <nav className="border-b border-white/10 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-normal">{articleTitle}</h1>
      </div>
      
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const isActive = 
            (tab.key === 'article' && pathname === tab.href) ||
            (tab.key !== 'article' && pathname.includes(tab.href));
          
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                isActive
                  ? 'bg-white/10 text-white border-b-2 border-blue-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title={tab.description}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}