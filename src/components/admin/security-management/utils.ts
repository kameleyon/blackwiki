import { SecurityIncident, UserActivity } from './types';

/**
 * Format date to a human-readable string
 */
export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString();
};

/**
 * Get severity color class based on severity level
 */
export const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical'): string => {
  switch (severity) {
    case 'low':
      return 'text-yellow-400 bg-yellow-400/10';
    case 'medium':
      return 'text-orange-400 bg-orange-400/10';
    case 'high':
      return 'text-red-400 bg-red-400/10';
    case 'critical':
      return 'text-red-600 bg-red-600/10';
    default:
      return 'text-white/60 bg-white/10';
  }
};

/**
 * Get status color class based on incident status
 */
export const getStatusColor = (status: 'open' | 'investigating' | 'resolved' | 'false_positive'): string => {
  switch (status) {
    case 'open':
      return 'text-red-400 bg-red-400/10';
    case 'investigating':
      return 'text-orange-400 bg-orange-400/10';
    case 'resolved':
      return 'text-green-400 bg-green-400/10';
    case 'false_positive':
      return 'text-white/60 bg-white/10';
    default:
      return 'text-white/60 bg-white/10';
  }
};

/**
 * Get activity status color class based on activity status
 */
export const getActivityStatusColor = (status: 'success' | 'failure' | 'warning'): string => {
  switch (status) {
    case 'success':
      return 'text-green-400';
    case 'failure':
      return 'text-red-400';
    case 'warning':
      return 'text-yellow-400';
    default:
      return 'text-white/60';
  }
};

/**
 * Format type string to a human-readable format
 */
export const formatTypeString = (type: string): string => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Filter incidents based on search query and filter type
 */
export const filterIncidents = (
  incidents: SecurityIncident[],
  searchQuery: string,
  filterType: string
): SecurityIncident[] => {
  return incidents.filter(incident => {
    // Filter by search query
    if (searchQuery && 
        !incident.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !incident.type.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !incident.user?.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by type
    if (filterType !== 'all' && filterType !== incident.type) {
      return false;
    }
    
    return true;
  });
};

/**
 * Sort incidents by timestamp (newest first)
 */
export const sortIncidentsByDate = (incidents: SecurityIncident[]): SecurityIncident[] => {
  return [...incidents].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

/**
 * Default chart options
 */
export const defaultChartOptions = {
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
};
