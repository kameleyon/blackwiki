import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import AdminGreetingHeader from "@/components/admin/AdminGreetingHeader";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

async function getAnalyticsData() {
  // Get user metrics
  const totalUsers = await prisma.user.count();
  const newUsers = await prisma.user.count({
    where: {
      joinedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  });
  const activeUsers = await prisma.user.count({
    where: {
      lastActive: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    }
  });

  // Get content metrics
  const totalArticles = await prisma.article.count();
  const newArticles = await prisma.article.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  });

  // Get engagement metrics
  const articlesWithViews = await prisma.article.findMany({
    select: {
      views: true
    }
  });

  const totalViews = articlesWithViews.reduce((sum: number, article) => sum + (article.views || 0), 0);
  
  // For likes, use comment count as a proxy
  const totalLikes = await prisma.comment.count();
  
  const totalComments = await prisma.comment.count();

  // Get collaboration metrics (using edits as a proxy for collaborations)
  const totalCollaborations = await prisma.edit.count();
  const activeCollaborations = await prisma.edit.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  });

  // Get categories for distribution
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { articles: true }
      }
    }
  });
  
  // Calculate average quality score from article metadata
  const articlesWithMetadata = await prisma.article.findMany({
    where: {
      metadata: {
        not: null
      }
    },
    select: {
      metadata: true
    }
  });
  
  // Parse metadata JSON strings and extract quality scores
  const qualityScores = articlesWithMetadata
    .map(article => {
      try {
        const metadata = article.metadata ? JSON.parse(article.metadata) : null;
        return metadata?.qualityScore || 0;
      } catch (e) {
        return 0;
      }
    })
    .filter(score => score > 0);
  
  const averageQualityScore = qualityScores.length > 0
    ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
    : 0;
  
  // Calculate user retention based on active users vs total users
  const userRetention = activeUsers > 0 && totalUsers > 0
    ? Math.round((activeUsers / totalUsers) * 100)
    : 0;
  
  // Calculate average contributors per article (as a proxy for collaboration)
  const articlesWithEdits = await prisma.article.findMany({
    include: {
      _count: {
        select: { edits: true }
      }
    }
  });
  
  // Count unique users who have made edits
  const editsByArticle = await prisma.edit.groupBy({
    by: ['articleId'],
    _count: {
      userId: true
    }
  });
  
  const averageContributors = editsByArticle.length > 0
    ? editsByArticle.reduce((sum, article) => sum + article._count.userId, 0) / editsByArticle.length
    : 0;
  
  // Get real time series data by grouping by month
  // For users
  const usersByMonth = await prisma.user.groupBy({
    by: ['joinedAt'],
    _count: {
      id: true
    },
    orderBy: {
      joinedAt: 'asc'
    },
    take: 12
  });
  
  // For articles
  const articlesByMonth = await prisma.article.groupBy({
    by: ['createdAt'],
    _count: {
      id: true
    },
    orderBy: {
      createdAt: 'asc'
    },
    take: 12
  });
  
  // For views (using article updates as a proxy)
  const viewsByMonth = await prisma.article.groupBy({
    by: ['updatedAt'],
    _sum: {
      views: true
    },
    orderBy: {
      updatedAt: 'asc'
    },
    take: 12
  });
  
  // For comments
  const commentsByMonth = await prisma.comment.groupBy({
    by: ['createdAt'],
    _count: {
      id: true
    },
    orderBy: {
      createdAt: 'asc'
    },
    take: 12
  });
  
  // For edits (as a proxy for collaboration efficiency)
  const editsByMonth = await prisma.edit.groupBy({
    by: ['createdAt'],
    _count: {
      id: true
    },
    orderBy: {
      createdAt: 'asc'
    },
    take: 12
  });
  
  // Convert to arrays for charts
  const userGrowth = usersByMonth.map(item => item._count.id);
  const contentGrowth = articlesByMonth.map(item => item._count.id);
  const viewsOverTime = viewsByMonth.map(item => item._sum.views || 0);
  const likesOverTime = commentsByMonth.map(item => item._count.id);
  const commentsOverTime = commentsByMonth.map(item => item._count.id);
  const collaborationEfficiency = editsByMonth.map(item => item._count.id);

  return {
    userMetrics: {
      totalUsers,
      newUsers,
      activeUsers,
      userGrowth,
      userRetention
    },
    contentMetrics: {
      totalArticles,
      newArticles,
      averageQualityScore,
      contentGrowth,
      categoryDistribution: {
        labels: categories.map(c => c.name),
        data: categories.map(c => c._count.articles)
      }
    },
    engagementMetrics: {
      totalViews,
      totalLikes,
      totalComments,
      viewsOverTime,
      likesOverTime,
      commentsOverTime
    },
    collaborationMetrics: {
      totalCollaborations,
      activeCollaborations,
      averageContributors,
      collaborationEfficiency
    }
  };
}

export default async function AdminAnalyticsPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get user role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, id: true, name: true }
  });

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  // Get analytics data
  const analyticsData = await getAnalyticsData();

  // Get pending reviews count for the greeting header
  const pendingReviews = await prisma.article.count({
    where: { status: { in: ["pending", "in review"] } }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminGreetingHeader 
        user={{ id: user.id, name: user.name }}
        totalUsers={analyticsData.userMetrics.totalUsers}
        totalArticles={analyticsData.contentMetrics.totalArticles}
        pendingReviews={pendingReviews}
        pageName="Analytics"
      />

      <AdminNav />

      <AnalyticsDashboard 
        userMetrics={analyticsData.userMetrics}
        contentMetrics={analyticsData.contentMetrics}
        engagementMetrics={analyticsData.engagementMetrics}
        collaborationMetrics={analyticsData.collaborationMetrics}
      />
    </div>
  );
}
