"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  FiEdit, 
  FiFileText, 
  FiStar, 
  FiCheckCircle, 
  FiMessageSquare,
  FiCalendar,
  FiFilter,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

type Activity = {
  id: string;
  type: 'edit' | 'comment' | 'publish' | 'review' | 'mention';
  title: string;
  description?: string;
  articleId?: string;
  articleTitle?: string;
  userId?: string;
  userName?: string;
  date: Date;
  metadata?: {
    [key: string]: string | number | boolean | null;
  };
};

type EnhancedActivityTimelineProps = {
  activities: Activity[];
  totalActivities: number;
};

export default function EnhancedActivityTimeline({ 
  activities, 
  totalActivities 
}: EnhancedActivityTimelineProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalActivities / itemsPerPage);

  // Filter activities by type
  const filteredActivities = filter 
    ? activities.filter(activity => activity.type === filter)
    : activities;

  // Get icon component based on activity type
  const getActivityIcon = (type: string, size = 14) => {
    switch (type) {
      case 'edit':
        return <FiEdit size={size} />;
      case 'comment':
        return <FiMessageSquare size={size} />;
      case 'publish':
        return <FiFileText size={size} />;
      case 'review':
        return <FiCheckCircle size={size} />;
      case 'mention':
        return <FiStar size={size} />;
      default:
        return <FiEdit size={size} />;
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };

  // Group activities by date for calendar view
  const groupActivitiesByDate = () => {
    const grouped: Record<string, Activity[]> = {};
    
    filteredActivities.forEach(activity => {
      const dateKey = formatDate(activity.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });
    
    return grouped;
  };

  // Get activity count for a specific date
  const getActivityCountForDate = (date: Date) => {
    const dateKey = formatDate(date);
    const grouped = groupActivitiesByDate();
    return grouped[dateKey]?.length || 0;
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium">Activity Timeline</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md ${
              view === 'list' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <FiFileText size={16} />
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`p-2 rounded-md ${
              view === 'calendar' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <FiCalendar size={16} />
          </button>
          <div className="relative">
            <button
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white px-2 py-1 bg-white/5 hover:bg-white/10 rounded"
            >
              <FiFilter size={14} />
              <span>Filter</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 hidden">
              <div className="py-1">
                <button
                  onClick={() => setFilter(null)}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                >
                  All Activities
                </button>
                <button
                  onClick={() => setFilter('edit')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                >
                  Edits
                </button>
                <button
                  onClick={() => setFilter('comment')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                >
                  Comments
                </button>
                <button
                  onClick={() => setFilter('publish')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                >
                  Publications
                </button>
                <button
                  onClick={() => setFilter('review')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                >
                  Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {view === 'list' ? (
        <>
          <div className="p-4">
            {filteredActivities.length > 0 ? (
              <div className="space-y-6">
                {filteredActivities.map((activity, index) => (
                  <div key={activity.id} className="flex">
                    <div className="mr-4 relative">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      {index !== filteredActivities.length - 1 && (
                        <div className="absolute top-8 bottom-0 left-1/2 w-px bg-gray-700 -translate-x-1/2"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          {activity.description && (
                            <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatRelativeTime(activity.date)}
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <span className="flex items-center">
                          <FiCalendar size={12} className="mr-1" />
                          {formatDate(activity.date)} at {formatTime(activity.date)}
                        </span>
                        {activity.articleTitle && (
                          <Link 
                            href={`/articles/${activity.articleId}`}
                            className="ml-3 text-gray-400 hover:text-white"
                          >
                            View Article
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No activities found.
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 text-sm ${
                  currentPage === 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 text-sm ${
                  currentPage === totalPages ? 'text-gray-600' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Next</span>
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-400">February 2025</h3>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-xs text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((day, index) => (
              <div 
                key={index} 
                className={`aspect-square p-1 ${
                  day ? 'hover:bg-white/5 cursor-pointer' : ''
                }`}
              >
                {day && (
                  <div className={`h-full rounded-md flex flex-col items-center justify-center ${
                    getActivityCountForDate(day) > 0 ? 'bg-white/10' : ''
                  }`}>
                    <span className="text-sm">{day.getDate()}</span>
                    {getActivityCountForDate(day) > 0 && (
                      <span className="text-xs text-gray-400 mt-1">
                        {getActivityCountForDate(day)} activities
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Today&apos;s Activities</h3>
            {filteredActivities.filter(a => 
              formatDate(a.date) === formatDate(new Date())
            ).length > 0 ? (
              <div className="space-y-3">
                {filteredActivities
                  .filter(a => formatDate(a.date) === formatDate(new Date()))
                  .map((activity) => (
                    <div key={activity.id} className="flex items-start p-2 hover:bg-white/5 rounded-md">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mr-3">
                        {getActivityIcon(activity.type, 12)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.title}</p>
                        <p className="text-xs text-gray-400">{formatTime(activity.date)}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No activities today.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
