"use client";

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiTag, FiFileText } from 'react-icons/fi';
import Link from 'next/link';

interface Suggestion {
  type: 'article' | 'category' | 'search';
  text: string;
  slug?: string;
  count?: number;
  views?: number;
  icon: string;
}

interface SearchSuggestionsProps {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

export default function SearchSuggestions({ 
  query, 
  onSuggestionClick, 
  onClose, 
  isVisible 
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : -1
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > -1 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            onSuggestionClick(suggestions[selectedIndex].text);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onSuggestionClick, onClose]);

  if (!isVisible || (!isLoading && suggestions.length === 0)) {
    return null;
  }

  return (
    <div 
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 mt-1 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
    >
      {isLoading ? (
        <div className="p-4 text-center text-white/60">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/20 mx-auto mb-2"></div>
          Finding suggestions...
        </div>
      ) : (
        <div className="py-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.text}`}
              onClick={() => onSuggestionClick(suggestion.text)}
              className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-3 ${
                index === selectedIndex ? 'bg-white/10' : ''
              }`}
            >
              <span className="text-lg">{suggestion.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white truncate">{suggestion.text}</div>
                <div className="text-xs text-white/50">
                  {suggestion.type === 'article' && suggestion.views && (
                    <span>{suggestion.views.toLocaleString()} views</span>
                  )}
                  {suggestion.type === 'category' && suggestion.count && (
                    <span>{suggestion.count} articles</span>
                  )}
                  {suggestion.type === 'search' && suggestion.count && (
                    <span>Popular search</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-white/40 uppercase">
                {suggestion.type}
              </div>
            </button>
          ))}
          
          {suggestions.length > 0 && (
            <div className="px-4 py-2 text-xs text-white/40 border-t border-white/10">
              Use ↑↓ to navigate, Enter to select, Esc to close
            </div>
          )}
        </div>
      )}
    </div>
  );
}