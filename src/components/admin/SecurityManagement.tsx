"use client";

import { useState } from 'react';
import { FiAlertTriangle, FiUsers, FiShield, FiServer } from 'react-icons/fi';
import { 
  SecurityHeader,
  SecurityOverview,
  SecurityCharts,
  SecurityIncidents,
  UserActivityLog,
  PermissionsManagement,
  RateLimitConfiguration,
  SecurityManagementProps,
  filterIncidents,
  sortIncidentsByDate
} from './security-management';
import { CollapsibleSection } from './system-management';

export default function SecurityManagement(props: SecurityManagementProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Handle refresh data
  const handleRefresh = async () => {
    setIsProcessing(true);
    try {
      await props.onRefreshData();
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Filter and sort incidents
  const filteredIncidents = sortIncidentsByDate(
    filterIncidents(props.incidents, searchQuery, filterType)
  );
  
  return (
    <div className="space-y-6">
      {/* Security Management Header */}
      <SecurityHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        onRefresh={handleRefresh}
        isProcessing={isProcessing}
      />
      
      {/* Security Overview */}
      <SecurityOverview metrics={props.metrics} />
      
      {/* Security Charts */}
      <SecurityCharts metrics={props.metrics} />
      
      {/* Security Incidents */}
      <CollapsibleSection
        title="Security Incidents"
        icon={<FiAlertTriangle size={18} />}
        isExpanded={expandedSection === 'incidents'}
        onToggle={() => toggleSection('incidents')}
        badge={props.metrics.openIncidents > 0 ? {
          text: `${props.metrics.openIncidents} open`,
          color: 'bg-red-500/20 text-red-300'
        } : undefined}
      >
        <SecurityIncidents 
          incidents={filteredIncidents}
          onUpdateIncident={props.onUpdateIncident}
        />
      </CollapsibleSection>
      
      {/* User Activity */}
      <CollapsibleSection
        title="User Activity"
        icon={<FiUsers size={18} />}
        isExpanded={expandedSection === 'activity'}
        onToggle={() => toggleSection('activity')}
      >
        <UserActivityLog activities={props.activities} />
      </CollapsibleSection>
      
      {/* Permissions Section */}
      <CollapsibleSection
        title="Permissions"
        icon={<FiShield size={18} />}
        isExpanded={expandedSection === 'permissions'}
        onToggle={() => toggleSection('permissions')}
      >
        <PermissionsManagement 
          permissions={props.permissions}
          onUpdatePermission={props.onUpdatePermission}
        />
      </CollapsibleSection>
      
      {/* Rate Limiting */}
      <CollapsibleSection
        title="Rate Limiting"
        icon={<FiServer size={18} />}
        isExpanded={expandedSection === 'ratelimits'}
        onToggle={() => toggleSection('ratelimits')}
      >
        <RateLimitConfiguration 
          rateLimits={props.rateLimits}
          onUpdateRateLimit={props.onUpdateRateLimit}
        />
      </CollapsibleSection>
    </div>
  );
}
