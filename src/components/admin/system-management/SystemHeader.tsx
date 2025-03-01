"use client";

import { FiRefreshCw } from 'react-icons/fi';

interface SystemHeaderProps {
  timeRange: 'hour' | 'day' | 'week';
  setTimeRange: (range: 'hour' | 'day' | 'week') => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

export const SystemHeader = ({
  timeRange,
  setTimeRange,
  onRefresh,
  isRefreshing
}: SystemHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <h2 className="text-xl font-normal">System Management</h2>
      
      <div className="flex flex-wrap gap-2">
        {/* Time Range Selector */}
        <div className="flex bg-white/5 rounded-lg overflow-hidden">
          {(['hour', 'day', 'week'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-medium ${
                timeRange === range
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Refresh Button */}
        <button 
          className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/10"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <FiRefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  );
};
