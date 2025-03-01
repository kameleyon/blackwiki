"use client";

import { Line, Bar } from 'react-chartjs-2';
import { SecurityMetrics } from './types';
import { defaultChartOptions, formatTypeString } from './utils';

interface SecurityChartsProps {
  metrics: SecurityMetrics;
}

export const SecurityCharts = ({ metrics }: SecurityChartsProps) => {
  // Incidents by type chart data
  const incidentsByTypeData = {
    labels: Object.keys(metrics.incidentsByType).map(type => formatTypeString(type)),
    datasets: [
      {
        label: 'Incidents',
        data: Object.values(metrics.incidentsByType),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Incidents over time chart data
  const incidentsOverTimeData = {
    labels: metrics.incidentsOverTime.map(item => 
      new Date(item.timestamp).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Incidents',
        data: metrics.incidentsOverTime.map(item => item.count),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
        <h3 className="text-lg font-normal mb-4">Incidents by Type</h3>
        <div className="h-64">
          <Bar 
            data={incidentsByTypeData}
            options={defaultChartOptions}
          />
        </div>
      </div>
      
      <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
        <h3 className="text-lg font-normal mb-4">Incidents Over Time</h3>
        <div className="h-64">
          <Line 
            data={incidentsOverTimeData}
            options={defaultChartOptions}
          />
        </div>
      </div>
    </div>
  );
};
