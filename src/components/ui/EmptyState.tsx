'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiBookOpen, FiPlus, FiFilter, FiUsers, FiStar } from 'react-icons/fi';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface EmptyStateProps {
  /** Type of empty state to determine appropriate message and actions */
  type?: 'search' | 'articles' | 'favorites' | 'users' | 'reviews' | 'generic';
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Primary action button */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  /** Additional actions */
  actions?: ReactNode;
  /** Custom illustration/icon */
  icon?: ReactNode;
  /** Custom className for styling */
  className?: string;
  /** Whether to show suggestions */
  showSuggestions?: boolean;
  /** Custom suggestions list */
  suggestions?: string[];
}

/**
 * Comprehensive empty state component with contextual guidance and CTAs
 */
export function EmptyState({
  type = 'generic',
  title,
  description,
  primaryAction,
  secondaryAction,
  actions,
  icon,
  className = '',
  showSuggestions = true,
  suggestions
}: EmptyStateProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Get empty state configuration based on type
  const config = getEmptyStateConfig(type);
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalIcon = icon || <config.icon className="w-12 h-12 text-white/40" />;
  const finalSuggestions = suggestions || config.suggestions;

  const containerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: 'easeOut'
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Illustration */}
      <motion.div 
        variants={itemVariants}
        className="mb-6"
      >
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
          {finalIcon}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-3">
          {finalTitle}
        </h2>
        <p className="text-white/70 leading-relaxed max-w-md">
          {finalDescription}
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-wrap justify-center gap-3 mb-6"
      >
        {/* Primary Action */}
        {primaryAction && (
          <motion.button
            onClick={primaryAction.onClick}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          >
            {primaryAction.icon}
            {primaryAction.label}
          </motion.button>
        )}

        {/* Secondary Action */}
        {secondaryAction && (
          <motion.button
            onClick={secondaryAction.onClick}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          >
            {secondaryAction.icon}
            {secondaryAction.label}
          </motion.button>
        )}

        {/* Custom Actions */}
        {actions}
      </motion.div>

      {/* Suggestions */}
      {showSuggestions && finalSuggestions && finalSuggestions.length > 0 && (
        <motion.div 
          variants={itemVariants}
          className="w-full"
        >
          <h3 className="text-sm font-medium text-white/80 mb-3">
            Try these suggestions:
          </h3>
          <ul className="space-y-2 text-sm text-white/60">
            {finalSuggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center justify-center gap-2">
                <span className="w-1 h-1 bg-white/40 rounded-full flex-shrink-0" />
                {suggestion}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Get empty state configuration based on type
 */
function getEmptyStateConfig(type: EmptyStateProps['type']) {
  const configs = {
    search: {
      title: 'No Results Found',
      description: 'We couldn\'t find any articles matching your search criteria. Try adjusting your filters or search terms.',
      icon: FiSearch,
      suggestions: [
        'Check your spelling',
        'Try more general keywords',
        'Remove some filters',
        'Browse by categories instead'
      ]
    },
    articles: {
      title: 'No Articles Yet',
      description: 'There are no articles in this section yet. Be the first to contribute knowledge to the AfroWiki community!',
      icon: FiBookOpen,
      suggestions: [
        'Share your knowledge and expertise',
        'Document historical events',
        'Highlight cultural achievements',
        'Collaborate with other contributors'
      ]
    },
    favorites: {
      title: 'No Favorites Yet',
      description: 'You haven\'t saved any articles to your favorites. Start exploring and save interesting articles for later.',
      icon: FiStar,
      suggestions: [
        'Browse featured articles',
        'Explore different categories',
        'Search for topics you\'re interested in',
        'Check out recently updated articles'
      ]
    },
    users: {
      title: 'No Users Found',
      description: 'There are no users matching your criteria. The AfroWiki community is growing - invite others to join!',
      icon: FiUsers,
      suggestions: [
        'Invite friends and colleagues',
        'Share AfroWiki on social media',
        'Participate in community discussions',
        'Help build the knowledge base'
      ]
    },
    reviews: {
      title: 'No Reviews Pending',
      description: 'All caught up! There are no articles pending review at the moment.',
      icon: FiFilter,
      suggestions: [
        'Check back later for new submissions',
        'Review your own draft articles',
        'Help improve existing articles',
        'Mentor new contributors'
      ]
    },
    generic: {
      title: 'Nothing Here Yet',
      description: 'This section is empty, but it won\'t be for long. Check back soon for updates!',
      icon: FiBookOpen,
      suggestions: [
        'Explore other sections',
        'Contribute content',
        'Join the community',
        'Share your knowledge'
      ]
    }
  };

  return configs[type || 'generic'];
}

/**
 * Pre-configured EmptyState components for common use cases
 */
export const SearchEmptyState = (props: Omit<EmptyStateProps, 'type'>) => (
  <EmptyState type="search" {...props} />
);

export const ArticlesEmptyState = (props: Omit<EmptyStateProps, 'type'>) => (
  <EmptyState type="articles" {...props} />
);

export const FavoritesEmptyState = (props: Omit<EmptyStateProps, 'type'>) => (
  <EmptyState type="favorites" {...props} />
);

export const UsersEmptyState = (props: Omit<EmptyStateProps, 'type'>) => (
  <EmptyState type="users" {...props} />
);

export const ReviewsEmptyState = (props: Omit<EmptyStateProps, 'type'>) => (
  <EmptyState type="reviews" {...props} />
);