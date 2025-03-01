"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { CommunityEvent } from './types';
import { getCommunityEvents } from './utils';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Video, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';

interface EventCalendarProps {
  showTitle?: boolean;
  limit?: number;
  showDetails?: boolean;
}

const EventCalendar: React.FC<EventCalendarProps> = ({
  showTitle = true,
  limit,
  showDetails = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [locationFilter, setLocationFilter] = useState<'all' | 'virtual' | 'in-person'>('all');
  
  const events = getCommunityEvents();
  
  // Filter events based on search query and location filter
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = 
      locationFilter === 'all' ? true :
      locationFilter === 'virtual' ? event.isVirtual :
      !event.isVirtual;
    
    return matchesSearch && matchesLocation;
  });
  
  // Sort events by start date (upcoming first)
  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  // Limit the number of events if specified
  const displayEvents = limit ? sortedEvents.slice(0, limit) : sortedEvents;
  
  // Format date for display
  const formatEventDate = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const startFormatted = start.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const startTime = start.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    
    if (!endDate) {
      return `${startFormatted} at ${startTime}`;
    }
    
    const end = new Date(endDate);
    
    // If same day
    if (start.toDateString() === end.toDateString()) {
      const endTime = end.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit'
      });
      return `${startFormatted} from ${startTime} to ${endTime}`;
    }
    
    // Different days
    const endFormatted = end.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${startFormatted} to ${endFormatted}`;
  };
  
  // Get days in month for calendar view
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar data
  const generateCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, events: [] });
    }
    
    // Add days of the month with their events
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      
      // Find events for this day
      const dayEvents = sortedEvents.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
        
        // Check if the current day falls within the event's date range
        return (
          date.getFullYear() === eventStart.getFullYear() &&
          date.getMonth() === eventStart.getMonth() &&
          date.getDate() === eventStart.getDate()
        ) || (
          event.endDate &&
          date >= eventStart &&
          date <= eventEnd
        );
      });
      
      days.push({ day, events: dayEvents });
    }
    
    return days;
  };
  
  const calendarData = generateCalendarData();
  
  // Get month name
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-normal flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-white/70" />
            Community Events
          </h2>
          <p className="text-white/70 mt-2">
            Upcoming events, meetups, and activities for the AfroWiki community
          </p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value as any)}
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 pr-10 appearance-none text-white/80 w-40"
              >
                <option value="all">All Locations</option>
                <option value="virtual">Virtual Only</option>
                <option value="in-person">In-Person Only</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4 pointer-events-none" />
            </div>
            
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 ${viewMode === 'list' ? 'bg-white/20' : 'bg-black/20 hover:bg-black/30'} transition-colors`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 ${viewMode === 'calendar' ? 'bg-white/20' : 'bg-black/20 hover:bg-black/30'} transition-colors`}
              >
                Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {viewMode === 'list' && !selectedEvent && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayEvents.map(event => (
            <div 
              key={event.id} 
              className="bg-black/20 rounded-lg overflow-hidden cursor-pointer hover:bg-black/30 transition-colors"
              onClick={() => showDetails && setSelectedEvent(event)}
            >
              {event.imageUrl && (
                <div className="h-40 relative">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                
                <div className="flex items-center mt-2 text-white/70 text-sm">
                  <Clock className="h-4 w-4 mr-2 text-white/60" />
                  {formatEventDate(event.startDate, event.endDate)}
                </div>
                
                <div className="flex items-center mt-2 text-white/70 text-sm">
                  {event.isVirtual ? (
                    <>
                      <Video className="h-4 w-4 mr-2 text-white/60" />
                      <span>Virtual ({event.location})</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2 text-white/60" />
                      <span>{event.location}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center mt-2 text-white/70 text-sm">
                  <Users className="h-4 w-4 mr-2 text-white/60" />
                  <span>
                    {event.attendees} attendees
                    {event.maxAttendees && ` / ${event.maxAttendees} max`}
                  </span>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-white/5 text-white/70 text-xs px-2 py-0.5 rounded-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {showDetails && (
                  <div className="mt-3 text-right">
                    <button className="text-white/70 hover:text-white text-sm transition-colors">
                      View Details →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {viewMode === 'calendar' && (
        <div className="bg-black/20 rounded-lg overflow-hidden">
          <div className="p-4 bg-black/30 flex items-center justify-between">
            <button 
              onClick={goToPreviousMonth}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-medium">{getMonthName(currentMonth)}</h3>
            
            <button 
              onClick={goToNextMonth}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 text-center border-b border-white/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-sm font-medium text-white/70">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {calendarData.map((data, index) => (
              <div 
                key={index} 
                className={`min-h-24 p-2 border-b border-r border-white/10 ${
                  data.day === 0 ? 'bg-black/10' : 'hover:bg-black/30 transition-colors'
                }`}
              >
                {data.day > 0 && (
                  <>
                    <div className="text-sm text-white/70 mb-1">{data.day}</div>
                    <div className="space-y-1">
                      {data.events.slice(0, 2).map(event => (
                        <div 
                          key={event.id}
                          className="text-xs p-1 rounded bg-white/10 truncate cursor-pointer"
                          onClick={() => showDetails && setSelectedEvent(event)}
                        >
                          {event.title}
                        </div>
                      ))}
                      {data.events.length > 2 && (
                        <div className="text-xs text-white/60 text-center">
                          +{data.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {displayEvents.length === 0 && !selectedEvent && (
        <div className="text-center py-8 text-white/60">
          No events found matching your search criteria.
        </div>
      )}
      
      {limit && events.length > limit && !selectedEvent && viewMode === 'list' && (
        <div className="mt-6 text-center">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
            View All Events
          </button>
        </div>
      )}
      
      {selectedEvent && showDetails && (
        <div>
          <div className="mb-4">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="text-white/70 hover:text-white flex items-center transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Events
            </button>
          </div>
          
          <div className="bg-black/20 rounded-lg overflow-hidden">
            {selectedEvent.imageUrl && (
              <div className="h-64 relative">
                <Image
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-2xl font-semibold">{selectedEvent.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <div className="flex items-center mt-2 text-white/80">
                    <Clock className="h-5 w-5 mr-3 text-white/60" />
                    {formatEventDate(selectedEvent.startDate, selectedEvent.endDate)}
                  </div>
                  
                  <div className="flex items-center mt-4 text-white/80">
                    {selectedEvent.isVirtual ? (
                      <>
                        <Video className="h-5 w-5 mr-3 text-white/60" />
                        <span>Virtual Event ({selectedEvent.location})</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-5 w-5 mr-3 text-white/60" />
                        <span>{selectedEvent.location}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-4 text-white/80">
                    <Users className="h-5 w-5 mr-3 text-white/60" />
                    <span>
                      {selectedEvent.attendees} attendees
                      {selectedEvent.maxAttendees && ` / ${selectedEvent.maxAttendees} max`}
                    </span>
                  </div>
                  
                  <div className="flex items-start mt-4 text-white/80">
                    <Tag className="h-5 w-5 mr-3 text-white/60 mt-0.5" />
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEvent.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-white/5 text-white/70 text-xs px-2 py-0.5 rounded-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">About this event</h4>
                  <p className="text-white/80 whitespace-pre-line">
                    {selectedEvent.description}
                  </p>
                  
                  <div className="mt-6 flex items-center">
                    <span className="text-white/60 text-sm">Organized by:</span>
                    <span className="ml-2">{selectedEvent.organizer.name}</span>
                  </div>
                  
                  <div className="mt-6">
                    <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                      Register for Event
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
