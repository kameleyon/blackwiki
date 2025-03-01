"use client";

import { UserActivity } from './types';
import { formatDate, getActivityStatusColor } from './utils';

interface UserActivityLogProps {
  activities: UserActivity[];
}

export const UserActivityLog = ({ activities }: UserActivityLogProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">User</th>
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">Action</th>
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">Resource</th>
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">Time</th>
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <tr key={activity.id} className="border-b border-white/10">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm">{activity.userName}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm">{activity.action}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm">{activity.resource}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs text-white/60">{formatDate(activity.timestamp)}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${getActivityStatusColor(activity.status)} bg-white/5`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-4 py-3 text-center text-sm text-white/60">
                No activity records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
