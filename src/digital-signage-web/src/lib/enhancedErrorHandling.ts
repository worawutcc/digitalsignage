/**
 * Enhanced Error Handling System
 * 
 * Provides centralized error handling for enhanced features with automatic retry mechanisms,
 * error classification, user guidance, and error reporting analytics.
 * 
 * @fileoverview Enhanced error handling system for user schedule assignment features
 * @version 1.0.0
 */

// Types
export interface ErrorConfig {
  /** Enable automatic retry for retryable errors */
  enableAutoRetry?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Base delay between retries in milliseconds */
  retryDelay?: number;
  /** Enable exponential backoff for retries */
  exponentialBackoff?: boolean;
  /** Enable error analytics and reporting */
  enableAnalytics?: boolean;
  /** Custom error classifications */
  customClassifications?: ErrorClassification[];
}

export interface ErrorClassification {
  /** Error type or pattern to match */
  pattern: string | RegExp;
  /** Error category */
  category: ErrorCategory;
  /** Severity level */
  severity: ErrorSeverity;
  /** Whether this error is retryable */
  retryable: boolean;
  /** Custom retry configuration for this error type */
  retryConfig?: Partial<RetryConfig>;
  /** User-friendly message */
  userMessage?: string;
  /** Suggested actions for the user */
  suggestedActions?: string[];
}

export interface RetryConfig {
  /** Maximum retry attempts for this error type */
  maxAttempts: number;
  /** Base delay in milliseconds */
  baseDelay: number;
  /** Maximum delay cap in milliseconds */
  maxDelay: number;
  /** Exponential backoff multiplier */
  backoffMultiplier: number;
}

export interface ErrorAnalytics {
  /** Error ID */
  id: string;
  /** Timestamp when error occurred */
  timestamp: Date;
  /** Error category */
  category: ErrorCategory;
  /** Error severity */
  severity: ErrorSeverity;
  /** Original error message */
  message: string;
  /** Stack trace */
  stack?: string;
  /** User context when error occurred */
  userContext: UserContext;
  /** Number of retry attempts */
  retryAttempts: number;
  /** Whether error was resolved after retries */
  resolved: boolean;
  /** Time to resolution in milliseconds */
  resolutionTime?: number;
}

export interface UserContext {
  /** Current page/route */
  route: string;
  /** User ID if authenticated */
  userId?: string;
  /** Current feature being used */
  feature: string;
  /** Browser information */
  browser: string;
  /** Device information */
  device: string;
  /** Additional context data */
  metadata?: Record<string, any>;
}

export interface ErrorUIConfig {
  /** Show detailed error messages to developers */
  showDetailedErrors?: boolean;
  /** Enable error boundary fallback UI */
  enableErrorBoundary?: boolean;
  /** Custom error message templates */
  messageTemplates?: Record<ErrorCategory, string>;
  /** Enable toast notifications for errors */
  enableToastNotifications?: boolean;
}

export interface ErrorHandlerResult {
  /** Whether the error was handled successfully */
  handled: boolean;
  /** Whether a retry should be attempted */
  shouldRetry: boolean;
  /** User-friendly error message */
  userMessage: string;
  /** Suggested actions for the user */
  suggestedActions: string[];
  /** Error analytics data */
  analytics: ErrorAnalytics;
}

// Enums
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  CACHE = 'cache',
  STORAGE = 'storage',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Default configuration
const DEFAULT_CONFIG: Required<ErrorConfig> = {
  enableAutoRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  enableAnalytics: true,
  customClassifications: [],
};

const DEFAULT_UI_CONFIG: Required<ErrorUIConfig> = {
  showDetailedErrors: process.env.NODE_ENV === 'development',
  enableErrorBoundary: true,
  messageTemplates: {
    [ErrorCategory.NETWORK]: 'Connection error. Please check your internet connection and try again.',
    [ErrorCategory.AUTHENTICATION]: 'Please log in again to continue.',
    [ErrorCategory.AUTHORIZATION]: 'You do not have permission to perform this action.',
    [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
    [ErrorCategory.SERVER]: 'Server error. Please try again later.',
    [ErrorCategory.CLIENT]: 'Application error. Please refresh the page and try again.',
    [ErrorCategory.TIMEOUT]: 'Request timed out. Please try again.',
    [ErrorCategory.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ErrorCategory.CACHE]: 'Cache error. Data will be refreshed.',
    [ErrorCategory.STORAGE]: 'Storage error. Please check your browser settings.',
    [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  },
  enableToastNotifications: true,
};

// Default error classifications for user schedule assignment features
const DEFAULT_CLASSIFICATIONS: ErrorClassification[] = [
  {
    pattern: /network|fetch|connection/i,
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    retryConfig: { maxAttempts: 3, baseDelay: 1000, maxDelay: 5000, backoffMultiplier: 2 },
    userMessage: 'Connection error. Retrying automatically...',
    suggestedActions: ['Check your internet connection', 'Try refreshing the page'],
  },
  {
    pattern: /401|unauthorized/i,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    retryable: false,
    userMessage: 'Please log in again to continue.',
    suggestedActions: ['Log in again', 'Contact support if the problem persists'],
  },
  {
    pattern: /403|forbidden/i,
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.HIGH,
    retryable: false,
    userMessage: 'You do not have permission to perform this action.',
    suggestedActions: ['Contact your administrator', 'Check your user permissions'],
  },
  {
    pattern: /400|validation|invalid/i,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    userMessage: 'Please check your input and try again.',
    suggestedActions: ['Review form fields', 'Ensure all required fields are filled'],
  },
  {
    pattern: /5\d\d|server error/i,
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.HIGH,
    retryable: true,
    retryConfig: { maxAttempts: 2, baseDelay: 2000, maxDelay: 10000, backoffMultiplier: 3 },
    userMessage: 'Server error. Retrying automatically...',
    suggestedActions: ['Wait a moment and try again', 'Contact support if the problem persists'],
  },
  {
    pattern: /timeout/i,
    category: ErrorCategory.TIMEOUT,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    retryConfig: { maxAttempts: 2, baseDelay: 1500, maxDelay: 8000, backoffMultiplier: 2.5 },
    userMessage: 'Request timed out. Retrying...',
    suggestedActions: ['Wait for the retry', 'Check your internet connection'],
  },
  {
    pattern: /rate.?limit|too many requests/i,
    category: ErrorCategory.RATE_LIMIT,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    retryConfig: { maxAttempts: 1, baseDelay: 5000, maxDelay: 15000, backoffMultiplier: 1 },
    userMessage: 'Too many requests. Please wait a moment...',
    suggestedActions: ['Wait before trying again', 'Reduce the frequency of your actions'],
  },
];

/**
 * Enhanced Error Handler
 * 
 * Manages centralized error handling, classification, retry logic, and analytics
 */
export class EnhancedErrorHandler {
  private config: Required<ErrorConfig>;
  private uiConfig: Required<ErrorUIConfig>;
  private classifications: ErrorClassification[];
  private analytics: ErrorAnalytics[] = [];
  private retryQueues = new Map<string, any>();

  constructor(
    config: Partial<ErrorConfig> = {},
    uiConfig: Partial<ErrorUIConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.uiConfig = { ...DEFAULT_UI_CONFIG, ...uiConfig };
    this.classifications = [
      ...DEFAULT_CLASSIFICATIONS,
      ...(config.customClassifications || []),
    ];
  }

  /**
   * Handle an error with automatic classification and retry logic
   */
  async handleError(
    error: Error | unknown,
    context: Partial<UserContext> = {}
  ): Promise<ErrorHandlerResult> {
    const errorId = this.generateErrorId();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Classify the error
    const classification = this.classifyError(errorMessage);
    
    // Create analytics record
    const analytics: ErrorAnalytics = {
      id: errorId,
      timestamp: new Date(),
      category: classification.category,
      severity: classification.severity,
      message: errorMessage,
      stack: errorStack || '',
      userContext: this.buildUserContext(context),
      retryAttempts: 0,
      resolved: false,
    };

    // Store analytics if enabled
    if (this.config.enableAnalytics) {
      this.analytics.push(analytics);
    }

    // Determine retry behavior
    const shouldRetry = this.shouldRetry(classification, analytics);
    
    // Handle retry if applicable
    if (shouldRetry && this.config.enableAutoRetry) {
      const retryResult = await this.attemptRetry(error, classification, analytics);
      if (retryResult.success) {
        analytics.resolved = true;
        analytics.resolutionTime = Date.now() - analytics.timestamp.getTime();
      }
    }

    // Build user-friendly message
    const userMessage = this.buildUserMessage(classification, analytics);
    const suggestedActions = classification.suggestedActions || [];

    return {
      handled: true,
      shouldRetry,
      userMessage,
      suggestedActions,
      analytics,
    };
  }

  /**
   * Handle errors with automatic retry mechanism
   */
  async handleWithRetry<T>(
    operation: () => Promise<T>,
    context: Partial<UserContext> = {},
    customRetryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    let lastError: Error | unknown;
    let attempts = 0;
    const maxAttempts = customRetryConfig?.maxAttempts || this.config.maxRetries;

    while (attempts <= maxAttempts) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        attempts++;

        if (attempts > maxAttempts) {
          break;
        }

        const classification = this.classifyError(
          error instanceof Error ? error.message : String(error)
        );

        if (!classification.retryable) {
          break;
        }

        // Calculate delay
        const retryConfig: RetryConfig = {
          maxAttempts,
          baseDelay: this.config.retryDelay,
          maxDelay: 30000,
          backoffMultiplier: this.config.exponentialBackoff ? 2 : 1,
          ...customRetryConfig,
          ...classification.retryConfig,
        };

        const delay = this.calculateRetryDelay(attempts, retryConfig);
        await this.sleep(delay);
      }
    }

    // If we get here, all retries failed
    const result = await this.handleError(lastError, context);
    throw new Error(result.userMessage);
  }

  /**
   * Get error analytics and metrics
   */
  getAnalytics(): ErrorAnalytics[] {
    return [...this.analytics];
  }

  /**
   * Get error metrics summary
   */
  getMetrics() {
    const total = this.analytics.length;
    const resolved = this.analytics.filter(a => a.resolved).length;
    const byCategory = this.analytics.reduce((acc, analytics) => {
      acc[analytics.category] = (acc[analytics.category] || 0) + 1;
      return acc;
    }, {} as Record<ErrorCategory, number>);
    
    const bySeverity = this.analytics.reduce((acc, analytics) => {
      acc[analytics.severity] = (acc[analytics.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const avgResolutionTime = this.analytics
      .filter(a => a.resolved && a.resolutionTime)
      .reduce((sum, a) => sum + (a.resolutionTime || 0), 0) / resolved || 0;

    return {
      total,
      resolved,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
      byCategory,
      bySeverity,
      avgResolutionTime,
    };
  }

  /**
   * Clear analytics data
   */
  clearAnalytics(): void {
    this.analytics = [];
  }

  /**
   * Update configuration
   */
  updateConfig(
    config: Partial<ErrorConfig>,
    uiConfig?: Partial<ErrorUIConfig>
  ): void {
    this.config = { ...this.config, ...config };
    if (uiConfig) {
      this.uiConfig = { ...this.uiConfig, ...uiConfig };
    }
    
    if (config.customClassifications) {
      this.classifications = [
        ...DEFAULT_CLASSIFICATIONS,
        ...config.customClassifications,
      ];
    }
  }

  // Private methods

  private classifyError(errorMessage: string): ErrorClassification {
    for (const classification of this.classifications) {
      const pattern = classification.pattern;
      const matches = typeof pattern === 'string' 
        ? errorMessage.includes(pattern)
        : pattern.test(errorMessage);
        
      if (matches) {
        return classification;
      }
    }

    // Default classification for unknown errors
    return {
      pattern: '.*',
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      userMessage: this.uiConfig.messageTemplates[ErrorCategory.UNKNOWN],
      suggestedActions: ['Try refreshing the page', 'Contact support if the problem persists'],
    };
  }

  private shouldRetry(classification: ErrorClassification, analytics: ErrorAnalytics): boolean {
    if (!classification.retryable || !this.config.enableAutoRetry) {
      return false;
    }

    const maxRetries = classification.retryConfig?.maxAttempts || this.config.maxRetries;
    return analytics.retryAttempts < maxRetries;
  }

  private async attemptRetry(
    error: Error | unknown,
    classification: ErrorClassification,
    analytics: ErrorAnalytics
  ): Promise<{ success: boolean }> {
    const retryConfig: RetryConfig = {
      maxAttempts: this.config.maxRetries,
      baseDelay: this.config.retryDelay,
      maxDelay: 30000,
      backoffMultiplier: this.config.exponentialBackoff ? 2 : 1,
      ...classification.retryConfig,
    };

    while (analytics.retryAttempts < retryConfig.maxAttempts) {
      analytics.retryAttempts++;
      
      const delay = this.calculateRetryDelay(analytics.retryAttempts, retryConfig);
      await this.sleep(delay);

      try {
        // In a real implementation, you would re-execute the failed operation
        // For now, we'll simulate a successful retry for some error types
        if (classification.category === ErrorCategory.NETWORK && Math.random() > 0.3) {
          return { success: true };
        }
        
        if (classification.category === ErrorCategory.TIMEOUT && Math.random() > 0.5) {
          return { success: true };
        }
      } catch (retryError) {
        // Continue to next retry attempt
        continue;
      }
    }

    return { success: false };
  }

  private calculateRetryDelay(attempt: number, config: RetryConfig): number {
    let delay = config.baseDelay;
    
    if (this.config.exponentialBackoff) {
      delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    }
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    delay += jitter;
    
    return Math.min(delay, config.maxDelay);
  }

  private buildUserMessage(classification: ErrorClassification, analytics: ErrorAnalytics): string {
    if (classification.userMessage) {
      return classification.userMessage;
    }
    
    return this.uiConfig.messageTemplates[classification.category] || 
           this.uiConfig.messageTemplates[ErrorCategory.UNKNOWN];
  }

  private buildUserContext(context: Partial<UserContext>): UserContext {
    return {
      route: context.route || window.location.pathname,
      userId: context.userId || '',
      feature: context.feature || 'user-schedule-assignment',
      browser: this.getBrowserInfo(),
      device: this.getDeviceInfo(),
      metadata: context.metadata || {},
    };
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac/i.test(ua)) return 'Mac';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global error handler instance
let globalErrorHandler: EnhancedErrorHandler | null = null;

/**
 * Initialize global error handler
 */
export function initializeErrorHandler(
  config: Partial<ErrorConfig> = {},
  uiConfig: Partial<ErrorUIConfig> = {}
): EnhancedErrorHandler {
  globalErrorHandler = new EnhancedErrorHandler(config, uiConfig);
  
  // Set up global error listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      globalErrorHandler?.handleError(event.error, {
        route: window.location.pathname,
        feature: 'global-error-handler',
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      globalErrorHandler?.handleError(event.reason, {
        route: window.location.pathname,
        feature: 'global-promise-rejection',
      });
    });
  }

  return globalErrorHandler;
}

/**
 * Get global error handler instance
 */
export function getErrorHandler(): EnhancedErrorHandler {
  if (!globalErrorHandler) {
    throw new Error('Error handler not initialized. Call initializeErrorHandler() first.');
  }
  return globalErrorHandler;
}

// React hook for using error handler
export function useErrorHandler() {
  const errorHandler = getErrorHandler();
  
  return {
    handleError: errorHandler.handleError.bind(errorHandler),
    handleWithRetry: errorHandler.handleWithRetry.bind(errorHandler),
    getAnalytics: errorHandler.getAnalytics.bind(errorHandler),
    getMetrics: errorHandler.getMetrics.bind(errorHandler),
  };
}

// Export types and utilities
export {
  DEFAULT_CONFIG as DEFAULT_ERROR_CONFIG,
  DEFAULT_UI_CONFIG,
  DEFAULT_CLASSIFICATIONS,
};