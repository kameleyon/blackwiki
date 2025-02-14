import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { FiEdit, FiTrash2, FiEye, FiList, FiFilePlus, FiSliders, FiUser, FiSettings, FiLogOut } from 'react-icons/fi'
import { ArticleStatus } from '@/types/index'

type Article = {
  id: string
  title: string
  slug: string
  status: ArticleStatus
  views: number
  createdAt: Date
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  const articles = await prisma.article.findMany({
    where: {
      authorId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-semibold pl-4">My Articles</h1>
      </div>
        <div className="flex items-center gap-6 mb-8">
        <input
          type="search"
          placeholder="Search articles..."
          className="w-40 search-input flex-1 px-4 py-1 border rounded-lg"
        />
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-200 font-medium">
            <FiList size={20} />
            <span>Articles</span>
          </Link>
          <Link href="/articles/new" className="flex items-center gap-2 text-gray-600 hover:text-gray-200">
            <FiFilePlus size={20} />
            <span>Add New</span>
          </Link>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-200">
            <FiSliders size={20} />
            <span>Filter</span>
          </button>
          <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-200">
            <FiUser size={20} />
            <span>My profile</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-2 text-gray-600 hover:text-gray-200">
            <FiSettings size={20} />
            <span>Settings</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-200">
            <FiLogOut size={20} />
            <span>Log out</span>
          </Link>
        </div>
        
    

      {/* Articles list */}
      <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
        <div className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr,0.5fr] gap-4 p-4 text-white/80 font-semibold border-b border-gray-700">
          <div>Date & Time</div>
          <div>Title</div>
          <div>Status</div>
          <div>Views</div>
          <div>Likes</div>
          <div>Actions</div>
        </div>
        
        {articles.map((article) => (
          <div key={article.id} className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr,0.5fr] gap-4 p-4 border-b hover:bg-gray-50">
            <div className="text-sm text-gray-600">
              {new Date(article.createdAt).toLocaleString()}
            </div>
            <div className="font-medium">{article.title}</div>
            <div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                (article.status as ArticleStatus) === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : (article.status as ArticleStatus) === 'in review'
                  ? 'bg-yellow-100 text-yellow-800'
                  : (article.status as ArticleStatus) === 'denied'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {(article.status as ArticleStatus) === 'approved' 
                  ? 'Approved' 
                  : (article.status as ArticleStatus) === 'in review'
                  ? 'In Review'
                  : (article.status as ArticleStatus) === 'denied'
                  ? 'Denied'
                  : 'Pending'}
              </span>
            </div>
            <div>{article.views}</div>
            <div>0</div>
            <div className="flex gap-2">
              <Link href={`/articles/${article.slug}`} className="text-blue-600 hover:text-blue-800">
                <FiEye size={18} />
              </Link>
              <Link href={`/articles/${article.slug}/edit`} className="text-gray-600 hover:text-gray-800">
                <FiEdit size={18} />
              </Link>
              <button className="text-red-600 hover:text-red-800">
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No articles yet. Click "Create Article" to get started.
          </div>
        )}
      </div>
    </div>
  )
}
