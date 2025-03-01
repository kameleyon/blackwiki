"use client";

import { Doughnut } from 'react-chartjs-2';
import { ChartData, ChartOptions } from '../../../lib/chart-config';
import { FiHardDrive, FiServer, FiCpu } from 'react-icons/fi';
import { SystemMetrics } from './types';
import { formatBytes } from './utils';

interface ResourceUtilizationProps {
  metrics: SystemMetrics;
}

export const ResourceUtilization = ({ metrics }: ResourceUtilizationProps) => {
  // CPU Usage Chart Data
  const cpuChartData = {
    labels: ['Used', 'Available'],
    datasets: [
      {
        data: [metrics.cpu.usage, 100 - metrics.cpu.usage],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };
  
  // Memory Usage Chart Data
  const memoryChartData = {
    labels: ['Used', 'Available'],
    datasets: [
      {
        data: [metrics.memory.used, metrics.memory.total - metrics.memory.used],
        backgroundColor: [
          'rgba(153, 102, 255, 0.8)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };
  
  // Disk Usage Chart Data
  const diskChartData = {
    labels: ['Used', 'Available'],
    datasets: [
      {
        data: [metrics.disk.used, metrics.disk.total - metrics.disk.used],
        backgroundColor: [
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };
  
  // Chart options
  const chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
  };
  
  // Memory chart options with custom tooltip
  const memoryChartOptions: ChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.label === 'Used' 
              ? `Used: ${formatBytes(metrics.memory.used)}` 
              : `Available: ${formatBytes(metrics.memory.total - metrics.memory.used)}`;
          }
        }
      }
    }
  };
  
  // Disk chart options with custom tooltip
  const diskChartOptions: ChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.label === 'Used' 
              ? `Used: ${formatBytes(metrics.disk.used)}` 
              : `Available: ${formatBytes(metrics.disk.total - metrics.disk.used)}`;
          }
        }
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <h4 className="text-sm font-medium text-white/60 mb-2">System Resource Utilization</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Usage */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-medium text-white/60">CPU Usage</h5>
            <FiCpu className="text-white/60" size={16} />
          </div>
          <div className="h-48 relative">
            <Doughnut data={cpuChartData} options={chartOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-normal">{metrics.cpu.usage}%</p>
                <p className="text-xs text-white/60">Utilized</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Memory Usage */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-medium text-white/60">Memory Usage</h5>
            <FiServer className="text-white/60" size={16} />
          </div>
          <div className="h-48 relative">
            <Doughnut data={memoryChartData} options={memoryChartOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-normal">{Math.round((metrics.memory.used / metrics.memory.total) * 100)}%</p>
                <p className="text-xs text-white/60">Utilized</p>
              </div>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-white/60">{formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}</p>
          </div>
        </div>
        
        {/* Disk Usage */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-medium text-white/60">Disk Usage</h5>
            <FiHardDrive className="text-white/60" size={16} />
          </div>
          <div className="h-48 relative">
            <Doughnut data={diskChartData} options={diskChartOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-normal">{Math.round((metrics.disk.used / metrics.disk.total) * 100)}%</p>
                <p className="text-xs text-white/60">Utilized</p>
              </div>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-white/60">{formatBytes(metrics.disk.used)} / {formatBytes(metrics.disk.total)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 rounded-xl p-4">
        <h5 className="text-sm font-medium text-white/60 mb-3">Resource Utilization Thresholds</h5>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-xs text-white/60">CPU Warning Threshold</p>
              <p className="text-xs text-yellow-400">70%</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-yellow-400" style={{ width: '70%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-xs text-white/60">CPU Critical Threshold</p>
              <p className="text-xs text-red-400">90%</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-red-400" style={{ width: '90%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-xs text-white/60">Memory Warning Threshold</p>
              <p className="text-xs text-yellow-400">80%</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-yellow-400" style={{ width: '80%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-xs text-white/60">Disk Warning Threshold</p>
              <p className="text-xs text-yellow-400">85%</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-yellow-400" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
