"use client";

import { Bar } from 'react-chartjs-2';
import { QualityMetrics } from './types';
import { defaultChartOptions } from './utils';

interface QualityDistributionProps {
  metrics: QualityMetrics;
}

export const QualityDistribution = ({ metrics }: QualityDistributionProps) => {
  // Quality distribution data
  const qualityDistributionData = {
    labels: ['90-100', '80-89', '70-79', '60-69', 'Below 60'],
    datasets: [
      {
        label: 'Articles',
        data: [
          metrics.qualityDistribution.excellent,
          metrics.qualityDistribution.good,
          metrics.qualityDistribution.average,
          metrics.qualityDistribution.belowAverage,
          metrics.qualityDistribution.poor,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
      <h3 className="text-lg font-normal mb-4">Quality Distribution</h3>
      <div className="h-64">
        <Bar 
          data={qualityDistributionData}
          options={defaultChartOptions}
        />
      </div>
    </div>
  );
};
