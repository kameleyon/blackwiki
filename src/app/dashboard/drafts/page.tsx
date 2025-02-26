import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { FiEdit, FiClock, FiCalendar } from 'react-icons/fi';
import DashboardNav from '@/components/dashboard/DashboardNav';
import GreetingHeader from '@/components/dashboard/GreetingHeader';

export default async function DraftsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  // Get only the current user's draft articles
  const drafts = await prisma.article.findMany({
    where: {
      isPublished: false,
      authorId: user.id // Filter by current user's ID
    },
    orderBy: {
      updatedAt: 'desc'
    },
    include: {
      author: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  console.log('Drafts found:', drafts.map(d => ({ id: d.id, title: d.title, authorId: d.authorId })));

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

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      {/* Personalized Header */}
      <GreetingHeader 
        user={user} 
        totalArticles={totalArticles} 
        publishedArticles={publishedArticles} 
        pageName="Drafts"
      />
      
      <DashboardNav />
      
      {/* Drafts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* New Draft Card */}
        <Link 
          href="/articles/new" 
          className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black flex flex-col items-center justify-center h-64 hover:bg-white/10 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <FiEdit size={24} className="text-white/60" />
          </div>
          <h3 className="text-lg font-medium mb-2">Create New Draft</h3>
          <p className="text-sm text-gray-400 text-center">
            Start writing a new article for AfroWiki
          </p>
        </Link>
        
        {/* Draft Cards */}
        {drafts.map((draft) => (
          <div key={draft.id} className="bg-white/5 rounded-xl shadow-sm shadow-black overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-2 line-clamp-2">{draft.title}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                {draft.summary || 'No summary yet'}
              </p>
              
              <div className="flex items-center text-xs text-gray-500 mb-4">
                <span className="flex items-center mr-3">
                  <FiCalendar size={12} className="mr-1" />
                  Created: {new Date(draft.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <FiClock size={12} className="mr-1" />
                  Updated: {new Date(draft.updatedAt).toLocaleDateString()}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                <div 
                  className="bg-white/40 h-1.5 rounded-full" 
                  style={{ width: `${getCompletionPercentage(draft)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mb-4">
                {getCompletionPercentage(draft)}% complete
              </div>
            </div>
            
            <div className="flex border-t border-gray-800">
              <Link 
                href={`/articles/edit/${draft.id}`}
                className="flex-1 py-3 text-center text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Continue Editing
              </Link>
              <button 
                className="flex-1 py-3 text-center text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors border-l border-gray-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {drafts.length === 0 && (
        <div className="bg-white/5 rounded-xl p-8 text-center shadow-sm shadow-black">
          <h3 className="text-lg font-medium mb-2">No Drafts Yet</h3>
          <p className="text-gray-400 mb-6">
            You don&apos;t have any drafts. Start writing your first article!
          </p>
          <Link 
            href="/articles/new" 
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-600 hover:text-gray-200 transition-colors inline-flex items-center gap-2"
          >
            <FiEdit size={16} />
            <span>Create Article</span>
          </Link>
        </div>
      )}
      
      {/* Draft Tips */}
      <div className="bg-white/5 rounded-xl p-6 shadow-sm shadow-black mt-8">
        <h3 className="text-lg font-medium mb-4">Tips for Writing Great Articles</h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li className="flex items-start">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mr-3 mt-0.5">1</span>
            <span>Start with a clear, concise summary that captures the essence of your topic.</span>
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mr-3 mt-0.5">2</span>
            <span>Use headings to organize your content into logical sections.</span>
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mr-3 mt-0.5">3</span>
            <span>Include reliable sources and citations to support your information.</span>
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mr-3 mt-0.5">4</span>
            <span>Use the AI fact-checking tool to verify your content before publishing.</span>
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mr-3 mt-0.5">5</span>
            <span>Save your work frequently using the auto-save feature.</span>
          </li>
        </ul>
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
