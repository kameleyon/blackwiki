"use client";

import { useState } from 'react';
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiXCircle, 
  FiActivity 
} from 'react-icons/fi';
import { SecurityIncident } from './types';
import { 
  formatDate, 
  getSeverityColor, 
  getStatusColor, 
  formatTypeString 
} from './utils';

interface SecurityIncidentsProps {
  incidents: SecurityIncident[];
  onUpdateIncident: (incidentId: string, updates: Partial<SecurityIncident>) => Promise<void>;
}

export const SecurityIncidents = ({
  incidents,
  onUpdateIncident
}: SecurityIncidentsProps) => {
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  
  // Toggle incident expansion
  const toggleIncidentExpansion = (incidentId: string) => {
    if (expandedIncident === incidentId) {
      setExpandedIncident(null);
    } else {
      setExpandedIncident(incidentId);
    }
  };
  
  return (
    <div className="space-y-4">
      {incidents.length > 0 ? (
        incidents.map((incident) => (
          <div 
            key={incident.id} 
            className="bg-white/5 rounded-xl overflow-hidden"
          >
            <div 
              className="p-4 cursor-pointer flex items-start justify-between"
              onClick={() => toggleIncidentExpansion(incident.id)}
            >
              <div className="flex items-start">
                <div className={`p-2 rounded-lg ${getSeverityColor(incident.severity)} mr-3`}>
                  <FiAlertTriangle size={16} />
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium">
                      {formatTypeString(incident.type)}
                    </h4>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(incident.status)}`}>
                      {formatTypeString(incident.status)}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">{formatDate(incident.timestamp)}</p>
                </div>
              </div>
              <div className="text-xs text-white/60">
                {incident.user ? incident.user.name : incident.ip}
              </div>
            </div>
            
            {expandedIncident === incident.id && (
              <div className="px-4 pb-4 pt-0 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="text-xs text-white/60 mb-1">Description</h5>
                    <p className="text-sm">{incident.description}</p>
                  </div>
                  
                  {incident.user && (
                    <div>
                      <h5 className="text-xs text-white/60 mb-1">User</h5>
                      <p className="text-sm">{incident.user.name} ({incident.user.email})</p>
                    </div>
                  )}
                  
                  <div>
                    <h5 className="text-xs text-white/60 mb-1">IP Address</h5>
                    <p className="text-sm">{incident.ip}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs text-white/60 mb-1">Severity</h5>
                    <p className={`text-sm ${getSeverityColor(incident.severity).split(' ')[0]}`}>
                      {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                    </p>
                  </div>
                </div>
                
                {incident.status === 'resolved' && incident.resolution && (
                  <div className="mb-4">
                    <h5 className="text-xs text-white/60 mb-1">Resolution</h5>
                    <p className="text-sm">{incident.resolution}</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {incident.status !== 'resolved' && (
                    <button 
                      className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10 flex items-center gap-1"
                      onClick={() => onUpdateIncident(incident.id, { status: 'resolved', resolution: 'Issue resolved by admin.' })}
                    >
                      <FiCheckCircle size={14} />
                      <span>Mark as Resolved</span>
                    </button>
                  )}
                  
                  {incident.status !== 'false_positive' && (
                    <button 
                      className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10 flex items-center gap-1"
                      onClick={() => onUpdateIncident(incident.id, { status: 'false_positive' })}
                    >
                      <FiXCircle size={14} />
                      <span>Mark as False Positive</span>
                    </button>
                  )}
                  
                  {incident.status === 'open' && (
                    <button 
                      className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10 flex items-center gap-1"
                      onClick={() => onUpdateIncident(incident.id, { status: 'investigating' })}
                    >
                      <FiActivity size={14} />
                      <span>Start Investigation</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-sm text-white/60">No incidents found</p>
        </div>
      )}
    </div>
  );
};
