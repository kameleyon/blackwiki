"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

export function SkeletonLoader({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  animate = true
}: SkeletonLoaderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;
  
  const baseClasses = "bg-white/10";
  
  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-lg",
    circular: "rounded-full",
    rounded: "rounded-xl"
  };

  const pulseAnimation = shouldAnimate ? {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '3rem')
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={`${baseClasses} ${variantClasses.text}`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%'
            }}
            animate={pulseAnimation}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      animate={pulseAnimation}
    />
  );
}

// Preset skeleton components for common use cases
export function ArticleCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLoader variant="text" width="60%" height="1.5rem" />
        <SkeletonLoader variant="rectangular" width="4rem" height="1.5rem" />
      </div>
      <SkeletonLoader variant="text" lines={3} />
      <div className="flex items-center gap-4 pt-2">
        <SkeletonLoader variant="circular" width="2rem" height="2rem" />
        <SkeletonLoader variant="text" width="8rem" height="1rem" />
        <SkeletonLoader variant="text" width="6rem" height="1rem" />
      </div>
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-start">
        <SkeletonLoader variant="text" width="70%" height="1.5rem" />
        <SkeletonLoader variant="rectangular" width="5rem" height="1.25rem" />
      </div>
      <SkeletonLoader variant="text" lines={2} />
      <div className="flex flex-wrap gap-2 pt-2">
        <SkeletonLoader variant="rounded" width="4rem" height="1.5rem" />
        <SkeletonLoader variant="rounded" width="5rem" height="1.5rem" />
        <SkeletonLoader variant="rounded" width="3rem" height="1.5rem" />
      </div>
      <div className="flex items-center gap-4 text-xs border-t border-white/10 pt-3">
        <SkeletonLoader variant="text" width="6rem" height="0.875rem" />
        <SkeletonLoader variant="text" width="4rem" height="0.875rem" />
        <SkeletonLoader variant="text" width="5rem" height="0.875rem" />
      </div>
    </div>
  );
}

export function ReviewQueueSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <SkeletonLoader variant="text" width="80%" height="1.25rem" />
          <SkeletonLoader variant="text" width="60%" height="1rem" />
        </div>
        <div className="flex gap-2">
          <SkeletonLoader variant="rounded" width="6rem" height="2rem" />
          <SkeletonLoader variant="rounded" width="8rem" height="2rem" />
        </div>
      </div>
      <div className="flex items-center gap-4 pt-2">
        <SkeletonLoader variant="circular" width="2rem" height="2rem" />
        <SkeletonLoader variant="text" width="8rem" height="1rem" />
        <SkeletonLoader variant="text" width="6rem" height="1rem" />
        <SkeletonLoader variant="rounded" width="4rem" height="1rem" />
      </div>
    </div>
  );
}