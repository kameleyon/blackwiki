import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MediaLibrary from "@/components/media/MediaLibrary";
import UserNav from "@/components/user/UserNav";

export const metadata = {
  title: "Media Library - AfroWiki",
  description: "Manage your media files for AfroWiki articles",
};

export default async function MediaPage() {
  // Check authentication
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4 mb-4">Media Library</h1>
      </div>
      <UserNav currentPath="/media" />
      
      <div className="mt-8">
        <div className="bg-white/5 rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Manage Your Media</h2>
            <p className="text-white/70">
              Upload, organize, and manage your media files. Drag and drop files to upload, create folders to organize your content, 
              and use the search and filter options to find what you need quickly.
            </p>
          </div>
          
          <MediaLibrary />
        </div>
      </div>
    </div>
  );
}
