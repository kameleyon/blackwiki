"use client";

import React from 'react';
import Image from 'next/image';
import { OrganizationMember } from './types';
import { getOrganizationMembers } from './utils';
import { Users, Globe, ExternalLink, Linkedin, Twitter } from 'lucide-react';

interface OrganizationStructureProps {
  showTitle?: boolean;
}

const OrganizationStructure: React.FC<OrganizationStructureProps> = ({
  showTitle = true,
}) => {
  const members = getOrganizationMembers();
  
  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-normal">AfroWiki Foundation</h2>
          <p className="text-white/70 mt-2">
            The people behind AfroWiki dedicated to preserving and sharing Black history and culture
          </p>
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl mb-4 font-normal flex items-center">
          <Users className="h-5 w-5 mr-2 text-white/70" />
          Leadership Team
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/20 rounded-lg p-4">
          <h3 className="text-lg mb-3 font-normal">Our Mission</h3>
          <p className="text-white/70 text-sm">
            AfroWiki Foundation is dedicated to collecting, preserving, and sharing knowledge about Black history, culture, and achievements worldwide. We aim to create a comprehensive, accurate, and accessible resource that celebrates the contributions of Black individuals and communities throughout history.
          </p>
        </div>
        
        <div className="bg-black/20 rounded-lg p-4">
          <h3 className="text-lg mb-3 font-normal">Get Involved</h3>
          <p className="text-white/70 text-sm mb-3">
            There are many ways to contribute to the AfroWiki mission:
          </p>
          <ul className="text-white/70 text-sm space-y-2">
            <li className="flex items-start">
              <span className="inline-block h-5 w-5 rounded-full bg-white/10 text-center text-xs leading-5 mr-2 flex-shrink-0">1</span>
              <span>Contribute content by editing or creating articles</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block h-5 w-5 rounded-full bg-white/10 text-center text-xs leading-5 mr-2 flex-shrink-0">2</span>
              <span>Support our work through donations</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block h-5 w-5 rounded-full bg-white/10 text-center text-xs leading-5 mr-2 flex-shrink-0">3</span>
              <span>Join our community and participate in discussions</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block h-5 w-5 rounded-full bg-white/10 text-center text-xs leading-5 mr-2 flex-shrink-0">4</span>
              <span>Help translate content into other languages</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <a 
          href="/about" 
          className="inline-flex items-center text-white/70 hover:text-white transition-colors"
        >
          Learn more about AfroWiki Foundation
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

interface MemberCardProps {
  member: OrganizationMember;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  return (
    <div className="bg-black/20 rounded-lg overflow-hidden">
      <div className="h-48 relative bg-black/30">
        {member.imageUrl ? (
          <Image
            src={member.imageUrl}
            alt={member.name}
            fill
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="h-16 w-16 text-white/20" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h4 className="text-lg">{member.name}</h4>
        <div className="text-white/70 text-sm mb-3">{member.role}</div>
        
        <p className="text-white/70 text-sm mb-4">
          {member.bio.length > 120 ? `${member.bio.substring(0, 120)}...` : member.bio}
        </p>
        
        {member.socialLinks && (
          <div className="flex space-x-3">
            {member.socialLinks.website && (
              <a 
                href={member.socialLinks.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
            )}
            {member.socialLinks.twitter && (
              <a 
                href={member.socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {member.socialLinks.linkedin && (
              <a 
                href={member.socialLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationStructure;
