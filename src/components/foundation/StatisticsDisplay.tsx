"use client";

import React from 'react';
import { StatisticMetric } from './types';
import { getStatistics } from './utils';
import { BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import * as Icons from 'lucide-react';

interface StatisticsDisplayProps {
  showTitle?: boolean;
  columns?: 2 | 3 | 4;
}

const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({
  showTitle = true,
  columns = 4
}) => {
  const statistics = getStatistics();
  
  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-normal">AfroWiki Statistics</h2>
          <div className="flex items-center text-white/60 text-sm">
            <BarChart2 className="h-4 w-4 mr-2" />
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      )}
      
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-4`}>
        {statistics.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>
      
      <div className="mt-6 bg-black/20 rounded-lg p-4">
        <h3 className="text-lg mb-2 font-normal">About These Statistics</h3>
        <p className="text-white/70 text-sm">
          These statistics are updated daily and reflect the current state of AfroWiki. 
          They help us track our growth and identify areas for improvement.
        </p>
        <div className="mt-3 flex items-center">
          <a 
            href="/special/statistics" 
            className="text-white/70 hover:text-white text-sm flex items-center transition-colors"
          >
            View detailed statistics
            <svg 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M14 5l7 7m0 0l-7 7m7-7H3" 
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  stat: StatisticMetric;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  // Dynamically get the icon component
  const IconComponent = stat.icon 
    ? (Icons as any)[stat.icon.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')] 
    : BarChart2;
  
  // Determine the change icon and color
  let ChangeIcon = Minus;
  let changeColorClass = 'text-white/50';
  
  if (stat.changeType === 'increase') {
    ChangeIcon = TrendingUp;
    changeColorClass = 'text-green-400';
  } else if (stat.changeType === 'decrease') {
    ChangeIcon = TrendingDown;
    changeColorClass = 'text-red-400';
  }
  
  return (
    <div className="bg-black/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white/70 text-sm">{stat.name}</div>
        <IconComponent className="h-5 w-5 text-white/60" />
      </div>
      
      <div className="text-2xl font-semibold mb-2">{stat.value}</div>
      
      {stat.change !== undefined && (
        <div className={`flex items-center ${changeColorClass} text-sm`}>
          <ChangeIcon className="h-4 w-4 mr-1" />
          <span>{stat.change > 0 ? '+' : ''}{stat.change}%</span>
          <span className="text-white/50 ml-1">from last month</span>
        </div>
      )}
      
      {stat.description && (
        <div className="mt-2 text-white/60 text-xs">
          {stat.description}
        </div>
      )}
    </div>
  );
};

export default StatisticsDisplay;
