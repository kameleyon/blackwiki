"use client";

import { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiTarget } from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

// Define chart options with dark mode styling
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12
        }
      }
    },
    title: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      titleColor: 'rgba(255, 255, 255, 0.9)',
      bodyColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    }
  }
};

// Define radar chart options (without x and y scales)
const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12
        }
      }
    },
    title: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      titleColor: 'rgba(255, 255, 255, 0.9)',
      bodyColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1
    }
  },
  scales: {
    r: {
      angleLines: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      pointLabels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 10
        }
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        backdropColor: 'transparent'
      }
    }
  }
};

// Define doughnut chart options (without scales)
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12
        }
      }
    },
    title: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      titleColor: 'rgba(255, 255, 255, 0.9)',
      bodyColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1
    }
  }
};

type AdvancedStatisticsProps = {
  contributionData: {
    articles: number;
    edits: number;
    comments: number;
    reviews: number;
  };
  articleImpactData: {
    views: number[];
    likes: number[];
    shares: number[];
    comments: number[];
    labels: string[];
  };
  categoryDistribution: {
    labels: string[];
    data: number[];
  };
  expertiseRadar: {
    labels: string[];
    current: number[];
    target: number[];
  };
  achievementsData: {
    completed: number;
    inProgress: number;
    locked: number;
  };
};

export default function AdvancedStatistics({
  contributionData,
  articleImpactData,
  categoryDistribution,
  expertiseRadar,
  achievementsData
}: AdvancedStatisticsProps) {
  const [activeTab, setActiveTab] = useState('contributions');

  // Prepare contribution data for bar chart
  const contributionChartData = {
    labels: ['Articles', 'Edits', 'Comments', 'Reviews'],
    datasets: [
      {
        label: 'Contributions',
        data: [
          contributionData.articles,
          contributionData.edits,
          contributionData.comments,
          contributionData.reviews
        ],
        backgroundColor: [
          'rgba(219, 39, 119, 0.8)',  // Pink/Magenta for Articles
          'rgba(107, 114, 128, 0.8)',  // Gray for Edits  
          'rgba(245, 158, 11, 0.8)',   // Golden for Comments
          'rgba(20, 184, 166, 0.8)'    // True teal for Reviews
        ],
        borderColor: [
          'rgba(219, 39, 119, 1)',     // Pink/Magenta border
          'rgba(107, 114, 128, 1)',    // Gray border
          'rgba(245, 158, 11, 1)',     // Golden border
          'rgba(20, 184, 166, 1)'      // True teal border
        ],
        borderWidth: 1
      }
    ]
  };

  // Prepare article impact data for line chart
  const impactChartData = {
    labels: articleImpactData.labels,
    datasets: [
      {
        label: 'Views',
        data: articleImpactData.views,
        borderColor: 'rgba(219, 39, 119, 1)',     // Pink/Magenta for Views
        backgroundColor: 'rgba(219, 39, 119, 0.1)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'Likes',
        data: articleImpactData.likes,
        borderColor: 'rgba(20, 184, 166, 1)',     // True teal for Likes
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'Shares',
        data: articleImpactData.shares,
        borderColor: 'rgba(245, 158, 11, 1)',     // Golden for Shares
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'Comments',
        data: articleImpactData.comments,
        borderColor: 'rgba(107, 114, 128, 1)',    // Gray for Comments
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        tension: 0.4,
        fill: false
      }
    ]
  };

  // Prepare category distribution data for doughnut chart
  const categoryChartData = {
    labels: categoryDistribution.labels,
    datasets: [
      {
        label: 'Articles',
        data: categoryDistribution.data,
        backgroundColor: [
          'rgba(219, 39, 119, 0.8)',   // Pink/Magenta
          'rgba(20, 184, 166, 0.8)',   // True teal
          'rgba(245, 158, 11, 0.8)',   // Golden
          'rgba(16, 185, 129, 0.8)',   // Emerald
          'rgba(139, 92, 246, 0.8)',   // Purple
          'rgba(239, 68, 68, 0.8)'     // Red
        ],
        borderColor: [
          'rgba(219, 39, 119, 1)',     // Pink/Magenta border
          'rgba(20, 184, 166, 1)',     // True teal border
          'rgba(245, 158, 11, 1)',     // Golden border
          'rgba(16, 185, 129, 1)',     // Emerald border
          'rgba(139, 92, 246, 1)',     // Purple border
          'rgba(239, 68, 68, 1)'       // Red border
        ],
        borderWidth: 1
      }
    ]
  };

  // Prepare expertise radar data
  const expertiseChartData = {
    labels: expertiseRadar.labels,
    datasets: [
      {
        label: 'Current Expertise',
        data: expertiseRadar.current,
        backgroundColor: 'rgba(20, 184, 166, 0.2)',     // True teal for Current
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(20, 184, 166, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(20, 184, 166, 1)'
      },
      {
        label: 'Target Expertise',
        data: expertiseRadar.target,
        backgroundColor: 'rgba(219, 39, 119, 0.2)',     // Pink/Magenta for Target
        borderColor: 'rgba(219, 39, 119, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(219, 39, 119, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(219, 39, 119, 1)'
      }
    ]
  };

  // Prepare achievements data for doughnut chart
  const achievementsChartData = {
    labels: ['Completed', 'In Progress', 'Locked'],
    datasets: [
      {
        label: 'Achievements',
        data: [
          achievementsData.completed,
          achievementsData.inProgress,
          achievementsData.locked
        ],
        backgroundColor: [
          'rgba(20, 184, 166, 0.8)',   // True teal for Completed
          'rgba(245, 158, 11, 0.8)',   // Golden for In Progress  
          'rgba(107, 114, 128, 0.4)'   // Dark gray for Locked
        ],
        borderColor: [
          'rgba(20, 184, 166, 1)',     // True teal border
          'rgba(245, 158, 11, 1)',     // Golden border
          'rgba(107, 114, 128, 0.8)'   // Dark gray border
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium">Advanced Statistics</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex items-center gap-2 px-4 py-3 ${
            activeTab === 'contributions'
              ? 'text-white border-b-2 border-white/60'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('contributions')}
        >
          <FiBarChart2 size={16} />
          <span className="text-sm">Contributions</span>
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-3 ${
            activeTab === 'impact'
              ? 'text-white border-b-2 border-white/60'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('impact')}
        >
          <FiTrendingUp size={16} />
          <span className="text-sm">Article Impact</span>
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-3 ${
            activeTab === 'categories'
              ? 'text-white border-b-2 border-white/60'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('categories')}
        >
          <FiPieChart size={16} />
          <span className="text-sm">Categories</span>
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-3 ${
            activeTab === 'expertise'
              ? 'text-white border-b-2 border-white/60'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('expertise')}
        >
          <FiTarget size={16} />
          <span className="text-sm">Expertise</span>
        </button>
      </div>

      {/* Chart Content */}
      <div className="p-4">
        {activeTab === 'contributions' && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Contribution Breakdown</h3>
              <p className="text-xs text-gray-500">
                Your contributions across different activities on AfroWiki
              </p>
            </div>
            <div className="h-64">
              <Bar options={chartOptions} data={contributionChartData} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-xs text-gray-400 mb-1">Total Contributions</h4>
                <p className="text-xl font-semibold">
                  {contributionData.articles + contributionData.edits + contributionData.comments + contributionData.reviews}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-xs text-gray-400 mb-1">Achievements</h4>
                <div className="h-16">
                  <Doughnut options={doughnutOptions} data={achievementsChartData} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Article Impact Over Time</h3>
              <p className="text-xs text-gray-500">
                Engagement metrics for your articles over the past 6 months
              </p>
            </div>
            <div className="h-64">
              <Line options={chartOptions} data={impactChartData} />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-xs text-gray-400 mb-1">Total Views</h4>
                <p className="text-lg font-semibold">
                  {articleImpactData.views.reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-xs text-gray-400 mb-1">Total Likes</h4>
                <p className="text-lg font-semibold">
                  {articleImpactData.likes.reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-xs text-gray-400 mb-1">Total Shares</h4>
                <p className="text-lg font-semibold">
                  {articleImpactData.shares.reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-xs text-gray-400 mb-1">Total Comments</h4>
                <p className="text-lg font-semibold">
                  {articleImpactData.comments.reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Category Distribution</h3>
              <p className="text-xs text-gray-500">
                Distribution of your articles across different categories
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64">
                <Doughnut options={doughnutOptions} data={categoryChartData} />
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Category Breakdown</h4>
                <div className="space-y-3">
                  {categoryDistribution.labels.map((label, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ 
                            backgroundColor: `rgba(${[
                              [219, 39, 119],   // Pink/Magenta
                              [20, 184, 166],   // True teal
                              [245, 158, 11],   // Golden
                              [16, 185, 129],   // Emerald
                              [139, 92, 246],   // Purple
                              [239, 68, 68]     // Red
                            ][index % 6].join(', ')}, 0.8)` 
                          }}
                        ></div>
                        <span className="text-sm">{label}</span>
                      </div>
                      <span className="text-sm font-medium">{categoryDistribution.data[index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expertise' && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Expertise Radar</h3>
              <p className="text-xs text-gray-500">
                Your current expertise levels compared to your targets
              </p>
            </div>
            <div className="h-64">
              <Radar options={radarOptions} data={expertiseChartData} />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-xs text-gray-400 mb-2">Strongest Areas</h4>
                {expertiseRadar.labels
                  .map((label, i) => ({ label, value: expertiseRadar.current[i] }))
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div key={index} className="flex items-center justify-between mb-1 last:mb-0">
                      <span className="text-sm">{item.label}</span>
                      <span className="text-sm font-medium">{item.value}/10</span>
                    </div>
                  ))
                }
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-xs text-gray-400 mb-2">Areas to Improve</h4>
                {expertiseRadar.labels
                  .map((label, i) => ({ 
                    label, 
                    current: expertiseRadar.current[i],
                    target: expertiseRadar.target[i],
                    gap: expertiseRadar.target[i] - expertiseRadar.current[i]
                  }))
                  .sort((a, b) => b.gap - a.gap)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div key={index} className="flex items-center justify-between mb-1 last:mb-0">
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center">
                        <span className="text-sm">{item.current}</span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="text-sm text-gray-400">{item.target}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
