import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { getCurrentUser } from '@/lib/auth';
import { FiCalendar, FiMapPin, FiGlobe, FiEdit2, FiActivity, FiAward } from 'react-icons/fi';
import UserContributions from '@/components/community-editing/UserContributions';
import UserExpertiseRadar from '@/components/users/UserExpertiseRadar';
import UserStatisticsPanel from '@/components/users/UserStatisticsPanel';

interface PageProps {
  params: {
    username: string;
  };
}

// Helper function to get user by username
async function getUserByUsername(username: string) {
  return await prisma.user.findFirst({
    where: {
      name: {
        equals: decodeURIComponent(username),
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      location: true,
      website: true,
      expertise: true,
      interests: true,
      joinedAt: true,
      lastActive: true,
      image: true,
      role: true,
      reviewerReputation: true,
      articles: {
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          isPublished: true,
          views: true
        },
        where: {
          isPublished: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      },
      _count: {
        select: {
          articles: {
            where: {
              isPublished: true
            }
          },
          edits: true,
          comments: true,
          reviews: true
        }
      }
    }
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getUserByUsername(params.username);
  
  if (!user) {
    return {
      title: 'User Not Found - AfroWiki'
    };
  }

  return {
    title: `${user.name} - User Profile | AfroWiki`,
    description: user.bio || `View ${user.name}'s contributions and expertise on AfroWiki`,
  };
}

export default async function UserPage({ params }: PageProps) {
  const user = await getUserByUsername(params.username);
  const currentUser = await getCurrentUser();
  
  if (!user) {
    notFound();
  }

  const isOwnProfile = currentUser?.id === user.id;
  const expertiseTags = user.expertise ? user.expertise.split(',').map(tag => tag.trim()) : [];
  const interestTags = user.interests ? user.interests.split(',').map(tag => tag.trim()) : [];

  // Calculate days since joined
  const daysSinceJoined = Math.floor(
    (new Date().getTime() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      {/* User Header */}
      <div className="bg-white/5 rounded-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-black/30 overflow-hidden border-2 border-white/10">
              {user.image ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={user.image} 
                    alt={`${user.name}'s profile`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-white/60">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-3xl font-normal">{user.name}</h1>
              
              {/* Role Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                  user.role === 'editor' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {user.role}
                </span>
                
                {user.reviewerReputation > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                    <FiAward size={14} />
                    <span>{user.reviewerReputation} reputation</span>
                  </div>
                )}
              </div>

              {/* Edit Profile Button */}
              {isOwnProfile && (
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                >
                  <FiEdit2 size={14} />
                  Edit Profile
                </Link>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-white/70 mb-4 leading-relaxed">{user.bio}</p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <FiCalendar size={14} />
                <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                <span className="text-white/40">({daysSinceJoined} days ago)</span>
              </div>
              
              {user.location && (
                <div className="flex items-center gap-1">
                  <FiMapPin size={14} />
                  <span>{user.location}</span>
                </div>
              )}
              
              {user.website && (
                <div className="flex items-center gap-1">
                  <FiGlobe size={14} />
                  <a 
                    href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-1">
                <FiActivity size={14} />
                <span>Last active: {new Date(user.lastActive).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expertise and Interests */}
        {(expertiseTags.length > 0 || interestTags.length > 0) && (
          <div className="mt-6 pt-6 border-t border-white/10">
            {expertiseTags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-white/80 mb-2">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {expertiseTags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {interestTags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-white/80 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {interestTags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Statistics and Info */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <UserStatisticsPanel
            userId={user.id}
            stats={{
              articlesCreated: user._count.articles,
              totalEdits: user._count.edits,
              commentsPosted: user._count.comments,
              reviewsCompleted: user._count.reviews,
              reputation: user.reviewerReputation
            }}
          />

          {/* Expertise Radar */}
          {expertiseTags.length > 0 && (
            <UserExpertiseRadar
              expertise={expertiseTags}
              userId={user.id}
            />
          )}
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Articles */}
          {user.articles.length > 0 && (
            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-xl font-normal mb-4">Recent Articles</h2>
              <div className="space-y-4">
                {user.articles.map((article) => (
                  <div key={article.id} className="border-b border-white/10 last:border-b-0 pb-4 last:pb-0">
                    <Link 
                      href={`/articles/${article.slug}`}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      <h3 className="font-medium mb-2">{article.title}</h3>
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      <span>{article.views} views</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {user._count.articles > 10 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Link 
                    href={`/users/${encodeURIComponent(user.name || '')}/articles`}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    View all {user._count.articles} articles →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* User Contributions */}
          <div className="bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-normal mb-4">Recent Contributions</h2>
            <UserContributions
              userId={user.id}
              username={user.name || 'Anonymous'}
              limit={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}