"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { CommunityMember, Badge } from './types';
import { getCommunityMembers } from './utils';
import { Search, Users, Award, Calendar, Clock, Edit3, Filter } from 'lucide-react';
import * as Icons from 'lucide-react';

interface MemberDirectoryProps {
  showTitle?: boolean;
  limit?: number;
}

const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  showTitle = true,
  limit
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'contributions' | 'joinDate' | 'lastActive'>('contributions');
  
  const members = getCommunityMembers();
  
  // Filter members based on search query and role filter
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter ? member.role === roleFilter : true;
    
    return matchesSearch && matchesRole;
  });
  
  // Sort members based on selected sort option
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy === 'contributions') {
      return b.contributions - a.contributions;
    } else if (sortBy === 'joinDate') {
      return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
    } else {
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    }
  });
  
  // Limit the number of members if specified
  const displayMembers = limit ? sortedMembers.slice(0, limit) : sortedMembers;
  
  // Get unique roles for filter
  const roles = Array.from(new Set(members.map(member => member.role)));
  
  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-normal flex items-center">
            <Users className="mr-2 h-6 w-6 text-white/70" />
            Community Members
          </h2>
          <p className="text-white/70 mt-2">
            Meet the contributors who make AfroWiki possible
          </p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, username, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={roleFilter || ''}
                onChange={(e) => setRoleFilter(e.target.value || null)}
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 pr-10 appearance-none text-white/80 w-40"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 pr-10 appearance-none text-white/80 w-48"
              >
                <option value="contributions">Sort by Contributions</option>
                <option value="joinDate">Sort by Join Date</option>
                <option value="lastActive">Sort by Last Active</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayMembers.map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
      
      {displayMembers.length === 0 && (
        <div className="text-center py-8 text-white/60">
          No members found matching your search criteria.
        </div>
      )}
      
      {limit && members.length > limit && (
        <div className="mt-6 text-center">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
            View All Members
          </button>
        </div>
      )}
    </div>
  );
};

interface MemberCardProps {
  member: CommunityMember;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  return (
    <div className="bg-black/20 rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-black/30 relative mr-4 flex-shrink-0">
            {member.avatarUrl ? (
              <Image
                src={member.avatarUrl}
                alt={member.name}
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
            <h3 className="text-lg font-semibold">{member.name}</h3>
            <div className="flex items-center text-white/70">
              <span>@{member.username}</span>
              <span className="mx-2">•</span>
              <span className="bg-white/10 text-white/80 text-xs px-2 py-0.5 rounded-full">
                {member.role}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-black/30 rounded-lg p-2">
            <div className="text-lg font-semibold">{member.contributions}</div>
            <div className="text-white/60 text-xs">Contributions</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-2">
            <div className="flex justify-center">
              <Calendar className="h-5 w-5 text-white/70" />
            </div>
            <div className="text-white/60 text-xs mt-1">
              {new Date(member.joinDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-2">
            <div className="flex justify-center">
              <Clock className="h-5 w-5 text-white/70" />
            </div>
            <div className="text-white/60 text-xs mt-1">
              {new Date(member.lastActive).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
        
        {member.badges.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm text-white/80 mb-2 flex items-center">
              <Award className="h-4 w-4 mr-1 text-white/60" />
              Badges:
            </h4>
            <div className="flex flex-wrap gap-2">
              {member.badges.map(badge => (
                <BadgeItem key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <h4 className="text-sm text-white/80 mb-2 flex items-center">
            <Edit3 className="h-4 w-4 mr-1 text-white/60" />
            Expertise:
          </h4>
          <div className="flex flex-wrap gap-2">
            {member.expertise.map((area, index) => (
              <span 
                key={index}
                className="bg-white/5 text-white/70 text-xs px-2 py-1 rounded-full"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface BadgeItemProps {
  badge: Badge;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge }) => {
  // Dynamically get the icon component
  const IconComponent = (Icons as any)[badge.icon.charAt(0).toUpperCase() + badge.icon.slice(1)];
  
  // Determine badge color based on level
  let badgeColorClass = 'bg-white/10 text-white/70';
  
  if (badge.level === 'bronze') {
    badgeColorClass = 'bg-amber-900/30 text-amber-400/90';
  } else if (badge.level === 'silver') {
    badgeColorClass = 'bg-gray-400/30 text-gray-300';
  } else if (badge.level === 'gold') {
    badgeColorClass = 'bg-yellow-600/30 text-yellow-400';
  } else if (badge.level === 'platinum') {
    badgeColorClass = 'bg-cyan-900/30 text-cyan-300';
  }
  
  return (
    <div 
      className={`flex items-center px-2 py-1 rounded-full text-xs ${badgeColorClass}`}
      title={badge.description}
    >
      {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
      {badge.name}
    </div>
  );
};

export default MemberDirectory;
