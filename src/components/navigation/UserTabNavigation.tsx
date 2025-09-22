"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiUser, FiMessageSquare, FiEdit, FiList } from 'react-icons/fi';

interface UserTabNavigationProps {
  username: string;
  displayName?: string;
  isOwnProfile?: boolean;
}

export default function UserTabNavigation({ username, displayName, isOwnProfile = false }: UserTabNavigationProps) {
  const pathname = usePathname();
  
  const tabs = [
    {
      key: 'profile',
      label: 'User page',
      href: `/users/${encodeURIComponent(username)}`,
      icon: FiUser,
      description: 'View user profile and contributions'
    },
    {
      key: 'talk',
      label: 'User talk',
      href: `/users/${encodeURIComponent(username)}/talk`,
      icon: FiMessageSquare,
      description: isOwnProfile ? 'Your talk page messages' : `Talk to ${displayName || username}`
    }
  ];

  // Add edit tab for own profile
  if (isOwnProfile) {
    tabs.splice(1, 0, {
      key: 'edit',
      label: 'Preferences',
      href: `/users/${encodeURIComponent(username)}/edit`,
      icon: FiEdit,
      description: 'Edit your profile'
    });
  }

  return (
    <nav className="border-b border-white/10 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-normal">
          {displayName || username}
          {isOwnProfile && <span className="text-white/50 ml-2">(You)</span>}
        </h1>
      </div>
      
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const isActive = 
            (tab.key === 'profile' && pathname === tab.href) ||
            (tab.key !== 'profile' && pathname.includes(tab.href));
          
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