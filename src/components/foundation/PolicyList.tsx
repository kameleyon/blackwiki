"use client";

import React from 'react';
import Link from 'next/link';
import { Policy } from './types';
import { getPolicies } from './utils';
import { FileText, Calendar, ExternalLink } from 'lucide-react';

interface PolicyListProps {
  limit?: number;
  showDescription?: boolean;
}

const PolicyList: React.FC<PolicyListProps> = ({ 
  limit,
  showDescription = true
}) => {
  const policies = getPolicies();
  const displayPolicies = limit ? policies.slice(0, limit) : policies;

  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      <h2 className="text-2xl mb-6 font-normal">Policies and Guidelines</h2>
      
      <div className="space-y-4">
        {displayPolicies.map((policy) => (
          <PolicyItem 
            key={policy.id} 
            policy={policy} 
            showDescription={showDescription} 
          />
        ))}
      </div>
      
      {limit && policies.length > limit && (
        <div className="mt-4 text-center">
          <Link 
            href="/policies" 
            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
          >
            View all policies
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

interface PolicyItemProps {
  policy: Policy;
  showDescription: boolean;
}

const PolicyItem: React.FC<PolicyItemProps> = ({ policy, showDescription }) => {
  return (
    <div className="border-b border-white/10 pb-4 last:border-0">
      <div className="flex items-start">
        <FileText className="h-5 w-5 text-white/60 mt-1 mr-3 flex-shrink-0" />
        <div>
          <Link 
            href={policy.url} 
            className="text-lg hover:text-white/90 transition-colors"
          >
            {policy.title}
          </Link>
          
          {showDescription && (
            <p className="text-white/70 mt-1">{policy.description}</p>
          )}
          
          <div className="flex items-center mt-2 text-sm text-white/50">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyList;
