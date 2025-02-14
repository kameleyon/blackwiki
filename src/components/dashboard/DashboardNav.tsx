"use client";

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { FiList, FiFilePlus, FiSliders, FiUser, FiSettings, FiLogOut } from 'react-icons/fi'

export default function DashboardNav() {
  return (
    <div className="flex items-center gap-6 mb-8">
      <input
        type="search"
        placeholder="Search articles..."
        className="w-40 search-input flex-1 px-4 py-1 border rounded-lg"
      />
      <Link href="/dashboard" className="flex items-center gap-2 text-gray-200 font-medium">
        <FiList size={20} />
        <span>Articles</span>
      </Link>
      <Link href="/articles/new" className="flex items-center gap-2 text-gray-600 hover:text-gray-200">
        <FiFilePlus size={20} />
        <span>New Post</span>
      </Link>
      <button className="flex items-center gap-2 text-gray-600 hover:text-gray-200">
        <FiSliders size={20} />
        <span>Filter</span>
      </button>
      <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-200">
        <FiUser size={20} />
        <span>My profile</span>
      </Link>
      <Link href="/settings" className="flex items-center gap-2 text-gray-600 hover:text-gray-200">
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
