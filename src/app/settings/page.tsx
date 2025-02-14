import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import UserNav from '@/components/user/UserNav'

export default async function SettingsPage() {
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
        <h1 className="text-2xl font-semibold pl-4">Settings</h1>
      </div>
      <UserNav currentPath="/settings" />

      <div className="grid grid-cols-[250px,1fr] gap-8">
        {/* User Stats */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl shadow-sm shadow-black p-6">
            <h2 className="text-lg font-medium text-gray-200 mb-4">User Stats</h2>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Member since {new Date(user.joinedAt).toLocaleDateString()}</p>
              <p>Posted {articles.length} articles</p>
              <p>Total {totalLikes} likes received</p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white/5 rounded-xl shadow-sm shadow-black p-6">
          <form action="/api/settings/update" method="POST" className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                defaultValue={user.name || ''}
                className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-400"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={user.email || ''}
                className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-400"
                placeholder="Enter your email"
              />
            </div>

            <div className="pt-6 border-t border-gray-700">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-200 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-400"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-200 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-400"
                    placeholder="Enter your new password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-400"
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
