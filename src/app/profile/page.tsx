// Use dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { FiEdit2, FiGlobe, FiTwitter } from "react-icons/fi";
import UserNav from "@/components/user/UserNav";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { getCurrentUser } from "@/lib/auth";
import GreetingHeader from "@/components/dashboard/GreetingHeader";

export default async function ProfilePage() {
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

  const userProfile = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      bio: true,
      location: true,
      website: true,
      wecherp: true,
      expertise: true,
      interests: true,
      joinedAt: true,
      image: true,
      articles: {
        select: { id: true }
      }
    }
  });

  if (!userProfile) {
    redirect("/auth/signin");
  }

  const expertiseTags = userProfile.expertise ? userProfile.expertise.split(",").map((tag: string) => tag.trim()) : [];
  const interestTags = userProfile.interests ? userProfile.interests.split(",").map((tag: string) => tag.trim()) : [];

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      {/* Personalized Header */}
      <GreetingHeader 
        user={currentUser} 
        totalArticles={totalArticles} 
        publishedArticles={publishedArticles} 
        pageName="My Profile"
      />
      
      <UserNav currentPath="/profile" />
      
      <div className="max-w-8xl mx-auto bg-white/5 rounded-xl shadow-md p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-32 h-32 rounded-full bg-black/30 overflow-hidden">
              {userProfile.image ? (
              <div className="relative w-full h-full">
                <Image 
                  src={userProfile.image || "/default-avatar.png"}
                  alt={`${userProfile.name}'s profile picture`}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  {userProfile.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-normal text-gray-100 flex items-center gap-3">
                {userProfile.name}
                <Link 
                  href="/settings"
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <FiEdit2 size={20} />
                </Link>
              </h1>
              <p className="text-gray-400">{userProfile.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(userProfile.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="text-center bg-black/30 rounded-lg px-4 py-2">
            <div className="text-2xl font-bold text-gray-100">
              {userProfile.articles.length}
            </div>
            <div className="text-sm text-gray-400">Articles</div>
          </div>
        </div>

        <div className="space-y-6">
          {userProfile.bio && (
            <div>
              <h2 className="text-lg font-normal text-gray-200 mb-2">About</h2>
              <div className="text-white/70 font-light prose prose-invert prose-sm leading-loose max-w-none">
                <ReactMarkdown>{userProfile.bio}</ReactMarkdown>
              </div>
            </div>
          )}

          {userProfile.location && (
            <div>
              <h2 className="text-lg font-normal text-gray-200 mb-2">Location</h2>
              <p className="text-white/70 font-light">{userProfile.location}</p>
            </div>
          )}

          {expertiseTags.length > 0 && (
            <div>
              <h2 className="text-lg font-normal text-gray-200 mb-2">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {expertiseTags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {interestTags.length > 0 && (
            <div>
              <h2 className="text-lg font-normal text-gray-200 mb-2">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {interestTags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-normal text-gray-200 mb-2">Contact</h2>
            <div className="space-y-2">
              {userProfile.website && (
                <a 
                  href={userProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FiGlobe /> Website
                  </span>
                </a>
              )}
              {userProfile.wecherp && (
                <a 
                  href={`https://wecherp.com/${userProfile.wecherp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FiTwitter /> Wecherp
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
