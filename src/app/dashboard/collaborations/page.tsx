import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { 
  FiEdit, 
  FiEye, 
  FiMessageSquare, 
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiPlus
} from 'react-icons/fi';
import DashboardNav from '@/components/dashboard/DashboardNav';
import GreetingHeader from '@/components/dashboard/GreetingHeader';

export default async function CollaborationsPage() {
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

  // In a real implementation, we would fetch the user's collaborations from the database
  // For now, we'll use mock data
  const activeCollaborations = [
    {
      id: '1',
      title: 'The Harlem Renaissance',
      status: 'in progress',
      collaborators: [
        { id: '1', name: 'Maya Johnson', image: '/uploads/user1.jpg', role: 'Editor' },
        { id: '2', name: 'James Wilson', image: '/uploads/user2.jpg', role: 'Contributor' },
        { id: '3', name: 'Sarah Thompson', image: '/uploads/user3.jpg', role: 'Reviewer' }
      ],
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      progress: 75
    },
    {
      id: '2',
      title: 'African Diaspora',
      status: 'in progress',
      collaborators: [
        { id: '1', name: 'Maya Johnson', image: '/uploads/user1.jpg', role: 'Contributor' },
        { id: '4', name: 'Robert Davis', image: '/uploads/user4.jpg', role: 'Editor' }
      ],
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      progress: 45
    }
  ];

  const invitations = [
    {
      id: '1',
      title: 'Soul Music Origins',
      invitedBy: 'James Brown',
      role: 'Contributor',
      invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
      id: '2',
      title: 'Black Cinema History',
      invitedBy: 'Lisa Johnson',
      role: 'Reviewer',
      invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    }
  ];

  const completedCollaborations = [
    {
      id: '3',
      title: 'Civil Rights Movement',
      status: 'completed',
      collaborators: [
        { id: '1', name: 'Maya Johnson', image: '/uploads/user1.jpg', role: 'Contributor' },
        { id: '5', name: 'David Johnson', image: '/uploads/user5.jpg', role: 'Editor' },
        { id: '6', name: 'Michael Smith', image: '/uploads/user6.jpg', role: 'Reviewer' }
      ],
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) // 14 days ago
    },
    {
      id: '4',
      title: 'Jazz and Blues: Origins',
      status: 'completed',
      collaborators: [
        { id: '1', name: 'Maya Johnson', image: '/uploads/user1.jpg', role: 'Editor' },
        { id: '7', name: 'Thomas Wilson', image: '/uploads/user7.jpg', role: 'Contributor' }
      ],
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) // 30 days ago
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      {/* Personalized Header */}
      <GreetingHeader 
        user={user} 
        totalArticles={totalArticles} 
        publishedArticles={publishedArticles} 
        pageName="Collaborations"
      />
      
      <DashboardNav />
      
      {/* Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white/5 rounded-xl shadow-sm shadow-black mb-8">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium">Collaboration Invitations</h2>
          </div>
          
          <div>
            {invitations.map(invitation => (
              <div key={invitation.id} className="p-4 border-b border-gray-800 hover:bg-black/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-medium mb-1">{invitation.title}</h3>
                    <p className="text-sm text-gray-400">
                      Invited by {invitation.invitedBy} to join as {invitation.role} • {formatRelativeTime(invitation.invitedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                      Accept
                    </button>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Active Collaborations */}
      <div className="bg-white/5 rounded-xl shadow-sm shadow-black mb-8">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-medium">Active Collaborations</h2>
          <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <FiPlus size={16} />
            <span>New Collaboration</span>
          </button>
        </div>
        
        {activeCollaborations.length > 0 ? (
          <div>
            {activeCollaborations.map(collab => (
              <div key={collab.id} className="p-4 border-b border-gray-800 hover:bg-black/30">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-medium mb-1">{collab.title}</h3>
                    <div className="flex items-center text-xs text-gray-400">
                      <FiClock size={12} className="mr-1" />
                      <span>Last activity: {formatRelativeTime(collab.lastActivity)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/articles/${collab.id}`}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                      title="View Article"
                    >
                      <FiEye size={16} />
                    </Link>
                    <Link 
                      href={`/articles/edit/${collab.id}`}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                      title="Edit Article"
                    >
                      <FiEdit size={16} />
                    </Link>
                    <button 
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                      title="Discussion"
                    >
                      <FiMessageSquare size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span>{collab.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div 
                        className="bg-white/40 h-1.5 rounded-full" 
                        style={{ width: `${collab.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                      {collab.collaborators.slice(0, 3).map((collaborator) => (
                        <div 
                          key={collaborator.id}
                          className="w-8 h-8 rounded-full bg-white/20 border-2 border-black flex items-center justify-center text-xs"
                          title={`${collaborator.name} (${collaborator.role})`}
                        >
                          {collaborator.name.charAt(0)}
                        </div>
                      ))}
                      {collab.collaborators.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-xs">
                          +{collab.collaborators.length - 3}
                        </div>
                      )}
                    </div>
                    <button className="text-xs text-gray-400 hover:text-white">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No active collaborations. Click &quot;New Collaboration&quot; to get started.
          </div>
        )}
      </div>
      
      {/* Completed Collaborations */}
      <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-medium">Completed Collaborations</h2>
        </div>
        
        {completedCollaborations.length > 0 ? (
          <div>
            {completedCollaborations.map(collab => (
              <div key={collab.id} className="p-4 border-b border-gray-800 hover:bg-black/30">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{collab.title}</h3>
                      <span className="flex items-center text-xs text-gray-400">
                        <FiCheckCircle size={12} className="mr-1" />
                        <span>Completed</span>
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <FiCalendar size={12} className="mr-1" />
                      <span>Completed on {collab.completedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/articles/${collab.id}`}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                      title="View Article"
                    >
                      <FiEye size={16} />
                    </Link>
                    <div className="flex -space-x-2">
                      {collab.collaborators.slice(0, 3).map((collaborator) => (
                        <div 
                          key={collaborator.id}
                          className="w-6 h-6 rounded-full bg-white/20 border-2 border-black flex items-center justify-center text-xs"
                          title={`${collaborator.name} (${collaborator.role})`}
                        >
                          {collaborator.name.charAt(0)}
                        </div>
                      ))}
                      {collab.collaborators.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-xs">
                          +{collab.collaborators.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No completed collaborations yet.
          </div>
        )}
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
