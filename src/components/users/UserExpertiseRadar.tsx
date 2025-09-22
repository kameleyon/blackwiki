"use client";

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { FiTarget } from 'react-icons/fi';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface UserExpertiseRadarProps {
  expertise: string[];
  userId: string;
}

export default function UserExpertiseRadar({ expertise, userId }: UserExpertiseRadarProps) {
  const [expertiseData, setExpertiseData] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpertiseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}/expertise`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch expertise data');
        }
        
        const data = await response.json();
        
        // Convert API response to the format expected by the radar chart
        const expertiseScores: { [key: string]: number } = {};
        
        // First, try to match the user's declared expertise areas with calculated scores
        expertise.forEach(area => {
          const matchingData = data.areas.find((item: any) => 
            item.area.toLowerCase().includes(area.toLowerCase()) ||
            area.toLowerCase().includes(item.area.toLowerCase())
          );
          expertiseScores[area] = matchingData ? matchingData.score : 25; // Default low score if no match
        });
        
        setExpertiseData(expertiseScores);
      } catch (error) {
        console.error('Error fetching expertise data:', error);
        // Fallback to basic scores if API fails
        const fallbackScores: { [key: string]: number } = {};
        expertise.forEach(area => {
          fallbackScores[area] = 30; // Conservative fallback score
        });
        setExpertiseData(fallbackScores);
      } finally {
        setLoading(false);
      }
    };

    if (expertise.length > 0) {
      fetchExpertiseData();
    } else {
      setLoading(false);
    }
  }, [expertise, userId]);

  if (loading || expertise.length === 0) {
    return null;
  }

  const data = {
    labels: expertise,
    datasets: [
      {
        label: 'Expertise Level',
        data: expertise.map(area => expertiseData[area] || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed.r}%`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10
          },
          stepSize: 20,
          showLabelBackdrop: false
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="bg-white/5 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiTarget className="text-white/60" size={16} />
        <h3 className="text-lg font-medium">Expertise Areas</h3>
      </div>

      <div className="relative h-64">
        <Radar data={data} options={options} />
      </div>

      {/* Expertise Levels Legend */}
      <div className="mt-4 space-y-2">
        <div className="text-xs text-white/60 text-center mb-2">Expertise Levels</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {expertise.map((area, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-white/70 truncate pr-2">{area}</span>
              <span className="text-blue-400 font-medium">
                {expertiseData[area]}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <p className="text-xs text-white/50">
          Expertise levels are calculated based on contribution history and peer recognition
        </p>
      </div>
    </div>
  );
}