import { prisma } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { FiUsers, FiSearch, FiMapPin, FiCalendar, FiAward } from 'react-icons/fi';
import UserDirectoryFilters from '@/components/users/UserDirectoryFilters';

export const metadata: Metadata = {
  title: 'User Directory - AfroWiki',
  description: 'Browse contributors and experts in the AfroWiki community',
};

interface SearchParams {
  searchParams: {
    search?: string;
    role?: string;
    expertise?: string;
    sort?: string;
  };
}

async function getUsers(searchParams: SearchParams['searchParams']) {
  const { search, role, expertise, sort = 'recent' } = searchParams;
  
  // Build where conditions
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { bio: { contains: search, mode: 'insensitive' } },
      { expertise: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (role && role !== 'all') {
    where.role = role;
  }
  
  if (expertise) {
    where.expertise = {
      contains: expertise,
      mode: 'insensitive'
    };
  }
  
  // Build order by
  let orderBy: any = { lastActive: 'desc' };
  switch (sort) {
    case 'name':
      orderBy = { name: 'asc' };
      break;
    case 'joined':
      orderBy = { joinedAt: 'desc' };
      break;
    case 'reputation':
      orderBy = { reviewerReputation: 'desc' };
      break;
    case 'articles':
      orderBy = [{ articles: { _count: 'desc' } }];
      break;
    default:
      orderBy = { lastActive: 'desc' };
  }

  const users = await prisma.user.findMany({
    where,
    orderBy,
    select: {
      id: true,
      name: true,
      bio: true,
      location: true,
      expertise: true,
      interests: true,
      joinedAt: true,
      lastActive: true,
      image: true,
      role: true,
      reviewerReputation: true,
      _count: {
        select: {
          articles: {
            where: {
              isPublished: true
            }
          },
          edits: true,
          comments: true
        }
      }
    },
    take: 50 // Limit to 50 users for now
  });

  return users;
}

export default async function UsersPage({ searchParams }: SearchParams) {
  const users = await getUsers(searchParams);
  
  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => {
    const daysSinceActive = (Date.now() - new Date(user.lastActive).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceActive <= 30;
  }).length;
  
  const contributorsByRole = {
    admin: users.filter(u => u.role === 'admin').length,
    editor: users.filter(u => u.role === 'editor').length,
    user: users.filter(u => u.role === 'user').length
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FiUsers className="text-white/60" size={32} />
          <h1 className="text-3xl font-normal">User Directory</h1>
        </div>
        <p className="text-white/70 mb-6">
          Explore the diverse community of contributors, experts, and scholars who make AfroWiki possible.
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-white mb-1">{totalUsers}</div>
            <div className="text-sm text-white/60">Total Contributors</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-green-400 mb-1">{activeUsers}</div>
            <div className="text-sm text-white/60">Active This Month</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-blue-400 mb-1">{contributorsByRole.editor}</div>
            <div className="text-sm text-white/60">Editors</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-red-400 mb-1">{contributorsByRole.admin}</div>
            <div className="text-sm text-white/60">Administrators</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <UserDirectoryFilters />

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const expertiseTags = user.expertise ? user.expertise.split(',').map(tag => tag.trim()).slice(0, 3) : [];
          const daysSinceActive = Math.floor((Date.now() - new Date(user.lastActive).getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Link 
              key={user.id} 
              href={`/users/${encodeURIComponent(user.name || 'anonymous')}`}
              className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors"
            >
              {/* User Header */}
              <div className="flex items-start gap-4 mb-4">
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
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium truncate">{user.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                      user.role === 'editor' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  
                  {user.location && (
                    <div className="flex items-center gap-1 text-xs text-white/60 mb-1">
                      <FiMapPin size={12} />
                      <span className="truncate">{user.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-white/50">
                    <FiCalendar size={12} />
                    <span>
                      {daysSinceActive === 0 ? 'Active today' :
                       daysSinceActive === 1 ? 'Active yesterday' :
                       daysSinceActive < 7 ? `Active ${daysSinceActive} days ago` :
                       daysSinceActive < 30 ? `Active ${Math.floor(daysSinceActive / 7)} weeks ago` :
                       'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-sm text-white/70 mb-4 line-clamp-3">{user.bio}</p>
              )}

              {/* Expertise Tags */}
              {expertiseTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {expertiseTags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {user.expertise && user.expertise.split(',').length > 3 && (
                    <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                      +{user.expertise.split(',').length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-xs text-white/60">
                  <span>{user._count.articles} articles</span>
                  <span>{user._count.edits} edits</span>
                  <span>{user._count.comments} comments</span>
                </div>
                
                {user.reviewerReputation > 0 && (
                  <div className="flex items-center gap-1 text-xs text-yellow-400">
                    <FiAward size={12} />
                    <span>{user.reviewerReputation}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <FiSearch className="mx-auto mb-4 text-white/40" size={48} />
          <h3 className="text-xl font-medium mb-2">No users found</h3>
          <p className="text-white/60">Try adjusting your search criteria to find contributors.</p>
        </div>
      )}

      {/* Load More (placeholder for future pagination) */}
      {users.length >= 50 && (
        <div className="text-center mt-8">
          <div className="text-white/60 text-sm">
            Showing first 50 users. Pagination coming soon.
          </div>
        </div>
      )}
    </div>
  );
}