import { getArticleBySlug } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import { FiArrowLeft, FiMessageSquare, FiUsers, FiFileText } from 'react-icons/fi';
import DiscussionSystem from '@/components/discussions/DiscussionSystem';
import ArticleTabNavigation from '@/components/navigation/ArticleTabNavigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: 'Article Not Found' };
  
  return {
    title: `Talk:${article.title} | AfroWiki`,
    description: `Discussion page for ${article.title}`,
  };
}

export default async function ArticleTalkPage({ params }: PageProps) {
  const article = await getArticleBySlug(params.slug);
  
  if (!article) {
    notFound();
  }
  
  const currentUser = await getCurrentUser();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Article Navigation Tabs */}
      <ArticleTabNavigation 
        articleSlug={params.slug}
        articleTitle={article.title}
      />

      {/* Discussion Info */}
      <div className="mb-8">
        <p className="text-white/70">
          This is the discussion page for "{article.title}". Please use this space to discuss improvements, 
          ask questions, or coordinate edits with other contributors.
        </p>
      </div>

      {/* Discussion Guidelines */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium mb-3 text-blue-300">Discussion Guidelines</h2>
        <ul className="text-sm text-white/70 space-y-2">
          <li>• Be respectful and constructive in your discussions</li>
          <li>• Focus on improving the article content and accuracy</li>
          <li>• Provide sources and references when making suggestions</li>
          <li>• Use clear, descriptive subject lines for new topics</li>
          <li>• Sign your posts and include timestamps when relevant</li>
        </ul>
      </div>

      {/* Article Context Panel */}
      <div className="bg-white/5 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiFileText className="text-white/60" size={24} />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium mb-2">About this article</h3>
            <p className="text-sm text-white/70 mb-3">{article.summary}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {article.categories.map(category => (
                <span key={category.id} className="px-2 py-1 bg-white/10 rounded text-xs">
                  {category.name}
                </span>
              ))}
            </div>
            <div className="text-xs text-white/50">
              Created: {new Date(article.createdAt).toLocaleDateString()} • 
              Last updated: {new Date(article.updatedAt).toLocaleDateString()} • 
              {article.views} views
            </div>
          </div>
        </div>
      </div>

      {/* Discussion System */}
      <div className="bg-white/5 rounded-lg">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <FiUsers size={16} className="text-white/60" />
            <h2 className="text-lg font-medium">Community Discussion</h2>
          </div>
          <p className="text-sm text-white/60 mt-1">
            Discuss improvements, share insights, and collaborate on this article
          </p>
        </div>
        
        <div className="p-6">
          <DiscussionSystem 
            targetId={article.id}
            targetType="article"
            targetTitle={article.title}
            currentUser={currentUser}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-white/5 rounded-lg">
        <h3 className="font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href={`/articles/${params.slug}`}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiFileText className="text-blue-400" size={20} />
            <div>
              <div className="font-medium text-sm">Read Article</div>
              <div className="text-xs text-white/60">View the main content</div>
            </div>
          </Link>
          
          {currentUser && (
            <Link 
              href={`/articles/${params.slug}/edit`}
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiFileText className="text-green-400" size={20} />
              <div>
                <div className="font-medium text-sm">Edit Article</div>
                <div className="text-xs text-white/60">Improve the content</div>
              </div>
            </Link>
          )}
          
          <Link 
            href={`/users/${encodeURIComponent(article.author?.name || 'unknown')}`}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiUsers className="text-purple-400" size={20} />
            <div>
              <div className="font-medium text-sm">Author Profile</div>
              <div className="text-xs text-white/60">View {article.author?.name}</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}