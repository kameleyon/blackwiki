"use client";

import { useState } from 'react';
import { RateLimitConfig } from './types';

interface RateLimitConfigurationProps {
  rateLimits: RateLimitConfig[];
  onUpdateRateLimit: (endpoint: string, updates: Partial<RateLimitConfig>) => Promise<void>;
}

export const RateLimitConfiguration = ({
  rateLimits,
  onUpdateRateLimit
}: RateLimitConfigurationProps) => {
  const [editingEndpoint, setEditingEndpoint] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<RateLimitConfig>>({});
  
  const handleEdit = (rateLimit: RateLimitConfig) => {
    setEditingEndpoint(rateLimit.endpoint);
    setEditValues({
      limit: rateLimit.limit,
      window: rateLimit.window,
      byIP: rateLimit.byIP,
      byUser: rateLimit.byUser
    });
  };
  
  const handleSave = async () => {
    if (editingEndpoint && Object.keys(editValues).length > 0) {
      await onUpdateRateLimit(editingEndpoint, editValues);
      setEditingEndpoint(null);
      setEditValues({});
    }
  };
  
  const handleCancel = () => {
    setEditingEndpoint(null);
    setEditValues({});
  };
  
  const handleChange = (field: keyof RateLimitConfig, value: any) => {
    setEditValues({
      ...editValues,
      [field]: value
    });
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">Endpoint</th>
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">Limit</th>
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">Window (s)</th>
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">By IP</th>
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">By User</th>
            <th className="px-4 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rateLimits.length > 0 ? (
            rateLimits.map((rateLimit) => (
              <tr key={rateLimit.endpoint} className="border-b border-white/10">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium">{rateLimit.endpoint}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {editingEndpoint === rateLimit.endpoint ? (
                    <input
                      type="number"
                      value={editValues.limit}
                      onChange={(e) => handleChange('limit', parseInt(e.target.value))}
                      className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-sm"
                      min={1}
                    />
                  ) : (
                    <span className="text-sm">{rateLimit.limit}</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {editingEndpoint === rateLimit.endpoint ? (
                    <input
                      type="number"
                      value={editValues.window}
                      onChange={(e) => handleChange('window', parseInt(e.target.value))}
                      className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-sm"
                      min={1}
                    />
                  ) : (
                    <span className="text-sm">{rateLimit.window}</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {editingEndpoint === rateLimit.endpoint ? (
                    <input
                      type="checkbox"
                      checked={editValues.byIP}
                      onChange={(e) => handleChange('byIP', e.target.checked)}
                      className="w-4 h-4 bg-white/5 border border-white/10 rounded"
                    />
                  ) : (
                    <span className="text-sm">{rateLimit.byIP ? '✓' : '✗'}</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {editingEndpoint === rateLimit.endpoint ? (
                    <input
                      type="checkbox"
                      checked={editValues.byUser}
                      onChange={(e) => handleChange('byUser', e.target.checked)}
                      className="w-4 h-4 bg-white/5 border border-white/10 rounded"
                    />
                  ) : (
                    <span className="text-sm">{rateLimit.byUser ? '✓' : '✗'}</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {editingEndpoint === rateLimit.endpoint ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="px-2 py-1 bg-white/5 rounded text-xs text-white/80 hover:bg-white/10"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-2 py-1 bg-white/5 rounded text-xs text-white/80 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(rateLimit)}
                      className="px-2 py-1 bg-white/5 rounded text-xs text-white/80 hover:bg-white/10"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-3 text-center text-sm text-white/60">
                No rate limits configured
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
