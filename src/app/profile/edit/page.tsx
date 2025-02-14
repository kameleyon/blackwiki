import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import UserNav from '@/components/user/UserNav'
import Link from 'next/link'
import TagInput from '@/components/ui/TagInput'

interface EditProfilePageProps {
  searchParams?: { error?: string }
}

export default async function EditProfilePage({ searchParams }: EditProfilePageProps) {
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
        <h1 className="text-2xl font-semibold pl-4">Edit Profile</h1>
      </div>
      <UserNav currentPath="/profile" />

      <div>
        <div className="bg-white/5 rounded-xl shadow-sm shadow-black p-8">
          {searchParams?.error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              Failed to update profile. Please try again.
            </div>
          )}
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-3xl">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-medium text-gray-200">{user.name}</h2>
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

          {/* Edit Form */}
          <form action="/api/profile/update" method="POST" className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={user.name || ''}
                className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-400"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-200 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={user.bio || ''}
                className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-400"
                placeholder="Tell us about yourself"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-200 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                defaultValue={user.location || ''}
                className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-400"
                placeholder="Where are you based?"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-200 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                defaultValue={user.website || ''}
                className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-400"
                placeholder="Your personal website"
              />
            </div>

            <div>
              <label htmlFor="wecherp" className="block text-sm font-medium text-gray-200 mb-1">
                Wecherp
              </label>
              <input
                type="text"
                id="wecherp"
                name="wecherp"
                defaultValue={user.wecherp || ''}
                className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-400"
                placeholder="Your Wecherp username"
              />
            </div>

            <TagInput
              id="expertise"
              name="expertise"
              label="Areas of Expertise"
              placeholder="What topics are you knowledgeable about? (Press Enter or comma to add)"
              defaultValue={user.expertise || ''}
            />

            <TagInput
              id="interests"
              name="interests"
              label="Interests"
              placeholder="What topics interest you? (Press Enter or comma to add)"
              defaultValue={user.interests || ''}
            />

            <div className="flex justify-end gap-4">
              <Link 
                href="/profile"
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
