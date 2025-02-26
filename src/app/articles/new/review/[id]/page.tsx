import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { checkArticleFacts } from "@/lib/factChecker";
import UserNav from "@/components/user/UserNav";
import { FiLoader, FiBookOpen, FiLink } from "react-icons/fi";
import Image from "next/image";
import { EditButton } from "@/components/articles/EditButton";
import { ArticleActions } from "@/components/articles/ArticleActions";
import ReactMarkdown from "react-markdown";
import { Metadata } from 'next';

type Article = {
  id: string;
  title: string;
  content: string;
  summary: string;
  image: string | null;
  imageAlt: string | null;
  authorId: string;
  categories: Array<{
    id: string;
    name: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
  }>;
  references?: Array<string>;
  metadata?: {
    keywords?: string[];
    description?: string;
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return {
      title: 'Review Article - AfroWiki',
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  const article = await prisma.article.findUnique({
    where: { 
      id: params.id,
      authorId: user?.id,
    },
  });

  return {
    title: article ? `Review: ${article.title} - AfroWiki` : 'Review Article - AfroWiki',
  };
}

export default async function ReviewArticlePage({ params }: any) {
  const articleId = params.id;
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get user ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Get article with user check
  const article = await prisma.article.findUnique({
    where: { 
      id: articleId,
      authorId: user.id,
    },
    include: {
      categories: true,
      tags: true,
    }
  });

  if (!article) {
    redirect("/dashboard");
  }

  // Assert article is not null after check
  const validArticle = article as Article;

  // Get fact check results
  const factCheck = await checkArticleFacts(validArticle.title, validArticle.content);
  const factCheckStatus = factCheck.status as 'pass' | 'fail' | 'not-relevant';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4 mb-4">Review Article</h1>
      </div>
      <UserNav currentPath="/articles/new" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Left Column - Article Preview */}
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-100">Article Preview</h2>
              <EditButton articleId={validArticle.id} />
            </div>
            
            {validArticle.image && (
              <div className="mb-6 relative w-full h-64">
                <Image 
                  src={validArticle.image}
                  alt={validArticle.imageAlt || validArticle.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-100 mb-4">{validArticle.title}</h1>
            
            <div className="prose prose-invert prose-sm max-w-none leading-loose mb-6">
              <ReactMarkdown 
                components={{
                  p: ({...props}) => <p className="text-white/70 font-light leading-loose" {...props} />,
                }}
              >
                {validArticle.summary}
              </ReactMarkdown>
            </div>
            
            <div className="prose prose-invert prose-sm max-w-none leading-loose">
              <ReactMarkdown 
                components={{
                  h1: ({...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                  h2: ({...props}) => <h2 className="text-xl font-semibold mb-3" {...props} />,
                  h3: ({...props}) => <h3 className="text-lg font-medium mb-2" {...props} />,
                  p: ({...props}) => <p className="mb-4 leading-loose" {...props} />,
                  ul: ({...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                  li: ({...props}) => <li className="leading-loose" {...props} />,
                  blockquote: ({...props}) => (
                    <blockquote className="border-l-4 border-white/20 pl-4 italic mb-4" {...props} />
                  ),
                  code: ({...props}) => (
                    <code className="bg-black/30 rounded px-1 py-0.5" {...props} />
                  ),
                  pre: ({...props}) => (
                    <pre className="bg-black/30 rounded p-4 mb-4 overflow-x-auto" {...props} />
                  ),
                }}
              >
                {validArticle.content}
              </ReactMarkdown>
            </div>

            {/* References Section */}
            {validArticle.references && validArticle.references.length > 0 && validArticle.references[0] !== "" && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="flex items-center text-lg font-medium mb-3">
                  <FiBookOpen className="mr-2" />
                  References
                </h3>
                <ul className="space-y-2">
                  {validArticle.references.map((reference, index) => (
                    <li key={index} className="text-white/70 text-sm">
                      {reference.startsWith('http') ? (
                        <a 
                          href={reference} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center hover:text-white"
                        >
                          <FiLink size={12} className="mr-1" />
                          {reference}
                        </a>
                      ) : (
                        reference
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex flex-wrap gap-2 mb-4">
                {validArticle.categories.map((category) => (
                  <span 
                    key={category.id}
                    className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {validArticle.tags.map((tag) => (
                  <span 
                    key={tag.id}
                    className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Fact Check Results & Actions */}
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white/80">Fact Check Results</h2>
              {!factCheck.success && (
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <FiLoader className="animate-spin" />
                  Analyzing...
                </div>
              )}
            </div>

            <div className="prose prose-invert prose-sm max-w-none leading-loose">
              <ReactMarkdown 
                components={{
                  h1: ({...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                  h2: ({...props}) => <h2 className="text-lg font-semibold mb-3" {...props} />,
                  h3: ({...props}) => <h3 className="text-md font-medium mb-2" {...props} />,
                  p: ({...props}) => <p className="mb-4 text-white/70 font-light text-sm leading-loose" {...props} />,
                  ul: ({...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-white/70 font-light text-sm" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-6 text-white/70 font-light text-sm mb-4 space-y-2" {...props} />,
                  li: ({...props}) => <li className="leading-loose text-white/70 font-light text-sm" {...props} />,
                  blockquote: ({...props}) => (
                    <blockquote className="border-l-4 border-white/20 pl-4 italic mb-4 text-white/70 font-light text-sm" {...props} />
                  ),
                }}
              >
                {factCheck.analysis}
              </ReactMarkdown>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Actions</h2>
            
            <ArticleActions 
              articleId={validArticle.id} 
              factCheckStatus={factCheckStatus}
            />
          </div>

          {/* SEO Preview */}
          {validArticle.metadata && (
            <div className="bg-white/5 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">SEO Preview</h2>
              
              <div className="bg-white/5 rounded-md p-4 mb-4">
                <h3 className="text-lg font-medium text-white/90 mb-1 line-clamp-1">{validArticle.title}</h3>
                <div className="text-green-400 text-xs mb-1">afrowiki.com › articles › {validArticle.title.toLowerCase().replace(/\s+/g, '-')}</div>
                <p className="text-sm text-white/70 line-clamp-2">
                  {validArticle.metadata.description || validArticle.summary}
                </p>
              </div>
              
              {validArticle.metadata.keywords && validArticle.metadata.keywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white/80 mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-1">
                    {validArticle.metadata.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-0.5 bg-white/5 text-white/60 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
