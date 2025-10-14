'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Accessibility Utilities and Components
 * WCAG 2.1 AA compliant with keyboard navigation support
 */

// ================================
// TYPES
// ================================

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

export interface KeyboardShortcutGroup {
  name: string;
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

// ================================
// KEYBOARD SHORTCUTS HOOK
// ================================

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const matchedShortcut = shortcuts.find(shortcut => {
        return (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.altKey === !!shortcut.altKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.metaKey === !!shortcut.metaKey
        );
      });

      if (matchedShortcut) {
        if (matchedShortcut.preventDefault !== false) {
          event.preventDefault();
        }
        matchedShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// ================================
// FOCUS MANAGEMENT HOOK
// ================================

export function useFocusManagement() {
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([]);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      setFocusHistory(prev => [...prev, activeElement]);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const lastFocused = focusHistory[focusHistory.length - 1];
    if (lastFocused) {
      lastFocused.focus();
      setFocusHistory(prev => prev.slice(0, -1));
    }
  }, [focusHistory]);

  return { saveFocus, restoreFocus };
}

// ================================
// ARROW KEY NAVIGATION HOOK
// ================================

export function useArrowKeyNavigation(
  containerRef: React.RefObject<HTMLElement | null>,
  options: {
    direction?: 'horizontal' | 'vertical';
    wrap?: boolean;
    selector?: string;
  } = {}
) {
  const {
    direction = 'vertical',
    wrap = false,
    selector = '[tabindex]:not([tabindex="-1"]), button, input, select, textarea, a[href]'
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const focusableElements = Array.from(
        container.querySelectorAll(selector)
      ) as HTMLElement[];

      const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowDown':
          if (direction === 'vertical') {
            e.preventDefault();
            nextIndex = currentIndex + 1;
          }
          break;
        case 'ArrowUp':
          if (direction === 'vertical') {
            e.preventDefault();
            nextIndex = currentIndex - 1;
          }
          break;
        case 'ArrowRight':
          if (direction === 'horizontal') {
            e.preventDefault();
            nextIndex = currentIndex + 1;
          }
          break;
        case 'ArrowLeft':
          if (direction === 'horizontal') {
            e.preventDefault();
            nextIndex = currentIndex - 1;
          }
          break;
        default:
          return;
      }

      // Handle wrapping
      if (wrap) {
        if (nextIndex >= focusableElements.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = focusableElements.length - 1;
      } else {
        nextIndex = Math.max(0, Math.min(nextIndex, focusableElements.length - 1));
      }

      const nextElement = focusableElements[nextIndex];
      if (nextElement) {
        nextElement.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, direction, wrap, selector]);
}

// ================================
// DEFAULT SHORTCUTS
// ================================

export const createDefaultShortcuts = (callbacks: {
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onSearch?: () => void;
  onHelp?: () => void;
}): KeyboardShortcutGroup[] => [
  {
    name: 'File Operations',
    shortcuts: [
      {
        key: 'n',
        ctrlKey: true,
        description: 'Create new item',
        action: callbacks.onNew || (() => {})
      },
      {
        key: 's',
        ctrlKey: true,
        description: 'Save current item',
        action: callbacks.onSave || (() => {})
      }
    ]
  },
  {
    name: 'Navigation',
    shortcuts: [
      {
        key: 'k',
        ctrlKey: true,
        description: 'Quick search',
        action: callbacks.onSearch || (() => {})
      },
      {
        key: '?',
        shiftKey: true,
        description: 'Show help',
        action: callbacks.onHelp || (() => {})
      }
    ]
  }
];