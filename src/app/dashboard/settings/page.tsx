import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { 
  FiLayout, 
  FiGrid, 
  FiList, 
  FiColumns, 
  FiEye, 
  FiEyeOff, 
  FiCheck,
  FiArrowLeft
} from 'react-icons/fi';
import DashboardNav from '@/components/dashboard/DashboardNav';
import GreetingHeader from '@/components/dashboard/GreetingHeader';

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }
  
  // Calculate statistics for the greeting header
  const totalArticles = await prisma.article.count({
    where: { authorId: user.id }
  });
  
  const publishedArticles = await prisma.article.count({
    where: { 
      authorId: user.id,
      isPublished: true
    }
  });

  // Mock dashboard preferences
  // In a real implementation, these would be stored in the database
  const dashboardPreferences = {
    layout: 'standard', // standard, compact, expanded
    showStatistics: true,
    showRecommendations: true,
    showActivityTimeline: true,
    showNotifications: true,
    primaryColor: 'default' // default, gray, white
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Personalized Header */}
      <GreetingHeader 
        user={user} 
        totalArticles={totalArticles} 
        publishedArticles={publishedArticles} 
        pageName="Dashboard Settings"
      />
      
      <DashboardNav />
      
      <div className="bg-white/5 rounded-xl shadow-sm shadow-black p-6 mb-6">
        <p className="text-gray-400 mb-6">
          Customize your dashboard experience by adjusting the settings below. These preferences are specific to your account and won&apos;t affect other users.
        </p>
        
        {/* Layout Options */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`border rounded-xl p-4 ${dashboardPreferences.layout === 'standard' ? 'border-white/40 bg-white/10' : 'border-white/10 hover:border-white/20'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiGrid size={18} />
                  <h3 className="font-medium">Standard</h3>
                </div>
                {dashboardPreferences.layout === 'standard' && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <FiCheck size={12} />
                  </div>
                )}
              </div>
              <div className="bg-white/5 rounded-lg p-2 mb-2 h-24 flex flex-col">
                <div className="w-full h-4 bg-white/10 rounded mb-2"></div>
                <div className="flex-1 flex gap-2">
                  <div className="w-2/3 bg-white/10 rounded"></div>
                  <div className="w-1/3 bg-white/10 rounded"></div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Balanced layout with main content and sidebar
              </p>
            </div>
            
            <div className={`border rounded-xl p-4 ${dashboardPreferences.layout === 'compact' ? 'border-white/40 bg-white/10' : 'border-white/10 hover:border-white/20'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiList size={18} />
                  <h3 className="font-medium">Compact</h3>
                </div>
                {dashboardPreferences.layout === 'compact' && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <FiCheck size={12} />
                  </div>
                )}
              </div>
              <div className="bg-white/5 rounded-lg p-2 mb-2 h-24 flex flex-col">
                <div className="w-full h-4 bg-white/10 rounded mb-2"></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="w-full h-4 bg-white/10 rounded"></div>
                  <div className="w-full h-4 bg-white/10 rounded"></div>
                  <div className="w-full h-4 bg-white/10 rounded"></div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Streamlined layout with focus on content
              </p>
            </div>
            
            <div className={`border rounded-xl p-4 ${dashboardPreferences.layout === 'expanded' ? 'border-white/40 bg-white/10' : 'border-white/10 hover:border-white/20'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiColumns size={18} />
                  <h3 className="font-medium">Expanded</h3>
                </div>
                {dashboardPreferences.layout === 'expanded' && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <FiCheck size={12} />
                  </div>
                )}
              </div>
              <div className="bg-white/5 rounded-lg p-2 mb-2 h-24 flex flex-col">
                <div className="w-full h-4 bg-white/10 rounded mb-2"></div>
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div className="bg-white/10 rounded"></div>
                  <div className="bg-white/10 rounded"></div>
                  <div className="bg-white/10 rounded"></div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Full-width layout with multiple columns
              </p>
            </div>
          </div>
        </div>
        
        {/* Content Visibility */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Content Visibility</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <FiGrid size={16} />
                </div>
                <div>
                  <h3 className="font-medium">Statistics</h3>
                  <p className="text-xs text-gray-500">Show article and engagement metrics</p>
                </div>
              </div>
              <button className={`w-12 h-6 rounded-full relative ${dashboardPreferences.showStatistics ? 'bg-white/40' : 'bg-white/10'}`}>
                <span className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all ${dashboardPreferences.showStatistics ? 'left-7' : 'left-0.5'}`}></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <FiList size={16} />
                </div>
                <div>
                  <h3 className="font-medium">Recommendations</h3>
                  <p className="text-xs text-gray-500">Show personalized topic suggestions</p>
                </div>
              </div>
              <button className={`w-12 h-6 rounded-full relative ${dashboardPreferences.showRecommendations ? 'bg-white/40' : 'bg-white/10'}`}>
                <span className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all ${dashboardPreferences.showRecommendations ? 'left-7' : 'left-0.5'}`}></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <FiList size={16} />
                </div>
                <div>
                  <h3 className="font-medium">Activity Timeline</h3>
                  <p className="text-xs text-gray-500">Show your recent activities</p>
                </div>
              </div>
              <button className={`w-12 h-6 rounded-full relative ${dashboardPreferences.showActivityTimeline ? 'bg-white/40' : 'bg-white/10'}`}>
                <span className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all ${dashboardPreferences.showActivityTimeline ? 'left-7' : 'left-0.5'}`}></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <FiList size={16} />
                </div>
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-xs text-gray-500">Show recent notifications</p>
                </div>
              </div>
              <button className={`w-12 h-6 rounded-full relative ${dashboardPreferences.showNotifications ? 'bg-white/40' : 'bg-white/10'}`}>
                <span className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all ${dashboardPreferences.showNotifications ? 'left-7' : 'left-0.5'}`}></span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Color Theme */}
        <div>
          <h2 className="text-lg font-medium mb-4">Color Theme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`border rounded-xl p-4 ${dashboardPreferences.primaryColor === 'default' ? 'border-white/40 bg-white/10' : 'border-white/10 hover:border-white/20'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Default</h3>
                {dashboardPreferences.primaryColor === 'default' && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <FiCheck size={12} />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/40"></div>
                <div className="w-8 h-8 rounded-full bg-white/20"></div>
                <div className="w-8 h-8 rounded-full bg-white/10"></div>
              </div>
            </div>
            
            <div className={`border rounded-xl p-4 ${dashboardPreferences.primaryColor === 'gray' ? 'border-white/40 bg-white/10' : 'border-white/10 hover:border-white/20'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Gray</h3>
                {dashboardPreferences.primaryColor === 'gray' && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <FiCheck size={12} />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-400"></div>
                <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                <div className="w-8 h-8 rounded-full bg-gray-800"></div>
              </div>
            </div>
            
            <div className={`border rounded-xl p-4 ${dashboardPreferences.primaryColor === 'white' ? 'border-white/40 bg-white/10' : 'border-white/10 hover:border-white/20'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">White</h3>
                {dashboardPreferences.primaryColor === 'white' && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <FiCheck size={12} />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-white"></div>
                <div className="w-8 h-8 rounded-full bg-white/60"></div>
                <div className="w-8 h-8 rounded-full bg-white/30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
