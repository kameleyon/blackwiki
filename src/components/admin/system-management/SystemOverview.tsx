"use client";

import { 
  FiCpu, 
  FiServer, 
  FiHardDrive, 
  FiClock,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';
import { SystemMetrics } from './types';
import { formatBytes, formatUptime } from './utils';

interface SystemOverviewProps {
  metrics: SystemMetrics;
}

export const SystemOverview = ({ metrics }: SystemOverviewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CPU Usage Card */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">CPU Usage</h3>
          <FiCpu className="text-white/60" size={18} />
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-normal">{metrics.cpu.usage}%</p>
          {metrics.cpu.usage > 80 ? (
            <FiTrendingUp className="text-red-400" size={18} />
          ) : metrics.cpu.usage > 50 ? (
            <FiActivity className="text-yellow-400" size={18} />
          ) : (
            <FiTrendingDown className="text-green-400" size={18} />
          )}
        </div>
        <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              metrics.cpu.usage > 80 ? 'bg-red-500' : 
              metrics.cpu.usage > 50 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${metrics.cpu.usage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Memory Usage Card */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">Memory Usage</h3>
          <FiServer className="text-white/60" size={18} />
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-normal">{Math.round((metrics.memory.used / metrics.memory.total) * 100)}%</p>
          <p className="text-sm text-white/60">{formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}</p>
        </div>
        <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              (metrics.memory.used / metrics.memory.total) > 0.8 ? 'bg-red-500' : 
              (metrics.memory.used / metrics.memory.total) > 0.5 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${(metrics.memory.used / metrics.memory.total) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Disk Usage Card */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">Disk Usage</h3>
          <FiHardDrive className="text-white/60" size={18} />
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-normal">{Math.round((metrics.disk.used / metrics.disk.total) * 100)}%</p>
          <p className="text-sm text-white/60">{formatBytes(metrics.disk.used)} / {formatBytes(metrics.disk.total)}</p>
        </div>
        <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              (metrics.disk.used / metrics.disk.total) > 0.8 ? 'bg-red-500' : 
              (metrics.disk.used / metrics.disk.total) > 0.5 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${(metrics.disk.used / metrics.disk.total) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* System Uptime Card */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">System Uptime</h3>
          <FiClock className="text-white/60" size={18} />
        </div>
        <p className="text-2xl font-normal">{formatUptime(metrics.uptime)}</p>
        <div className="mt-2 text-xs text-white/60 flex items-center">
          <FiActivity className="text-white/60 mr-1" size={12} />
          <span>Last restart: {new Date(Date.now() - metrics.uptime * 1000).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
