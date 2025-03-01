export interface SecurityIncident {
  id: string;
  type: 'unauthorized_access' | 'api_abuse' | 'rate_limit' | 'suspicious_activity' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  ip: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  resolution?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: Date;
  ip: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  roles: string[];
}

export interface RateLimitConfig {
  endpoint: string;
  limit: number;
  window: number; // in seconds
  byIP: boolean;
  byUser: boolean;
}

export interface SecurityMetrics {
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  incidentsByType: Record<string, number>;
  incidentsBySeverity: Record<string, number>;
  incidentsOverTime: {
    timestamp: Date;
    count: number;
  }[];
  failedLogins: number;
  apiRateLimitHits: number;
  suspiciousActivities: number;
}

export interface SecurityManagementProps {
  incidents: SecurityIncident[];
  activities: UserActivity[];
  permissions: Permission[];
  rateLimits: RateLimitConfig[];
  metrics: SecurityMetrics;
  onUpdateIncident: (incidentId: string, updates: Partial<SecurityIncident>) => Promise<void>;
  onUpdateRateLimit: (endpoint: string, updates: Partial<RateLimitConfig>) => Promise<void>;
  onUpdatePermission: (permissionId: string, updates: Partial<Permission>) => Promise<void>;
  onRefreshData: () => Promise<void>;
}
