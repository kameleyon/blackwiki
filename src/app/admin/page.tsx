import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import { FiUsers, FiFileText, FiFlag, FiActivity } from "react-icons/fi";

async function getAdminStats() {
  const [totalUsers, totalArticles, pendingArticles, totalReports] = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.article.count({
      where: { status: "pending" }
    }),
    prisma.article.count({
      where: { status: "reported" }
    })
  ]);

  const recentActivity = await prisma.article.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      author: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return {
    totalUsers,
    totalArticles,
    pendingArticles,
    totalReports,
    recentActivity
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get user role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  const stats = await getAdminStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4">Admin Dashboard</h1>
      </div>

      <AdminNav />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Users</p>
              <h3 className="text-2xl font-semibold mt-1">{stats.totalUsers}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <FiUsers className="w-6 h-6 text-white/80" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Articles</p>
              <h3 className="text-2xl font-semibold mt-1">{stats.totalArticles}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <FiFileText className="w-6 h-6 text-white/80" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Pending Reviews</p>
              <h3 className="text-2xl font-semibold mt-1">{stats.pendingArticles}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <FiActivity className="w-6 h-6 text-white/80" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Reports</p>
              <h3 className="text-2xl font-semibold mt-1">{stats.totalReports}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <FiFlag className="w-6 h-6 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {stats.recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{activity.title}</h3>
                <p className="text-sm text-white/60">
                  by {activity.author.name} ({activity.author.email})
                </p>
              </div>
              <div className="text-sm text-white/60">
                {new Date(activity.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
