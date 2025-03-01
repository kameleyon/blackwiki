"use client";

import React, { useState } from 'react';
import { CommunityAnnouncement } from './types';
import { getCommunityAnnouncements } from './utils';
import { 
  Bell, 
  Calendar, 
  Search, 
  Filter,
  AlertTriangle,
  Info,
  AlertCircle
} from 'lucide-react';

interface AnnouncementFeedProps {
  showTitle?: boolean;
  limit?: number;
}

const AnnouncementFeed: React.FC<AnnouncementFeedProps> = ({
  showTitle = true,
  limit
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [importanceFilter, setImportanceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  const announcements = getCommunityAnnouncements();
  
  // Filter announcements based on search query, category filter, and importance filter
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter ? announcement.category === categoryFilter : true;
    
    const matchesImportance = importanceFilter === 'all' ? true : announcement.importance === importanceFilter;
    
    return matchesSearch && matchesCategory && matchesImportance;
  });
  
  // Sort announcements by date (newest first) and importance (high first)
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    // First sort by importance
    const importanceOrder = { high: 0, medium: 1, low: 2 };
    const importanceDiff = importanceOrder[a.importance] - importanceOrder[b.importance];
    
    if (importanceDiff !== 0) {
      return importanceDiff;
    }
    
    // Then sort by date
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  
  // Limit the number of announcements if specified
  const displayAnnouncements = limit ? sortedAnnouncements.slice(0, limit) : sortedAnnouncements;
  
  // Get unique categories for filter
  const categories = Array.from(new Set(announcements.map(announcement => announcement.category)));
  
  // Get importance icon
  const getImportanceIcon = (importance: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-normal flex items-center">
            <Bell className="mr-2 h-6 w-6 text-white/70" />
            Community Announcements
          </h2>
          <p className="text-white/70 mt-2">
            Important updates and news from the AfroWiki team
          </p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 pr-10 appearance-none text-white/80 w-40"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={importanceFilter}
                onChange={(e) => setImportanceFilter(e.target.value as any)}
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 pr-10 appearance-none text-white/80 w-40"
              >
                <option value="all">All Importance</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {displayAnnouncements.map(announcement => (
          <div 
            key={announcement.id} 
            className={`bg-black/20 rounded-lg p-4 border-l-4 ${
              announcement.importance === 'high' 
                ? 'border-red-500' 
                : announcement.importance === 'medium'
                ? 'border-yellow-500'
                : 'border-blue-500'
            }`}
          >
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                {getImportanceIcon(announcement.importance)}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="text-lg font-semibold">{announcement.title}</h3>
                  <div className="flex items-center text-white/60 text-sm mt-1 sm:mt-0">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(announcement.publishedAt)}</span>
                  </div>
                </div>
                
                <p className="text-white/80 mb-3">
                  {announcement.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-white/60 text-sm mr-2">Posted by:</span>
                    <span className="text-white/80">{announcement.author.name}</span>
                    <span className="text-white/60 text-sm ml-2">({announcement.author.role})</span>
                  </div>
                  
                  <span className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full">
                    {announcement.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {displayAnnouncements.length === 0 && (
        <div className="text-center py-8 text-white/60">
          No announcements found matching your search criteria.
        </div>
      )}
      
      {limit && announcements.length > limit && (
        <div className="mt-6 text-center">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
            View All Announcements
          </button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementFeed;
