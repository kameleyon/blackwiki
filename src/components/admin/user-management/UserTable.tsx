"use client";

import { 
  FiUser, 
  FiEdit, 
  FiTrash2, 
  FiLock,
  FiUnlock,
  FiShield,
  FiChevronDown,
  FiChevronUp,
  FiAlertTriangle,
  FiEye
} from 'react-icons/fi';
import { User, roleColors, statusColors } from './types';

interface UserTableProps {
  users: User[];
  totalCount: number;
  page: number;
  itemsPerPage: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  isProcessing: boolean;
  onSort: (field: string) => void;
  onPageChange: (newPage: number) => void;
  onSelectUser: (user: User) => void;
  onStatusChange: (userId: string, newStatus: string) => Promise<void>;
  onRoleChangeClick: (userId: string, currentRole: string) => void;
  onWarningClick: (userId: string) => void;
  onDelete: (userId: string) => Promise<void>;
}

export default function UserTable({
  users,
  totalCount,
  page,
  itemsPerPage,
  sortField,
  sortDirection,
  isProcessing,
  onSort,
  onPageChange,
  onSelectUser,
  onStatusChange,
  onRoleChangeClick,
  onWarningClick,
  onDelete
}: UserTableProps) {
  return (
    <div className="bg-white/5 rounded-xl shadow-sm shadow-black overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                <div className="flex items-center cursor-pointer" onClick={() => onSort('name')}>
                  <span>User</span>
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? 
                      <FiChevronUp className="ml-1" size={14} /> : 
                      <FiChevronDown className="ml-1" size={14} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                <div className="flex items-center cursor-pointer" onClick={() => onSort('role')}>
                  <span>Role</span>
                  {sortField === 'role' && (
                    sortDirection === 'asc' ? 
                      <FiChevronUp className="ml-1" size={14} /> : 
                      <FiChevronDown className="ml-1" size={14} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                <div className="flex items-center cursor-pointer" onClick={() => onSort('status')}>
                  <span>Status</span>
                  {sortField === 'status' && (
                    sortDirection === 'asc' ? 
                      <FiChevronUp className="ml-1" size={14} /> : 
                      <FiChevronDown className="ml-1" size={14} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                <div className="flex items-center cursor-pointer" onClick={() => onSort('lastActive')}>
                  <span>Last Active</span>
                  {sortField === 'lastActive' && (
                    sortDirection === 'asc' ? 
                      <FiChevronUp className="ml-1" size={14} /> : 
                      <FiChevronDown className="ml-1" size={14} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                <div className="flex items-center cursor-pointer" onClick={() => onSort('contributionCount')}>
                  <span>Contributions</span>
                  {sortField === 'contributionCount' && (
                    sortDirection === 'asc' ? 
                      <FiChevronUp className="ml-1" size={14} /> : 
                      <FiChevronDown className="ml-1" size={14} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
                onClick={() => onSelectUser(user)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden mr-3 flex items-center justify-center">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="text-white/60" size={16} />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-white/60">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${roleColors[user.role]}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[user.status]}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                  {user.warningCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">
                      {user.warningCount} {user.warningCount === 1 ? 'warning' : 'warnings'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-white/60">
                    {new Date(user.lastActive).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {user.contributionCount} total
                  </div>
                  <div className="text-xs text-white/60">
                    {user.articleCount} articles
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/80"
                      title="View Profile"
                    >
                      <FiEye size={16} />
                    </button>
                    <button 
                      className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/80"
                      title="Edit Role"
                      onClick={() => onRoleChangeClick(user.id, user.role)}
                      disabled={isProcessing}
                    >
                      <FiShield size={16} />
                    </button>
                    <button 
                      className="p-1.5 bg-yellow-500/10 rounded-lg hover:bg-yellow-500/20 text-yellow-400"
                      title="Send Warning"
                      onClick={() => onWarningClick(user.id)}
                      disabled={isProcessing}
                    >
                      <FiAlertTriangle size={16} />
                    </button>
                    {user.status === 'active' ? (
                      <button 
                        className="p-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400"
                        title="Suspend User"
                        onClick={() => onStatusChange(user.id, 'suspended')}
                        disabled={isProcessing}
                      >
                        <FiLock size={16} />
                      </button>
                    ) : (
                      <button 
                        className="p-1.5 bg-green-500/10 rounded-lg hover:bg-green-500/20 text-green-400"
                        title="Activate User"
                        onClick={() => onStatusChange(user.id, 'active')}
                        disabled={isProcessing}
                      >
                        <FiUnlock size={16} />
                      </button>
                    )}
                    <button 
                      className="p-1.5 bg-white/5 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400"
                      title="Delete User"
                      onClick={() => onDelete(user.id)}
                      disabled={isProcessing}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-white/10">
        <div className="text-sm text-white/60">
          Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, totalCount)} of {totalCount} users
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="px-3 py-1 bg-white/5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <div className="px-3 py-1 bg-white/10 rounded-lg text-sm">{page}</div>
          <button 
            className="px-3 py-1 bg-white/5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(page + 1)}
            disabled={page * itemsPerPage >= totalCount}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
