"use client";

import { FiRefreshCw } from 'react-icons/fi';
import { SystemMetrics } from './types';
import { formatBytes } from './utils';

interface CacheManagementProps {
  metrics: SystemMetrics;
  onClearCache: () => Promise<void>;
}

export const CacheManagement = ({
  metrics,
  onClearCache
}: CacheManagementProps) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/60">Cache Hit Rate</h4>
          </div>
          <p className="text-xl font-normal">{(metrics.cache.hitRate * 100).toFixed(1)}%</p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/60">Cache Size</h4>
          </div>
          <p className="text-xl font-normal">{formatBytes(metrics.cache.size)}</p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/60">Cached Items</h4>
          </div>
          <p className="text-xl font-normal">{metrics.cache.items}</p>
        </div>
      </div>
      
      <button 
        className="flex items-center gap-1 px-4 py-2 bg-white/5 rounded-lg text-sm text-white/80 hover:bg-white/10"
        onClick={onClearCache}
      >
        <FiRefreshCw size={16} />
        <span>Clear Cache</span>
      </button>
    </>
  );
};
