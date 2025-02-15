import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import UserNav from "@/components/user/UserNav";
import { ProfileSettingsForm } from "@/components/user/ProfileSettingsForm";
import { AccountSettingsForm } from "@/components/user/AccountSettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

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
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4 mb-4">Settings</h1>
      </div>
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
