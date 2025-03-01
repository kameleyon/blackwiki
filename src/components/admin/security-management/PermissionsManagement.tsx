"use client";

import { Permission } from './types';

interface PermissionsManagementProps {
  permissions: Permission[];
  onUpdatePermission: (permissionId: string, updates: Partial<Permission>) => Promise<void>;
}

export const PermissionsManagement = ({
  permissions,
  onUpdatePermission
}: PermissionsManagementProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">Permission</th>
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">Description</th>
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">Roles</th>
          </tr>
        </thead>
        <tbody>
          {permissions.length > 0 ? (
            permissions.map((permission) => (
              <tr key={permission.id} className="border-b border-white/10">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium">{permission.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">{permission.description}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {permission.roles.map((role) => (
                      <span key={role} className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-4 py-3 text-center text-sm text-white/60">
                No permissions found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
