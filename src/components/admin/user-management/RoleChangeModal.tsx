"use client";

import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface RoleChangeModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  currentRole: string;
  onClose: () => void;
  onSubmit: (role: string) => Promise<void>;
}

export default function RoleChangeModal({
  isOpen,
  isProcessing,
  currentRole,
  onClose,
  onSubmit
}: RoleChangeModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>(currentRole);

  const handleSubmit = async () => {
    if (!selectedRole || selectedRole === currentRole) return;
    await onSubmit(selectedRole);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-normal">Change User Role</h3>
          <button
            className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/80"
            onClick={onClose}
            disabled={isProcessing}
          >
            <FiX size={16} />
          </button>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Select New Role
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="role-user"
                name="role"
                value="user"
                checked={selectedRole === 'user'}
                onChange={() => setSelectedRole('user')}
                className="mr-2"
                disabled={isProcessing}
              />
              <label htmlFor="role-user" className="text-sm text-gray-300">
                User - Regular user with standard permissions
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="role-moderator"
                name="role"
                value="moderator"
                checked={selectedRole === 'moderator'}
                onChange={() => setSelectedRole('moderator')}
                className="mr-2"
                disabled={isProcessing}
              />
              <label htmlFor="role-moderator" className="text-sm text-gray-300">
                Moderator - Can review and moderate content
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="role-admin"
                name="role"
                value="admin"
                checked={selectedRole === 'admin'}
                onChange={() => setSelectedRole('admin')}
                className="mr-2"
                disabled={isProcessing}
              />
              <label htmlFor="role-admin" className="text-sm text-gray-300">
                Admin - Full access to all system features
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-white/5 rounded-lg text-sm text-white/80 hover:bg-white/10"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500/20 rounded-lg text-sm text-blue-300 hover:bg-blue-500/30"
            onClick={handleSubmit}
            disabled={!selectedRole || selectedRole === currentRole || isProcessing}
          >
            {isProcessing ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </div>
  );
}
