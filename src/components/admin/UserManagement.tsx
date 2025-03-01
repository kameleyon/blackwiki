"use client";

import { useState } from 'react';
import { UserManagementProps, User } from './user-management/types';
import UserFilters from './user-management/UserFilters';
import UserTable from './user-management/UserTable';
import UserDetails from './user-management/UserDetails';
import UserWarningModal from './user-management/UserWarningModal';
import RoleChangeModal from './user-management/RoleChangeModal';

export default function UserManagement({
  users,
  totalCount,
  onRoleChange,
  onStatusChange,
  onDelete,
  onSendWarning
}: UserManagementProps) {
  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('lastActive');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  // State for user details and modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningUserId, setWarningUserId] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [roleChangeUserId, setRoleChangeUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Handle user status change
  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) {
      setIsProcessing(true);
      try {
        await onStatusChange(userId, newStatus);
        // Update UI or show success message
      } catch (error) {
        console.error('Error changing user status:', error);
        // Show error message
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  // Handle user role change modal
  const handleRoleChangeClick = (userId: string, currentRole: string) => {
    setRoleChangeUserId(userId);
    setSelectedRole(currentRole);
    setShowRoleModal(true);
  };
  
  const handleRoleChangeSubmit = async (newRole: string) => {
    if (!roleChangeUserId) return;
    
    setIsProcessing(true);
    try {
      await onRoleChange(roleChangeUserId, newRole);
      setShowRoleModal(false);
      setSelectedRole('');
      setRoleChangeUserId(null);
      // Update UI or show success message
    } catch (error) {
      console.error('Error changing user role:', error);
      // Show error message
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle user warning
  const handleWarningClick = (userId: string) => {
    setWarningUserId(userId);
    setShowWarningModal(true);
  };
  
  const handleWarningSubmit = async (message: string) => {
    if (!warningUserId) return;
    
    setIsProcessing(true);
    try {
      await onSendWarning(warningUserId, message);
      setShowWarningModal(false);
      setWarningUserId(null);
      // Update UI or show success message
    } catch (error) {
      console.error('Error sending warning:', error);
      // Show error message
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle user deletion
  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setIsProcessing(true);
      try {
        await onDelete(userId);
        // Update UI or show success message
      } catch (error) {
        console.error('Error deleting user:', error);
        // Show error message
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    // Filter by search query
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by role
    if (filterRole !== 'all' && user.role !== filterRole) {
      return false;
    }
    
    // Filter by status
    if (filterStatus !== 'all' && user.status !== filterStatus) {
      return false;
    }
    
    return true;
  });
  
  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'role':
        valueA = a.role;
        valueB = b.role;
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'lastActive':
        valueA = new Date(a.lastActive).getTime();
        valueB = new Date(b.lastActive).getTime();
        break;
      case 'contributionCount':
        valueA = a.contributionCount;
        valueB = b.contributionCount;
        break;
      default:
        valueA = new Date(a.lastActive).getTime();
        valueB = new Date(b.lastActive).getTime();
    }
    
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
  
  // Paginate users
  const paginatedUsers = sortedUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  return (
    <div className="space-y-6">
      {/* User Management Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-normal">User Management</h2>
        
        <UserFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      </div>
      
      {/* Users Table */}
      <UserTable
        users={paginatedUsers}
        totalCount={filteredUsers.length}
        page={page}
        itemsPerPage={itemsPerPage}
        sortField={sortField}
        sortDirection={sortDirection}
        isProcessing={isProcessing}
        onSort={handleSort}
        onPageChange={setPage}
        onSelectUser={setSelectedUser}
        onStatusChange={handleStatusChange}
        onRoleChangeClick={handleRoleChangeClick}
        onWarningClick={handleWarningClick}
        onDelete={handleDelete}
      />
      
      {/* User Detail Panel */}
      {selectedUser && (
        <UserDetails
          user={selectedUser}
          isProcessing={isProcessing}
          onClose={() => setSelectedUser(null)}
          onStatusChange={handleStatusChange}
          onRoleChangeClick={handleRoleChangeClick}
          onWarningClick={handleWarningClick}
          onDelete={handleDelete}
        />
      )}
      
      {/* Warning Modal */}
      <UserWarningModal
        isOpen={showWarningModal}
        isProcessing={isProcessing}
        onClose={() => setShowWarningModal(false)}
        onSubmit={handleWarningSubmit}
      />
      
      {/* Role Change Modal */}
      <RoleChangeModal
        isOpen={showRoleModal}
        isProcessing={isProcessing}
        currentRole={selectedRole}
        onClose={() => setShowRoleModal(false)}
        onSubmit={handleRoleChangeSubmit}
      />
    </div>
  );
}
