import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import { FiUser, FiCalendar, FiEye } from "react-icons/fi";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

async function getArticle(id: string) {
  return await prisma.article.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          name: true,
          email: true
        }
      },
      categories: true,
      tags: true
    }
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function AdminArticleEditPage(props: any) {
  const { params } = props;

  if (!params?.id) {
    redirect("/admin/articles");
    return null;
  }
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get user role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  const article = await getArticle(params.id);

  if (!article) {
    redirect("/admin/articles");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4">Edit Article</h1>
      </div>

      <AdminNav />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Article Preview */}
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Article Preview</h2>
            
            {article.image && (
              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.imageAlt || article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <h3 className="text-xl font-bold mb-4">{article.title}</h3>
            
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>
                {article.content}
              </ReactMarkdown>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex flex-wrap gap-2 mb-4">
                {article.categories.map((category) => (
                  <span 
                    key={category.id}
                    className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
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

        {/* Article Details & Actions */}
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Article Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FiUser className="w-5 h-5 text-white/60" />
                <div>
                  <div className="text-sm text-white/60">Author</div>
                  <div>{article.author.name} ({article.author.email})</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-white/60" />
                <div>
                  <div className="text-sm text-white/60">Last Updated</div>
                  <div>{new Date(article.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FiEye className="w-5 h-5 text-white/60" />
                <div>
                  <div className="text-sm text-white/60">Views</div>
                  <div>{article.views}</div>
                </div>
              </div>
            </div>
          </div>

          <form 
            action="/api/admin/articles/update" 
            method="POST"
            className="bg-white/5 rounded-xl p-6"
          >
            <input type="hidden" name="articleId" value={article.id} />
            <h2 className="text-xl font-semibold mb-4">Article Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={article.status}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white/80"
                >
                  <option value="pending">Pending</option>
                  <option value="in review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Admin Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white/80"
                  placeholder="Add notes about this article..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Update Article
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
