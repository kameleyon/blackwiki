"use client";

import React from 'react';
import {
  MemberDirectory,
  DiscussionForum,
  EventCalendar,
  MentorshipPrograms,
  CommunityProjects,
  AnnouncementFeed
} from '@/components/community';

const CommunityPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl mb-4 font-normal">AfroWiki Community</h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          Connect with fellow contributors, participate in discussions, join events, and collaborate on projects
          to help build and improve AfroWiki.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <section>
          <h2 className="text-3xl mb-6 font-normal">Latest Announcements</h2>
          <AnnouncementFeed showTitle={false} limit={3} />
        </section>
        
        <section>
          <h2 className="text-3xl mb-6 font-normal">Upcoming Events</h2>
          <EventCalendar showTitle={false} limit={2} showDetails={true} />
        </section>
        
        <section>
          <h2 className="text-3xl mb-6 font-normal">Active Projects</h2>
          <CommunityProjects showTitle={false} limit={4} showDetails={true} />
        </section>
        
        <section>
          <h2 className="text-3xl mb-6 font-normal">Mentorship Programs</h2>
          <MentorshipPrograms showTitle={false} limit={3} showDetails={true} />
        </section>
        
        <section>
          <h2 className="text-3xl mb-6 font-normal">Discussion Forum</h2>
          <DiscussionForum showTitle={false} limit={5} showReplies={true} />
        </section>
        
        <section>
          <h2 className="text-3xl mb-6 font-normal">Community Members</h2>
          <MemberDirectory showTitle={false} limit={6} />
        </section>
      </div>
    </div>
  );
};

export default CommunityPage;
