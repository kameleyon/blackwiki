"use client";

import { FiCheckCircle } from 'react-icons/fi';
import { QualityMetrics } from './types';
import { getScoreColor, getScoreBackground } from './utils';

interface QualityOverviewProps {
  metrics: QualityMetrics;
}

export const QualityOverview = ({ metrics }: QualityOverviewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Quality Score */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">Overall Quality</h3>
          <FiCheckCircle className={getScoreColor(metrics.averageQualityScore)} size={18} />
        </div>
        <p className={`text-2xl font-normal ${getScoreColor(metrics.averageQualityScore)}`}>
          {metrics.averageQualityScore.toFixed(1)}
        </p>
        <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${getScoreBackground(metrics.averageQualityScore)}`}
            style={{ width: `${metrics.averageQualityScore}%` }}
          ></div>
        </div>
      </div>
      
      {/* Fact Checking Score */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">Fact Checking</h3>
          <FiCheckCircle className={getScoreColor(metrics.averageFactScore)} size={18} />
        </div>
        <p className={`text-2xl font-normal ${getScoreColor(metrics.averageFactScore)}`}>
          {metrics.averageFactScore.toFixed(1)}
        </p>
        <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${getScoreBackground(metrics.averageFactScore)}`}
            style={{ width: `${metrics.averageFactScore}%` }}
          ></div>
        </div>
      </div>
      
      {/* Readability Score */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">Readability</h3>
          <FiCheckCircle className={getScoreColor(metrics.averageReadabilityScore)} size={18} />
        </div>
        <p className={`text-2xl font-normal ${getScoreColor(metrics.averageReadabilityScore)}`}>
          {metrics.averageReadabilityScore.toFixed(1)}
        </p>
        <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${getScoreBackground(metrics.averageReadabilityScore)}`}
            style={{ width: `${metrics.averageReadabilityScore}%` }}
          ></div>
        </div>
      </div>
      
      {/* SEO Score */}
      <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/60">SEO</h3>
          <FiCheckCircle className={getScoreColor(metrics.averageSeoScore)} size={18} />
        </div>
        <p className={`text-2xl font-normal ${getScoreColor(metrics.averageSeoScore)}`}>
          {metrics.averageSeoScore.toFixed(1)}
        </p>
        <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${getScoreBackground(metrics.averageSeoScore)}`}
            style={{ width: `${metrics.averageSeoScore}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
