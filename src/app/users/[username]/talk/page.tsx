import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiMessageSquare, FiUser, FiMail, FiMapPin, FiCalendar } from 'react-icons/fi';
import DiscussionSystem from '@/components/discussions/DiscussionSystem';
import UserTabNavigation from '@/components/navigation/UserTabNavigation';

interface PageProps {
  params: {
    username: string;
  };
}

async function getUserByName(username: string) {
  return await prisma.user.findFirst({
    where: { name: decodeURIComponent(username) },
    select: {
      id: true,
      name: true,
      bio: true,
      image: true,
      location: true,
      expertise: true,
      interests: true,
      joinedAt: true,
      lastActive: true,
      role: true,
      reviewerReputation: true,
      _count: {
        select: {
          articles: {
            where: { isPublished: true }
          },
          edits: true,
          comments: true
        }
      }
    }
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getUserByName(params.username);
  if (!user) return { title: 'User Not Found' };
  
  return {
    title: `User talk:${user.name} | AfroWiki`,
    description: `Discussion page for user ${user.name}`,
  };
}

export default async function UserTalkPage({ params }: PageProps) {
  const user = await getUserByName(params.username);
  
  if (!user) {
    notFound();
  }
  
  const currentUser = await getCurrentUser();
  const isOwnTalkPage = currentUser?.id === user.id;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Navigation Tabs */}
      <UserTabNavigation 
        username={user.name || 'anonymous'}
        displayName={user.name || undefined}
        isOwnProfile={isOwnTalkPage}
      />

      {/* Talk Page Info */}
      <div className="mb-8">
        <p className="text-white/70">
          {isOwnTalkPage ? 
            "This is your talk page. Other users can leave messages for you here." :
            `Leave messages for ${user.name} on this talk page.`}
        </p>
      </div>

      {/* User Context Panel */}
      <div className="bg-white/5 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-black/30 overflow-hidden flex-shrink-0">
            {user.image ? (
              <div className="relative w-full h-full">
                <Image 
                  src={user.image} 
                  alt={`${user.name}'s avatar`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl text-white/60">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{user.name}</h3>
              <span className={`px-2 py-0.5 rounded text-xs ${
                user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                user.role === 'editor' ? 'bg-blue-500/20 text-blue-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {user.role}
              </span>
              {user.reviewerReputation > 0 && (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                  {user.reviewerReputation} reputation
                </span>
              )}
            </div>
            
            {user.bio && (
              <p className="text-sm text-white/70 mb-3">{user.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-xs text-white/60">
              {user.location && (
                <div className="flex items-center gap-1">
                  <FiMapPin size={12} />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <FiCalendar size={12} />
                <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
              </div>
              <span>{user._count.articles} articles</span>
              <span>{user._count.edits} edits</span>
              <span>{user._count.comments} comments</span>
            </div>
            
            {user.expertise && (
              <div className="flex flex-wrap gap-1 mt-3">
                {user.expertise.split(',').slice(0, 4).map((area, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                  >
                    {area.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Talk Page Guidelines */}
      {!isOwnTalkPage && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium mb-3 text-blue-300">Talk Page Etiquette</h2>
          <ul className="text-sm text-white/70 space-y-2">
            <li>• Be respectful and professional in your communications</li>
            <li>• Keep discussions relevant to AfroWiki contributions and collaboration</li>
            <li>• For urgent matters, consider using other communication channels</li>
            <li>• Always sign your posts with your username</li>
            <li>• Avoid removing other users' messages unless they violate policies</li>
          </ul>
        </div>
      )}

      {/* Welcome Message for New Users */}
      {isOwnTalkPage && user._count.articles + user._count.edits + user._count.comments < 10 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium mb-3 text-green-300">Welcome to AfroWiki!</h2>
          <div className="text-sm text-white/70 space-y-2">
            <p>Welcome to your talk page! This is where other contributors can leave you messages about your contributions to AfroWiki.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link 
                href="/help" 
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
              >
                Getting Started Guide
              </Link>
              <Link 
                href="/community" 
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
              >
                Community Portal
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Discussion System */}
      <div className="bg-white/5 rounded-lg">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiMail size={16} className="text-white/60" />
              <h2 className="text-lg font-medium">Messages</h2>
            </div>
            {!isOwnTalkPage && currentUser && (
              <div className="text-xs text-white/50">
                Signed in as {currentUser.name}
              </div>
            )}
          </div>
          <p className="text-sm text-white/60 mt-1">
            {isOwnTalkPage ? 
              "Messages from other users will appear here" :
              `Leave a message for ${user.name}`}
          </p>
        </div>
        
        <div className="p-6">
          <DiscussionSystem 
            targetId={user.id}
            targetType="user"
            targetTitle={user.name || 'User'}
            currentUser={currentUser}
            isOwnPage={isOwnTalkPage}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-white/5 rounded-lg">
        <h3 className="font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href={`/users/${encodeURIComponent(user.name || 'anonymous')}`}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiUser className="text-blue-400" size={20} />
            <div>
              <div className="font-medium text-sm">User Profile</div>
              <div className="text-xs text-white/60">View contributions</div>
            </div>
          </Link>
          
          <Link 
            href="/users"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiUser className="text-green-400" size={20} />
            <div>
              <div className="font-medium text-sm">User Directory</div>
              <div className="text-xs text-white/60">Browse all users</div>
            </div>
          </Link>
          
          {currentUser && !isOwnTalkPage && (
            <Link 
              href={`/users/${encodeURIComponent(currentUser.name || 'anonymous')}/talk`}
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiMessageSquare className="text-purple-400" size={20} />
              <div>
                <div className="font-medium text-sm">Your Talk Page</div>
                <div className="text-xs text-white/60">Check your messages</div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}