"use client";

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { FiList, FiFilePlus, FiUser, FiSettings, FiLogOut } from 'react-icons/fi'

type UserNavProps = {
  currentPath: string;
}

export default function UserNav({ currentPath }: UserNavProps) {
  return (
    <div className="flex items-center justify-end gap-6 mb-8">
      <Link 
        href="/dashboard" 
        className={`flex items-center gap-2 ${
          currentPath === '/dashboard' 
            ? 'text-gray-200 font-medium' 
            : 'text-gray-600 hover:text-gray-200'
        }`}
      >
        <FiList size={20} />
        <span>Articles</span>
      </Link>
      <Link 
        href="/articles/new" 
        className={`flex items-center gap-2 ${
          currentPath === '/articles/new' 
            ? 'text-gray-200 font-medium' 
            : 'text-gray-600 hover:text-gray-200'
        }`}
      >
        <FiFilePlus size={20} />
        <span>New Post</span>
      </Link>
      <Link 
        href="/profile" 
        className={`flex items-center gap-2 ${
          currentPath === '/profile' 
            ? 'text-gray-200 font-medium' 
            : 'text-gray-600 hover:text-gray-200'
        }`}
      >
        <FiUser size={20} />
        <span>My profile</span>
      </Link>
      <Link 
        href="/settings" 
        className={`flex items-center gap-2 ${
          currentPath === '/settings' 
            ? 'text-gray-200 font-medium' 
            : 'text-gray-600 hover:text-gray-200'
        }`}
      >
        <FiSettings size={20} />
        <span>Settings</span>
      </Link>
      <button 
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-200"
      >
        <FiLogOut size={20} />
        <span>Log out</span>
      </button>
    </div>
  )
}
