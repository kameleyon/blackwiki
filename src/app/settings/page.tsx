import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import UserNav from "@/components/user/UserNav";
import { ProfileSettingsForm } from "@/components/user/ProfileSettingsForm";
import { AccountSettingsForm } from "@/components/user/AccountSettingsForm";
import { getCurrentUser } from "@/lib/auth";
import GreetingHeader from "@/components/dashboard/GreetingHeader";

export default async function SettingsPage() {
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      location: true,
      website: true,
      wecherp: true,
      expertise: true,
      interests: true,
      image: true,
    }
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      {/* Personalized Header */}
      <GreetingHeader 
        user={currentUser} 
        totalArticles={totalArticles} 
        publishedArticles={publishedArticles} 
        pageName="Settings"
      />
      
      <UserNav currentPath="/settings" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Left Column - Profile Settings */}
        <div>
          <ProfileSettingsForm user={user} />
        </div>

        {/* Right Column - Account Settings */}
        <div>
          <AccountSettingsForm user={user} />
        </div>
      </div>
    </div>
  );
}
