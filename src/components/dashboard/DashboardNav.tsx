"use client";

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { FiList, FiFilePlus, FiSliders, FiUser, FiSettings, FiLogOut } from 'react-icons/fi'

export default function DashboardNav() {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-8">
      <input
        type="search"
        placeholder="Search articles..."
        className="w-32 sm:w-40 h-2 search-input flex-1 px-3 sm:px-4 py-0 sm:shadow-sm md:shadow-md border rounded-full text-sm sm:text-base"
      />
      <Link 
        href="/dashboard" 
        className="flex items-center gap-2 text-gray-200 font-medium"
        title="Articles"
      >
        <FiList size={20} />
        <span className="hidden sm:inline">Articles</span>
      </Link>
      
      <button 
        className="flex items-center gap-2 text-gray-600 hover:text-gray-200"
        title="Filter"
      >
        <FiSliders size={20} />
        <span className="hidden sm:inline">Filter</span>
      </button>
      <Link 
        href="/articles/new" 
        className="flex items-center gap-2 text-gray-600 hover:text-gray-200"
        title="New Post"
      >
        <FiFilePlus size={20} />
        <span className="hidden sm:inline">New Post</span>
      </Link>
      <Link 
        href="/profile" 
        className="flex items-center gap-2 text-gray-600 hover:text-gray-200"
        title="My Profile"
      >
        <FiUser size={20} />
        <span className="hidden sm:inline">My profile</span>
      </Link>
      <Link 
        href="/settings" 
        className="flex items-center gap-2 text-gray-600 hover:text-gray-200"
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
