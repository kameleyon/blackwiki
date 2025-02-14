"use client";

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { FiList, FiFilePlus, FiUser, FiSettings, FiLogOut } from 'react-icons/fi'

type UserNavProps = {
  currentPath: string;
}

export default function UserNav({ currentPath }: UserNavProps) {
  return (
    <div className="flex items-center justify-end gap-3 sm:gap-6 mb-4 sm:mb-8">
      <Link 
        href="/dashboard" 
        className={`flex items-center gap-2 ${
          currentPath === '/dashboard' 
            ? 'text-gray-200 font-medium' 
            : 'text-gray-600 hover:text-gray-200'
        }`}
        title="Articles"
      >
        <FiList size={20} />
        <span className="hidden sm:inline">Articles</span>
      </Link>
      <Link 
        href="/articles/new" 
        className={`flex items-center gap-2 ${
          currentPath === '/articles/new' 
            ? 'text-gray-200 font-medium' 
            : 'text-gray-600 hover:text-gray-200'
        }`}
        title="New Post"
      >
        <FiFilePlus size={20} />
        <span className="hidden sm:inline">New Post</span>
      </Link>
      <Link 
        href="/profile" 
        className={`flex items-center gap-2 ${
          currentPath === '/profile' 
            ? 'text-gray-200 font-medium' 
            : 'text-gray-600 hover:text-gray-200'
        }`}
        title="My Profile"
      >
        <FiUser size={20} />
        <span className="hidden sm:inline">My profile</span>
      </Link>
      <Link 
        href="/settings" 
        className={`flex items-center gap-2 ${
          currentPath === '/settings' 
            ? 'text-gray-200 font-medium' 
            : 'text-gray-600 hover:text-gray-200'
        }`}
        title="Settings"
      >
        <FiSettings size={20} />
        <span className="hidden sm:inline">Settings</span>
      </Link>
      <button 
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-200"
        title="Log out"
      >
        <FiLogOut size={20} />
        <span className="hidden sm:inline">Log out</span>
      </button>
    </div>
  )
}
