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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4">Profile</h1>
      </div>
      <UserNav currentPath="/profile" />

      <div>
        <div className="bg-white/5 rounded-xl shadow-sm shadow-black p-8">
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-3xl">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-medium text-gray-200">{user.name}</h2>
                <Link href="/profile/edit" className="text-gray-400 hover:text-gray-200">
                  <FiEdit size={20} />
                </Link>
              </div>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 mt-2">Member since {new Date(user.joinedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-200 mb-2">About</h3>
              <p className="text-gray-400">{user.bio || 'No bio provided yet.'}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-200 mb-2">Location</h3>
              <p className="text-gray-400">{user.location || 'Not specified'}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-200 mb-2">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
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
              <h3 className="text-lg font-medium text-gray-200 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
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
              <h3 className="text-lg font-medium text-gray-200 mb-2">Contact</h3>
              <div className="space-y-2 text-gray-400">
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
