import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { 
  FiEdit, 
  FiEye, 
  FiBarChart2, 
  FiFileText, 
  FiUsers, 
  FiStar, 
  FiArrowUp,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import DashboardNav from '@/components/dashboard/DashboardNav';
import GreetingHeader from '@/components/dashboard/GreetingHeader';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  // Get user's articles
  const articles = await prisma.article.findMany({
    where: {
      authorId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5 // Only get the 5 most recent articles for the dashboard
  });

  // Calculate statistics
  const totalArticles = await prisma.article.count({
    where: { authorId: user.id }
  });
  
  const publishedArticles = await prisma.article.count({
    where: { 
      authorId: user.id,
      isPublished: true
    }
  });
  
  const totalViews = await prisma.article.aggregate({
    where: { authorId: user.id },
    _sum: { views: true }
  });

  // Get user's interests for personalized recommendations
  const userInterests = user.interests?.split(',').map(i => i.trim().toLowerCase()) || [];

  // Mock data for activity timeline
  const activityTimeline = [
    { 
      id: 1, 
      type: 'edit', 
      title: 'Updated article "The Harlem Renaissance"', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    { 
      id: 2, 
      type: 'comment', 
      title: 'Received comment on "African Diaspora"', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    { 
      id: 3, 
      type: 'publish', 
      title: 'Published "History of Jazz Music"', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    { 
      id: 4, 
      type: 'review', 
      title: 'Article "Civil Rights Movement" approved', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    }
  ];

  // Mock data for notifications
  const notifications = [
    { 
      id: 1, 
      type: 'comment', 
      message: 'New comment on your article', 
      date: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    { 
      id: 2, 
      type: 'review', 
      message: 'Your article has been approved', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    },
    { 
      id: 3, 
      type: 'mention', 
      message: 'You were mentioned in a discussion', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    }
  ];

  // All possible topic recommendations
  const allRecommendations = [
    { id: 1, title: 'African American Literature', category: 'Literature', tags: ['literature', 'writing', 'books'] },
    { id: 2, title: 'Civil Rights Movement', category: 'History', tags: ['history', 'politics', 'activism'] },
    { id: 3, title: 'Jazz and Blues', category: 'Music', tags: ['music', 'arts', 'culture'] },
    { id: 4, title: 'African Diaspora', category: 'History', tags: ['history', 'culture', 'geography'] },
    { id: 5, title: 'Black Cinema', category: 'Film', tags: ['film', 'arts', 'entertainment'] },
    { id: 6, title: 'Hip Hop Evolution', category: 'Music', tags: ['music', 'culture', 'entertainment'] },
    { id: 7, title: 'Black Scientists and Inventors', category: 'Science', tags: ['science', 'technology', 'innovation'] },
    { id: 8, title: 'Contemporary Black Artists', category: 'Art', tags: ['art', 'culture', 'contemporary'] }
  ];
  
  // Filter recommendations based on user interests if available
  let recommendations = allRecommendations;
  if (userInterests.length > 0) {
    recommendations = allRecommendations.filter(rec => 
      rec.tags.some(tag => userInterests.includes(tag))
    );
    
    // If no matches, fall back to all recommendations
    if (recommendations.length === 0) {
      recommendations = allRecommendations;
    }
  }
  
  // Take just 3 recommendations
  recommendations = recommendations.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      {/* Personalized Header */}
      <GreetingHeader 
        user={user} 
        totalArticles={totalArticles} 
        publishedArticles={publishedArticles} 
      />
      
      <DashboardNav />
      
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Articles</h3>
                <FiFileText className="text-white/60" size={18} />
              </div>
              <p className="text-2xl font-semibold">{totalArticles}</p>
              <div className="mt-2 text-xs text-gray-500">
                {publishedArticles} published
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Views</h3>
                <FiEye className="text-white/60" size={18} />
              </div>
              <p className="text-2xl font-semibold">{totalViews._sum.views || 0}</p>
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <FiArrowUp className="text-white/60 mr-1" size={12} />
                <span>12% from last week</span>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Contributions</h3>
                <FiBarChart2 className="text-white/60" size={18} />
              </div>
              <p className="text-2xl font-semibold">{totalArticles + 8}</p>
              <div className="mt-2 text-xs text-gray-500">
                Articles, edits & reviews
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 shadow-sm shadow-black">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Collaborators</h3>
                <FiUsers className="text-white/60" size={18} />
              </div>
              <p className="text-2xl font-semibold">3</p>
              <div className="mt-2 text-xs text-gray-500">
                On 2 active projects
              </div>
            </div>
          </div>
          
          {/* Recent Articles */}
          <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">Recent Articles</h2>
              <Link href="/dashboard/articles" className="text-sm text-gray-400 hover:text-white">
                View all
              </Link>
            </div>
            
            {articles.length > 0 ? (
              <div>
                {articles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border-b border-gray-800 hover:bg-black/30">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{article.title}</h3>
                      <div className="flex items-center text-xs text-gray-400">
                        <span className="flex items-center mr-3">
                          <FiCalendar size={12} className="mr-1" />
                          {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center mr-3">
                          <FiEye size={12} className="mr-1" />
                          {article.views} views
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
                    <div className="flex items-center gap-2">
                      <Link href={`/articles/${article.slug}`} className="text-white/60 hover:text-white/80 p-1">
                        <FiEye size={16} />
                      </Link>
                      <Link href={`/articles/edit/${article.id}`} className="text-white/60 hover:text-white/80 p-1">
                        <FiEdit size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No articles yet. Click &quot;Create Article&quot; to get started.
              </div>
            )}
          </div>
          
          {/* Activity Timeline */}
          <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">Recent Activity</h2>
              <Link href="/dashboard/activity" className="text-sm text-gray-400 hover:text-white">
                View all
              </Link>
            </div>
            
            <div className="p-4">
              {activityTimeline.map((activity) => (
                <div key={activity.id} className="flex mb-4 last:mb-0">
                  <div className="mr-4 relative">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      {activity.type === 'edit' && <FiEdit size={14} />}
                      {activity.type === 'comment' && <FiStar size={14} />}
                      {activity.type === 'publish' && <FiFileText size={14} />}
                      {activity.type === 'review' && <FiCheckCircle size={14} />}
                    </div>
                    {activity.id !== activityTimeline.length && (
                      <div className="absolute top-8 bottom-0 left-1/2 w-px bg-gray-700 -translate-x-1/2"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-400">
                      {formatRelativeTime(activity.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar - 1/3 width on large screens */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">Notifications</h2>
              <span className="px-2 py-1 bg-white/10 text-xs rounded-full">
                {notifications.length} new
              </span>
            </div>
            
            <div>
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 border-b border-gray-800 hover:bg-black/30">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                      {notification.type === 'comment' && <FiStar size={14} />}
                      {notification.type === 'review' && <FiCheckCircle size={14} />}
                      {notification.type === 'mention' && <FiAlertCircle size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(notification.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 text-center">
              <button className="text-sm text-gray-400 hover:text-white">
                View all notifications
              </button>
            </div>
          </div>
          
          {/* Drafts & Quick Access */}
          <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">Drafts</h2>
            </div>
            
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">The Black Panthers</h3>
                <span className="text-xs text-gray-400">2 days ago</span>
              </div>
              <div className="text-xs text-gray-400 mb-3">
                Last edited on Feb 24, 2025
              </div>
              <div className="flex justify-between">
                <button className="text-xs text-gray-400 hover:text-white flex items-center">
                  <FiEdit size={12} className="mr-1" />
                  Continue editing
                </button>
                <span className="text-xs text-gray-500">60% complete</span>
              </div>
            </div>
            
            <div className="p-4">
              <Link 
                href="/articles/new" 
                className="flex items-center justify-center gap-2 w-full p-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
              >
                <FiFileText size={14} />
                <span>Start new draft</span>
              </Link>
            </div>
          </div>
          
          {/* Recommended Topics */}
          <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">Recommended Topics</h2>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-4">
                Topics that need contributions based on your expertise:
              </p>
              
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{rec.title}</h3>
                      <p className="text-xs text-gray-500">{rec.category}</p>
                    </div>
                    <button className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-white/5 hover:bg-white/10 rounded">
                      Explore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format relative time
function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
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
