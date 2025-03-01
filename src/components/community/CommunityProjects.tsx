"use client";

import React, { useState } from 'react';
import { CommunityProject } from './types';
import { getCommunityProjects } from './utils';
import { 
  FolderOpen, 
  Users, 
  Calendar, 
  Tag, 
  Search, 
  Filter,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart2
} from 'lucide-react';

interface CommunityProjectsProps {
  showTitle?: boolean;
  limit?: number;
  showDetails?: boolean;
}

const CommunityProjects: React.FC<CommunityProjectsProps> = ({
  showTitle = true,
  limit,
  showDetails = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'in-progress' | 'completed'>('all');
  const [selectedProject, setSelectedProject] = useState<CommunityProject | null>(null);
  
  const projects = getCommunityProjects();
  
  // Filter projects based on search query and status filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' ? true : project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort projects: in-progress first, then planning, then completed
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const statusOrder = { 'in-progress': 0, 'planning': 1, 'completed': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  // Limit the number of projects if specified
  const displayProjects = limit ? sortedProjects.slice(0, limit) : sortedProjects;
  
  // Get status badge color
  const getStatusColor = (status: 'planning' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'planning':
        return 'bg-blue-900/30 text-blue-400';
      case 'in-progress':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'completed':
        return 'bg-green-900/30 text-green-400';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: 'planning' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'planning':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 mr-1" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 mr-1" />;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-normal flex items-center">
            <FolderOpen className="mr-2 h-6 w-6 text-white/70" />
            Community Projects
          </h2>
          <p className="text-white/70 mt-2">
            Collaborative initiatives to improve and expand AfroWiki content
          </p>
        </div>
      )}
      
      {!selectedProject && (
        <>
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 pr-10 appearance-none text-white/80 w-48"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayProjects.map(project => (
              <div 
                key={project.id} 
                className="bg-black/20 rounded-lg overflow-hidden hover:bg-black/30 transition-colors cursor-pointer"
                onClick={() => showDetails && setSelectedProject(project)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      <span className="capitalize">{project.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-white/70 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="flex items-center text-white/70 text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-white/60" />
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex items-center text-white/70 text-sm">
                      <Users className="h-4 w-4 mr-2 text-white/60" />
                      <span>{project.members} members</span>
                    </div>
                    <div className="flex items-center text-white/70 text-sm">
                      <BarChart2 className="h-4 w-4 mr-2 text-white/60" />
                      <span>{project.progress}% complete</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center text-white/70 text-sm mb-2">
                      <Tag className="h-4 w-4 mr-2 text-white/60" />
                      <span>Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-white/5 text-white/70 text-xs px-2 py-0.5 rounded-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-white/70 text-sm">
                      Lead: {project.lead.name}
                    </div>
                    
                    {showDetails && (
                      <button className="text-white/70 hover:text-white text-sm flex items-center transition-colors">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {displayProjects.length === 0 && (
            <div className="text-center py-8 text-white/60">
              No projects found matching your search criteria.
            </div>
          )}
          
          {limit && projects.length > limit && (
            <div className="mt-6 text-center">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                View All Projects
              </button>
            </div>
          )}
        </>
      )}
      
      {selectedProject && showDetails && (
        <div>
          <div className="mb-4">
            <button 
              onClick={() => setSelectedProject(null)}
              className="text-white/70 hover:text-white flex items-center transition-colors"
            >
              <ChevronRight className="h-4 w-4 mr-1 transform rotate-180" />
              Back to Projects
            </button>
          </div>
          
          <div className="bg-black/20 rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-semibold">{selectedProject.title}</h3>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(selectedProject.status)}`}>
                  {getStatusIcon(selectedProject.status)}
                  <span className="capitalize">{selectedProject.status.replace('-', ' ')}</span>
                </div>
              </div>
              
              <p className="mt-4 text-white/80">
                {selectedProject.description}
              </p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-4">Project Details</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-white/60" />
                      <div>
                        <div className="text-white/60 text-sm">Start Date</div>
                        <div>{formatDate(selectedProject.startDate)}</div>
                      </div>
                    </div>
                    
                    {selectedProject.endDate && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-3 text-white/60" />
                        <div>
                          <div className="text-white/60 text-sm">End Date</div>
                          <div>{formatDate(selectedProject.endDate)}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-3 text-white/60" />
                      <div>
                        <div className="text-white/60 text-sm">Team Size</div>
                        <div>{selectedProject.members} contributors</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FolderOpen className="h-5 w-5 mr-3 text-white/60" />
                      <div>
                        <div className="text-white/60 text-sm">Project Lead</div>
                        <div>{selectedProject.lead.name} (@{selectedProject.lead.username})</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center text-white/80 mb-2">
                      <Tag className="h-5 w-5 mr-2 text-white/60" />
                      <span>Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-4">Progress</h4>
                  
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">Completion</span>
                      <span className="text-white/80 font-medium">{selectedProject.progress}%</span>
                    </div>
                    
                    <div className="w-full bg-black/30 rounded-full h-2.5 mb-4">
                      <div 
                        className="bg-white/60 h-2.5 rounded-full" 
                        style={{ width: `${selectedProject.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-white/70 text-sm">
                      {selectedProject.status === 'planning' && (
                        <p>This project is currently in the planning phase. The team is defining goals, scope, and timeline.</p>
                      )}
                      
                      {selectedProject.status === 'in-progress' && (
                        <p>This project is actively being worked on. Contributors are creating and improving content.</p>
                      )}
                      
                      {selectedProject.status === 'completed' && (
                        <p>This project has been completed. All planned work has been finished.</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    {selectedProject.status !== 'completed' && (
                      <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                        Join Project
                      </button>
                    )}
                    
                    {selectedProject.status === 'completed' && (
                      <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                        View Results
                      </button>
                    )}
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

export default CommunityProjects;
