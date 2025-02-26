import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { 
  FiEye, 
  FiBookmark, 
  FiClock,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList
} from 'react-icons/fi';
import DashboardNav from '@/components/dashboard/DashboardNav';
import GreetingHeader from '@/components/dashboard/GreetingHeader';

export default async function SavedArticlesPage() {
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

  // In a real implementation, we would fetch the user's saved articles from the database
  // For now, we'll use mock data
  const savedArticles = [
    {
      id: '1',
      title: 'The Harlem Renaissance',
      summary: 'An intellectual and cultural revival of African American music, dance, art, fashion, literature, theater, and politics centered in Harlem, New York City, in the 1920s.',
      author: 'Maya Johnson',
      category: 'History',
      savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      image: '/uploads/harlem-renaissance.jpg'
    },
    {
      id: '2',
      title: 'African Diaspora',
      summary: 'The worldwide collection of communities descended from native Africans or people from Africa, predominantly in the Americas.',
      author: 'James Wilson',
      category: 'Culture',
      savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      image: '/uploads/african-diaspora.jpg'
    },
    {
      id: '3',
      title: 'Jazz and Blues: Origins and Evolution',
      summary: 'Exploring the roots and development of Jazz and Blues music and their profound impact on American culture.',
      author: 'Robert Davis',
      category: 'Music',
      savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      image: '/uploads/jazz-blues.jpg'
    },
    {
      id: '4',
      title: 'Civil Rights Movement',
      summary: 'A decades-long struggle by African Americans to end legalized racial discrimination, disenfranchisement, and racial segregation in the United States.',
      author: 'Sarah Thompson',
      category: 'History',
      savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
      image: '/uploads/civil-rights.jpg'
    },
    {
      id: '5',
      title: 'Black Literature in the 20th Century',
      summary: 'An exploration of influential Black authors and literary movements throughout the 20th century.',
      author: 'David Johnson',
      category: 'Literature',
      savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      image: '/uploads/black-literature.jpg'
    }
  ];

  // Mock collections for organizing saved articles
  const collections = [
    { id: '1', name: 'Research', count: 12 },
    { id: '2', name: 'To Read Later', count: 8 },
    { id: '3', name: 'Favorites', count: 5 },
    { id: '4', name: 'History', count: 7 },
    { id: '5', name: 'Music', count: 3 }
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      {/* Personalized Header */}
      <GreetingHeader 
        user={user} 
        totalArticles={totalArticles} 
        publishedArticles={publishedArticles} 
        pageName="Saved Articles"
      />
      
      <DashboardNav />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Collections */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 rounded-xl shadow-sm shadow-black overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">Collections</h2>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                  <span>New Collection</span>
                  <span className="text-lg">+</span>
                </button>
                <button className="text-sm text-gray-400 hover:text-white">
                  Edit
                </button>
              </div>
              
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-2 rounded-lg bg-white/10 text-white">
                  <span>All Saved</span>
                  <span className="text-sm text-gray-400">{savedArticles.length}</span>
                </button>
                
                {collections.map(collection => (
                  <button 
                    key={collection.id}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                  >
                    <span>{collection.name}</span>
                    <span className="text-sm">{collection.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content - Saved Articles */}
        <div className="lg:col-span-3">
          {/* Search and Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="search" 
                placeholder="Search saved articles..." 
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                <FiFilter size={18} />
              </button>
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                <FiGrid size={18} />
              </button>
              <button className="p-2 bg-white/10 rounded-lg text-white">
                <FiList size={18} />
              </button>
            </div>
          </div>
          
          {/* Articles List */}
          <div className="space-y-4">
            {savedArticles.map(article => (
              <div key={article.id} className="bg-white/5 rounded-xl shadow-sm shadow-black overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Article Image (hidden on small screens) */}
                  <div className="hidden md:block md:w-1/4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50"></div>
                    <div className="h-full bg-white/10"></div>
                  </div>
                  
                  {/* Article Content */}
                  <div className="p-4 md:p-6 md:w-3/4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          By {article.author}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <FiClock size={12} className="mr-1" />
                        <span>Saved {formatRelativeTime(article.savedAt)}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {article.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/articles/${article.id}`}
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                      >
                        <FiEye size={14} />
                        <span>Read Article</span>
                      </Link>
                      
                      <div className="flex items-center gap-3">
                        <button className="text-white/60 hover:text-white/80">
                          <FiBookmark size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white">
                &lt;
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 text-white">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white">
                3
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white">
                &gt;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format relative time
function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
}
