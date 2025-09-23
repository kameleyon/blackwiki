"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch, FiFilter, FiX, FiCalendar, FiTag, FiArrowDown } from 'react-icons/fi';
import SearchSuggestions from './SearchSuggestions';

interface AdvancedSearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
  categories?: Array<{ name: string; count: number }>;
}

export interface SearchParams {
  q: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  contentType: string;
  status: string;
}

export default function AdvancedSearchForm({ onSearch, isLoading, categories = [] }: AdvancedSearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchForm, setSearchForm] = useState<SearchParams>({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    sortBy: searchParams.get('sortBy') || 'relevance',
    contentType: searchParams.get('contentType') || '',
    status: searchParams.get('status') || 'published'
  });

  // Check if any filters are active
  const hasActiveFilters = searchForm.category || searchForm.dateFrom || searchForm.dateTo || 
    searchForm.contentType || searchForm.sortBy !== 'relevance' || searchForm.status !== 'published';

  const handleInputChange = (field: keyof SearchParams, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchForm);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(searchForm).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    const resetForm = {
      q: searchForm.q, // Keep search query
      category: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'relevance',
      contentType: '',
      status: 'published'
    };
    setSearchForm(resetForm);
    onSearch(resetForm);
  };

  const clearSearch = () => {
    const resetForm = {
      q: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'relevance',
      contentType: '',
      status: 'published'
    };
    setSearchForm(resetForm);
    setShowFilters(false);
    onSearch(resetForm);
    router.push('/search');
  };

  return (
    <div className="bg-white/5 rounded-lg p-6 mb-6">
      {/* Main search bar */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchForm.q}
              onChange={(e) => handleInputChange('q', e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search articles, topics, people, places..."
              className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-gray-400"
            />
            {searchForm.q && (
              <button
                type="button"
                onClick={() => {
                  handleInputChange('q', '');
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white z-10"
              >
                <FiX size={18} />
              </button>
            )}
            
            <SearchSuggestions
              query={searchForm.q}
              isVisible={showSuggestions}
              onSuggestionClick={(suggestion) => {
                handleInputChange('q', suggestion);
                setShowSuggestions(false);
                searchInputRef.current?.focus();
              }}
              onClose={() => setShowSuggestions(false)}
            />
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              hasActiveFilters || showFilters 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <FiFilter size={18} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                {[searchForm.category, searchForm.dateFrom, searchForm.dateTo, 
                  searchForm.contentType, searchForm.sortBy !== 'relevance' ? 'sorted' : '', 
                  searchForm.status !== 'published' ? 'status' : ''].filter(Boolean).length}
              </span>
            )}
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Advanced filters */}
      {showFilters && (
        <div className="border-t border-white/10 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FiTag size={14} />
                Category
              </label>
              <select
                value={searchForm.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full p-2 bg-black/30 border border-white/20 rounded text-white"
              >
                <option value="">All Categories</option>
                {categories.slice(0, 20).map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FiCalendar size={14} />
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={searchForm.dateFrom}
                  onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                  className="flex-1 p-2 bg-black/30 border border-white/20 rounded text-white"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={searchForm.dateTo}
                  onChange={(e) => handleInputChange('dateTo', e.target.value)}
                  className="flex-1 p-2 bg-black/30 border border-white/20 rounded text-white"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FiArrowDown size={14} />
                Sort By
              </label>
              <select
                value={searchForm.sortBy}
                onChange={(e) => handleInputChange('sortBy', e.target.value)}
                className="w-full p-2 bg-black/30 border border-white/20 rounded text-white"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Newest First</option>
                <option value="views">Most Viewed</option>
                <option value="likes">Most Liked</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>

            {/* Content type - Temporarily disabled for performance */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white/40">
                Content Length (Coming Soon)
              </label>
              <select
                disabled
                value=""
                className="w-full p-2 bg-black/30 border border-white/20 rounded text-white/40 cursor-not-allowed"
              >
                <option value="">Feature Coming Soon</option>
              </select>
              <p className="text-xs text-white/40 mt-1">
                Content filtering will be available after database optimization
              </p>
            </div>

            {/* Status filter removed for public search security */}
            {/* Status filtering would allow unauthorized access to drafts/unpublished content */}
          </div>

          {/* Filter actions */}
          {hasActiveFilters && (
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <div className="text-sm text-white/60">
                {[searchForm.category, searchForm.dateFrom, searchForm.dateTo, 
                  searchForm.contentType, searchForm.sortBy !== 'relevance' ? 'custom sort' : '', 
                  searchForm.status !== 'published' ? searchForm.status : ''].filter(Boolean).length} filters active
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}