"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiBarChart2, FiSettings } from 'react-icons/fi';

interface AdminGreetingHeaderProps {
  user: {
    name?: string | null;
    id: string;
  };
  totalUsers: number;
  totalArticles: number;
  pendingReviews: number;
  pageName?: string;
}

export default function AdminGreetingHeader({ 
  user, 
  totalUsers, 
  totalArticles, 
  pendingReviews, 
  pageName 
}: AdminGreetingHeaderProps) {
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
            <h1 className="text-2xl font-normal">{greeting}, {user.name || 'Admin'}</h1>
            {pageName && <span className="text-gray-400">• {pageName}</span>}
          </div>
          <p className="text-gray-400 mt-1">
            {`Platform overview: ${totalUsers} users, ${totalArticles} articles, ${pendingReviews} pending reviews.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/analytics" 
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-2"
          >
            <FiBarChart2 size={16} />
            <span>Analytics</span>
          </Link>
          <Link 
            href="/admin/settings" 
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
            title="Admin Settings"
          >
            <FiSettings size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
