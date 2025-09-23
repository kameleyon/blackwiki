"use client";

import { FiEdit, FiMessageSquare, FiFileText, FiAward, FiTrendingUp } from 'react-icons/fi';

interface UserStatisticsPanelProps {
  userId: string;
  stats: {
    articlesCreated: number;
    totalEdits: number;
    commentsPosted: number;
    reviewsCompleted: number;
    reputation: number;
  };
}

export default function UserStatisticsPanel({ userId, stats }: UserStatisticsPanelProps) {
  const statItems = [
    {
      icon: FiFileText,
      label: 'Articles Created',
      value: stats.articlesCreated,
      color: 'text-gray-300'
    },
    {
      icon: FiEdit,
      label: 'Total Edits',
      value: stats.totalEdits,
      color: 'text-gray-400'
    },
    {
      icon: FiMessageSquare,
      label: 'Comments Posted',
      value: stats.commentsPosted,
      color: 'text-gray-500'
    },
    {
      icon: FiAward,
      label: 'Reviews Completed',
      value: stats.reviewsCompleted,
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="bg-white/5 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiTrendingUp className="text-white/60" size={16} />
        <h3 className="text-lg font-medium">Statistics</h3>
      </div>

      <div className="space-y-4">
        {statItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <item.icon className={`${item.color} bg-white/10 p-2 rounded-lg`} size={32} />
              <span className="text-sm text-white/70">{item.label}</span>
            </div>
            <span className="text-xl font-medium text-white">{item.value.toLocaleString()}</span>
          </div>
        ))}

        {/* Reputation Score */}
        {stats.reputation > 0 && (
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-gray-400 to-gray-600 p-2 rounded-lg">
                  <FiAward className="text-white" size={16} />
                </div>
                <span className="text-sm text-white/70">Reputation Score</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-medium text-gray-300">{stats.reputation}</div>
                <div className="text-xs text-white/50">
                  {stats.reputation >= 100 ? 'Trusted Contributor' :
                   stats.reputation >= 50 ? 'Active Member' :
                   'New Contributor'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Level */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-sm text-white/60 mb-2">Activity Level</div>
            <div className="flex justify-center">
              {(() => {
                const totalActivity = stats.articlesCreated + stats.totalEdits + stats.commentsPosted;
                const level = 
                  totalActivity >= 100 ? 'Very Active' :
                  totalActivity >= 50 ? 'Active' :
                  totalActivity >= 20 ? 'Moderate' :
                  totalActivity >= 5 ? 'Casual' :
                  'New';
                
                const levelColor =
                  level === 'Very Active' ? 'text-gray-300 bg-gray-600/20' :
                  level === 'Active' ? 'text-gray-400 bg-gray-700/20' :
                  level === 'Moderate' ? 'text-gray-500 bg-gray-800/20' :
                  level === 'Casual' ? 'text-gray-600 bg-gray-900/20' :
                  'text-gray-400 bg-gray-500/20';

                return (
                  <span className={`px-3 py-1 rounded-full text-sm ${levelColor}`}>
                    {level}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}