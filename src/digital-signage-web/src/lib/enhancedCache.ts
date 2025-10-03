/**
 * Enhanced Caching Strategy for React Query
 * 
 * Provides intelligent cache invalidation, prefetching strategies, and cache compression
 * for large datasets to improve performance of enhanced features.
 * 
 * @fileoverview Enhanced caching system for user schedule assignment features
 * @version 1.0.0
 */

import { QueryClient, QueryKey, QueryObserver } from '@tanstack/react-query';

// Types
export interface CacheConfig {
  /** Default cache time in milliseconds (5 minutes) */
  defaultCacheTime?: number;
  /** Default stale time in milliseconds (1 minute) */
  defaultStaleTime?: number;
  /** Maximum cache size in MB */
  maxCacheSize?: number;
  /** Enable cache compression for large datasets */
  enableCompression?: boolean;
  /** Prefetch strategies configuration */
  prefetch?: PrefetchConfig;
}

export interface PrefetchConfig {
  /** Enable automatic prefetching of related data */
  enabled?: boolean;
  /** Prefetch delay in milliseconds */
  delay?: number;
  /** Maximum concurrent prefetch requests */
  maxConcurrent?: number;
  /** Prefetch triggers */
  triggers?: PrefetchTrigger[];
}

export interface PrefetchTrigger {
  /** Query key pattern to match */
  pattern: string;
  /** Related queries to prefetch */
  relatedQueries: string[];
  /** Condition function to determine if prefetch should occur */
  condition?: (data: any) => boolean;
}

export interface CacheMetrics {
  /** Total cache size in bytes */
  totalSize: number;
  /** Number of cached queries */
  queryCount: number;
  /** Cache hit rate percentage */
  hitRate: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** Last cleanup timestamp */
  lastCleanup: Date;
}

export interface CacheCompressionOptions {
  /** Minimum data size to compress (in bytes) */
  minSize?: number;
  /** Compression algorithm */
  algorithm?: 'gzip' | 'deflate';
  /** Compression level (1-9) */
  level?: number;
}

// Default configuration
const DEFAULT_CONFIG: Required<CacheConfig> = {
  defaultCacheTime: 5 * 60 * 1000, // 5 minutes
  defaultStaleTime: 60 * 1000, // 1 minute
  maxCacheSize: 50, // 50MB
  enableCompression: true,
  prefetch: {
    enabled: true,
    delay: 100,
    maxConcurrent: 3,
    triggers: [],
  },
};

// Prefetch triggers for user schedule assignment features
const DEFAULT_PREFETCH_TRIGGERS: PrefetchTrigger[] = [
  {
    pattern: 'users',
    relatedQueries: ['user-schedules', 'user-devices'],
    condition: (data) => Array.isArray(data) && data.length > 0,
  },
  {
    pattern: 'user-schedules',
    relatedQueries: ['schedules', 'users'],
    condition: (data) => Array.isArray(data) && data.length > 0,
  },
  {
    pattern: 'schedules',
    relatedQueries: ['schedule-assignments', 'devices'],
    condition: (data) => Array.isArray(data) && data.length > 0,
  },
  {
    pattern: 'bulk-operations',
    relatedQueries: ['operation-status', 'affected-users'],
    condition: (data) => data?.operationId,
  },
];

/**
 * Enhanced Cache Manager
 * 
 * Manages intelligent caching, prefetching, and compression for React Query
 */
export class EnhancedCacheManager {
  private config: Required<CacheConfig>;
  private queryClient: QueryClient;
  private metrics: CacheMetrics;
  private prefetchQueue: Set<string> = new Set();
  private compressionCache: Map<string, any> = new Map();
  private observer: QueryObserver<any> | null = null;

  constructor(queryClient: QueryClient, config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.config.prefetch.triggers = [
      ...DEFAULT_PREFETCH_TRIGGERS,
      ...(config.prefetch?.triggers || []),
    ];
    
    this.queryClient = queryClient;
    this.metrics = {
      totalSize: 0,
      queryCount: 0,
      hitRate: 0,
      memoryUsage: 0,
      lastCleanup: new Date(),
    };

    this.setupCacheObserver();
    this.setupPeriodicCleanup();
  }

  /**
   * Get cache configuration
   */
  getConfig(): Required<CacheConfig> {
    return { ...this.config };
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.prefetch?.triggers) {
      this.config.prefetch.triggers = [
        ...DEFAULT_PREFETCH_TRIGGERS,
        ...newConfig.prefetch.triggers,
      ];
    }
  }

  /**
   * Intelligent cache invalidation based on data relationships
   */
  async invalidateRelated(queryKey: QueryKey): Promise<void> {
    const keyString = Array.isArray(queryKey) ? queryKey.join('-') : String(queryKey);
    
    // Find related queries to invalidate
    const relatedPatterns = this.getRelatedPatterns(keyString);
    
    for (const pattern of relatedPatterns) {
      await this.queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKeyString = Array.isArray(query.queryKey) 
            ? query.queryKey.join('-') 
            : String(query.queryKey);
          return queryKeyString.includes(pattern);
        },
      });
    }

    // Update metrics
    this.updateMetrics();
  }

  /**
   * Prefetch related data based on current query results
   */
  async prefetchRelated(queryKey: QueryKey, data: any): Promise<void> {
    if (!this.config.prefetch.enabled) return;

    const keyString = Array.isArray(queryKey) ? queryKey.join('-') : String(queryKey);
    
    // Find matching prefetch triggers
    const matchingTriggers = this.config.prefetch.triggers?.filter(trigger =>
      keyString.includes(trigger.pattern) && 
      (!trigger.condition || trigger.condition(data))
    ) || [];

    // Queue prefetch requests
    for (const trigger of matchingTriggers) {
      for (const relatedQuery of trigger.relatedQueries) {
        if (!this.prefetchQueue.has(relatedQuery)) {
          this.prefetchQueue.add(relatedQuery);
          
          // Delay prefetch to avoid overwhelming the server
          setTimeout(() => {
            this.executePrefetch(relatedQuery, data);
            this.prefetchQueue.delete(relatedQuery);
          }, this.config.prefetch.delay);
        }
      }
    }
  }

  /**
   * Compress large data sets for storage
   */
  compressData(data: any, options: CacheCompressionOptions = {}): any {
    if (!this.config.enableCompression) return data;

    const serialized = JSON.stringify(data);
    const size = new Blob([serialized]).size;

    if (size < (options.minSize || 10240)) { // 10KB minimum
      return data;
    }

    try {
      // Simple compression using built-in compression API if available
      if ('CompressionStream' in window) {
        const compressed = this.performCompression(serialized, options);
        return {
          __compressed: true,
          data: compressed,
          originalSize: size,
          algorithm: options.algorithm || 'gzip',
        };
      }
      
      return data;
    } catch (error) {
      console.warn('Cache compression failed:', error);
      return data;
    }
  }

  /**
   * Decompress data for usage
   */
  decompressData(compressedData: any): any {
    if (!compressedData?.__compressed) return compressedData;

    try {
      if ('DecompressionStream' in window) {
        return this.performDecompression(compressedData.data, compressedData.algorithm);
      }
      
      return compressedData;
    } catch (error) {
      console.warn('Cache decompression failed:', error);
      return compressedData;
    }
  }

  /**
   * Get cache metrics and performance statistics
   */
  getMetrics(): CacheMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Manually trigger cache cleanup
   */
  async cleanup(): Promise<void> {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    let removedQueries = 0;
    let freedSize = 0;

    for (const query of queries) {
      const isStale = Date.now() - (query.state.dataUpdatedAt || 0) > this.config.defaultCacheTime;
      const hasNoObservers = query.getObserversCount() === 0;
      
      if (isStale && hasNoObservers) {
        const querySize = this.estimateQuerySize(query);
        freedSize += querySize;
        removedQueries++;
        
        cache.remove(query);
      }
    }

    // Clear compression cache of unused items
    this.cleanupCompressionCache();

    this.metrics.lastCleanup = new Date();
    console.log(`Cache cleanup: removed ${removedQueries} queries, freed ${this.formatBytes(freedSize)}`);
  }

  /**
   * Reset cache and metrics
   */
  reset(): void {
    this.queryClient.clear();
    this.compressionCache.clear();
    this.prefetchQueue.clear();
    
    this.metrics = {
      totalSize: 0,
      queryCount: 0,
      hitRate: 0,
      memoryUsage: 0,
      lastCleanup: new Date(),
    };
  }

  // Private methods

  private setupCacheObserver(): void {
    // Monitor cache changes for metrics
    this.queryClient.getQueryCache().subscribe(() => {
      this.updateMetrics();
    });
  }

  private setupPeriodicCleanup(): void {
    // Run cleanup every 10 minutes
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  private getRelatedPatterns(queryKey: string): string[] {
    const related: string[] = [];
    
    if (queryKey.includes('user')) {
      related.push('user-schedule', 'user-device', 'schedule-assignment');
    }
    
    if (queryKey.includes('schedule')) {
      related.push('user-schedule', 'schedule-assignment', 'device');
    }
    
    if (queryKey.includes('bulk-operation')) {
      related.push('user', 'schedule', 'operation-status');
    }

    return related;
  }

  private async executePrefetch(queryPattern: string, contextData: any): Promise<void> {
    try {
      // Generate query key based on pattern and context
      const queryKey = this.generateQueryKey(queryPattern, contextData);
      
      if (queryKey && this.prefetchQueue.size < (this.config.prefetch.maxConcurrent || 3)) {
        await this.queryClient.prefetchQuery({
          queryKey,
          staleTime: this.config.defaultStaleTime,
        });
      }
    } catch (error) {
      console.warn(`Prefetch failed for pattern ${queryPattern}:`, error);
    }
  }

  private generateQueryKey(pattern: string, contextData: any): QueryKey | null {
    switch (pattern) {
      case 'user-schedules':
        return contextData?.userId ? ['user-schedules', contextData.userId] : null;
      case 'user-devices':
        return contextData?.userId ? ['user-devices', contextData.userId] : null;
      case 'schedules':
        return ['schedules'];
      case 'schedule-assignments':
        return contextData?.scheduleId ? ['schedule-assignments', contextData.scheduleId] : null;
      case 'devices':
        return ['devices'];
      case 'operation-status':
        return contextData?.operationId ? ['operation-status', contextData.operationId] : null;
      case 'affected-users':
        return contextData?.operationId ? ['affected-users', contextData.operationId] : null;
      default:
        return null;
    }
  }

  private performCompression(data: string, options: CacheCompressionOptions): string {
    // Placeholder for actual compression implementation
    // In a real implementation, you would use a compression library
    return btoa(data); // Simple base64 encoding as placeholder
  }

  private performDecompression(compressedData: string, algorithm: string): any {
    // Placeholder for actual decompression implementation
    const decompressed = atob(compressedData);
    return JSON.parse(decompressed);
  }

  private updateMetrics(): void {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    this.metrics.queryCount = queries.length;
    this.metrics.totalSize = queries.reduce((total, query) => 
      total + this.estimateQuerySize(query), 0);
    this.metrics.memoryUsage = this.metrics.totalSize / (1024 * 1024); // Convert to MB
    
    // Calculate hit rate (simplified)
    const totalQueries = queries.length;
    const cachedQueries = queries.filter(q => q.state.data !== undefined).length;
    this.metrics.hitRate = totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0;
  }

  private estimateQuerySize(query: any): number {
    try {
      const serialized = JSON.stringify(query.state.data);
      return new Blob([serialized]).size;
    } catch {
      return 0;
    }
  }

  private cleanupCompressionCache(): void {
    // Remove compression cache entries that are no longer referenced
    const activeQueries = this.queryClient.getQueryCache().getAll();
    const activeKeys = new Set(activeQueries.map(q => JSON.stringify(q.queryKey)));
    
    for (const [key] of this.compressionCache) {
      if (!activeKeys.has(key)) {
        this.compressionCache.delete(key);
      }
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Enhanced Query Client factory with default configuration
export function createEnhancedQueryClient(config: Partial<CacheConfig> = {}): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: config.defaultStaleTime || DEFAULT_CONFIG.defaultStaleTime,
        cacheTime: config.defaultCacheTime || DEFAULT_CONFIG.defaultCacheTime,
        retry: 3,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });

  // Attach enhanced cache manager
  const cacheManager = new EnhancedCacheManager(queryClient, config);
  
  // Add cache manager to query client for global access
  (queryClient as any).enhancedCache = cacheManager;

  return queryClient;
}

// Utility hooks for using enhanced caching features
export function useEnhancedCache() {
  const queryClient = useQueryClient();
  const cacheManager = (queryClient as any).enhancedCache as EnhancedCacheManager;
  
  if (!cacheManager) {
    throw new Error('Enhanced cache manager not found. Use createEnhancedQueryClient() to create your query client.');
  }

  return {
    invalidateRelated: cacheManager.invalidateRelated.bind(cacheManager),
    prefetchRelated: cacheManager.prefetchRelated.bind(cacheManager),
    getMetrics: cacheManager.getMetrics.bind(cacheManager),
    cleanup: cacheManager.cleanup.bind(cacheManager),
    updateConfig: cacheManager.updateConfig.bind(cacheManager),
  };
}

// Import useQueryClient for the hook
import { useQueryClient } from '@tanstack/react-query';

// Export utilities
export { DEFAULT_CONFIG, DEFAULT_PREFETCH_TRIGGERS };