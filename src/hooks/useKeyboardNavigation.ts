'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardNavigationOptions {
  /** Handle Escape key press */
  onEscape?: () => void;
  /** Handle Enter key press */
  onEnter?: () => void;
  /** Handle Arrow key navigation */
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  /** Handle Tab key for focus management */
  onTab?: (direction: 'forward' | 'backward') => void;
  /** Whether navigation is enabled */
  enabled?: boolean;
  /** Prevent default behavior for handled keys */
  preventDefault?: boolean;
}

/**
 * Hook for comprehensive keyboard navigation support
 */
export function useKeyboardNavigation({
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onTab,
  enabled = true,
  preventDefault = true
}: KeyboardNavigationOptions = {}) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    let handled = false;

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          onEscape();
          handled = true;
        }
        break;
      
      case 'Enter':
        if (onEnter && !event.shiftKey && !event.ctrlKey && !event.altKey) {
          onEnter();
          handled = true;
        }
        break;
      
      case 'ArrowUp':
        if (onArrowUp) {
          onArrowUp();
          handled = true;
        }
        break;
      
      case 'ArrowDown':
        if (onArrowDown) {
          onArrowDown();
          handled = true;
        }
        break;
      
      case 'ArrowLeft':
        if (onArrowLeft) {
          onArrowLeft();
          handled = true;
        }
        break;
      
      case 'ArrowRight':
        if (onArrowRight) {
          onArrowRight();
          handled = true;
        }
        break;
      
      case 'Tab':
        if (onTab) {
          onTab(event.shiftKey ? 'backward' : 'forward');
          handled = true;
        }
        break;
    }

    if (handled && preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [
    enabled,
    preventDefault,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab
  ]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return { handleKeyDown };
}

/**
 * Hook for focus management within a container
 */
export function useFocusManager(containerRef?: React.RefObject<HTMLElement>) {
  const focusFirst = useCallback(() => {
    const container = containerRef?.current || document;
    const focusable = container.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }, [containerRef]);

  const focusLast = useCallback(() => {
    const container = containerRef?.current || document;
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable[focusable.length - 1]?.focus();
  }, [containerRef]);

  const focusNext = useCallback(() => {
    const container = containerRef?.current || document;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ));
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const nextElement = focusable[currentIndex + 1] || focusable[0];
    nextElement?.focus();
  }, [containerRef]);

  const focusPrevious = useCallback(() => {
    const container = containerRef?.current || document;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ));
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const previousElement = focusable[currentIndex - 1] || focusable[focusable.length - 1];
    previousElement?.focus();
  }, [containerRef]);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      const container = containerRef?.current;
      if (!container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));

      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [containerRef]);

  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    trapFocus
  };
}