"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'white' | 'gray';
  label?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  color = 'white',
  label = 'Loading...'
}: LoadingSpinnerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-primary',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  // Animation configuration respecting reduced motion preference
  const animationProps = prefersReducedMotion 
    ? {
        // Truly static - no animation for reduced motion
        animate: undefined,
        transition: undefined
      }
    : {
        // Normal rotation animation
        animate: { rotate: 360 },
        transition: { duration: 1, repeat: Infinity, ease: "linear" }
      };

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={label}
    >
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full`}
        {...animationProps}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}