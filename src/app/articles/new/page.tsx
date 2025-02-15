import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import UserNav from "@/components/user/UserNav";
import { NewArticleForm } from "../../../components/articles/NewArticleForm";

export default async function NewArticlePage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

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
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4 mb-4">Add New Article</h1>
      </div>
      <UserNav currentPath="/articles/new" />
      
      <div className="max-w-8xl mx-auto">
        <NewArticleForm 
          categories={categories}
        />
      </div>
    </div>
  );
}
