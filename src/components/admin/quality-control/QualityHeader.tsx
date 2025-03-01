"use client";

import { FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';

interface QualityHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  onRefresh: () => Promise<void>;
  isProcessing: boolean;
}

export const QualityHeader = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  onRefresh,
  isProcessing
}: QualityHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <h2 className="text-xl font-normal">Quality Control</h2>
      
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-white/20 w-full md:w-64"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
        </div>
        
        {/* Filter */}
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none w-full md:w-48"
          >
            <option value="all">All Articles</option>
            <option value="low-quality">Low Quality</option>
            <option value="citation-issues">Citation Issues</option>
            <option value="fact-issues">Fact Issues</option>
            <option value="readability-issues">Readability Issues</option>
            <option value="seo-issues">SEO Issues</option>
            <option value="plagiarism-issues">Plagiarism Issues</option>
          </select>
          <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
        </div>
        
        {/* Refresh Button */}
        <button 
          className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/10"
          onClick={onRefresh}
          disabled={isProcessing}
        >
          <FiRefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
          <span>{isProcessing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  );
};
