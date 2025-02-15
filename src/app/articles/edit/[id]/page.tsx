/* eslint-disable @typescript-eslint/no-explicit-any */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { NewArticleForm } from "@/components/articles/NewArticleForm";
import UserNav from "@/components/user/UserNav";

/**
 * Final workaround for the Next.js 15 type conflict:
 * We disable the no-explicit-any rule in this file to sidestep
 * Next.js's usage of Promise<any> in dynamic route param checks.
 * This file is otherwise the same as before, just ignoring the ESLint rule.
 */
export default async function EditArticlePage(props: any) {
  const { params } = props;

  if (!params?.id) {
    redirect("/dashboard");
    return null;
  }

  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/auth/signin");
    return null;
  }

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
      id: params.id,
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
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4 mb-4">Edit Article</h1>
      </div>
      <UserNav currentPath="/articles/edit" />

      <div className="max-w-4xl mx-auto">
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
