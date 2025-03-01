"use client";

import { FiDatabase, FiSettings, FiDownload, FiUpload } from 'react-icons/fi';
import { SystemMetrics } from './types';

interface DatabaseManagementProps {
  metrics: SystemMetrics;
  onOptimizeDatabase: () => Promise<void>;
  onCreateBackup: () => Promise<void>;
  onRestoreBackup: (backupId: string) => Promise<void>;
}

export const DatabaseManagement = ({
  metrics,
  onOptimizeDatabase,
  onCreateBackup,
  onRestoreBackup
}: DatabaseManagementProps) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/60">Active Connections</h4>
          </div>
          <p className="text-xl font-normal">{metrics.database.connections}</p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/60">Avg Query Time</h4>
          </div>
          <p className="text-xl font-normal">{metrics.database.queryTime} ms</p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/60">Slow Queries</h4>
          </div>
          <p className="text-xl font-normal">{metrics.database.slowQueries}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button 
          className="flex items-center gap-1 px-4 py-2 bg-white/5 rounded-lg text-sm text-white/80 hover:bg-white/10"
          onClick={onOptimizeDatabase}
        >
          <FiSettings size={16} />
          <span>Optimize Database</span>
        </button>
        
        <button 
          className="flex items-center gap-1 px-4 py-2 bg-white/5 rounded-lg text-sm text-white/80 hover:bg-white/10"
          onClick={onCreateBackup}
        >
          <FiDownload size={16} />
          <span>Create Backup</span>
        </button>
        
        <button 
          className="flex items-center gap-1 px-4 py-2 bg-white/5 rounded-lg text-sm text-white/80 hover:bg-white/10"
          onClick={() => onRestoreBackup('latest')}
        >
          <FiUpload size={16} />
          <span>Restore Latest Backup</span>
        </button>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-white/60 mb-2">Backup History</h4>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Latest Backup</p>
              <p className="text-xs text-white/60 mt-1">{new Date(metrics.lastBackup).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10"
                onClick={() => onRestoreBackup('latest')}
              >
                <FiUpload size={14} />
                <span>Restore</span>
              </button>
              <button 
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10"
              >
                <FiDownload size={14} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
