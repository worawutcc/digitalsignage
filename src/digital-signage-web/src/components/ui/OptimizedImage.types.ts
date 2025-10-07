/**
 * OptimizedImage Component Types
 * 
 * Type definitions for OptimizedImage component.
 * 
 * @see OptimizedImage.tsx
 * @see copilot-instructions-ui.instructions.md - Component Development Rules
 */

import { ImageProps as NextImageProps } from 'next/image'

export interface OptimizedImageProps extends Omit<NextImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string
  className?: string
  containerClassName?: string
  showSpinner?: boolean
  onLoadComplete?: () => void
  onError?: () => void
}
