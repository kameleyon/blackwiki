"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiStar, 
  FiMessageSquare, 
  FiAward,
  FiClock,
  FiBell,
  FiSettings,
  FiX,
  FiCheck,
  FiFilter
} from 'react-icons/fi';

type Notification = {
  id: string;
  type: 'review' | 'comment' | 'mention' | 'achievement' | 'system';
  message: string;
  articleId?: string;
  articleTitle?: string;
  userId?: string;
  userName?: string;
  date: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    [key: string]: string | number | boolean | null;
  };
};

type NotificationSettings = {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'never';
    types: {
      review: boolean;
      comment: boolean;
      mention: boolean;
      achievement: boolean;
      system: boolean;
    };
  };
  inApp: {
    enabled: boolean;
    types: {
      review: boolean;
      comment: boolean;
      mention: boolean;
      achievement: boolean;
      system: boolean;
    };
  };
};

type EnhancedNotificationsProps = {
  notifications: Notification[];
  settings: NotificationSettings;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDeleteNotification: (id: string) => Promise<void>;
  onUpdateSettings: (settings: NotificationSettings) => Promise<void>;
};

export default function EnhancedNotifications({
  notifications,
  settings,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onUpdateSettings
}: EnhancedNotificationsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [filter, setFilter] = useState<string | null>(null);
  const [tempSettings, setTempSettings] = useState<NotificationSettings>({ ...settings });
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter notifications based on active tab and filter
  const filteredNotifications = notifications.filter(notification => {
    // Apply read/unread filter
    if (activeTab === 'unread' && notification.read) return false;
    
    // Apply type filter
    if (filter && notification.type !== filter) return false;
    
    return true;
  });

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get icon component based on notification type
  const getNotificationIcon = (type: string, size = 14) => {
    switch (type) {
      case 'review':
        return <FiCheckCircle size={size} />;
      case 'comment':
        return <FiMessageSquare size={size} />;
      case 'mention':
        return <FiStar size={size} />;
      case 'achievement':
        return <FiAward size={size} />;
      case 'system':
        return <FiAlertCircle size={size} />;
      default:
        return <FiBell size={size} />;
    }
  };

  // Handle settings changes
  const handleSettingChange = (path: string[], value: boolean | string) => {
    const newSettings = { ...tempSettings };
    
    if (path.length === 2 && path[0] === 'email' && path[1] === 'enabled') {
      newSettings.email.enabled = value as boolean;
    } else if (path.length === 2 && path[0] === 'email' && path[1] === 'frequency') {
      newSettings.email.frequency = value as 'immediate' | 'daily' | 'weekly' | 'never';
    } else if (path.length === 3 && path[0] === 'email' && path[1] === 'types') {
      newSettings.email.types[path[2] as keyof typeof newSettings.email.types] = value as boolean;
    } else if (path.length === 2 && path[0] === 'inApp' && path[1] === 'enabled') {
      newSettings.inApp.enabled = value as boolean;
    } else if (path.length === 3 && path[0] === 'inApp' && path[1] === 'types') {
      newSettings.inApp.types[path[2] as keyof typeof newSettings.inApp.types] = value as boolean;
    }
    
    setTempSettings(newSettings);
  };

  // Save settings changes
  const saveSettings = async () => {
    await onUpdateSettings(tempSettings);
    setActiveTab('all');
  };

  // Cancel settings changes
  const cancelSettings = () => {
    setTempSettings({ ...settings });
    setActiveTab('all');
  };

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const grouped: Record<string, Notification[]> = {};
    
    filteredNotifications.forEach(notification => {
      const dateKey = formatDate(notification.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(notification);
    });
    
    return grouped;
  };

  // Get dates with notifications
  const getDatesWithNotifications = () => {
    return Object.keys(groupNotificationsByDate()).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  };

  return (
    <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium">Notifications</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              activeTab === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
              activeTab === 'unread' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-md ${
              activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiSettings size={16} />
          </button>
        </div>
      </div>
      
      {activeTab !== 'settings' && (
        <div className="flex items-center justify-between p-3 bg-white/5 border-b border-gray-700">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white px-2 py-1 bg-white/5 hover:bg-white/10 rounded"
            >
              <FiFilter size={14} />
              <span>Filter</span>
            </button>
            {showDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setFilter(null);
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => {
                      setFilter('review');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                  >
                    Reviews
                  </button>
                  <button
                    onClick={() => {
                      setFilter('comment');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                  >
                    Comments
                  </button>
                  <button
                    onClick={() => {
                      setFilter('mention');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                  >
                    Mentions
                  </button>
                  <button
                    onClick={() => {
                      setFilter('achievement');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                  >
                    Achievements
                  </button>
                  <button
                    onClick={() => {
                      setFilter('system');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                  >
                    System
                  </button>
                </div>
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-gray-400 hover:text-white"
            >
              Mark all as read
            </button>
          )}
        </div>
      )}
      
      {activeTab !== 'settings' ? (
        <div>
          {filteredNotifications.length > 0 ? (
            <div>
              {getDatesWithNotifications().map(dateKey => (
                <div key={dateKey}>
                  <div className="px-4 py-2 bg-white/5 border-b border-gray-800">
                    <h3 className="text-xs font-medium text-gray-400">{dateKey}</h3>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {groupNotificationsByDate()[dateKey].map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-white/5 ${!notification.read ? 'bg-white/5' : ''}`}
                      >
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className={`${!notification.read ? 'font-medium' : ''}`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <FiClock size={12} className="mr-1" />
                                    {formatTime(notification.date)}
                                  </span>
                                  {notification.articleTitle && (
                                    <Link 
                                      href={`/articles/${notification.articleId}`}
                                      className="ml-3 text-gray-400 hover:text-white"
                                    >
                                      View Article
                                    </Link>
                                  )}
                                  {notification.actionUrl && (
                                    <Link 
                                      href={notification.actionUrl}
                                      className="ml-3 text-gray-400 hover:text-white"
                                    >
                                      View Details
                                    </Link>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 ml-4">
                                {!notification.read && (
                                  <button 
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md"
                                    title="Mark as read"
                                  >
                                    <FiCheck size={14} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => onDeleteNotification(notification.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-md"
                                  title="Delete notification"
                                >
                                  <FiX size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {activeTab === 'unread' 
                ? 'No unread notifications.' 
                : filter 
                  ? `No ${filter} notifications found.` 
                  : 'No notifications found.'}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable email notifications</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={tempSettings.email.enabled}
                    onChange={() => handleSettingChange(['email', 'enabled'], !tempSettings.email.enabled)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${tempSettings.email.enabled ? 'bg-white/40' : 'bg-white/10'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${tempSettings.email.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
              
              {tempSettings.email.enabled && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Frequency</label>
                    <select
                      value={tempSettings.email.frequency}
                      onChange={(e) => handleSettingChange(['email', 'frequency'], e.target.value)}
                      className="w-full bg-white/5 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Notification Types</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 bg-white/5 border-gray-700 rounded"
                          checked={tempSettings.email.types.review}
                          onChange={() => handleSettingChange(['email', 'types', 'review'], !tempSettings.email.types.review)}
                        />
                        <span className="ml-2">Reviews and approvals</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 bg-white/5 border-gray-700 rounded"
                          checked={tempSettings.email.types.comment}
                          onChange={() => handleSettingChange(['email', 'types', 'comment'], !tempSettings.email.types.comment)}
                        />
                        <span className="ml-2">Comments on your articles</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 bg-white/5 border-gray-700 rounded"
                          checked={tempSettings.email.types.mention}
                          onChange={() => handleSettingChange(['email', 'types', 'mention'], !tempSettings.email.types.mention)}
                        />
                        <span className="ml-2">Mentions</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 bg-white/5 border-gray-700 rounded"
                          checked={tempSettings.email.types.achievement}
                          onChange={() => handleSettingChange(['email', 'types', 'achievement'], !tempSettings.email.types.achievement)}
                        />
                        <span className="ml-2">Achievements</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 bg-white/5 border-gray-700 rounded"
                          checked={tempSettings.email.types.system}
                          onChange={() => handleSettingChange(['email', 'types', 'system'], !tempSettings.email.types.system)}
                        />
                        <span className="ml-2">System notifications</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">In-App Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable in-app notifications</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={tempSettings.inApp.enabled}
                    onChange={() => handleSettingChange(['inApp', 'enabled'], !tempSettings.inApp.enabled)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${tempSettings.inApp.enabled ? 'bg-white/40' : 'bg-white/10'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${tempSettings.inApp.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
              
              {tempSettings.inApp.enabled && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notification Types</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 bg-white/5 border-gray-700 rounded"
                        checked={tempSettings.inApp.types.review}
                        onChange={() => handleSettingChange(['inApp', 'types', 'review'], !tempSettings.inApp.types.review)}
                      />
                      <span className="ml-2">Reviews and approvals</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 bg-white/5 border-gray-700 rounded"
                        checked={tempSettings.inApp.types.comment}
                        onChange={() => handleSettingChange(['inApp', 'types', 'comment'], !tempSettings.inApp.types.comment)}
                      />
                      <span className="ml-2">Comments on your articles</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 bg-white/5 border-gray-700 rounded"
                        checked={tempSettings.inApp.types.mention}
                        onChange={() => handleSettingChange(['inApp', 'types', 'mention'], !tempSettings.inApp.types.mention)}
                      />
                      <span className="ml-2">Mentions</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 bg-white/5 border-gray-700 rounded"
                        checked={tempSettings.inApp.types.achievement}
                        onChange={() => handleSettingChange(['inApp', 'types', 'achievement'], !tempSettings.inApp.types.achievement)}
                      />
                      <span className="ml-2">Achievements</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 bg-white/5 border-gray-700 rounded"
                        checked={tempSettings.inApp.types.system}
                        onChange={() => handleSettingChange(['inApp', 'types', 'system'], !tempSettings.inApp.types.system)}
                      />
                      <span className="ml-2">System notifications</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={cancelSettings}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
