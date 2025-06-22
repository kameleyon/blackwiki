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
import Link from 'next/link';
import { FileSearch, Users, BookOpen, Award } from 'lucide-react';

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
      
      {/* Community Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link href="/community/reviews" className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <FileSearch className="h-8 w-8 mb-3 text-primary" />
          <h3 className="text-lg font-medium mb-2">Review Center</h3>
          <p className="text-sm text-muted-foreground">Help maintain content quality by reviewing articles</p>
        </Link>
        
        <Link href="/community/projects" className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <Users className="h-8 w-8 mb-3 text-primary" />
          <h3 className="text-lg font-medium mb-2">Collaborations</h3>
          <p className="text-sm text-muted-foreground">Join collaborative writing projects</p>
        </Link>
        
        <Link href="/community/help" className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <BookOpen className="h-8 w-8 mb-3 text-primary" />
          <h3 className="text-lg font-medium mb-2">Help Center</h3>
          <p className="text-sm text-muted-foreground">Learn how to contribute effectively</p>
        </Link>
        
        <Link href="/community/achievements" className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <Award className="h-8 w-8 mb-3 text-primary" />
          <h3 className="text-lg font-medium mb-2">Achievements</h3>
          <p className="text-sm text-muted-foreground">Track your contributions and earn badges</p>
        </Link>
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
