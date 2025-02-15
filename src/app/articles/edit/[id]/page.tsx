import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import UserNav from "@/components/user/UserNav";
import { NewArticleForm } from "@/components/articles/NewArticleForm";

export default async function EditArticlePage({ 
  params 
}: { 
  params: { id: string } 
}) {
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

  // Get session and article data
  const [session, article] = await Promise.all([
    getServerSession(),
    prisma.article.findUnique({
      where: { 
        id: params.id,
      },
      include: {
        categories: true,
        tags: true,
      }
    }) as Promise<Article | null>
  ]);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get user ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user || !article || article.authorId !== user.id) {
    redirect("/dashboard");
  }

  // Fetch all categories for the dropdown
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Fetch all tags for autocomplete
  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4 mb-4">Edit Article</h1>
      </div>
      <UserNav currentPath="/articles/edit" />
      
      <div className="max-w-4xl mx-auto">
        <NewArticleForm 
          categories={categories}
          existingTags={tags}
          editMode={true}
          article={{
            id: article.id,
            title: article.title,
            content: article.content,
            summary: article.summary,
            image: article.image,
            imageAlt: article.imageAlt,
            categories: article.categories.map(c => c.id),
            tags: article.tags.map(t => t.name),
          }}
        />
      </div>
    </div>
  );
}
