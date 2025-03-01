"use client";

import { Line } from 'react-chartjs-2';
import { FiXCircle } from 'react-icons/fi';
import { SystemMetrics } from './types';
import { defaultChartOptions, getTimeLabels } from './utils';

interface ErrorTrackingProps {
  metrics: SystemMetrics;
  timeRange: 'hour' | 'day' | 'week';
}

export const ErrorTracking = ({
  metrics,
  timeRange
}: ErrorTrackingProps) => {
  // Get time labels based on selected range
  const timeLabels = getTimeLabels(timeRange);
  
  // Error Rate Chart Data
  const errorRateChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Error Rate (%)',
        data: metrics.errors.history.map(value => value * 100), // Convert to percentage
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  return (
    <>
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <h4 className="text-sm font-medium text-white/60 mb-4">Error Rate Over Time</h4>
        <div className="h-64">
          <Line 
            data={errorRateChartData}
            options={{
              ...defaultChartOptions,
              scales: {
                ...defaultChartOptions.scales,
                y: {
                  ...defaultChartOptions.scales.y,
                  suggestedMax: 5, // Suggest max of 5% for better visualization
                }
              }
            }}
          />
        </div>
      </div>
      
      <h4 className="text-sm font-medium text-white/60 mb-2">Recent Errors</h4>
      {metrics.errors.recent.length > 0 ? (
        <div className="space-y-2">
          {metrics.errors.recent.map((error, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-start">
                <FiXCircle className="text-red-400 mt-1 mr-2 flex-shrink-0" size={16} />
                <div className="flex-grow">
                  <p className="text-sm font-medium">{error.message}</p>
                  <p className="text-xs text-white/60 mt-1">Path: {error.path}</p>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-white/60">{new Date(error.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-white/60">Occurred {error.count} times</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-sm text-white/60">No errors recorded in the selected time period</p>
        </div>
      )}
    </>
  );
};
