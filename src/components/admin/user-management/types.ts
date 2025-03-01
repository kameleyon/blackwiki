export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'banned';
  joinedAt: Date;
  lastActive: Date;
  articleCount: number;
  contributionCount: number;
  warningCount: number;
  profileImage?: string;
}

export interface UserManagementProps {
  users: User[];
  totalCount: number;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  onStatusChange: (userId: string, newStatus: string) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onSendWarning: (userId: string, message: string) => Promise<void>;
}

export const statusColors = {
  active: 'bg-green-500/20 text-green-300',
  suspended: 'bg-yellow-500/20 text-yellow-300',
  banned: 'bg-red-500/20 text-red-300'
};

export const roleColors = {
  user: 'bg-blue-500/20 text-blue-300',
  moderator: 'bg-purple-500/20 text-purple-300',
  admin: 'bg-orange-500/20 text-orange-300'
};
