"use client";

import { Line } from 'react-chartjs-2';
import { FiBarChart2, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { SystemMetrics } from './types';
import { defaultChartOptions, getTimeLabels } from './utils';

interface PerformanceMetricsProps {
  metrics: SystemMetrics;
  timeRange: 'hour' | 'day' | 'week';
}

export const PerformanceMetrics = ({
  metrics,
  timeRange
}: PerformanceMetricsProps) => {
  // Get time labels based on selected range
  const timeLabels = getTimeLabels(timeRange);
  
  // CPU Usage Chart Data
  const cpuChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: metrics.cpu.history,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Memory Usage Chart Data
  const memoryChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Memory Usage (%)',
        data: metrics.memory.history.map(value => (value / metrics.memory.total) * 100),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Request Rate Chart Data
  const requestChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Requests per Minute',
        data: metrics.requests.history,
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Response Time Chart Data
  const responseTimeChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Average Response Time (ms)',
        data: metrics.responseTime.history,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CPU Usage Chart */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-sm font-medium text-white/60 mb-4">CPU Usage Over Time</h4>
          <div className="h-64">
            <Line 
              data={cpuChartData}
              options={defaultChartOptions}
            />
          </div>
        </div>
        
        {/* Memory Usage Chart */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-sm font-medium text-white/60 mb-4">Memory Usage Over Time</h4>
          <div className="h-64">
            <Line 
              data={memoryChartData}
              options={defaultChartOptions}
            />
          </div>
        </div>
        
        {/* Request Rate Chart */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-sm font-medium text-white/60 mb-4">Request Rate</h4>
          <div className="h-64">
            <Line 
              data={requestChartData}
              options={defaultChartOptions}
            />
          </div>
        </div>
        
        {/* Response Time Chart */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-sm font-medium text-white/60 mb-4">Response Time</h4>
          <div className="h-64">
            <Line 
              data={responseTimeChartData}
              options={defaultChartOptions}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/60">Requests</h4>
            <FiBarChart2 className="text-white/60" size={16} />
          </div>
          <p className="text-xl font-normal">{metrics.requests.total.toLocaleString()}</p>
          <p className="text-sm text-white/60">{metrics.requests.perMinute} per minute</p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/60">Response Time</h4>
            <FiClock className="text-white/60" size={16} />
          </div>
          <p className="text-xl font-normal">{metrics.responseTime.average} ms</p>
          <p className="text-sm text-white/60">P95: {metrics.responseTime.p95} ms</p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white/60">Error Rate</h4>
            <FiAlertTriangle className={metrics.errors.rate > 0.05 ? "text-red-400" : "text-white/60"} size={16} />
          </div>
          <p className="text-xl font-normal">{(metrics.errors.rate * 100).toFixed(2)}%</p>
          <p className="text-sm text-white/60">{metrics.errors.count} errors total</p>
        </div>
      </div>
    </>
  );
};
