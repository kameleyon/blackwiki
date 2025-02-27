import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ContentOrganizer from "@/components/organization/ContentOrganizer";
import UserNav from "@/components/user/UserNav";
import { FiFolder, FiTag, FiLink } from "react-icons/fi";

export const metadata = {
  title: "Content Organization - AfroWiki",
  description: "Manage categories, tags, and content relationships for AfroWiki articles",
};

export default async function OrganizationPage() {
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
          Content Organization
        </h1>
      </div>
      <UserNav currentPath="/organization" />
      
      <div className="mt-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
              <FiTag className="mr-2" />
              Manage Content Structure
            </h2>
            <p className="text-white/70">
              Organize your content with categories, tags, and relationships. Create a structured knowledge base 
              that helps users discover related content and navigate through topics easily.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <FiLink className="text-white/80 mr-2" />
                <h3 className="text-lg font-medium text-white">Content Organization Benefits</h3>
              </div>
              <ul className="list-disc list-inside text-white/70 space-y-1 ml-2">
                <li>Improve content discoverability with proper categorization</li>
                <li>Create meaningful connections between related articles</li>
                <li>Build a hierarchical structure for your knowledge base</li>
                <li>Help users navigate through topics with intuitive organization</li>
                <li>Enhance search functionality with relevant tags</li>
              </ul>
            </div>
            
            {/* Content Organizer Component */}
            <ContentOrganizer />
          </div>
        </div>
      </div>
    </div>
  );
}
