"use client";

import { useState } from 'react';
import { 
  FiUsers, 
  FiFileText, 
  FiTrendingUp, 
  FiBarChart2, 
  FiPieChart,
  FiActivity,
  FiCalendar,
  FiSearch,
  FiDownload
} from 'react-icons/fi';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title, 
  Tooltip, 
  Legend
);

interface AnalyticsDashboardProps {
  userMetrics: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    userGrowth: number[];
    userRetention: number;
  };
  contentMetrics: {
    totalArticles: number;
    newArticles: number;
    averageQualityScore: number;
    contentGrowth: number[];
    categoryDistribution: {
      labels: string[];
      data: number[];
    };
  };
  engagementMetrics: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    viewsOverTime: number[];
    likesOverTime: number[];
    commentsOverTime: number[];
  };
  collaborationMetrics: {
    totalCollaborations: number;
    activeCollaborations: number;
    averageContributors: number;
    collaborationEfficiency: number[];
  };
}

export default function AnalyticsDashboard({
  userMetrics,
  contentMetrics,
  engagementMetrics,
  collaborationMetrics
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [reportType, setReportType] = useState<'overview' | 'users' | 'content' | 'engagement' | 'collaboration'>('overview');
  
  // Time labels based on selected range
  const timeLabels = {
    day: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    month: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
    year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  
  // User growth chart data
  const userGrowthData = {
    labels: timeLabels[timeRange],
    datasets: [
      {
        label: 'New Users',
        data: userMetrics.userGrowth,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Content growth chart data
  const contentGrowthData = {
    labels: timeLabels[timeRange],
    datasets: [
      {
        label: 'New Articles',
        data: contentMetrics.contentGrowth,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Engagement metrics chart data
  const engagementData = {
    labels: timeLabels[timeRange],
    datasets: [
      {
        label: 'Views',
        data: engagementMetrics.viewsOverTime,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Likes',
        data: engagementMetrics.likesOverTime,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Comments',
        data: engagementMetrics.commentsOverTime,
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.4,
      },
    ],
  };
  
  // Category distribution chart data
  const categoryDistributionData = {
    labels: contentMetrics.categoryDistribution.labels,
    datasets: [
      {
        label: 'Articles per Category',
        data: contentMetrics.categoryDistribution.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Collaboration efficiency chart data
  const collaborationEfficiencyData = {
    labels: timeLabels[timeRange],
    datasets: [
      {
        label: 'Collaboration Efficiency',
        data: collaborationMetrics.collaborationEfficiency,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-normal">Analytics Dashboard</h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Time Range Selector */}
          <div className="flex bg-white/5 rounded-lg overflow-hidden">
            {(['day', 'week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium ${
                  timeRange === range
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Report Type Selector */}
          <div className="flex bg-white/5 rounded-lg overflow-hidden">
            {(['overview', 'users', 'content', 'engagement', 'collaboration'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 py-1.5 text-xs font-medium ${
                  reportType === type
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Export Button */}
          <button className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/10">
            <FiDownload size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
            <FiUsers className="text-white/60" size={18} />
          </div>
          <p className="text-2xl font-normal">{userMetrics.totalUsers}</p>
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <FiTrendingUp className="text-green-400 mr-1" size={12} />
            <span>{userMetrics.newUsers} new this {timeRange}</span>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Articles</h3>
            <FiFileText className="text-white/60" size={18} />
          </div>
          <p className="text-2xl font-normal">{contentMetrics.totalArticles}</p>
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <FiTrendingUp className="text-green-400 mr-1" size={12} />
            <span>{contentMetrics.newArticles} new this {timeRange}</span>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Views</h3>
            <FiBarChart2 className="text-white/60" size={18} />
          </div>
          <p className="text-2xl font-normal">{engagementMetrics.totalViews}</p>
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <FiActivity className="text-white/60 mr-1" size={12} />
            <span>Avg. quality score: {contentMetrics.averageQualityScore.toFixed(1)}/10</span>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">User Retention</h3>
            <FiPieChart className="text-white/60" size={18} />
          </div>
          <p className="text-2xl font-normal">{userMetrics.userRetention}%</p>
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <FiActivity className="text-white/60 mr-1" size={12} />
            <span>Active collaborations: {collaborationMetrics.activeCollaborations}</span>
          </div>
        </div>
      </div>
      
      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        {(reportType === 'overview' || reportType === 'users') && (
          <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
            <h3 className="text-lg font-normal mb-4">User Growth</h3>
            <div className="h-64">
              <Line 
                data={userGrowthData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
        
        {/* Content Growth Chart */}
        {(reportType === 'overview' || reportType === 'content') && (
          <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
            <h3 className="text-lg font-normal mb-4">Content Growth</h3>
            <div className="h-64">
              <Line 
                data={contentGrowthData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
        
        {/* Engagement Metrics Chart */}
        {(reportType === 'overview' || reportType === 'engagement') && (
          <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
            <h3 className="text-lg font-normal mb-4">Engagement Metrics</h3>
            <div className="h-64">
              <Line 
                data={engagementData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
        
        {/* Category Distribution Chart */}
        {(reportType === 'overview' || reportType === 'content') && (
          <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
            <h3 className="text-lg font-normal mb-4">Category Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-3/4 h-full">
                <Doughnut 
                  data={categoryDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Collaboration Efficiency Chart */}
        {(reportType === 'overview' || reportType === 'collaboration') && (
          <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
            <h3 className="text-lg font-normal mb-4">Collaboration Efficiency</h3>
            <div className="h-64">
              <Bar 
                data={collaborationEfficiencyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Custom Report Builder */}
      {reportType === 'overview' && (
        <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-normal">Custom Report Builder</h3>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-lg text-xs font-medium text-white hover:bg-white/20">
              <FiDownload size={14} />
              <span>Generate Report</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Report Type
                </label>
                <select className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20">
                  <option>User Growth</option>
                  <option>Content Performance</option>
                  <option>Engagement Analysis</option>
                  <option>Collaboration Metrics</option>
                  <option>Quality Assessment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Time Period
                </label>
                <select className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last 12 months</option>
                  <option>Custom range</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Data Granularity
                </label>
                <select className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20">
                  <option>Hourly</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Chart Type
                </label>
                <select className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20">
                  <option>Line Chart</option>
                  <option>Bar Chart</option>
                  <option>Pie Chart</option>
                  <option>Radar Chart</option>
                  <option>Table</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Metrics to Include
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="metric-users" className="mr-2" defaultChecked />
                    <label htmlFor="metric-users" className="text-sm text-gray-300">User Growth</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="metric-content" className="mr-2" defaultChecked />
                    <label htmlFor="metric-content" className="text-sm text-gray-300">Content Growth</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="metric-views" className="mr-2" defaultChecked />
                    <label htmlFor="metric-views" className="text-sm text-gray-300">Views</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="metric-quality" className="mr-2" />
                    <label htmlFor="metric-quality" className="text-sm text-gray-300">Quality Score</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
