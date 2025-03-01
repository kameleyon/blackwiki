"use client";

import { FiSearch, FiFilter, FiChevronDown, FiShield } from 'react-icons/fi';

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterRole: string;
  setFilterRole: (role: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export default function UserFilters({
  searchQuery,
  setSearchQuery,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus
}: UserFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-white/20 w-full md:w-64"
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
      </div>
      
      {/* Role Filter */}
      <div className="relative">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
      </div>
      
      {/* Status Filter */}
      <div className="relative">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
      </div>
    </div>
  );
}
