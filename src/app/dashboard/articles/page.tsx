import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiEye, FiFilter } from 'react-icons/fi';
import { ArticleStatus } from '@/types/index';
import DashboardNav from '@/components/dashboard/DashboardNav';
import GreetingHeader from '@/components/dashboard/GreetingHeader';

export default async function ArticlesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  const articles = await prisma.article.findMany({
    where: {
      authorId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate statistics for the greeting header
  const totalArticles = await prisma.article.count({
    where: { authorId: user.id }
  });
  
  const publishedArticles = await prisma.article.count({
    where: { 
      authorId: user.id,
      isPublished: true
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Personalized Header */}
      <GreetingHeader 
        user={user} 
        totalArticles={totalArticles} 
        publishedArticles={publishedArticles} 
        pageName="My Articles"
      />
      
      <DashboardNav />
      
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm flex items-center gap-2 text-gray-400 hover:text-white">
            <FiFilter size={14} />
            <span>Filter</span>
          </button>
          
          <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-400">
            <option value="all">All Articles</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="in-review">In Review</option>
          </select>
          
          <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-400">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="views">Most Views</option>
            <option value="likes">Most Likes</option>
          </select>
        </div>
        
        <Link 
          href="/articles/new" 
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-600 hover:text-gray-200 transition-colors flex items-center gap-2"
        >
          <span>Create Article</span>
        </Link>
      </div>

      {/* Articles list */}
      <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
        <div className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr,0.5fr] gap-2 sm:gap-4 p-3 sm:p-4 text-xs sm:text-sm text-white/80 font-semibold border-b border-gray-700">
          <div>Date</div>
          <div>Title</div>
          <div>Status</div>
          <div>Views</div>
          <div>Likes</div>
          <div>Actions</div>
        </div>
        
        {articles.map((article) => (
          <div key={article.id} className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr,0.5fr] gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-800 hover:bg-black/30">
            <div className="text-xs sm:text-sm text-gray-400">
              {new Date(article.createdAt).toLocaleDateString()}
            </div>
            <div className="font-light text-xs sm:text-sm">{article.title}</div>
            <div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                (article.status as ArticleStatus) === 'approved'
                  ? 'bg-white/40 text-white/80 text-xs sm:text-sm'
                  : (article.status as ArticleStatus) === 'in review'
                  ? 'bg-white/20 text-white/80 text-xs sm:text-sm'
                  : (article.status as ArticleStatus) === 'denied'
                  ? 'bg-white/10 text-white/80 text-xs sm:text-sm'
                  : 'bg-white/10 text-white/80 text-xs sm:text-sm'
              }`}>
                {(article.status as ArticleStatus) === 'approved' 
                  ? 'Approved' 
                  : (article.status as ArticleStatus) === 'in review'
                  ? 'In Review'
                  : (article.status as ArticleStatus) === 'denied'
                  ? 'Denied'
                  : 'Draft'}
              </span>
            </div>
            <div className="font-light text-xs sm:text-sm">{article.views}</div>
            <div className="font-light text-xs sm:text-sm">0</div>
            <div className="flex items-center gap-2">
              <Link href={`/articles/${article.slug}`} className="text-white/60 hover:text-white/80 flex items-center">
                <FiEye size={14} />
              </Link>
              <Link href={`/articles/edit/${article.id}`} className="text-white/60 hover:text-white/80 flex items-center">
                <FiEdit size={14} />
              </Link>
              <button className="text-white/60 hover:text-white/80 flex items-center">
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm md:text-md">
            No articles yet. Click &quot;Create Article&quot; to get started.
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {articles.length > 0 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white">
              &lt;
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 text-white">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white">
              &gt;
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
