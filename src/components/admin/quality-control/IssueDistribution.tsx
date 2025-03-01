"use client";

import { Bar } from 'react-chartjs-2';
import { QualityMetrics } from './types';
import { defaultChartOptions } from './utils';

interface IssueDistributionProps {
  metrics: QualityMetrics;
}

export const IssueDistribution = ({ metrics }: IssueDistributionProps) => {
  // Issue distribution data
  const issueDistributionData = {
    labels: ['Citation', 'Fact', 'Plagiarism', 'Readability', 'SEO'],
    datasets: [
      {
        label: 'Issues',
        data: [
          metrics.issuesByType.citation,
          metrics.issuesByType.fact,
          metrics.issuesByType.plagiarism,
          metrics.issuesByType.readability,
          metrics.issuesByType.seo,
        ],
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
  
  return (
    <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
      <h3 className="text-lg font-normal mb-4">Issues by Type</h3>
      <div className="h-64">
        <Bar 
          data={issueDistributionData}
          options={defaultChartOptions}
        />
      </div>
    </div>
  );
};
