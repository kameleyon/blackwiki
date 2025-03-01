import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { NewArticleForm } from "@/components/articles/NewArticleForm";
import UserNav from "@/components/user/UserNav";
import { getCurrentUser } from "@/lib/auth";
import GreetingHeader from "@/components/dashboard/GreetingHeader";
import { Metadata } from "next";

// Define the params type
interface PageProps {
  params: {
    id: string;
  };
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Safely access the ID
  const id = params.id;
  
  try {
    // Get article title for metadata
    const article = await prisma.article.findUnique({
      where: { id },
      select: { title: true },
    });
    
    return {
      title: article ? `Edit: ${article.title} | AfroWiki` : 'Edit Article | AfroWiki',
      description: 'Edit your article on AfroWiki',
    };
  } catch {
    // Ignore error and return default metadata
    return {
      title: 'Edit Article | AfroWiki',
      description: 'Edit your article on AfroWiki',
    };
  }
}

export default async function EditArticlePage({ params }: PageProps) {
  // Safely access the ID
  const id = params.id;
  
  if (!id) {
    redirect("/dashboard");
    return null;
  }

  const session = await getServerSession();
  const currentUser = await getCurrentUser();
  
  if (!session?.user?.email || !currentUser) {
    redirect("/auth/signin");
    return null;
  }
  
  // Calculate statistics for the greeting header
  const totalArticles = await prisma.article.count({
    where: { authorId: currentUser.id }
  });
  
  const publishedArticles = await prisma.article.count({
    where: { 
      authorId: currentUser.id,
      isPublished: true
    }
  });

  // Get user ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    redirect("/auth/signin");
    return null;
  }

  // Get article with user check
  const article = await prisma.article.findUnique({
    where: {
      id: id, // Use the awaited id
      authorId: user.id,
    },
    include: {
      categories: true,
      tags: true,
    },
  });

  if (!article) {
    redirect("/dashboard");
    return null;
  }

  // Get all categories
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      {/* Personalized Header */}
      <GreetingHeader 
        user={currentUser} 
        totalArticles={totalArticles} 
        publishedArticles={publishedArticles} 
        pageName="Edit Article"
      />
      
      <UserNav currentPath="/articles/edit" />

      <div className="max-w-8xl mx-auto">
        <NewArticleForm
          categories={categories}
          editMode={true}
          article={{
            id: article.id,
            title: article.title,
            content: article.content,
            summary: article.summary,
            image: article.image,
            imageAlt: article.imageAlt,
            categories: article.categories.map((c) => c.id),
            tags: article.tags.map((t) => t.name),
          }}
        />
      </div>
    </div>
  );
}
