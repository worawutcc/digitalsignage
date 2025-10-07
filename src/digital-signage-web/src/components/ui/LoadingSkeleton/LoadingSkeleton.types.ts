/**
 * Props for the LoadingSkeleton component
 */
export interface LoadingSkeletonProps {
  /**
   * Variant of the skeleton loader
   * @default 'default'
   */
  variant?: 'default' | 'card' | 'table' | 'list' | 'text' | 'avatar' | 'image'
  
  /**
   * Number of skeleton items to render
   * @default 1
   */
  count?: number
  
  /**
   * Custom className for additional styling
   */
  className?: string
  
  /**
   * Height of skeleton (CSS value)
   */
  height?: string | number
  
  /**
   * Width of skeleton (CSS value)
   */
  width?: string | number
}
