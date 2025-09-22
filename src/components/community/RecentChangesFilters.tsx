"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiFilter, FiX, FiClock, FiUser } from 'react-icons/fi';

export default function RecentChangesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    action: searchParams.get('action') || 'all',
    user: searchParams.get('user') || '',
    hours: searchParams.get('hours') || '24',
    limit: searchParams.get('limit') || '50'
  });

  useEffect(() => {
    // Update filters when URL changes
    setFilters({
      action: searchParams.get('action') || 'all',
      user: searchParams.get('user') || '',
      hours: searchParams.get('hours') || '24',
      limit: searchParams.get('limit') || '50'
    });
  }, [searchParams]);

  const updateFilters = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '50') {
        params.set(key, value);
      }
    });
    
    const queryString = params.toString();
    router.push(`/recent-changes${queryString ? `?${queryString}` : ''}`);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      action: 'all',
      user: '',
      hours: '24',
      limit: '50'
    };
    setFilters(clearedFilters);
    updateFilters(clearedFilters);
  };

  const hasActiveFilters = filters.action !== 'all' || filters.user || filters.hours !== '24' || filters.limit !== '50';

  const actionOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'article_created', label: 'Article Created' },
    { value: 'article_updated', label: 'Article Edited' },
    { value: 'wikipedia_import', label: 'Wikipedia Import' },
    { value: 'article_status_changed', label: 'Status Changed' },
    { value: 'article_watched', label: 'Article Watched' },
    { value: 'review_submitted', label: 'Review Submitted' },
    { value: 'review_completed', label: 'Review Completed' },
    { value: 'comment_created', label: 'Comment Posted' },
    { value: 'user_role_updated', label: 'Role Updated' }
  ];

  const timeOptions = [
    { value: '1', label: 'Last Hour' },
    { value: '6', label: 'Last 6 Hours' },
    { value: '24', label: 'Last 24 Hours' },
    { value: '168', label: 'Last Week' },
    { value: '720', label: 'Last Month' }
  ];

  const limitOptions = [
    { value: '25', label: '25 items' },
    { value: '50', label: '50 items' },
    { value: '100', label: '100 items' },
    { value: '200', label: '200 items' }
  ];

  return (
    <div className="mb-6">
      {/* Filter Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors mb-4"
      >
        <FiFilter size={16} />
        <span>Filter Changes</span>
        {hasActiveFilters && (
          <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 rounded-full text-xs">
            Active
          </span>
        )}
      </button>

      {/* Filters Panel */}
      {isExpanded && (
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Action Type
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {actionOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <FiUser size={14} className="inline mr-1" />
                User
              </label>
              <input
                type="text"
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                placeholder="Search by username..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Time Period */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <FiClock size={14} className="inline mr-1" />
                Time Period
              </label>
              <select
                value={filters.hours}
                onChange={(e) => handleFilterChange('hours', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {timeOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Items per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {limitOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
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

          {/* Quick Filters */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-sm font-medium text-white/80 mb-2">Quick Filters:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('action', 'article_created')}
                className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs hover:bg-green-500/30 transition-colors"
              >
                New Articles
              </button>
              <button
                onClick={() => handleFilterChange('action', 'article_updated')}
                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs hover:bg-blue-500/30 transition-colors"
              >
                Recent Edits
              </button>
              <button
                onClick={() => handleFilterChange('hours', '1')}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs hover:bg-purple-500/30 transition-colors"
              >
                Last Hour
              </button>
              <button
                onClick={() => handleFilterChange('action', 'review_submitted')}
                className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs hover:bg-yellow-500/30 transition-colors"
              >
                Reviews
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}