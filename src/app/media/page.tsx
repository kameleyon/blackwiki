import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MediaLibrary from "@/components/media/MediaLibrary";
import MediaOrganizer from "@/components/media/MediaOrganizer";
import UserNav from "@/components/user/UserNav";
import { FiImage, FiFolder } from "react-icons/fi";

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
        <h1 className="text-2xl font-semibold pl-4 mb-4 flex items-center">
          <FiFolder className="mr-2" />
          Media Library
        </h1>
      </div>
      <UserNav currentPath="/media" />
      
      <div className="mt-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
              <FiImage className="mr-2" />
              Manage Your Media
            </h2>
            <p className="text-white/70">
              Upload, organize, and manage your media files. Drag and drop files to upload, create folders to organize your content, 
              and use the search and filter options to find what you need quickly.
            </p>
          </div>
          
          {/* Media Organization */}
          <MediaOrganizer />
          
          {/* Media Library */}
          <MediaLibrary />
        </div>
      </div>
    </div>
  );
}
