"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiX, FiCalendar, FiUser, FiTag, FiFolder, FiChevronDown } from "react-icons/fi";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FilterOption {
  id: string;
  name: string;
  _count?: {
    articles: number;
  };
}

interface FilterOptions {
  categories: FilterOption[];
  tags: FilterOption[];
  authors: FilterOption[];
}

interface SearchFilters {
  categories: string[];
  tags: string[];
  authors: string[];
  dateFrom: string;
  dateTo: string;
  sortBy: 'relevance' | 'recent' | 'views' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export default function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  isVisible,
  onToggle
}: AdvancedSearchFiltersProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    tags: [],
    authors: []
  });
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    tags: true,
    authors: true,
    date: false
  });

  // Focus management for accessibility
  useEffect(() => {
    if (isVisible) {
      // Focus the first interactive element when panel opens
      const firstButton = document.querySelector('#advanced-filters-panel button');
      if (firstButton) {
        (firstButton as HTMLElement).focus();
      }
    }
  }, [isVisible]);

  // Handle escape key and outside click
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onToggle();
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      if (isVisible) {
        const panel = document.getElementById('advanced-filters-panel');
        const toggleButton = document.querySelector('[aria-controls="advanced-filters-panel"]');
        if (panel && toggleButton && !panel.contains(event.target as Node) && !toggleButton.contains(event.target as Node)) {
          onToggle();
        }
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isVisible, onToggle]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!isVisible) return;
      
      setLoading(true);
      try {
        const response = await fetch('/api/search/filters');
        if (response.ok) {
          const data = await response.json();
          setFilterOptions(data.data);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, [isVisible]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMultiSelect = (type: 'categories' | 'tags' | 'authors', value: string) => {
    const current = filters[type];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFilters({ [type]: updated });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      tags: [],
      authors: [],
      dateFrom: '',
      dateTo: '',
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  const getActiveFiltersCount = () => {
    return filters.categories.length + 
           filters.tags.length + 
           filters.authors.length + 
           (filters.dateFrom ? 1 : 0) + 
           (filters.dateTo ? 1 : 0);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
        aria-expanded={isVisible}
        aria-controls="advanced-filters-panel"
        aria-label={`Advanced search filters${getActiveFiltersCount() > 0 ? ` (${getActiveFiltersCount()} active)` : ''}`}
      >
        <FiFilter size={14} aria-hidden="true" />
        <span>Advanced Filters</span>
        {getActiveFiltersCount() > 0 && (
          <span 
            className="bg-white/20 text-xs px-2 py-0.5 rounded-full"
            aria-label={`${getActiveFiltersCount()} active filters`}
          >
            {getActiveFiltersCount()}
          </span>
        )}
      </button>

      {/* Filters Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            id="advanced-filters-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="advanced-filters-title"
            className="absolute top-full mt-2 left-0 right-0 w-full max-w-4xl bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 md:p-6 z-50 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 id="advanced-filters-title" className="font-semibold text-lg">Advanced Search Filters</h3>
              <div className="flex items-center gap-2">
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onToggle}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Content Filters */}
                <div className="space-y-4">
                  {/* Categories */}
                  <div>
                    <button
                      onClick={() => toggleSection('categories')}
                      className="flex items-center justify-between w-full mb-3 text-sm font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <FiFolder size={14} />
                        <span>Categories</span>
                        {filters.categories.length > 0 && (
                          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                            {filters.categories.length}
                          </span>
                        )}
                      </div>
                      <FiChevronDown
                        size={14}
                        className={`transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.categories && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="max-h-40 overflow-y-auto space-y-2"
                        >
                          {filterOptions.categories.slice(0, 10).map(category => (
                            <label key={category.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.categories.includes(category.name)}
                                onChange={() => handleMultiSelect('categories', category.name)}
                                className="rounded border-white/20 bg-white/10 text-white focus:ring-white/20"
                              />
                              <span className="flex-1">{category.name}</span>
                              <span className="text-xs text-white/50">
                                {category._count?.articles || 0}
                              </span>
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Tags */}
                  <div>
                    <button
                      onClick={() => toggleSection('tags')}
                      className="flex items-center justify-between w-full mb-3 text-sm font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <FiTag size={14} />
                        <span>Tags</span>
                        {filters.tags.length > 0 && (
                          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                            {filters.tags.length}
                          </span>
                        )}
                      </div>
                      <FiChevronDown
                        size={14}
                        className={`transition-transform ${expandedSections.tags ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.tags && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="max-h-40 overflow-y-auto space-y-2"
                        >
                          {filterOptions.tags.slice(0, 10).map(tag => (
                            <label key={tag.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.tags.includes(tag.name)}
                                onChange={() => handleMultiSelect('tags', tag.name)}
                                className="rounded border-white/20 bg-white/10 text-white focus:ring-white/20"
                              />
                              <span className="flex-1">#{tag.name}</span>
                              <span className="text-xs text-white/50">
                                {tag._count?.articles || 0}
                              </span>
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Authors */}
                  <div>
                    <button
                      onClick={() => toggleSection('authors')}
                      className="flex items-center justify-between w-full mb-3 text-sm font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <FiUser size={14} />
                        <span>Authors</span>
                        {filters.authors.length > 0 && (
                          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                            {filters.authors.length}
                          </span>
                        )}
                      </div>
                      <FiChevronDown
                        size={14}
                        className={`transition-transform ${expandedSections.authors ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.authors && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="max-h-40 overflow-y-auto space-y-2"
                        >
                          {filterOptions.authors.slice(0, 10).map(author => (
                            <label key={author.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.authors.includes(author.id)}
                                onChange={() => handleMultiSelect('authors', author.id)}
                                className="rounded border-white/20 bg-white/10 text-white focus:ring-white/20"
                              />
                              <span className="flex-1">{author.name}</span>
                              <span className="text-xs text-white/50">
                                {author._count?.articles || 0}
                              </span>
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Sort and Date Filters */}
                <div className="space-y-4">
                  {/* Sort Options */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <span>Sort & Order</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        { value: 'relevance', label: 'Relevance' },
                        { value: 'recent', label: 'Most Recent' },
                        { value: 'views', label: 'Most Viewed' },
                        { value: 'title', label: 'Title A-Z' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => updateFilters({ sortBy: option.value as any })}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            filters.sortBy === option.value 
                              ? 'bg-white/20 text-white' 
                              : 'bg-white/5 hover:bg-white/10 text-white/80'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateFilters({ sortOrder: 'desc' })}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          filters.sortOrder === 'desc'
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 hover:bg-white/10 text-white/80'
                        }`}
                      >
                        Descending
                      </button>
                      <button
                        onClick={() => updateFilters({ sortOrder: 'asc' })}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          filters.sortOrder === 'asc'
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 hover:bg-white/10 text-white/80'
                        }`}
                      >
                        Ascending
                      </button>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <button
                      onClick={() => toggleSection('date')}
                      className="flex items-center justify-between w-full mb-3 text-sm font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <FiCalendar size={14} />
                        <span>Date Range</span>
                        {(filters.dateFrom || filters.dateTo) && (
                          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <FiChevronDown
                        size={14}
                        className={`transition-transform ${expandedSections.date ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.date && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          <div>
                            <label className="block text-xs text-white/70 mb-1">From Date</label>
                            <input
                              type="date"
                              value={filters.dateFrom}
                              onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/70 mb-1">To Date</label>
                            <input
                              type="date"
                              value={filters.dateTo}
                              onChange={(e) => updateFilters({ dateTo: e.target.value })}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}