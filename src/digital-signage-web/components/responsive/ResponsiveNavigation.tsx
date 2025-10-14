'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Mobile Navigation Component
 * Following mobile-first responsive design principles
 */

// Types for navigation items
export interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
}

export interface MobileNavProps {
  items: NavItem[];
  currentPath?: string | undefined;
  onItemClick?: ((item: NavItem) => void) | undefined;
  className?: string;
}

// ================================
// MOBILE NAVIGATION HOOK
// ================================

export function useMobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    
    return undefined;
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return {
    isOpen,
    isMobile,
    toggleMenu,
    closeMenu,
    setIsOpen
  };
}

// ================================
// HAMBURGER MENU BUTTON
// ================================

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  isOpen,
  onClick,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center',
        'p-2 rounded-md text-gray-400',
        'hover:text-gray-500 hover:bg-gray-100',
        'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
        'transition-all duration-200',
        className
      )}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <span className="sr-only">Open main menu</span>
      <div className="block h-6 w-6">
        <span
          className={cn(
            'absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out',
            isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
          )}
        />
        <span
          className={cn(
            'absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out',
            isOpen ? 'opacity-0' : 'opacity-100'
          )}
        />
        <span
          className={cn(
            'absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out',
            isOpen ? '-rotate-45 -translate-y-0' : 'translate-y-2'
          )}
        />
      </div>
    </button>
  );
};

// ================================
// MOBILE NAVIGATION MENU
// ================================

export const MobileNavMenu: React.FC<MobileNavProps> = ({
  items,
  currentPath = '',
  onItemClick,
  className = ''
}) => {
  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = currentPath === item.href;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.href} className={cn('w-full', level > 0 && 'ml-4')}>
        <button
          type="button"
          onClick={() => onItemClick?.(item)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-md text-left',
            'text-base font-medium transition-colors duration-200',
            isActive
              ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50',
            'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
          )}
        >
          <div className="flex items-center space-x-3">
            {item.icon && (
              <span className="flex-shrink-0 h-5 w-5">{item.icon}</span>
            )}
            <span>{item.label}</span>
          </div>
          
          {item.badge && (
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              isActive
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            )}>
              {item.badge}
            </span>
          )}
        </button>

        {hasChildren && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn('py-2 space-y-1', className)}>
      {items.map(item => renderNavItem(item))}
    </nav>
  );
};

// ================================
// RESPONSIVE NAVIGATION LAYOUT
// ================================

interface ResponsiveNavLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  currentPath?: string | undefined;
  onNavItemClick?: ((item: NavItem) => void) | undefined;
  title?: string;
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const ResponsiveNavLayout: React.FC<ResponsiveNavLayoutProps> = ({
  children,
  navItems,
  currentPath,
  onNavItemClick,
  title = 'Digital Signage',
  logo,
  actions,
  className = ''
}) => {
  const { isOpen, isMobile, toggleMenu, closeMenu } = useMobileNavigation();

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Mobile header */}
      <div className="md:hidden bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {logo}
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {actions}
              <HamburgerButton isOpen={isOpen} onClick={toggleMenu} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            className={cn(
              'fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity duration-300',
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            onClick={closeMenu}
          />
          
          {/* Slide-out panel */}
          <div
            className={cn(
              'fixed top-0 left-0 z-50 w-80 max-w-sm h-full bg-white shadow-xl',
              'transform transition-transform duration-300 ease-in-out',
              isOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  {logo}
                  <h2 className="text-lg font-semibold text-gray-900">
                    {title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <span className="sr-only">Close menu</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Navigation */}
              <div className="flex-1 px-4 py-2 overflow-y-auto">
                <MobileNavMenu
                  items={navItems}
                  currentPath={currentPath}
                  onItemClick={(item) => {
                    onNavItemClick?.(item);
                    closeMenu();
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop layout */}
      <div className="hidden md:flex md:h-screen">
        {/* Desktop sidebar */}
        <div className="flex flex-col w-64 bg-white shadow-sm border-r">
          <div className="flex items-center h-16 px-6 border-b">
            <div className="flex items-center space-x-3">
              {logo}
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
            </div>
          </div>
          
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <MobileNavMenu
              items={navItems}
              currentPath={currentPath}
              onItemClick={onNavItemClick}
            />
          </nav>
        </div>

        {/* Desktop main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="h-16 bg-white shadow-sm border-b px-6 flex items-center justify-end">
            {actions}
          </div>
          
          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile content */}
      <div className="md:hidden">
        {children}
      </div>
    </div>
  );
};

// ================================
// RESPONSIVE BOTTOM NAVIGATION
// ================================

interface BottomNavProps {
  items: NavItem[];
  currentPath?: string | undefined;
  onItemClick?: ((item: NavItem) => void) | undefined;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({
  items,
  currentPath = '',
  onItemClick,
  className = ''
}) => {
  // Only show first 5 items for mobile bottom nav
  const displayItems = items.slice(0, 5);

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg',
      'md:hidden z-30',
      className
    )}>
      <div className="grid grid-cols-5 h-16">
        {displayItems.map((item) => {
          const isActive = currentPath === item.href;
          
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => onItemClick?.(item)}
              className={cn(
                'flex flex-col items-center justify-center space-y-1',
                'text-xs font-medium transition-colors duration-200',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900',
                'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
              )}
            >
              <span className="h-5 w-5">{item.icon}</span>
              <span className="truncate max-w-full px-1">{item.label}</span>
              {item.badge && (
                <span className="absolute top-1 right-2 inline-flex items-center justify-center px-1 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white min-w-[1rem] h-4">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default {
  useMobileNavigation,
  HamburgerButton,
  MobileNavMenu,
  ResponsiveNavLayout,
  BottomNavigation
};