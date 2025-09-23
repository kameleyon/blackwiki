"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiFilter, FiX } from 'react-icons/fi';

export default function UserDirectoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || 'all',
    expertise: searchParams.get('expertise') || '',
    sort: searchParams.get('sort') || 'recent'
  });

  useEffect(() => {
    // Update filters when URL changes
    setFilters({
      search: searchParams.get('search') || '',
      role: searchParams.get('role') || 'all',
      expertise: searchParams.get('expertise') || '',
      sort: searchParams.get('sort') || 'recent'
    });
  }, [searchParams]);

  const updateFilters = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    
    const queryString = params.toString();
    router.push(`/users${queryString ? `?${queryString}` : ''}`);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      role: 'all',
      expertise: '',
      sort: 'recent'
    };
    setFilters(clearedFilters);
    updateFilters(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.role !== 'all' || filters.expertise || filters.sort !== 'recent';

  return (
    <div className="mb-6">
      {/* Filter Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors mb-4"
      >
        <FiFilter size={16} />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="px-2 py-0.5 bg-gray-600/30 text-gray-300 rounded-full text-xs">
            Active
          </span>
        )}
      </button>

      {/* Filters Panel */}
      {isExpanded && (
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Name, bio, expertise..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="editor">Editors</option>
                <option value="user">Contributors</option>
              </select>
            </div>

            {/* Expertise */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Expertise
              </label>
              <input
                type="text"
                value={filters.expertise}
                onChange={(e) => handleFilterChange('expertise', e.target.value)}
                placeholder="e.g., History, Music, Politics..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50"
              >
                <option value="recent">Recently Active</option>
                <option value="name">Name (A-Z)</option>
                <option value="joined">Recently Joined</option>
                <option value="reputation">Reputation</option>
                <option value="articles">Articles Created</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors"
              >
                <FiX size={14} />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}