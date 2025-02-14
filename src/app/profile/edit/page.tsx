'use client';

import { getCurrentUser } from '@/lib/auth'
import { redirect, useRouter } from 'next/navigation'
import { prisma } from '@/lib/db'
import UserNav from '@/components/user/UserNav'
import Link from 'next/link'
import TagInput from '@/components/ui/TagInput'
interface EditProfilePageProps {
  searchParams?: { 
    error?: string;
    message?: string;
  }
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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex justify-between items-center mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold pl-2 sm:pl-4">Edit Profile</h1>
      </div>
      <UserNav currentPath="/profile" />

      <div>
        <div className="bg-white/5 rounded-xl shadow-sm shadow-black p-4 sm:p-8">
          {searchParams?.error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {searchParams.message === 'name-required' 
                ? 'Name is required to update your profile.'
                : 'Failed to update profile. Please try again.'}
            </div>
          )}
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-700 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-medium text-gray-200">{user.name}</h2>
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

          {/* Edit Form */}
          <form 
            className="space-y-4 sm:space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const response = await fetch('/api/profile/update', {
                method: 'POST',
                body: formData,
              });
              
              if (response.ok) {
                window.location.href = '/profile';
              } else {
                window.location.href = '/profile/edit?error=true';
              }
            }}
          >
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

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
              <Link 
                href="/profile"
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm sm:text-base font-medium rounded-lg transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base font-medium rounded-lg transition-colors"
                formNoValidate
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
