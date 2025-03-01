"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiEdit, FiSettings } from 'react-icons/fi';

interface GreetingHeaderProps {
  user: {
    name?: string | null;
    id: string;
  };
  totalArticles: number;
  publishedArticles: number;
  pageName?: string;
}

export default function GreetingHeader({ user, totalArticles, publishedArticles, pageName }: GreetingHeaderProps) {
  const [greeting, setGreeting] = useState('Good day');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="bg-white/5 rounded-xl p-6 mb-8 shadow-sm shadow-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-normal">{greeting}, {user.name || 'Scholar'}</h1>
            {pageName && <span className="text-gray-400">• {pageName}</span>}
          </div>
          <p className="text-gray-400 mt-1">
            {totalArticles > 0 
              ? `You have ${publishedArticles} published article${publishedArticles !== 1 ? 's' : ''} and ${totalArticles - publishedArticles} draft${totalArticles - publishedArticles !== 1 ? 's' : ''}.` 
              : 'Start your journey by creating your first article.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/articles/new" 
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-2"
          >
            <FiEdit size={16} />
            <span>New Article</span>
          </Link>
          <Link 
            href="/settings" 
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
            title="Dashboard Settings"
          >
            <FiSettings size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
