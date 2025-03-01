"use client";

import React from 'react';
import {
  PolicyList,
  DonationSystem,
  WikipediaStylePages,
  LanguageSelector,
  StatisticsDisplay,
  OrganizationStructure
} from '@/components/foundation';

const FoundationPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl mb-4 font-normal">AfroWiki Foundation</h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          Explore the organizational structure, policies, and community features of AfroWiki Foundation.
          This page showcases the Wikipedia-style foundation components that power our platform.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <section>
          <h2 className="text-3xl mb-6 font-normal">Organization</h2>
          <OrganizationStructure showTitle={false} />
        </section>
        
        <section>
          <h2 className="text-3xl mb-6 font-normal">Policies and Guidelines</h2>
          <PolicyList showDescription={true} />
        </section>
        
        <section>
          <h2 className="text-3xl mb-6 font-normal">Support AfroWiki</h2>
          <DonationSystem showTitle={false} />
        </section>
        
        <section>
          <h2 className="text-3xl mb-6 font-normal">Platform Statistics</h2>
          <StatisticsDisplay showTitle={false} columns={4} />
        </section>
        
        <section>
          <h2 className="text-3xl mb-6 font-normal">Core Pages</h2>
          <WikipediaStylePages showSpecialPages={true} />
        </section>
        
        <section>
          <h2 className="text-3xl mb-6 font-normal">Language Support</h2>
          <LanguageSelector showTitle={false} />
        </section>
      </div>
    </div>
  );
};

export default FoundationPage;
