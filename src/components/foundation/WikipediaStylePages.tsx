"use client";

import React from 'react';
import Link from 'next/link';
import { WikipediaStylePage, SpecialPage } from './types';
import { getWikipediaStylePages, getSpecialPages } from './utils';
import { ExternalLink } from 'lucide-react';
import * as Icons from 'lucide-react';

interface WikipediaStylePagesProps {
  showSpecialPages?: boolean;
}

const WikipediaStylePages: React.FC<WikipediaStylePagesProps> = ({ 
  showSpecialPages = true 
}) => {
  const wikipediaStylePages = getWikipediaStylePages();
  const specialPages = getSpecialPages();
  
  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      <h2 className="text-2xl mb-6 font-normal">AfroWiki Pages</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl mb-4 font-normal">Core Pages</h3>
          <div className="space-y-3">
            {wikipediaStylePages.map((page) => (
              <PageLink key={page.id} page={page} />
            ))}
          </div>
        </div>
        
        {showSpecialPages && (
          <div>
            <h3 className="text-xl mb-4 font-normal">Special Pages</h3>
            <div className="space-y-3">
              {specialPages.map((page) => (
                <PageLink key={page.id} page={page} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface PageLinkProps {
  page: WikipediaStylePage | SpecialPage;
}

const PageLink: React.FC<PageLinkProps> = ({ page }) => {
  // Dynamically get the icon component
  const IconComponent = (Icons as any)[page.icon.charAt(0).toUpperCase() + page.icon.slice(1)];
  
  return (
    <div className="group">
      <Link 
        href={page.url} 
        className="flex items-start hover:bg-white/5 p-2 rounded-lg transition-colors"
      >
        {IconComponent && (
          <IconComponent className="h-5 w-5 text-white/60 mt-0.5 mr-3 flex-shrink-0" />
        )}
        <div>
          <div className="flex items-center">
            <span className="text-lg group-hover:text-white/90 transition-colors">
              {page.title}
            </span>
            <ExternalLink className="h-3.5 w-3.5 ml-1.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-white/70 text-sm mt-0.5">{page.description}</p>
        </div>
      </Link>
    </div>
  );
};

export default WikipediaStylePages;
