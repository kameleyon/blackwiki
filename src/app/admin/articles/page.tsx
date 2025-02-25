import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import CleanMarkdownButton from "@/components/admin/CleanMarkdownButton";
import { FiEdit, FiEye, FiClock, FiUser } from "react-icons/fi";
import Link from "next/link";

async function getArticles() {
  return await prisma.article.findMany({
    orderBy: {
      updatedAt: "desc"
    },
    select: {
      id: true,
      title: true,
      status: true,
      views: true,
      updatedAt: true,
      author: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });
}

export default async function AdminArticlesPage() {
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

  const articles = await getArticles();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4">Article Management</h1>
        <div>
          <CleanMarkdownButton />
        </div>
      </div>

      <AdminNav />

      {/* Articles List */}
      <div className="bg-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 p-4 text-sm font-medium text-white/80 border-b border-white/10">
          <div>Title</div>
          <div>Author</div>
          <div>Status</div>
          <div>Views</div>
          <div>Last Updated</div>
        </div>

        <div className="divide-y divide-white/10">
          {articles.map((article) => (
            <div
              key={article.id}
              className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 p-4 items-center hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-medium">{article.title}</span>
                  <div className="flex gap-2 mt-1">
                    <Link 
                      href={`/articles/${article.id}`} 
                      className="text-xs text-white/60 hover:text-white/80 flex items-center gap-1"
                    >
                      <FiEye className="w-3 h-3" />
                      View
                    </Link>
                    <Link 
                      href={`/admin/articles/${article.id}/edit`} 
                      className="text-xs text-white/60 hover:text-white/80 flex items-center gap-1"
                    >
                      <FiEdit className="w-3 h-3" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-white/60" />
                <div className="flex flex-col">
                  <span className="text-white/80">{article.author.name}</span>
                  <span className="text-xs text-white/60">{article.author.email}</span>
                </div>
              </div>

              <div>
                <span className={`px-2 py-1 rounded-full text-xs
                  ${article.status === 'approved' 
                    ? 'bg-white/20 text-white' 
                    : article.status === 'in review'
                    ? 'bg-white/10 text-white/80'
                    : article.status === 'denied'
                    ? 'bg-red-500/20 text-red-200'
                    : 'bg-white/5 text-white/60'
                  }`}
                >
                  {article.status}
                </span>
              </div>

              <div className="text-white/60">
                {article.views} views
              </div>

              <div className="flex items-center gap-2 text-white/60">
                <FiClock className="w-4 h-4" />
                <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
