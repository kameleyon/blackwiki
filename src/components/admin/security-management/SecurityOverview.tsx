"use client";

import { 
  FiAlertTriangle, 
  FiLock, 
  FiSlash, 
  FiEye, 
  FiActivity, 
  FiClock 
} from 'react-icons/fi';
import { SecurityMetrics } from './types';

interface SecurityOverviewProps {
  metrics: SecurityMetrics;
}

export const SecurityOverview = ({ metrics }: SecurityOverviewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Incidents Card */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">Total Incidents</h3>
          <FiAlertTriangle className="text-white/60" size={18} />
        </div>
        <p className="text-2xl font-normal">{metrics.totalIncidents}</p>
        <div className="mt-2 text-xs text-white/60 flex items-center">
          <FiActivity className="text-white/60 mr-1" size={12} />
          <span>{metrics.openIncidents} open, {metrics.resolvedIncidents} resolved</span>
        </div>
      </div>
      
      {/* Failed Logins Card */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">Failed Logins</h3>
          <FiLock className="text-white/60" size={18} />
        </div>
        <p className="text-2xl font-normal">{metrics.failedLogins}</p>
        <div className="mt-2 text-xs text-white/60 flex items-center">
          <FiClock className="text-white/60 mr-1" size={12} />
          <span>Last 24 hours</span>
        </div>
      </div>
      
      {/* API Rate Limit Hits Card */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">API Rate Limit Hits</h3>
          <FiSlash className="text-white/60" size={18} />
        </div>
        <p className="text-2xl font-normal">{metrics.apiRateLimitHits}</p>
        <div className="mt-2 text-xs text-white/60 flex items-center">
          <FiClock className="text-white/60 mr-1" size={12} />
          <span>Last 24 hours</span>
        </div>
      </div>
      
      {/* Suspicious Activities Card */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">Suspicious Activities</h3>
          <FiEye className="text-white/60" size={18} />
        </div>
        <p className="text-2xl font-normal">{metrics.suspiciousActivities}</p>
        <div className="mt-2 text-xs text-white/60 flex items-center">
          <FiClock className="text-white/60 mr-1" size={12} />
          <span>Last 24 hours</span>
        </div>
      </div>
    </div>
  );
};
