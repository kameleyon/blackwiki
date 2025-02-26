import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { 
  FiEdit, 
  FiEye, 
  FiFileText, 
  FiStar, 
  FiMessageSquare, 
  FiCheckCircle,
  FiCalendar,
  FiClock
} from 'react-icons/fi';
import DashboardNav from '@/components/dashboard/DashboardNav';
import GreetingHeader from '@/components/dashboard/GreetingHeader';

export default async function ActivityPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  // Get only the current user's recent articles
  const recentArticles = await prisma.article.findMany({
    where: {
      authorId: user.id // Filter by current user's ID
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 5,
    include: {
      author: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  console.log('Recent articles found:', recentArticles.map(a => ({ id: a.id, title: a.title, authorId: a.authorId })));
  
  // Calculate statistics for the greeting header (for current user only)
  const totalArticles = await prisma.article.count({
    where: {
      authorId: user.id
    }
  });
  
  const publishedArticles = await prisma.article.count({
    where: { 
      isPublished: true,
      authorId: user.id
    }
  });

  // Mock activity data
  // In a real implementation, this would come from a database table tracking user activities
  const activities = [
    {
      id: 1,
      type: 'edit',
      title: 'Updated article "The Harlem Renaissance"',
      articleId: '1',
      articleTitle: 'The Harlem Renaissance',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: 2,
      type: 'comment',
      title: 'Received comment on "African Diaspora"',
      articleId: '2',
      articleTitle: 'African Diaspora',
      comment: 'Great article! I learned a lot about the historical context.',
      commentAuthor: 'Maya Johnson',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
      id: 3,
      type: 'publish',
      title: 'Published "History of Jazz Music"',
      articleId: '3',
      articleTitle: 'History of Jazz Music',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
      id: 4,
      type: 'review',
      title: 'Article "Civil Rights Movement" approved',
      articleId: '4',
      articleTitle: 'Civil Rights Movement',
      reviewerName: 'Admin',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    },
    {
      id: 5,
      type: 'edit',
      title: 'Started draft "Black Literature in the 20th Century"',
      articleId: '5',
      articleTitle: 'Black Literature in the 20th Century',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) // 4 days ago
    },
    {
      id: 6,
      type: 'view',
      title: 'Your article "African Diaspora" reached 100 views',
      articleId: '2',
      articleTitle: 'African Diaspora',
      viewCount: 100,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
    },
    {
      id: 7,
      type: 'collaboration',
      title: 'James Brown invited you to collaborate on "Soul Music Origins"',
      collaboratorName: 'James Brown',
      articleId: '7',
      articleTitle: 'Soul Music Origins',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6) // 6 days ago
    },
    {
      id: 8,
      type: 'achievement',
      title: 'Earned "Prolific Writer" badge',
      badgeName: 'Prolific Writer',
      badgeDescription: 'Published 5 or more articles',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
    }
  ];

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof activities>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedActivities).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      {/* Personalized Header */}
      <GreetingHeader 
        user={user} 
        totalArticles={totalArticles} 
        publishedArticles={publishedArticles} 
        pageName="Activity Timeline"
      />
      
      <DashboardNav />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timeline - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">Recent Activity</h2>
            </div>
            
            <div className="p-6">
              {sortedDates.map((date) => (
                <div key={date} className="mb-8 last:mb-0">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                      <FiCalendar size={14} />
                    </div>
                    <h3 className="text-md font-medium">{date}</h3>
                  </div>
                  
                  <div className="ml-4 pl-8 border-l border-gray-700">
                    {groupedActivities[date].map((activity) => (
                      <div key={activity.id} className="mb-6 last:mb-0 relative">
                        <div className="absolute -left-12 top-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                          {activity.type === 'edit' && <FiEdit size={12} />}
                          {activity.type === 'comment' && <FiMessageSquare size={12} />}
                          {activity.type === 'publish' && <FiFileText size={12} />}
                          {activity.type === 'review' && <FiCheckCircle size={12} />}
                          {activity.type === 'view' && <FiEye size={12} />}
                          {activity.type === 'collaboration' && <FiStar size={12} />}
                          {activity.type === 'achievement' && <FiStar size={12} />}
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{activity.title}</h4>
                            <span className="text-xs text-gray-400">
                              {formatTime(activity.date)}
                            </span>
                          </div>
                          
                          {activity.type === 'comment' && (
                            <div className="bg-white/5 rounded p-3 text-sm text-gray-400 mb-2">
                              &ldquo;{activity.comment}&rdquo;
                              <div className="mt-1 text-xs text-gray-500">
                                - {activity.commentAuthor}
                              </div>
                            </div>
                          )}
                          
                          {activity.type === 'achievement' && (
                            <div className="text-sm text-gray-400 mb-2">
                              {activity.badgeDescription}
                            </div>
                          )}
                          
                          {activity.articleId && (
                            <Link 
                              href={`/articles/${activity.articleId}`}
                              className="text-sm text-gray-400 hover:text-white flex items-center mt-2"
                            >
                              <FiEye size={12} className="mr-1" />
                              View article
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar - 1/3 width on large screens */}
        <div className="space-y-6">
          {/* Activity Stats */}
          <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">Activity Stats</h2>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">This week</div>
                <div className="text-sm font-medium">12 activities</div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Edits</span>
                    <span>5</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="bg-white/40 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Comments</span>
                    <span>3</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="bg-white/40 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Publications</span>
                    <span>2</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="bg-white/40 h-1.5 rounded-full" style={{ width: '17%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Reviews</span>
                    <span>2</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="bg-white/40 h-1.5 rounded-full" style={{ width: '17%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Articles */}
          <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">Recently Updated</h2>
            </div>
            
            <div>
              {recentArticles.map((article) => (
                <div key={article.id} className="p-4 border-b border-gray-800 hover:bg-black/30">
                  <Link href={`/articles/${article.slug}`}>
                    <h3 className="font-medium mb-1">{article.title}</h3>
                  </Link>
                  <div className="flex items-center text-xs text-gray-400">
                    <span className="flex items-center mr-3">
                      <FiClock size={12} className="mr-1" />
                      {formatRelativeTime(article.updatedAt)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      article.isPublished
                        ? 'bg-white/20 text-white/80'
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {article.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
              
              {recentArticles.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No articles yet.
                </div>
              )}
            </div>
          </div>
          
          {/* Contribution Calendar Placeholder */}
          <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">Contribution Calendar</h2>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-full aspect-square rounded ${
                      Math.random() > 0.7 
                        ? 'bg-white/40' 
                        : Math.random() > 0.5 
                          ? 'bg-white/20' 
                          : Math.random() > 0.3 
                            ? 'bg-white/10' 
                            : 'bg-white/5'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-white/5 rounded"></div>
                  <div className="w-3 h-3 bg-white/10 rounded"></div>
                  <div className="w-3 h-3 bg-white/20 rounded"></div>
                  <div className="w-3 h-3 bg-white/40 rounded"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time (e.g., "2:30 PM")
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Helper function to format relative time
function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
}
