import { getArticleBySlug, incrementArticleViews } from '@/lib/db'
import { prisma } from "@/lib/db";
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { getServerSession } from "next-auth";
import { getCurrentUser } from "@/lib/auth";
import ArticleEngagement from '@/components/articles/ArticleEngagement'
import RelatedArticles from '@/components/articles/RelatedArticles'
import CommentSystem from '@/components/collaboration/CommentSystem'
import CommunityEditingTabs from '@/components/community-editing/CommunityEditingTabs'
import GreetingHeader from "@/components/dashboard/GreetingHeader";
import UserNav from "@/components/user/UserNav";
import { FiClock, FiEye, FiCalendar } from 'react-icons/fi'
import { processArticleContent, markdownToHtml } from '@/lib/markdownCleaner'
import '@/app/articles/new/review/article-content.css'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)
  if (!article) return { title: 'Article Not Found' }
  
  return {
    title: `${article.title} | AfroWiki`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.image ? [article.image] : [],
    }
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticleBySlug(params.slug)
  
  if (!article) {
    notFound()
  }
  
  // Increment view count
  await incrementArticleViews(article.id)
  
  // Get current user for the greeting header
  const session = await getServerSession();
  const currentUser = await getCurrentUser();
  
  // Calculate statistics for the greeting header
  let totalArticles = 0;
  let publishedArticles = 0;
  
  if (currentUser) {
    totalArticles = await prisma.article.count({
      where: { authorId: currentUser.id }
    });
    
    publishedArticles = await prisma.article.count({
      where: { 
        authorId: currentUser.id,
        isPublished: true
      }
    });
  }
  
  // Calculate reading time (rough estimate)
  const wordsPerMinute = 200
  const wordCount = article.content.split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  
  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      {/* Personalized Header - only show if user is logged in */}
      {currentUser && (
        <>
          <GreetingHeader 
            user={currentUser} 
            totalArticles={totalArticles} 
            publishedArticles={publishedArticles} 
            pageName="View Article"
          />
          
          <UserNav currentPath="/articles/view" />
        </>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <div className="lg:w-3/4">
          {/* Article Header */}
          <div className="mb-8">
            {article.image && (
              <div className="relative w-full h-64 md:h-96 mb-6 rounded-xl overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.imageAlt || article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-normal mb-4">{article.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {article.categories.map(category => (
                <span key={category.id} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  {category.name}
                </span>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-6">
              <div className="flex items-center gap-1">
                <FiCalendar size={14} />
                <span>Published: {new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiCalendar size={14} />
                <span>Updated: {new Date(article.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiEye size={14} />
                <span>{article.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <FiClock size={14} />
                <span>{readingTime} min read</span>
              </div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg mb-8">
              <div 
                className="text-lg italic article-content"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(processArticleContent(article.summary)) }}
              />
            </div>
          </div>
          
          {/* Article Content */}
          <div className="prose prose-invert max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: markdownToHtml(processArticleContent(article.content)) }}
              className="article-content"
            />
          </div>
          
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span key={tag.id} className="px-3 py-1 bg-white/5 rounded-full text-sm">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
          
          {/* Article Engagement */}
          <ArticleEngagement _articleId={article.id} />
          
          {/* References */}
          {article.references.length > 0 && (
            <div className="mt-12 border-t border-white/10 pt-6">
              <h2 className="text-xl font-normal mb-4">References</h2>
              <ul className="space-y-2">
                {article.references.map(reference => (
                  <li key={reference.id}>
                    <a 
                      href={reference.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white font-semibold hover:underline"
                    >
                      {reference.title}
                      {reference.description && (
                        <span className="block text-sm text-white/60">{reference.description}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Community Editing Features */}
          <div className="mt-12 border-t border-white/10 pt-6">
            <h2 className="text-xl font-normal mb-4">Community</h2>
            <div className="mb-6">
              {/* @ts-ignore - Component exists but TypeScript may not recognize it */}
              <CommunityEditingTabs 
                articleId={article.id} 
                articleTitle={article.title}
                authorId={article.authorId}
                authorName={article.author?.name || undefined}
              />
            </div>
          </div>
          
          {/* Comments */}
          <div className="mt-12 border-t border-white/10 pt-6">
            <CommentSystem articleId={article.id} />
          </div>
          
          {/* Navigation */}
          <div className="mt-12 flex justify-between">
            <Link 
              href="/search"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Back to Search
            </Link>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="sticky top-24 space-y-6">
            <RelatedArticles 
              categories={article.categories} 
              tags={article.tags}
              currentArticleId={article.id}
            />
            
            {/* Table of Contents - Placeholder for future implementation */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-normal mb-4">Table of Contents</h3>
              <div className="text-sm text-white/70">
                <p>This feature will be implemented soon.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
