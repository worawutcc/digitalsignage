import NextImage, { ImageProps as NextImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface OptimizedImageProps extends Omit<NextImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string
  className?: string
  containerClassName?: string
  showSpinner?: boolean
  onLoadComplete?: () => void
  onError?: () => void
}

/**
 * Optimized image component with loading states and fallbacks
 * Uses Next.js Image with performance optimizations
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.svg',
  className,
  containerClassName,
  showSpinner = true,
  onLoadComplete,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  const handleLoad = () => {
    setIsLoading(false)
    onLoadComplete?.()
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
    onError?.()
  }

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Loading spinner */}
      {isLoading && showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Actual image */}
      <NextImage
        {...props}
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          error && imageSrc === fallbackSrc ? 'opacity-50' : '',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        // Performance optimizations
        quality={90}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        // Loading strategy
        priority={props.priority || false}
        loading={props.loading || 'lazy'}
      />
      
      {/* Error state indicator */}
      {error && imageSrc === fallbackSrc && (
        <div className="absolute top-2 right-2 p-1 bg-destructive/80 text-destructive-foreground text-xs rounded">
          Failed to load
        </div>
      )}
    </div>
  )
}

/**
 * Optimized avatar component with proper sizing and fallbacks
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  ...props
}: OptimizedImageProps & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      fallbackSrc="/images/default-avatar.svg"
      {...props}
    />
  )
}

/**
 * Optimized thumbnail component for media files
 */
export function OptimizedThumbnail({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={200}
      height={150}
      className={cn('object-cover rounded-md', className)}
      fallbackSrc="/images/media-placeholder.svg"
      showSpinner={true}
      {...props}
    />
  )
}