"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { MentorshipProgram } from './types';
import { getMentorshipPrograms } from './utils';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Tag, 
  Search, 
  Filter,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface MentorshipProgramsProps {
  showTitle?: boolean;
  limit?: number;
  showDetails?: boolean;
}

const MentorshipPrograms: React.FC<MentorshipProgramsProps> = ({
  showTitle = true,
  limit,
  showDetails = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all');
  const [selectedProgram, setSelectedProgram] = useState<MentorshipProgram | null>(null);
  
  const programs = getMentorshipPrograms();
  
  // Filter programs based on search query and status filter
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = 
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' ? true : program.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort programs: active first, then upcoming, then completed
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, completed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  // Limit the number of programs if specified
  const displayPrograms = limit ? sortedPrograms.slice(0, limit) : sortedPrograms;
  
  // Get status badge color
  const getStatusColor = (status: 'upcoming' | 'active' | 'completed') => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-900/30 text-blue-400';
      case 'active':
        return 'bg-green-900/30 text-green-400';
      case 'completed':
        return 'bg-gray-800/50 text-gray-400';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: 'upcoming' | 'active' | 'completed') => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'completed':
        return <AlertCircle className="h-4 w-4 mr-1" />;
    }
  };
  
  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-normal flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-white/70" />
            Mentorship Programs
          </h2>
          <p className="text-white/70 mt-2">
            Learn from experienced editors and develop your skills through structured mentorship
          </p>
        </div>
      )}
      
      {!selectedProgram && (
        <>
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 pr-10 appearance-none text-white/80 w-40"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayPrograms.map(program => (
              <div 
                key={program.id} 
                className="bg-black/20 rounded-lg overflow-hidden hover:bg-black/30 transition-colors cursor-pointer"
                onClick={() => showDetails && setSelectedProgram(program)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{program.title}</h3>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(program.status)}`}>
                      {getStatusIcon(program.status)}
                      <span className="capitalize">{program.status}</span>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-white/70 line-clamp-2">
                    {program.description}
                  </p>
                  
                  <div className="mt-4 flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-black/30 relative mr-3 flex-shrink-0">
                      {program.mentor.avatarUrl ? (
                        <Image
                          src={program.mentor.avatarUrl}
                          alt={program.mentor.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{program.mentor.name}</div>
                      <div className="text-white/60 text-sm">Mentor</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center text-white/70 text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-white/60" />
                      <span>{program.duration}</span>
                    </div>
                    <div className="flex items-center text-white/70 text-sm">
                      <Users className="h-4 w-4 mr-2 text-white/60" />
                      <span>{program.enrolled} / {program.capacity} enrolled</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center text-white/70 text-sm mb-2">
                      <Tag className="h-4 w-4 mr-2 text-white/60" />
                      <span>Topics:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {program.topics.slice(0, 3).map((topic, index) => (
                        <span 
                          key={index}
                          className="bg-white/5 text-white/70 text-xs px-2 py-0.5 rounded-sm"
                        >
                          {topic}
                        </span>
                      ))}
                      {program.topics.length > 3 && (
                        <span className="text-white/50 text-xs">+{program.topics.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  
                  {showDetails && (
                    <div className="mt-4 text-right">
                      <button className="text-white/70 hover:text-white text-sm flex items-center ml-auto transition-colors">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {displayPrograms.length === 0 && (
            <div className="text-center py-8 text-white/60">
              No mentorship programs found matching your search criteria.
            </div>
          )}
          
          {limit && programs.length > limit && (
            <div className="mt-6 text-center">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                View All Programs
              </button>
            </div>
          )}
        </>
      )}
      
      {selectedProgram && showDetails && (
        <div>
          <div className="mb-4">
            <button 
              onClick={() => setSelectedProgram(null)}
              className="text-white/70 hover:text-white flex items-center transition-colors"
            >
              <ChevronRight className="h-4 w-4 mr-1 transform rotate-180" />
              Back to Programs
            </button>
          </div>
          
          <div className="bg-black/20 rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-semibold">{selectedProgram.title}</h3>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(selectedProgram.status)}`}>
                  {getStatusIcon(selectedProgram.status)}
                  <span className="capitalize">{selectedProgram.status}</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h4 className="text-lg font-medium mb-3">About this Program</h4>
                  <p className="text-white/80 whitespace-pre-line">
                    {selectedProgram.description}
                  </p>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-3">Topics Covered</h4>
                    <ul className="space-y-2">
                      {selectedProgram.topics.map((topic, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 mr-2 text-white/60 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-3">Program Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-3 text-white/60" />
                        <div>
                          <div className="text-white/60 text-sm">Duration</div>
                          <div>{selectedProgram.duration}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-3 text-white/60" />
                        <div>
                          <div className="text-white/60 text-sm">Enrollment</div>
                          <div>{selectedProgram.enrolled} / {selectedProgram.capacity} participants</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <h4 className="text-lg font-medium mb-4">Your Mentor</h4>
                  
                  <div className="flex items-center mb-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-black/30 relative mr-4 flex-shrink-0">
                      {selectedProgram.mentor.avatarUrl ? (
                        <Image
                          src={selectedProgram.mentor.avatarUrl}
                          alt={selectedProgram.mentor.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-lg">{selectedProgram.mentor.name}</div>
                      <div className="text-white/60">@{selectedProgram.mentor.username}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-white/60 text-sm mb-2">Expertise:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProgram.mentor.expertise.map((area, index) => (
                        <span 
                          key={index}
                          className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {selectedProgram.status === 'upcoming' && selectedProgram.enrolled < selectedProgram.capacity && (
                    <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors mt-4">
                      Apply for Mentorship
                    </button>
                  )}
                  
                  {selectedProgram.status === 'upcoming' && selectedProgram.enrolled >= selectedProgram.capacity && (
                    <div className="w-full py-3 bg-white/5 rounded-lg text-white/60 text-center mt-4">
                      Program Full
                    </div>
                  )}
                  
                  {selectedProgram.status === 'active' && (
                    <div className="w-full py-3 bg-white/5 rounded-lg text-white/60 text-center mt-4">
                      Currently in Progress
                    </div>
                  )}
                  
                  {selectedProgram.status === 'completed' && (
                    <div className="w-full py-3 bg-white/5 rounded-lg text-white/60 text-center mt-4">
                      Program Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipPrograms;
