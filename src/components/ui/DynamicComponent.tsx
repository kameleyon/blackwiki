"use client";

import React, { Suspense, ComponentType } from 'react';
import dynamic from 'next/dynamic';

interface DynamicComponentProps {
  componentName: string;
  fallback?: React.ReactNode;
  props?: Record<string, unknown>;
}

// Define a type for the dynamic import function
type DynamicImport = () => Promise<{ default: ComponentType<any> }>;

// Map of component paths - only include components that actually exist in the project
const componentMap: Record<string, DynamicImport> = {
  // Editor components
  'RichTextEditor': () => import('@/components/editor/RichTextEditor'),
  
  // Collaboration components
  'CollaborativeEditor': () => import('@/components/collaboration/CollaborativeEditor'),
  'CommentSystem': () => import('@/components/collaboration/CommentSystem'),
  
  // Reference components
  'ReferenceManager': () => import('@/components/references/ReferenceManager'),
  
  // Add more components as needed
};

/**
 * Dynamic component loader with Suspense
 * This component dynamically imports and renders components based on their name
 */
export default function DynamicComponent({
  componentName,
  fallback = <div className="w-full h-32 flex items-center justify-center bg-white/5 rounded-md">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white/30"></div>
  </div>,
  props = {}
}: DynamicComponentProps) {
  // Check if the component exists in our map
  if (!componentMap[componentName]) {
    console.error(`Component "${componentName}" not found in component map`);
    return <div>Component not found: {componentName}</div>;
  }
  
  // Dynamically load the component
  const Component = dynamic(componentMap[componentName], {
    loading: () => <>{fallback}</>,
    ssr: false, // Disable server-side rendering for these components
  });
  
  // Render the component with Suspense for better error handling
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}

/**
 * HOC to memoize components to prevent unnecessary re-renders
 */
export function withMemo<T>(Component: React.ComponentType<T>) {
  return React.memo(Component);
}

/**
 * Example usage:
 * 
 * <DynamicComponent 
 *   componentName="RichTextEditor" 
 *   props={{ 
 *     initialValue: "# Hello World", 
 *     onChange: (value) => console.log(value) 
 *   }} 
 * />
 */
