import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import { FiMail, FiCalendar, FiUser } from "react-icons/fi";

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: {
      joinedAt: "desc"
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      joinedAt: true,
      articles: {
        select: {
          id: true
        }
      }
    }
  });
}

export default async function AdminUsersPage() {
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

  const users = await getUsers();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4">User Management</h1>
      </div>

      <AdminNav />

      {/* Users List */}
      <div className="bg-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr,1.5fr,1fr,1fr,1fr] gap-4 p-4 text-sm font-medium text-white/80 border-b border-white/10">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Articles</div>
          <div>Joined</div>
        </div>

        <div className="divide-y divide-white/10">
          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1fr,1.5fr,1fr,1fr,1fr] gap-4 p-4 items-center hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-white/60" />
                <span className="font-medium">{user.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-white/60" />
                <span className="text-white/80">{user.email}</span>
              </div>

              <div>
                <span className={`px-2 py-1 rounded-full text-xs
                  ${user.role === 'admin' 
                    ? 'bg-white/20 text-white' 
                    : user.role === 'editor'
                    ? 'bg-white/10 text-white/80'
                    : 'bg-white/5 text-white/60'
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <div className="text-white/60">
                {user.articles.length} articles
              </div>

              <div className="flex items-center gap-2 text-white/60">
                <FiCalendar className="w-4 h-4" />
                <span>{new Date(user.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
