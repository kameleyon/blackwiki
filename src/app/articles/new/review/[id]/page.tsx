import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { checkArticleFacts } from "@/lib/factChecker";
import UserNav from "@/components/user/UserNav";
import { FiLoader } from "react-icons/fi";
import Image from "next/image";
import { EditButton } from "@/components/articles/EditButton";
import { ArticleActions } from "@/components/articles/ArticleActions";
import ReactMarkdown from "react-markdown";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
};

/**
 * Final workaround for the Next.js 15 type conflict:
 * We disable the no-explicit-any rule in this file to sidestep
 * Next.js's usage of Promise<any> in dynamic route param checks.
 */
export default async function ReviewArticlePage(props: any) {
  const { params } = props;

  if (!params?.id) {
    redirect("/dashboard");
    return null;
  }

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
  }) as Article | null;

  if (!article) {
    redirect("/dashboard");
  }

  // Get fact check results
  const factCheck = await checkArticleFacts(article.title, article.content);

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
              <EditButton articleId={article.id} />
            </div>
            
            {article.image && (
              <div className="mb-6 relative w-full h-64">
                <Image 
                  src={article.image}
                  alt={article.imageAlt || article.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-100 mb-4">{article.title}</h1>
            
            <div className="prose prose-invert prose-sm max-w-none leading-loose mb-6">
              <ReactMarkdown 
                components={{
                  p: ({...props}) => <p className="text-white/70 font-light leading-loose" {...props} />,
                }}
              >
                {article.summary}
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
                {article.content}
              </ReactMarkdown>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex flex-wrap gap-2 mb-4">
                {article.categories.map((category: { id: string; name: string }) => (
                  <span 
                    key={category.id}
                    className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: { id: string; name: string }) => (
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
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <FiLoader className="animate-spin" />
                Analyzing...
              </div>
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
            
            <ArticleActions articleId={article.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
