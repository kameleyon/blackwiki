import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import UserNav from '@/components/user/UserNav'
import Link from 'next/link'
import { FiEdit } from 'react-icons/fi'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  const articles = await prisma.article.findMany({
    where: { authorId: user.id }
  })

  const totalLikes = 0 // TODO: Add likes to articles model

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex justify-between items-center mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold pl-2 sm:pl-4">Profile</h1>
      </div>
      <UserNav currentPath="/profile" />

      <div>
        <div className="bg-white/5 rounded-xl shadow-sm shadow-black p-4 sm:p-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-700 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-medium text-gray-200">{user.name}</h2>
                <Link href="/profile/edit" className="text-gray-400 hover:text-gray-200">
                  <FiEdit size={20} />
                </Link>
              </div>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 mt-2">Member since {new Date(user.joinedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-400">Articles</p>
              <p className="text-2xl font-medium text-gray-200">{articles.length}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-400">Total Likes</p>
              <p className="text-2xl font-medium text-gray-200">{totalLikes}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-400">Role</p>
              <p className="text-2xl font-medium text-gray-200">{user.role}</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-200 mb-2">About</h3>
              <p className="text-sm sm:text-base text-gray-400">{user.bio || 'No bio provided yet.'}</p>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-200 mb-2">Location</h3>
              <p className="text-sm sm:text-base text-gray-400">{user.location || 'Not specified'}</p>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-200 mb-2">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {user.expertise ? (
                  user.expertise.split(',').map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-white/10 rounded-md text-sm text-gray-200">
                      {tag.trim()}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No areas of expertise specified</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-200 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {user.interests ? (
                  user.interests.split(',').map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-white/10 rounded-md text-sm text-gray-200">
                      {tag.trim()}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No interests specified</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-200 mb-2">Contact</h3>
              <div className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400">
                {user.website && (
                  <p>Website: <a href={user.website} className="text-blue-400 hover:underline">{user.website}</a></p>
                )}
                {user.wecherp && <p>Wecherp: {user.wecherp}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
