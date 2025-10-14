'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Mobile-First Layout Components
 * Responsive grid systems and containers following Tailwind CSS 4 patterns
 */

// ================================
// RESPONSIVE BREAKPOINTS
// ================================

export const breakpoints = {
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)  
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices
  '2xl': 1536 // 2X large devices
} as const;

export type Breakpoint = keyof typeof breakpoints;

// ================================
// RESPONSIVE CONTAINER
// ================================

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
  padding = 'md',
  center = true
}) => {
  const containerClasses = cn(
    'w-full',
    center && 'mx-auto',
    // Max widths (mobile first)
    maxWidth === 'sm' && 'max-w-sm',
    maxWidth === 'md' && 'max-w-md', 
    maxWidth === 'lg' && 'max-w-4xl',
    maxWidth === 'xl' && 'max-w-6xl',
    maxWidth === '2xl' && 'max-w-7xl',
    maxWidth === 'full' && 'max-w-none',
    // Responsive padding
    padding === 'none' && 'px-0',
    padding === 'xs' && 'px-2 sm:px-3',
    padding === 'sm' && 'px-3 sm:px-4', 
    padding === 'md' && 'px-4 sm:px-6 lg:px-8',
    padding === 'lg' && 'px-6 sm:px-8 lg:px-12',
    padding === 'xl' && 'px-8 sm:px-12 lg:px-16',
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

// ================================
// RESPONSIVE GRID
// ================================

interface GridConfig {
  cols: number;
  gap?: number;
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  default?: GridConfig;
  sm?: GridConfig;
  md?: GridConfig; 
  lg?: GridConfig;
  xl?: GridConfig;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  default: defaultConfig = { cols: 1, gap: 4 },
  sm,
  md,
  lg,
  xl
}) => {
  const gridClasses = cn(
    'grid',
    // Base grid (mobile first)
    `grid-cols-${defaultConfig.cols}`,
    `gap-${defaultConfig.gap || 4}`,
    // Responsive breakpoints
    sm && `sm:grid-cols-${sm.cols}`,
    sm?.gap && `sm:gap-${sm.gap}`,
    md && `md:grid-cols-${md.cols}`,
    md?.gap && `md:gap-${md.gap}`,
    lg && `lg:grid-cols-${lg.cols}`,
    lg?.gap && `lg:gap-${lg.gap}`,
    xl && `xl:grid-cols-${xl.cols}`,
    xl?.gap && `xl:gap-${xl.gap}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// ================================
// RESPONSIVE STACK
// ================================

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'column' | 'row';
  spacing?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  responsive?: {
    sm?: Partial<ResponsiveStackProps>;
    md?: Partial<ResponsiveStackProps>;
    lg?: Partial<ResponsiveStackProps>;
  };
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className = '',
  direction = 'column',
  spacing = 4,
  align = 'start',
  justify = 'start',
  wrap = false,
  responsive = {}
}) => {
  const stackClasses = cn(
    'flex',
    // Base direction and spacing
    direction === 'column' ? 'flex-col' : 'flex-row',
    direction === 'column' ? `space-y-${spacing}` : `space-x-${spacing}`,
    // Alignment
    align === 'start' && 'items-start',
    align === 'center' && 'items-center', 
    align === 'end' && 'items-end',
    align === 'stretch' && 'items-stretch',
    // Justification
    justify === 'start' && 'justify-start',
    justify === 'center' && 'justify-center',
    justify === 'end' && 'justify-end', 
    justify === 'between' && 'justify-between',
    justify === 'around' && 'justify-around',
    justify === 'evenly' && 'justify-evenly',
    // Wrap
    wrap && 'flex-wrap',
    // Responsive variants
    responsive.sm?.direction === 'row' && 'sm:flex-row',
    responsive.sm?.direction === 'column' && 'sm:flex-col',
    responsive.md?.direction === 'row' && 'md:flex-row',
    responsive.md?.direction === 'column' && 'md:flex-col',
    responsive.lg?.direction === 'row' && 'lg:flex-row',
    responsive.lg?.direction === 'column' && 'lg:flex-col',
    className
  );

  return (
    <div className={stackClasses}>
      {children}
    </div>
  );
};

// ================================
// RESPONSIVE CARD
// ================================

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  hover?: boolean;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  border = true,
  hover = false
}) => {
  const cardClasses = cn(
    'bg-white',
    // Border
    border && 'border border-gray-200',
    // Shadows
    shadow === 'xs' && 'shadow-xs',
    shadow === 'sm' && 'shadow-sm',
    shadow === 'md' && 'shadow-md',
    shadow === 'lg' && 'shadow-lg',
    shadow === 'xl' && 'shadow-xl',
    shadow === 'none' && 'shadow-none',
    // Rounded corners
    rounded === 'sm' && 'rounded-sm',
    rounded === 'md' && 'rounded-md',
    rounded === 'lg' && 'rounded-lg',
    rounded === 'xl' && 'rounded-xl',
    rounded === 'none' && 'rounded-none',
    // Mobile-first padding
    padding === 'none' && 'p-0',
    padding === 'xs' && 'p-2 sm:p-3',
    padding === 'sm' && 'p-3 sm:p-4',
    padding === 'md' && 'p-4 sm:p-6',
    padding === 'lg' && 'p-6 sm:p-8',
    padding === 'xl' && 'p-8 sm:p-12',
    // Hover effects
    hover && 'transition-shadow duration-200 hover:shadow-lg',
    className
  );

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

// ================================
// RESPONSIVE TEXT
// ================================

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  size?: {
    base?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  };
  weight?: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'inherit' | 'gray-900' | 'gray-700' | 'gray-600' | 'gray-500' | 'blue-600' | 'red-600' | 'green-600';
  align?: 'left' | 'center' | 'right' | 'justify';
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className = '',
  as: Component = 'p',
  size = { base: 'base' },
  weight = 'normal',
  color = 'gray-900',
  align = 'left'
}) => {
  const textClasses = cn(
    // Base size (mobile first)
    size.base && `text-${size.base}`,
    // Responsive sizes
    size.sm && `sm:text-${size.sm}`,
    size.md && `md:text-${size.md}`,
    size.lg && `lg:text-${size.lg}`,
    // Weight and color
    `font-${weight}`,
    color !== 'inherit' && `text-${color}`,
    // Alignment
    align === 'left' && 'text-left',
    align === 'center' && 'text-center',
    align === 'right' && 'text-right', 
    align === 'justify' && 'text-justify',
    className
  );

  return (
    <Component className={textClasses}>
      {children}
    </Component>
  );
};

// ================================
// RESPONSIVE SIDEBAR LAYOUT
// ================================

interface ResponsiveSidebarLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  sidebarPosition?: 'left' | 'right';
  collapsible?: boolean;
  mobileBreakpoint?: 'sm' | 'md' | 'lg';
}

export const ResponsiveSidebarLayout: React.FC<ResponsiveSidebarLayoutProps> = ({
  children,
  sidebar,
  className = '',
  sidebarWidth = 'md',
  sidebarPosition = 'left',
  collapsible = true,
  mobileBreakpoint = 'lg'
}) => {
  const sidebarWidthClasses = {
    sm: 'w-64',
    md: 'w-80', 
    lg: 'w-96'
  };

  const layoutClasses = cn(
    'min-h-screen',
    // Desktop layout
    `${mobileBreakpoint}:flex`,
    sidebarPosition === 'right' && `${mobileBreakpoint}:flex-row-reverse`,
    className
  );

  const sidebarClasses = cn(
    'bg-white border-gray-200',
    sidebarPosition === 'left' ? 'border-r' : 'border-l',
    // Mobile: full width, hidden by default if collapsible
    collapsible && `hidden ${mobileBreakpoint}:block`,
    // Desktop: fixed width
    `${mobileBreakpoint}:${sidebarWidthClasses[sidebarWidth]}`,
    `${mobileBreakpoint}:flex-shrink-0`
  );

  const contentClasses = cn(
    'flex-1 min-w-0', // min-w-0 prevents flex item from overflowing
    `${mobileBreakpoint}:overflow-hidden`
  );

  return (
    <div className={layoutClasses}>
      <aside className={sidebarClasses}>
        {sidebar}
      </aside>
      <main className={contentClasses}>
        {children}
      </main>
    </div>
  );
};

// ================================
// RESPONSIVE UTILITIES
// ================================

export const ResponsiveUtils = {
  // Common responsive patterns
  spacing: {
    xs: 'space-y-2 sm:space-y-3',
    sm: 'space-y-3 sm:space-y-4',
    md: 'space-y-4 sm:space-y-6', 
    lg: 'space-y-6 sm:space-y-8',
    xl: 'space-y-8 sm:space-y-12'
  },

  padding: {
    xs: 'p-2 sm:p-3',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-12'
  },

  // Layout patterns
  centerContent: 'flex items-center justify-center min-h-screen p-4',
  stackOnMobile: 'flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0',
  hideOnMobile: 'hidden md:block',
  showOnMobile: 'block md:hidden',
  
  // Grid patterns
  autoGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  cardGrid: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6',
  
  // Button sizes (touch-friendly)
  button: {
    sm: 'px-3 py-2 text-sm min-h-[2.75rem]', // 44px min touch target
    md: 'px-4 py-2.5 text-base min-h-[3rem]', // 48px min touch target
    lg: 'px-6 py-3 text-lg min-h-[3.5rem]'   // 56px min touch target
  }
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveStack,
  ResponsiveCard,
  ResponsiveText,
  ResponsiveSidebarLayout,
  ResponsiveUtils
};