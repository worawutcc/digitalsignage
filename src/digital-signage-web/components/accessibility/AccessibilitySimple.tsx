'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  useKeyboardShortcuts, 
  useFocusManagement, 
  useArrowKeyNavigation,
  createDefaultShortcuts,
  type KeyboardShortcut,
  type KeyboardShortcutGroup
} from '../../hooks/useAccessibilitySimple';

/**
 * Accessibility Components - Simplified Version
 * WCAG 2.1 AA compliant with keyboard navigation
 */

// ================================
// KEYBOARD SHORTCUT HELP MODAL
// ================================

interface KeyboardShortcutHelpProps {
  shortcuts: KeyboardShortcutGroup[];
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutHelp: React.FC<KeyboardShortcutHelpProps> = ({
  shortcuts,
  isOpen,
  onClose
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { saveFocus, restoreFocus } = useFocusManagement();

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      saveFocus();
      setTimeout(() => {
        const closeButton = modalRef.current?.querySelector('button');
        closeButton?.focus();
      }, 100);
    } else {
      restoreFocus();
    }
  }, [isOpen, saveFocus, restoreFocus]);

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.metaKey) keys.push('Cmd');
    keys.push(shortcut.key);
    return keys.join(' + ');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-xl font-semibold">
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {shortcuts.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                {group.name}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut: KeyboardShortcut, shortcutIndex: number) => (
                  <div
                    key={shortcutIndex}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-700">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ================================
// ACCESSIBLE INPUT COMPONENT
// ================================

interface AccessibleInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  className?: string;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  helperText,
  errorText,
  className = ''
}) => {
  const hasError = !!errorText;
  const helperTextId = `${id}-helper`;
  const errorTextId = `${id}-error`;

  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'block w-full px-3 py-2 border rounded-md shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          hasError 
            ? 'border-red-300 text-red-900' 
            : 'border-gray-300',
          'sm:text-sm'
        )}
        aria-describedby={cn(
          helperText && helperTextId,
          errorText && errorTextId
        )}
        aria-invalid={hasError}
      />
      
      {helperText && !hasError && (
        <p id={helperTextId} className="text-xs text-gray-600">
          {helperText}
        </p>
      )}
      
      {errorText && (
        <p id={errorTextId} className="text-xs text-red-600" role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
};

// ================================
// ACCESSIBLE TABS COMPONENT
// ================================

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccessibleTabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const AccessibleTabs: React.FC<AccessibleTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  className = ''
}) => {
  const tabListRef = useRef<HTMLDivElement | null>(null);
  
  useArrowKeyNavigation(tabListRef, {
    direction: 'horizontal',
    wrap: true,
    selector: '[role="tab"]:not([aria-disabled="true"])'
  });

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        ref={tabListRef}
        role="tablist"
        className="flex border-b border-gray-200"
        aria-label="Content tabs"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`tabpanel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={tab.id !== activeTabId}
            className="focus:outline-none"
            tabIndex={0}
          >
            {tab.id === activeTabId && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

// ================================
// SKIP TO CONTENT LINK
// ================================

export const SkipToContent: React.FC = () => {
  const handleSkip = () => {
    const target = document.getElementById('main-content');
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleSkip}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-blue-600 text-white px-4 py-2 rounded-md z-50',
        'focus:outline-none focus:ring-2 focus:ring-blue-500'
      )}
    >
      Skip to main content
    </button>
  );
};

// ================================
// LIVE REGION FOR ANNOUNCEMENTS
// ================================

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite'
}) => {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

// ================================
// ACCESSIBILITY PROVIDER
// ================================

interface AccessibilityContextType {
  shortcuts: KeyboardShortcutGroup[];
  showShortcutHelp: () => void;
  announceMessage: (message: string) => void;
}

const AccessibilityContext = React.createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: React.ReactNode;
  customShortcuts?: KeyboardShortcutGroup[];
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  customShortcuts = []
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState('');

  const defaultShortcuts = createDefaultShortcuts({
    onHelp: () => setIsHelpOpen(true)
  });

  const allShortcuts = [...defaultShortcuts, ...customShortcuts];

  useKeyboardShortcuts(
    allShortcuts.flatMap(group => group.shortcuts),
    true
  );

  const handleAnnounceMessage = (message: string) => {
    setAnnounceMessage(message);
    setTimeout(() => setAnnounceMessage(''), 100);
  };

  const contextValue: AccessibilityContextType = {
    shortcuts: allShortcuts,
    showShortcutHelp: () => setIsHelpOpen(true),
    announceMessage: handleAnnounceMessage
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <SkipToContent />
      {children}
      
      <KeyboardShortcutHelp
        shortcuts={allShortcuts}
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
      
      <LiveRegion message={announceMessage} />
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export default {
  KeyboardShortcutHelp,
  AccessibleInput,
  AccessibleTabs,
  SkipToContent,
  LiveRegion,
  AccessibilityProvider,
  useAccessibility
};