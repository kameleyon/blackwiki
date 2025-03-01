"use client";

import { useState } from 'react';
import { 
  FiActivity, 
  FiAlertTriangle, 
  FiDatabase, 
  FiServer, 
  FiSettings,
  FiHardDrive
} from 'react-icons/fi';

import {
  SystemHeader,
  SystemOverview,
  CollapsibleSection,
  PerformanceMetrics,
  ErrorTracking,
  DatabaseManagement,
  CacheManagement,
  ServiceStatus,
  ResourceUtilization,
  SystemManagementProps
} from './system-management';

export default function SystemManagement(props: SystemManagementProps) {
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('hour');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Handle refresh metrics
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await props.onRefreshMetrics();
    } finally {
      setIsRefreshing(false);
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
  
  return (
    <div className="space-y-6">
      {/* System Management Header */}
      <SystemHeader
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      
      {/* System Health Overview */}
      <SystemOverview metrics={props.metrics} />
      
      {/* Performance Metrics */}
      <CollapsibleSection
        title="Performance Metrics"
        icon={<FiActivity size={18} />}
        isExpanded={expandedSection === 'performance'}
        onToggle={() => toggleSection('performance')}
      >
        <PerformanceMetrics 
          metrics={props.metrics}
          timeRange={timeRange}
        />
      </CollapsibleSection>
      
      {/* Error Tracking */}
      <CollapsibleSection
        title="Error Tracking"
        icon={<FiAlertTriangle size={18} />}
        isExpanded={expandedSection === 'errors'}
        onToggle={() => toggleSection('errors')}
        badge={props.metrics.errors.count > 0 ? {
          text: `${props.metrics.errors.count} errors`,
          color: 'bg-red-500/20 text-red-300'
        } : undefined}
      >
        <ErrorTracking 
          metrics={props.metrics}
          timeRange={timeRange}
        />
      </CollapsibleSection>
      
      {/* Database Management */}
      <CollapsibleSection
        title="Database Management"
        icon={<FiDatabase size={18} />}
        isExpanded={expandedSection === 'database'}
        onToggle={() => toggleSection('database')}
      >
        <DatabaseManagement 
          metrics={props.metrics}
          onOptimizeDatabase={props.onOptimizeDatabase}
          onCreateBackup={props.onCreateBackup}
          onRestoreBackup={props.onRestoreBackup}
        />
      </CollapsibleSection>
      
      {/* Cache Management */}
      <CollapsibleSection
        title="Cache Management"
        icon={<FiServer size={18} />}
        isExpanded={expandedSection === 'cache'}
        onToggle={() => toggleSection('cache')}
      >
        <CacheManagement 
          metrics={props.metrics}
          onClearCache={props.onClearCache}
        />
      </CollapsibleSection>
      
      {/* Service Status */}
      <CollapsibleSection
        title="Service Status"
        icon={<FiSettings size={18} />}
        isExpanded={expandedSection === 'services'}
        onToggle={() => toggleSection('services')}
      >
        <ServiceStatus 
          metrics={props.metrics}
          onRestartService={props.onRestartService}
        />
      </CollapsibleSection>
      
      {/* Resource Utilization */}
      <CollapsibleSection
        title="Resource Utilization"
        icon={<FiHardDrive size={18} />}
        isExpanded={expandedSection === 'resources'}
        onToggle={() => toggleSection('resources')}
      >
        <ResourceUtilization 
          metrics={props.metrics}
        />
      </CollapsibleSection>
    </div>
  );
}
