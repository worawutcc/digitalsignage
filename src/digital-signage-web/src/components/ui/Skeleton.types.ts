/**
 * Skeleton Component Types
 * 
 * Type definitions for Skeleton component.
 * 
 * @see Skeleton.tsx
 * @see specs/020-phase-1/tasks.md - T054 Loading Skeletons
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

export interface SkeletonProps {
  /**
   * CSS class name for styling
   */
  className?: string
  
  /**
   * Number of skeleton items to render
   * @default 1
   */
  count?: number
}

export interface SkeletonTextProps {
  /**
   * Number of lines to show
   * @default 3
   */
  lines?: number
  
  /**
   * CSS class name
   */
  className?: string
}

export interface SkeletonCardProps {
  /**
   * Show avatar in card
   * @default false
   */
  showAvatar?: boolean
  
  /**
   * Number of text lines
   * @default 3
   */
  lines?: number
  
  /**
   * CSS class name
   */
  className?: string
}

export interface SkeletonTableProps {
  /**
   * Number of rows
   * @default 5
   */
  rows?: number
  
  /**
   * Number of columns
   * @default 4
   */
  columns?: number
  
  /**
   * Show header row
   * @default true
   */
  showHeader?: boolean
  
  /**
   * CSS class name
   */
  className?: string
}
