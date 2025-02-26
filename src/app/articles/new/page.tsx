import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import UserNav from "@/components/user/UserNav";
import { NewArticleForm } from "../../../components/articles/NewArticleForm";
import { getCurrentUser } from "@/lib/auth";
import GreetingHeader from "@/components/dashboard/GreetingHeader";

export default async function NewArticlePage() {
  const session = await getServerSession();
  const currentUser = await getCurrentUser();
  
  if (!session?.user?.email || !currentUser) {
    redirect("/auth/signin");
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

  // Fetch categories for the dropdown
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
        pageName="Add New Article"
      />
      
      <UserNav currentPath="/articles/new" />
      
      <div className="max-w-8xl mx-auto">
        <NewArticleForm 
          categories={categories}
        />
      </div>
    </div>
  );
}
