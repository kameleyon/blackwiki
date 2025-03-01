"use client";

import { 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle, 
  FiRefreshCw 
} from 'react-icons/fi';
import { SystemMetrics } from './types';
import { formatUptime } from './utils';

interface ServiceStatusProps {
  metrics: SystemMetrics;
  onRestartService: (serviceName: string) => Promise<void>;
}

export const ServiceStatus = ({
  metrics,
  onRestartService
}: ServiceStatusProps) => {
  return (
    <div className="space-y-2">
      {metrics.services.map((service, index) => (
        <div key={index} className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {service.status === 'healthy' ? (
                <FiCheckCircle className="text-green-400 mr-2" size={16} />
              ) : service.status === 'degraded' ? (
                <FiAlertTriangle className="text-yellow-400 mr-2" size={16} />
              ) : (
                <FiXCircle className="text-red-400 mr-2" size={16} />
              )}
              <div>
                <p className="text-sm font-medium">{service.name}</p>
                <p className="text-xs text-white/60 mt-1">Uptime: {formatUptime(service.uptime)}</p>
              </div>
            </div>
            <button 
              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10"
              onClick={() => onRestartService(service.name)}
            >
              <FiRefreshCw size={14} />
              <span>Restart</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
