import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  FiActivity, FiShuffle, FiEye, FiUsers, FiFileText, 
  FiMessageSquare, FiStar, FiTrendingUp, FiBookOpen 
} from 'react-icons/fi';
import RandomArticleWidget from '@/components/community/RandomArticleWidget';

export const metadata: Metadata = {
  title: 'Community Portal - AfroWiki',
  description: 'Connect with the AfroWiki community, discover tools, and contribute to preserving Black history and culture',
};

async function getCommunityStats() {
  const [
    totalArticles,
    publishedArticles, 
    totalUsers,
    activeUsers,
    totalEdits,
    recentActivity
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { isPublished: true } }),
    prisma.user.count(),
    prisma.user.count({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    prisma.edit.count(),
    prisma.auditLog.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })
  ]);

  return {
    totalArticles,
    publishedArticles,
    totalUsers,
    activeUsers,
    totalEdits,
    recentActivity
  };
}

export default async function CommunityPortalPage() {
  const currentUser = await getCurrentUser();
  const stats = await getCommunityStats();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FiUsers className="text-white/60" size={32} />
          <h1 className="text-3xl font-normal">Community Portal</h1>
        </div>
        <p className="text-white/70 mb-6">
          Welcome to the AfroWiki community hub. Connect with fellow contributors, discover tools, 
          and help preserve and share Black history, culture, and achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Community Stats */}
          <div className="bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <FiTrendingUp size={20} />
              Community Overview
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <FiFileText className="mx-auto mb-2 text-blue-400" size={24} />
                <div className="text-2xl font-medium">{stats.publishedArticles.toLocaleString()}</div>
                <div className="text-sm text-white/60">Published Articles</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <FiUsers className="mx-auto mb-2 text-green-400" size={24} />
                <div className="text-2xl font-medium">{stats.activeUsers.toLocaleString()}</div>
                <div className="text-sm text-white/60">Active Users</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <FiActivity className="mx-auto mb-2 text-purple-400" size={24} />
                <div className="text-2xl font-medium">{stats.recentActivity.toLocaleString()}</div>
                <div className="text-sm text-white/60">Recent Changes (24h)</div>
              </div>
            </div>

            <div className="text-center">
              <Link 
                href="/recent-changes"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                View Recent Activity
              </Link>
            </div>
          </div>

          {/* Community Tools */}
          <div className="bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <FiBookOpen size={20} />
              Community Tools
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/recent-changes"
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiActivity className="text-blue-400" size={24} />
                <div>
                  <div className="font-medium">Recent Changes</div>
                  <div className="text-sm text-white/60">Track community activity and edits</div>
                </div>
              </Link>
              
              <Link 
                href="/random"
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiShuffle className="text-green-400" size={24} />
                <div>
                  <div className="font-medium">Random Article</div>
                  <div className="text-sm text-white/60">Discover interesting content</div>
                </div>
              </Link>
              
              <Link 
                href="/users"
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiUsers className="text-purple-400" size={24} />
                <div>
                  <div className="font-medium">User Directory</div>
                  <div className="text-sm text-white/60">Browse community members</div>
                </div>
              </Link>
              
              <Link 
                href="/search"
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiEye className="text-yellow-400" size={24} />
                <div>
                  <div className="font-medium">Advanced Search</div>
                  <div className="text-sm text-white/60">Find articles and content</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <FiStar size={20} />
              Getting Started
            </h2>
            
            <div className="space-y-4">
              {!currentUser ? (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h3 className="font-medium mb-2 text-blue-300">Join the Community</h3>
                  <p className="text-sm text-white/70 mb-3">
                    Create an account to start contributing to AfroWiki. Help preserve and share 
                    Black history, culture, and achievements with the world.
                  </p>
                  <Link 
                    href="/auth/signin"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition-colors"
                  >
                    Sign Up / Sign In
                  </Link>
                </div>
              ) : (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h3 className="font-medium mb-2 text-green-300">Welcome back, {currentUser.name}!</h3>
                  <p className="text-sm text-white/70 mb-3">
                    Ready to contribute? Start by editing an existing article or creating new content.
                  </p>
                  <div className="flex gap-2">
                    <Link 
                      href="/articles/new"
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm transition-colors"
                    >
                      Create Article
                    </Link>
                    <Link 
                      href={`/users/${encodeURIComponent(currentUser.name || 'anonymous')}`}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                    >
                      View Your Profile
                    </Link>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium mb-2">For New Contributors</h4>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Read existing articles to understand our style</li>
                    <li>• Start with small edits to get familiar</li>
                    <li>• Use discussion pages to ask questions</li>
                    <li>• Follow community guidelines</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium mb-2">For Experienced Editors</h4>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Help review new articles</li>
                    <li>• Mentor new contributors</li>
                    <li>• Participate in community discussions</li>
                    <li>• Maintain article quality standards</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Random Article Widget */}
          <RandomArticleWidget />

          {/* Quick Stats */}
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Quick Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Total Articles</span>
                <span>{stats.totalArticles.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total Users</span>
                <span>{stats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total Edits</span>
                <span>{stats.totalEdits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Active Users (30d)</span>
                <span>{stats.activeUsers.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Featured Links */}
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link 
                href="/articles/new"
                className="block text-sm text-blue-400 hover:underline"
              >
                Create New Article
              </Link>
              <Link 
                href="/search"
                className="block text-sm text-blue-400 hover:underline"
              >
                Search Articles
              </Link>
              <Link 
                href="/recent-changes"
                className="block text-sm text-blue-400 hover:underline"
              >
                Recent Changes
              </Link>
              <Link 
                href="/users"
                className="block text-sm text-blue-400 hover:underline"
              >
                User Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}