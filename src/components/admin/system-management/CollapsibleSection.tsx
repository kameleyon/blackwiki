"use client";

import { ReactNode } from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';

interface CollapsibleSectionProps {
  title: string;
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  badge?: {
    text: string;
    color: string;
  };
  children: ReactNode;
}

export const CollapsibleSection = ({
  title,
  icon,
  isExpanded,
  onToggle,
  badge,
  children
}: CollapsibleSectionProps) => {
  return (
    <div 
      className={`bg-white/5 rounded-xl shadow-sm shadow-black overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-[1000px]' : 'max-h-16'
      }`}
    >
      <div 
        className="px-6 py-4 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <div className="text-white/60 mr-2">
            {icon}
          </div>
          <h3 className="text-lg font-normal">{title}</h3>
          {badge && (
            <span className={`ml-2 px-2 py-0.5 ${badge.color} rounded-full text-xs`}>
              {badge.text}
            </span>
          )}
        </div>
        {isExpanded ? (
          <FiMinimize2 className="text-white/60" size={18} />
        ) : (
          <FiMaximize2 className="text-white/60" size={18} />
        )}
      </div>
      
      {isExpanded && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
};
