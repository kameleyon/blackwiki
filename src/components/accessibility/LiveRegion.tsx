"use client";

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}

/**
 * LiveRegion component for accessibility announcements
 * Used to announce dynamic content changes to screen readers
 */
export function LiveRegion({ 
  message, 
  priority = 'polite',
  className = 'sr-only'
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className={className}
    >
      {message}
    </div>
  );
}

/**
 * Hook for managing live region announcements
 * Provides a simple way to trigger accessibility announcements with proper semantics
 */
export function useLiveRegion() {
  const politeRegionRef = useRef<HTMLDivElement>(null);
  const assertiveRegionRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const targetRef = priority === 'assertive' ? assertiveRegionRef : politeRegionRef;
    
    if (targetRef.current) {
      // Clear the message first to ensure it's announced even if it's the same
      targetRef.current.textContent = '';
      
      // Use setTimeout to ensure screen readers notice the change
      setTimeout(() => {
        if (targetRef.current) {
          targetRef.current.textContent = message;
        }
      }, 100);
    }
  };

  const LiveRegionComponent = () => (
    <>
      {/* Polite announcements */}
      <div
        ref={politeRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      {/* Assertive announcements (errors, urgent updates) */}
      <div
        ref={assertiveRegionRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );

  return { announce, LiveRegionComponent };
}