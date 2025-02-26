"use client";

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
  FiList, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiBarChart2, 
  FiClock,
  FiEdit3,
  FiBookmark,
  FiUsers
} from 'react-icons/fi';

export default function DashboardNav() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? "text-white font-medium" : "text-gray-600 hover:text-gray-200";
  };

  return (
    <div className="mb-8">
      <nav className="bg-white/5 rounded-xl p-1 mb-6">
        <ul className="flex flex-wrap">
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isActive('/dashboard')}`}
              title="Overview"
            >
              <FiBarChart2 size={18} />
              <span className="hidden md:inline">Overview</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/articles"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isActive('/dashboard/articles')}`}
              title="My Articles"
            >
              <FiList size={18} />
              <span className="hidden md:inline">My Articles</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/drafts"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isActive('/dashboard/drafts')}`}
              title="Drafts"
            >
              <FiEdit3 size={18} />
              <span className="hidden md:inline">Drafts</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/activity"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isActive('/dashboard/activity')}`}
              title="Activity"
            >
              <FiClock size={18} />
              <span className="hidden md:inline">Activity</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/saved"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isActive('/dashboard/saved')}`}
              title="Saved"
            >
              <FiBookmark size={18} />
              <span className="hidden md:inline">Saved</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/collaborations"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isActive('/dashboard/collaborations')}`}
              title="Collaborations"
            >
              <FiUsers size={18} />
              <span className="hidden md:inline">Collaborations</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="flex items-center justify-end gap-4 mb-4">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-200"
          title="My Profile"
        >
          <FiUser size={18} />
          <span className="hidden md:inline">Profile</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-200"
          title="Settings"
        >
          <FiSettings size={18} />
          <span className="hidden md:inline">Settings</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-200"
          title="Log out"
        >
          <FiLogOut size={18} />
          <span className="hidden md:inline">Log out</span>
        </button>
      </div>
    </div>
  );
}
