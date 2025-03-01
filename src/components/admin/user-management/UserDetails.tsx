"use client";

import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiEdit, 
  FiTrash2, 
  FiLock,
  FiUnlock,
  FiShield,
  FiX,
  FiAlertTriangle,
  FiMessageSquare,
  FiEye,
  FiFileText
} from 'react-icons/fi';
import Link from 'next/link';
import { User, roleColors, statusColors } from './types';

interface UserDetailsProps {
  user: User;
  isProcessing: boolean;
  onClose: () => void;
  onStatusChange: (userId: string, newStatus: string) => Promise<void>;
  onRoleChangeClick: (userId: string, currentRole: string) => void;
  onWarningClick: (userId: string) => void;
  onDelete: (userId: string) => Promise<void>;
}

export default function UserDetails({
  user,
  isProcessing,
  onClose,
  onStatusChange,
  onRoleChangeClick,
  onWarningClick,
  onDelete
}: UserDetailsProps) {
  return (
    <div className="bg-white/5 rounded-xl shadow-sm shadow-black p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-white/10 overflow-hidden mr-4 flex items-center justify-center">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <FiUser className="text-white/60" size={32} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-normal">{user.name}</h3>
            <p className="text-sm text-white/60 flex items-center">
              <FiMail className="mr-1" size={14} />
              {user.email}
            </p>
            <p className="text-sm text-white/60 flex items-center mt-1">
              <FiCalendar className="mr-1" size={14} />
              Joined {new Date(user.joinedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button 
          className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/80"
          onClick={onClose}
        >
          <FiX size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Role</span>
            <span className={`px-2 py-1 rounded-full text-xs ${roleColors[user.role]}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Status</span>
            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[user.status]}`}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Last Active</span>
            <span className="text-sm">{new Date(user.lastActive).toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Articles</span>
            <span className="text-sm">{user.articleCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Total Contributions</span>
            <span className="text-sm">{user.contributionCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Warnings</span>
            <span className="text-sm">{user.warningCount}</span>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium mb-2">Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Link 
                href={`/admin/users/${user.id}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10"
              >
                <FiEye size={14} />
                <span>View Full Profile</span>
              </Link>
              <button 
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10"
                onClick={() => onRoleChangeClick(user.id, user.role)}
                disabled={isProcessing}
              >
                <FiShield size={14} />
                <span>Change Role</span>
              </button>
              <button 
                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 rounded-lg text-xs text-yellow-400 hover:bg-yellow-500/20"
                onClick={() => onWarningClick(user.id)}
                disabled={isProcessing}
              >
                <FiAlertTriangle size={14} />
                <span>Send Warning</span>
              </button>
              {user.status === 'active' ? (
                <button 
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 rounded-lg text-xs text-red-400 hover:bg-red-500/20"
                  onClick={() => onStatusChange(user.id, 'suspended')}
                  disabled={isProcessing}
                >
                  <FiLock size={14} />
                  <span>Suspend User</span>
                </button>
              ) : (
                <button 
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 rounded-lg text-xs text-green-400 hover:bg-green-500/20"
                  onClick={() => onStatusChange(user.id, 'active')}
                  disabled={isProcessing}
                >
                  <FiUnlock size={14} />
                  <span>Activate User</span>
                </button>
              )}
              <button 
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-red-500/10 hover:text-red-400"
                onClick={() => onDelete(user.id)}
                disabled={isProcessing}
              >
                <FiTrash2 size={14} />
                <span>Delete User</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* User Activity */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Recent Activity</h4>
          
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-start">
                <div className="p-1.5 bg-white/10 rounded-lg mr-3">
                  <FiFileText className="text-white/60" size={16} />
                </div>
                <div>
                  <p className="text-sm">Published article "Introduction to African Art"</p>
                  <p className="text-xs text-white/60 mt-1">2 days ago</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-start">
                <div className="p-1.5 bg-white/10 rounded-lg mr-3">
                  <FiEdit className="text-white/60" size={16} />
                </div>
                <div>
                  <p className="text-sm">Edited article "The History of Jazz"</p>
                  <p className="text-xs text-white/60 mt-1">3 days ago</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-start">
                <div className="p-1.5 bg-white/10 rounded-lg mr-3">
                  <FiMessageSquare className="text-white/60" size={16} />
                </div>
                <div>
                  <p className="text-sm">Commented on "The Civil Rights Movement"</p>
                  <p className="text-xs text-white/60 mt-1">5 days ago</p>
                </div>
              </div>
            </div>
          </div>
          
          <h4 className="text-sm font-medium mt-6">Warning History</h4>
          
          {user.warningCount > 0 ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <div className="flex items-start">
                  <div className="p-1.5 bg-yellow-500/20 rounded-lg mr-3">
                    <FiAlertTriangle className="text-yellow-400" size={16} />
                  </div>
                  <div>
                    <p className="text-sm">Warning for inappropriate content</p>
                    <p className="text-xs text-white/60 mt-1">2 weeks ago</p>
                    <p className="text-xs text-white/80 mt-2 bg-white/5 p-2 rounded">
                      Your article contained content that violates our community guidelines. Please review our content policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-white/5 text-center">
              <p className="text-sm text-white/60">No warnings issued</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
