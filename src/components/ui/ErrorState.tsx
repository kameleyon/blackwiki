'use client';

import { useEffect } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiWifi, FiHome, FiHelpCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface ErrorStateProps {
  /** Error type to determine the appropriate message and actions */
  type?: 'network' | 'server' | 'not-found' | 'unauthorized' | 'validation' | 'generic';
  /** Custom error title */
  title?: string;
  /** Custom error message */
  message?: string;
  /** Raw error object for detailed error analysis */
  error?: Error | string;
  /** Retry function - if provided, shows retry button */
  onRetry?: () => void;
  /** Whether retry action is currently loading */
  retrying?: boolean;
  /** Custom actions to display */
  actions?: React.ReactNode;
  /** Whether to show debug information (dev mode) */
  showDebug?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Announcement priority for screen readers */
  announcementPriority?: 'polite' | 'assertive';
}

/**
 * Comprehensive error state component with user-friendly messages and recovery actions
 */
export function ErrorState({
  type = 'generic',
  title,
  message,
  error,
  onRetry,
  retrying = false,
  actions,
  showDebug = process.env.NODE_ENV === 'development',
  className = '',
  announcementPriority = 'assertive'
}: ErrorStateProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Get error details based on type
  const errorConfig = getErrorConfig(type, error);
  const finalTitle = title || errorConfig.title;
  const finalMessage = message || errorConfig.message;

  // Check if user is likely offline
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  // Auto-announce error for screen readers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const announcement = `Error: ${finalTitle}. ${finalMessage}`;
      
      // Use aria-live region for screen readers
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', announcementPriority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.textContent = announcement;
      document.body.appendChild(liveRegion);

      // Clean up
      setTimeout(() => {
        if (document.body.contains(liveRegion)) {
          document.body.removeChild(liveRegion);
        }
      }, 1000);
    }
  }, [finalTitle, finalMessage, announcementPriority]);

  const containerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.4,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center p-8 text-center bg-white/5 rounded-lg border border-white/10 ${className}`}
      role="alert"
      aria-live={announcementPriority}
    >
      {/* Error Icon */}
      <div className="mb-6">
        <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center">
          <errorConfig.icon className="w-8 h-8 text-gray-400" aria-hidden="true" />
        </div>
      </div>

      {/* Error Content */}
      <div className="mb-6 max-w-md">
        <h2 className="text-xl font-semibold text-white mb-2">
          {finalTitle}
        </h2>
        <p className="text-white/70 leading-relaxed">
          {finalMessage}
        </p>

        {/* Offline indicator */}
        {isOffline && type === 'network' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
            <FiWifi className="w-4 h-4" />
            <span className="text-sm">You appear to be offline</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {/* Retry Button */}
        {onRetry && (
          <motion.button
            onClick={onRetry}
            disabled={retrying}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          >
            <FiRefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Try Again'}
          </motion.button>
        )}

        {/* Home Button */}
        <motion.button
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        >
          <FiHome className="w-4 h-4" />
          Go Home
        </motion.button>

        {/* Custom Actions */}
        {actions}
      </div>

      {/* Support Link */}
      <div className="text-sm text-white/50">
        Need help?{' '}
        <button
          onClick={() => window.open('mailto:support@afrowiki.com', '_blank')}
          className="text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
        >
          <span className="inline-flex items-center gap-1">
            <FiHelpCircle className="w-3 h-3" />
            Contact Support
          </span>
        </button>
      </div>

      {/* Debug Information */}
      {showDebug && error && (
        <details className="mt-6 w-full max-w-lg">
          <summary className="cursor-pointer text-xs text-white/50 hover:text-white/70 focus:outline-none focus:ring-1 focus:ring-white/50 rounded px-2 py-1">
            Debug Information
          </summary>
          <div className="mt-2 p-3 bg-black/30 rounded text-xs text-white/60 text-left overflow-x-auto">
            <pre>{typeof error === 'string' ? error : error.message}</pre>
            {typeof error === 'object' && error.stack && (
              <pre className="mt-2 opacity-70">{error.stack}</pre>
            )}
          </div>
        </details>
      )}
    </motion.div>
  );
}

/**
 * Get error configuration based on error type
 */
function getErrorConfig(type: ErrorStateProps['type'], error?: Error | string) {
  const configs = {
    network: {
      title: 'Connection Problem',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      icon: FiWifi
    },
    server: {
      title: 'Server Error',
      message: 'Something went wrong on our end. Our team has been notified and is working on a fix.',
      icon: FiAlertTriangle
    },
    'not-found': {
      title: 'Page Not Found',
      message: 'The page you\'re looking for doesn\'t exist or has been moved.',
      icon: FiAlertTriangle
    },
    unauthorized: {
      title: 'Access Denied',
      message: 'You don\'t have permission to view this content. Please log in or contact an administrator.',
      icon: FiAlertTriangle
    },
    validation: {
      title: 'Invalid Data',
      message: 'The information provided is invalid. Please check your input and try again.',
      icon: FiAlertTriangle
    },
    generic: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      icon: FiAlertTriangle
    }
  };

  return configs[type || 'generic'];
}

/**
 * Hook for handling errors with ErrorState
 */
export function useErrorHandler() {
  const handleError = (error: Error | string, type: ErrorStateProps['type'] = 'generic') => {
    console.error(`[${type?.toUpperCase()}]`, error);
    return { error, type };
  };

  const isNetworkError = (error: Error | string) => {
    const message = typeof error === 'string' ? error : error.message;
    return message.includes('fetch') || 
           message.includes('network') || 
           message.includes('connection') ||
           message.toLowerCase().includes('failed to fetch');
  };

  const getErrorType = (error: Error | string): ErrorStateProps['type'] => {
    if (isNetworkError(error)) return 'network';
    
    const message = typeof error === 'string' ? error : error.message;
    if (message.includes('401') || message.includes('Unauthorized')) return 'unauthorized';
    if (message.includes('404') || message.includes('Not Found')) return 'not-found';
    if (message.includes('400') || message.includes('validation')) return 'validation';
    if (message.includes('500') || message.includes('Internal Server Error')) return 'server';
    
    return 'generic';
  };

  return { handleError, isNetworkError, getErrorType };
}