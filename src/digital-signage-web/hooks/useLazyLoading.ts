'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Simplified Lazy Loading Hooks for Playlist Management
 * Implements progressive loading and performance optimization
 * Follows UI copilot patterns with TypeScript strict mode
 */

// ================================
// TYPE DEFINITIONS
// ================================

export interface LazyLoadConfig {
  /** Initial page size */
  pageSize?: number;
  /** Preload threshold (distance from bottom to trigger load) */
  loadThreshold?: number;
  /** Debounce delay for scroll events */
  scrollDebounce?: number;
}

export interface PaginatedData<T> {
  data: T[];
  totalCount: number;
  hasNextPage: boolean;
}

// ================================
// PROGRESSIVE DATA LOADING HOOK
// ================================

/**
 * Hook for progressive data loading based on priority
 */
export function useProgressiveDataLoading<T>(
  loaders: Record<string, () => Promise<T>>,
  priorities: Record<string, 'immediate' | 'high' | 'medium' | 'low'> = {}
) {
  const [loadedData, setLoadedData] = useState<Record<string, T>>({});
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error>>({});

  // Sort loaders by priority
  const sortedLoaders = Object.entries(loaders).sort(([keyA], [keyB]) => {
    const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
    const priorityA = priorities[keyA] || 'low';
    const priorityB = priorities[keyB] || 'low';
    return priorityOrder[priorityA] - priorityOrder[priorityB];
  });

  // Load data progressively
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const loadNext = async (index: number) => {
      if (index >= sortedLoaders.length) return;

      const entry = sortedLoaders[index];
      if (!entry) return;
      
      const [key, loader] = entry;
      
      // Skip if already loaded
      if (loadedData[key]) {
        loadNext(index + 1);
        return;
      }

      setLoadingState(prev => ({ ...prev, [key]: true }));

      try {
        const data = await loader();
        setLoadedData(prev => ({ ...prev, [key]: data }));
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      } catch (error) {
        setErrors(prev => ({ ...prev, [key]: error as Error }));
      } finally {
        setLoadingState(prev => ({ ...prev, [key]: false }));
      }

      // Schedule next load with delay based on priority
      const priority = priorities[key] || 'low';
      const delays = { immediate: 0, high: 50, medium: 200, low: 500 };
      
      timeoutId = setTimeout(() => {
        loadNext(index + 1);
      }, delays[priority]);
    };

    loadNext(0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data: loadedData,
    loading: loadingState,
    errors,
    isLoading: Object.values(loadingState).some(Boolean),
    allLoaded: sortedLoaders.length === Object.keys(loadedData).length
  };
}

// ================================
// SIMPLE PAGINATION HOOK
// ================================

/**
 * Hook for simple paginated data loading
 */
export function useSimplePagination<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<PaginatedData<T>>,
  config: LazyLoadConfig = {}
) {
  const { pageSize = 20 } = config;
  
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const response = await fetchFunction(page, pageSize);
      
      if (append) {
        setItems(prev => [...prev, ...response.data]);
      } else {
        setItems(response.data);
      }
      
      setTotalCount(response.totalCount);
      setHasNextPage(response.hasNextPage);
      setCurrentPage(page);
      
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetchFunction, pageSize]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || isLoadingMore) return;
    loadData(currentPage + 1, true);
  }, [hasNextPage, isLoadingMore, currentPage, loadData]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    loadData(1, false);
  }, [loadData]);

  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(1);
    setTotalCount(0);
    setHasNextPage(false);
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    loadData(1, false);
  }, [loadData]);

  return {
    items,
    isLoading,
    isLoadingMore,
    hasNextPage,
    error,
    totalCount,
    loadMore,
    refresh,
    reset
  };
}

// ================================
// INTERSECTION OBSERVER HOOK
// ================================

/**
 * Hook for lazy loading with intersection observer
 */
export function useLazyIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px', ...options }
    );

    const element = elementRef.current;
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return elementRef;
}

// ================================
// MEDIA LAZY LOADING HOOK
// ================================

/**
 * Hook for lazy loading media thumbnails
 */
export function useMediaLazyLoading(mediaItems: Array<{ id: number; thumbnailUrl?: string }>) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [loadedItems, setLoadedItems] = useState<Set<number>>(new Set());
  
  const observeItem = useCallback((element: HTMLElement | null, mediaId: number) => {
    if (!element || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, mediaId]));
          } else {
            setVisibleItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(mediaId);
              return newSet;
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(element);
    
    return () => observer.disconnect();
  }, []);

  const markAsLoaded = useCallback((mediaId: number) => {
    setLoadedItems(prev => new Set([...prev, mediaId]));
  }, []);

  return {
    visibleItems,
    loadedItems,
    observeItem,
    markAsLoaded,
    shouldLoad: (mediaId: number) => visibleItems.has(mediaId) && !loadedItems.has(mediaId)
  };
}

// ================================
// DEVICE ASSIGNMENT LAZY LOADING
// ================================

/**
 * Hook for lazy loading device assignment data
 */
export function useDeviceAssignmentLazy(playlistId: number) {
  return useProgressiveDataLoading(
    {
      // Load assigned devices first (high priority)
      assignedDevices: async () => {
        const response = await fetch(`/api/playlists/${playlistId}/devices/assigned`);
        return response.json();
      },
      
      // Load available devices (medium priority)
      availableDevices: async () => {
        const response = await fetch(`/api/playlists/${playlistId}/devices/available`);
        return response.json();
      },
      
      // Load device groups (medium priority)
      deviceGroups: async () => {
        const response = await fetch(`/api/device-groups`);
        return response.json();
      },
      
      // Load assignment history (low priority)
      assignmentHistory: async () => {
        const response = await fetch(`/api/playlists/${playlistId}/devices/history`);
        return response.json();
      }
    },
    {
      assignedDevices: 'high',
      availableDevices: 'medium',
      deviceGroups: 'medium',
      assignmentHistory: 'low'
    }
  );
}

// ================================
// ANALYTICS LAZY LOADING HOOK
// ================================

/**
 * Hook for lazy loading analytics data based on tab visibility
 */
export function useAnalyticsLazy(playlistId: number, activeTab: string) {
  return useProgressiveDataLoading(
    {
      // Overview data (always load first)
      overview: async () => {
        const response = await fetch(`/api/analytics/playlists/${playlistId}/overview`);
        return response.json();
      },
      
      // Device metrics
      deviceMetrics: async () => {
        const response = await fetch(`/api/analytics/playlists/${playlistId}/devices`);
        return response.json();
      },
      
      // Media performance
      mediaMetrics: async () => {
        const response = await fetch(`/api/analytics/playlists/${playlistId}/media`);
        return response.json();
      },
      
      // Trend data
      trendData: async () => {
        const response = await fetch(`/api/analytics/playlists/${playlistId}/trends`);
        return response.json();
      }
    },
    {
      overview: 'immediate',
      deviceMetrics: activeTab === 'devices' ? 'high' : 'medium',
      mediaMetrics: activeTab === 'media' ? 'high' : 'low',
      trendData: activeTab === 'trends' ? 'high' : 'low'
    }
  );
}

// ================================
// LAZY LOADING UTILITIES
// ================================

export const LazyLoadUtils = {
  /**
   * Create debounced function for performance
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  /**
   * Calculate optimal page size based on viewport
   */
  calculatePageSize: (itemHeight: number, containerHeight?: number): number => {
    if (typeof window === 'undefined') return 20;
    
    const viewportHeight = containerHeight || window.innerHeight;
    const itemsPerScreen = Math.ceil(viewportHeight / itemHeight);
    
    // Load 2-3 screens worth of content
    return Math.min(Math.max(itemsPerScreen * 2.5, 10), 50);
  },

  /**
   * Preload critical images
   */
  preloadImages: async (imageUrls: string[]): Promise<void> => {
    const promises = imageUrls.map((url) =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      })
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  },

  /**
   * Check if element is in viewport
   */
  isInViewport: (element: HTMLElement, threshold: number = 0): boolean => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top <= windowHeight * (1 + threshold) &&
      rect.bottom >= -windowHeight * threshold &&
      rect.left <= windowWidth * (1 + threshold) &&
      rect.right >= -windowWidth * threshold
    );
  }
};