import { getCurrentUser } from '@/lib/auth';
import { getServerSession } from "next-auth";
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
import AdvancedStatistics from '@/components/dashboard/AdvancedStatistics';
import GoalsAndAchievements from '@/components/dashboard/GoalsAndAchievements';

export default async function DashboardPage() {
  // Handle JWT decryption failures gracefully to prevent infinite redirect loops
  let session = null;
  let user = null;
  
  try {
    session = await getServerSession();
    if (session?.user?.email) {
      user = await getCurrentUser();
    }
  } catch (error) {
    // JWT decryption failed - clear invalid session 
    console.error("JWT session error - redirecting to clear invalid session:", error);
    redirect('/api/auth/clear-session');
  }
  
  // If no valid session, redirect to sign-in
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }
  
  // Only redirect if we have a session but no user in the database
  if (!user && session?.user?.email) {
    console.error("Session exists but user not found in database:", session.user.email);
    // Instead of redirecting, we'll show an error message
    return (
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
        <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Authentication Error</h2>
          <p className="text-white/70">
            There was an error retrieving your user profile. Please try signing out and signing in again.
          </p>
          <div className="mt-4">
            <Link href="/auth/signout" className="px-4 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20">
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ensure user is not null before proceeding
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
        <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Authentication Error</h2>
          <p className="text-white/70">
            There was an error retrieving your user profile. Please try signing out and signing in again.
          </p>
          <div className="mt-4">
            <Link href="/auth/signout" className="px-4 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20">
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get only the current user's articles
  const articles = await prisma.article.findMany({
    where: {
      authorId: user.id // Now we know user is not null
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5, // Only get the 5 most recent articles for the dashboard
    include: {
      categories: true,
      tags: true,
      author: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  console.log('Articles found:', articles.map(a => ({ id: a.id, title: a.title, authorId: a.authorId })));

  // Get only the current user's draft articles
  const drafts = await prisma.article.findMany({
    where: {
      isPublished: false,
      authorId: user.id // Filter by current user's ID
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 3, // Only get the 3 most recent drafts
    include: {
      categories: true,
      tags: true,
      author: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  console.log('Drafts found:', drafts.map(d => ({ id: d.id, title: d.title, authorId: d.authorId })));

  // Calculate statistics for the current user only
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
  
  const totalViews = await prisma.article.aggregate({
    _sum: { views: true }
  });

  // Get edits for activity timeline (only for the current user's articles or edits made by the current user)
  const edits = await prisma.edit.findMany({
    where: {
      OR: [
        { userId: user.id }, // Edits made by the current user
        { 
          article: {
            authorId: user.id // Edits on articles authored by the current user
          }
        }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    include: {
      article: true,
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  console.log('Edits found:', edits.map(e => ({ id: e.id, articleId: e.articleId, userId: e.userId })));

  // Get articles with status changes for activity timeline (only for the current user's articles)
  const statusChangedArticles = await prisma.article.findMany({
    where: {
      status: {
        in: ['approved', 'in review']
      },
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

  console.log('Status changed articles found:', statusChangedArticles.map(a => ({ id: a.id, title: a.title, authorId: a.authorId, status: a.status })));

  // Combine edits and status changes into activity timeline
  const activityTimeline = [
    ...edits.map(edit => ({
      id: edit.id,
      type: 'edit',
      title: `Updated article "${edit.article.title}"`,
      articleId: edit.articleId,
      articleTitle: edit.article.title,
      date: edit.createdAt
    })),
    ...statusChangedArticles.map(article => ({
      id: article.id,
      type: article.status === 'approved' ? 'review' : 'publish',
      title: article.status === 'approved' 
        ? `Article "${article.title}" approved` 
        : `Published "${article.title}"`,
      articleId: article.id,
      articleTitle: article.title,
      date: article.updatedAt
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 4);

  // Generate notifications based on recent activities
  const notifications = [
    ...statusChangedArticles.map(article => ({
      id: article.id,
      type: 'review',
      message: article.status === 'approved' 
        ? `Your article "${article.title}" has been approved` 
        : `Your article "${article.title}" is in review`,
      articleId: article.id,
      date: article.updatedAt
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 3);

  // Get user's interests for personalized recommendations
  const userInterests = user.interests?.split(',').map(i => i.trim().toLowerCase()) || [];

  // Get all categories for recommendations
  const categories = await prisma.category.findMany({
    include: {
      articles: {
        select: {
          id: true
        }
      }
    }
  });

  // Get all tags for recommendations
  const tags = await prisma.tag.findMany();

  // Create recommendations based on categories and user interests
  const allRecommendations = categories.map(category => {
    // Extract relevant tags for this category
    const categoryTags = tags
      .filter(tag => tag.name.toLowerCase().includes(category.name.toLowerCase()) || 
                    category.name.toLowerCase().includes(tag.name.toLowerCase()))
      .map(tag => tag.name.toLowerCase());
    
    return {
      id: category.id,
      title: category.name,
      category: category.name,
      description: category.description || `Articles about ${category.name}`,
      articleCount: category.articles.length,
      tags: categoryTags
    };
  });
  
  // Filter recommendations based on user interests if available
  let recommendations = allRecommendations;
  if (userInterests.length > 0) {
    recommendations = allRecommendations.filter(rec => 
      rec.tags.some(tag => userInterests.some(interest => tag.includes(interest) || interest.includes(tag)))
    );
    
    // If no matches, fall back to all recommendations
    if (recommendations.length === 0) {
      recommendations = allRecommendations;
    }
  }
  
  // Sort by article count and take just 3 recommendations
  recommendations = recommendations
    .sort((a, b) => b.articleCount - a.articleCount)
    .slice(0, 3);

  // Calculate contribution statistics
  const totalEdits = await prisma.edit.count();
  
  const totalContributions = totalArticles + totalEdits;
  
  // Mock data for advanced statistics
  const advancedStatisticsData = {
    contributionData: {
      articles: totalArticles,
      edits: totalEdits,
      comments: Math.floor(Math.random() * 20), // Mock data
      reviews: Math.floor(Math.random() * 10)   // Mock data
    },
    articleImpactData: {
      views: [120, 230, 310, 290, 400, 450],
      likes: [20, 40, 50, 45, 60, 70],
      shares: [5, 10, 15, 12, 20, 25],
      comments: [10, 20, 30, 25, 35, 40],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    categoryDistribution: {
      labels: categories.slice(0, 6).map(c => c.name),
      data: categories.slice(0, 6).map(c => c.articles.length)
    },
    expertiseRadar: {
      labels: ['History', 'Culture', 'Art', 'Music', 'Literature', 'Politics'],
      current: [7, 5, 8, 6, 4, 3],
      target: [9, 8, 10, 8, 7, 6]
    },
    achievementsData: {
      completed: 5,
      inProgress: 3,
      locked: 7
    }
  };
  
  // Mock data for goals and achievements
  const goalsAndAchievementsData = {
    achievements: [
      {
        id: '1',
        title: 'Prolific Writer',
        description: 'Published 5 or more articles',
        icon: 'award',
        status: 'completed' as const,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) // 30 days ago
      },
      {
        id: '2',
        title: 'Rising Star',
        description: 'Received 100+ views on a single article',
        icon: 'award',
        status: 'completed' as const,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15) // 15 days ago
      },
      {
        id: '3',
        title: 'Collaboration Champion',
        description: 'Collaborated on 3 or more articles',
        icon: 'award',
        status: 'in-progress' as const,
        progress: 66 // 2 out of 3
      },
      {
        id: '4',
        title: 'Category Expert',
        description: 'Published 3 articles in the same category',
        icon: 'award',
        status: 'in-progress' as const,
        progress: 33 // 1 out of 3
      },
      {
        id: '5',
        title: 'Fact Checker',
        description: 'Verified facts in 10 articles',
        icon: 'check',
        status: 'locked' as const
      },
      {
        id: '6',
        title: 'Community Pillar',
        description: 'Contribute to AfroWiki for 1 year',
        icon: 'award',
        status: 'locked' as const
      }
    ],
    goals: [
      {
        id: '1',
        title: 'Complete History Series',
        description: 'Finish the series on African Kingdoms',
        target: 5,
        current: 2,
        unit: 'articles',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
        category: 'Content Creation'
      },
      {
        id: '2',
        title: 'Improve Expertise',
        description: 'Increase expertise in Music category',
        target: 8,
        current: 6,
        unit: 'level',
        category: 'Skill Development'
      },
      {
        id: '3',
        title: 'Collaboration',
        description: 'Collaborate with other authors',
        target: 3,
        current: 1,
        unit: 'collaborations',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // 60 days from now
        category: 'Community'
      },
      {
        id: '4',
        title: 'Article Views',
        description: 'Reach 1000 total views on all articles',
        target: 1000,
        current: 450,
        unit: 'views',
        category: 'Impact'
      }
    ]
  };

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
              <p className="text-2xl font-semibold">{totalContributions}</p>
              <div className="mt-2 text-xs text-gray-500">
                {totalArticles} articles, {totalEdits} edits
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
                        <span className="flex items-center mr-3">
                          By {article.author?.name || 'Unknown'}
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
                    {activityTimeline.indexOf(activity) !== activityTimeline.length - 1 && (
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
          
          {/* Advanced Statistics */}
          <AdvancedStatistics {...advancedStatisticsData} />
          
          {/* Goals and Achievements */}
          <GoalsAndAchievements 
            achievements={goalsAndAchievementsData.achievements}
            goals={goalsAndAchievementsData.goals}
          />
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
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">Drafts</h2>
              <Link href="/dashboard/drafts" className="text-sm text-gray-400 hover:text-white">
                View all
              </Link>
            </div>
            
            {drafts.length > 0 ? (
              <>
                {drafts.map((draft) => (
                  <div key={draft.id} className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{draft.title}</h3>
                      <span className="text-xs text-gray-400">{formatRelativeTime(draft.updatedAt)}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-3">
                      Last edited on {new Date(draft.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex justify-between">
                      <Link 
                        href={`/articles/edit/${draft.id}`}
                        className="text-xs text-gray-400 hover:text-white flex items-center"
                      >
                        <FiEdit size={12} className="mr-1" />
                        Continue editing
                      </Link>
                      <span className="text-xs text-gray-500">
                        {getCompletionPercentage(draft)}% complete
                      </span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No drafts yet.
              </div>
            )}
            
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

// Helper function to calculate completion percentage
function getCompletionPercentage(draft: {
  title?: string;
  summary?: string;
  content?: string;
  categories?: { id: string }[];
  tags?: { name: string }[];
}): number {
  let score = 0;
  
  // Title exists and has reasonable length
  if (draft.title && draft.title.length > 10) score += 20;
  else if (draft.title) score += 10;
  
  // Summary exists
  if (draft.summary && draft.summary.length > 50) score += 20;
  else if (draft.summary) score += 10;
  
  // Content exists and has reasonable length
  if (draft.content) {
    const contentLength = draft.content.length;
    if (contentLength > 2000) score += 40;
    else if (contentLength > 1000) score += 30;
    else if (contentLength > 500) score += 20;
    else score += 10;
  }
  
  // Has categories
  if (draft.categories && draft.categories.length > 0) score += 10;
  
  // Has tags
  if (draft.tags && draft.tags.length > 0) score += 10;
  
  return Math.min(100, score);
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
