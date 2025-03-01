export interface SystemMetrics {
  cpu: {
    usage: number;
    history: number[];
  };
  memory: {
    total: number;
    used: number;
    history: number[];
  };
  disk: {
    total: number;
    used: number;
  };
  requests: {
    total: number;
    perMinute: number;
    history: number[];
  };
  responseTime: {
    average: number;
    p95: number;
    history: number[];
  };
  errors: {
    count: number;
    rate: number;
    history: number[];
    recent: {
      message: string;
      path: string;
      timestamp: Date;
      count: number;
    }[];
  };
  database: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
  cache: {
    hitRate: number;
    size: number;
    items: number;
  };
  uptime: number;
  lastBackup: Date;
  services: {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
  }[];
}

export interface SystemManagementProps {
  metrics: SystemMetrics;
  onRefreshMetrics: () => Promise<void>;
  onClearCache: () => Promise<void>;
  onOptimizeDatabase: () => Promise<void>;
  onCreateBackup: () => Promise<void>;
  onRestoreBackup: (backupId: string) => Promise<void>;
  onRestartService: (serviceName: string) => Promise<void>;
}
