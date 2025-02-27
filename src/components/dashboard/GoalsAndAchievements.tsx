"use client";

import { useState } from 'react';
import { FiAward, FiTarget, FiCheck, FiClock, FiLock } from 'react-icons/fi';

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'in-progress' | 'locked';
  progress?: number;
  completedAt?: Date;
  reward?: string;
};

type Goal = {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  category: string;
};

type GoalsAndAchievementsProps = {
  achievements: Achievement[];
  goals: Goal[];
};

export default function GoalsAndAchievements({ achievements, goals }: GoalsAndAchievementsProps) {
  const [activeTab, setActiveTab] = useState('achievements');

  // Group achievements by status
  const completedAchievements = achievements.filter(a => a.status === 'completed');
  const inProgressAchievements = achievements.filter(a => a.status === 'in-progress');
  const lockedAchievements = achievements.filter(a => a.status === 'locked');

  // Group goals by category
  const goalsByCategory = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // Calculate overall progress for goals
  const calculateOverallProgress = (goals: Goal[]) => {
    if (goals.length === 0) return 0;
    
    const totalProgress = goals.reduce((sum, goal) => {
      const goalProgress = Math.min(100, (goal.current / goal.target) * 100);
      return sum + goalProgress;
    }, 0);
    
    return Math.round(totalProgress / goals.length);
  };

  const overallGoalProgress = calculateOverallProgress(goals);

  // Get icon component based on string name
  const getIconComponent = (iconName: string, size = 16) => {
    switch (iconName) {
      case 'award':
        return <FiAward size={size} />;
      case 'target':
        return <FiTarget size={size} />;
      case 'check':
        return <FiCheck size={size} />;
      case 'clock':
        return <FiClock size={size} />;
      case 'lock':
        return <FiLock size={size} />;
      default:
        return <FiAward size={size} />;
    }
  };

  // Format date to readable string
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Calculate days remaining until deadline
  const getDaysRemaining = (deadline?: Date) => {
    if (!deadline) return null;
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium">Goals & Achievements</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex items-center gap-2 px-4 py-3 ${
            activeTab === 'achievements'
              ? 'text-white border-b-2 border-white/60'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('achievements')}
        >
          <FiAward size={16} />
          <span className="text-sm">Achievements</span>
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-3 ${
            activeTab === 'goals'
              ? 'text-white border-b-2 border-white/60'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('goals')}
        >
          <FiTarget size={16} />
          <span className="text-sm">Personal Goals</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'achievements' && (
          <div>
            {/* Achievement Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-semibold">{completedAchievements.length}</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-semibold">{inProgressAchievements.length}</div>
                <div className="text-xs text-gray-400">In Progress</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-semibold">{lockedAchievements.length}</div>
                <div className="text-xs text-gray-400">Locked</div>
              </div>
            </div>

            {/* Completed Achievements */}
            {completedAchievements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Completed</h3>
                <div className="space-y-3">
                  {completedAchievements.map((achievement) => (
                    <div key={achievement.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3 text-white/80">
                          {getIconComponent(achievement.icon, 16)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{achievement.title}</h4>
                            <span className="text-xs text-gray-400">
                              {achievement.completedAt ? formatDate(achievement.completedAt) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
                          {achievement.reward && (
                            <div className="text-xs text-white/80 mt-2 bg-white/10 px-2 py-1 rounded inline-block">
                              Reward: {achievement.reward}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Achievements */}
            {inProgressAchievements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">In Progress</h3>
                <div className="space-y-3">
                  {inProgressAchievements.map((achievement) => (
                    <div key={achievement.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 text-white/60">
                          {getIconComponent(achievement.icon, 16)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
                          {achievement.progress !== undefined && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-400">Progress</span>
                                <span>{achievement.progress}%</span>
                              </div>
                              <div className="w-full bg-white/5 rounded-full h-1.5">
                                <div 
                                  className="bg-white/40 h-1.5 rounded-full" 
                                  style={{ width: `${achievement.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Locked</h3>
                <div className="space-y-3">
                  {lockedAchievements.map((achievement) => (
                    <div key={achievement.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 text-white/40">
                          <FiLock size={16} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white/60">{achievement.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div>
            {/* Goals Overview */}
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Overall Progress</h3>
                <span className="text-sm font-medium">{overallGoalProgress}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 mb-4">
                <div 
                  className="bg-white/40 h-2 rounded-full" 
                  style={{ width: `${overallGoalProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400">
                You have {goals.length} active goals across {Object.keys(goalsByCategory).length} categories
              </div>
            </div>

            {/* Goals by Category */}
            <div className="space-y-6">
              {Object.entries(goalsByCategory).map(([category, categoryGoals]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">{category}</h3>
                  <div className="space-y-3">
                    {categoryGoals.map((goal) => {
                      const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
                      const daysRemaining = getDaysRemaining(goal.deadline);
                      
                      return (
                        <div key={goal.id} className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{goal.title}</h4>
                            {daysRemaining !== null && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                daysRemaining > 7 
                                  ? 'bg-white/10 text-white/60' 
                                  : 'bg-white/20 text-white/80'
                              }`}>
                                {daysRemaining} days left
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mb-3">{goal.description}</p>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-400">Progress</span>
                            <span>{goal.current} / {goal.target} {goal.unit}</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div 
                              className="bg-white/40 h-1.5 rounded-full" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          {goal.deadline && (
                            <div className="text-xs text-gray-500 mt-2">
                              Deadline: {formatDate(goal.deadline)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Goal Button */}
            <div className="mt-6">
              <button className="w-full p-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                <FiTarget size={14} />
                <span>Set New Goal</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
