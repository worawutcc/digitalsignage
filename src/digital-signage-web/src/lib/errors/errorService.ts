// Error service implementation following contract specifications
// Provides centralized error management and notification system

import { 
  ApiError, 
  ToastNotification, 
  ErrorDisplayOptions, 
  ToastOptions,
  ToastType 
} from '@/types/errors';

export class ErrorService {
  private activeErrors: ApiError[] = [];
  private toastNotifications: ToastNotification[] = [];
  private retryActions: Map<string, () => Promise<void>> = new Map();
  private maxToasts = 5;
  private duplicateCheckWindow = 5000; // 5 seconds

  /**
   * Show error with ApiError object or string message
   */
  showError(error: ApiError | string, options?: ErrorDisplayOptions): void {
    const apiError: ApiError = typeof error === 'string' 
      ? {
          title: error,
          status: 0,
          timestamp: new Date().toISOString(),
        }
      : error;

    // Add to active errors
    this.activeErrors.push(apiError);

    // Show toast notification unless explicitly disabled
    if (options?.showRetry !== false) {
      this.showToast(
        apiError.detail || apiError.title,
        'error',
        {
          persistent: options?.persistent || apiError.status >= 500,
          ...(options?.retryDelay && { retryDelay: options.retryDelay }),
          ...(options?.showRetry && { showRetry: options.showRetry }),
        }
      );
    }
  }

  /**
   * Show toast notification with specified type and options
   */
  showToast(message: string, type: ToastType = 'info', options?: ToastOptions): void {
    // Check for duplicate toasts within the time window
    const isDuplicate = this.toastNotifications.some(toast => 
      toast.message === message && 
      toast.type === type &&
      (Date.now() - new Date(toast.timestamp).getTime()) < this.duplicateCheckWindow
    );

    if (isDuplicate) {
      return;
    }

    const toast: ToastNotification = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      ...(options?.duration && { duration: options.duration }),
      ...(options?.persistent && { persistent: options.persistent }),
    };

    this.toastNotifications.push(toast);

    // Limit number of toasts
    if (this.toastNotifications.length > this.maxToasts) {
      this.toastNotifications = this.toastNotifications.slice(-this.maxToasts);
    }

    // Auto-dismiss if not persistent and has duration
    if (!toast.persistent && toast.duration) {
      setTimeout(() => {
        this.dismissToast(toast.id);
      }, toast.duration);
    }
  }

  /**
   * Clear the current global error
   */
  clearError(): void {
    this.activeErrors = [];
  }

  /**
   * Clear all errors and toast notifications
   */
  clearAllErrors(): void {
    this.activeErrors = [];
    this.toastNotifications = [];
  }

  /**
   * Dismiss specific toast notification by ID
   */
  dismissToast(id: string): void {
    this.toastNotifications = this.toastNotifications.filter(
      toast => toast.id !== id
    );
  }

  /**
   * Get all active errors
   */
  getActiveErrors(): ApiError[] {
    return [...this.activeErrors];
  }

  /**
   * Get all toast notifications
   */
  getToastNotifications(): ToastNotification[] {
    return [...this.toastNotifications];
  }

  /**
   * Check if there are any active errors
   */
  hasActiveErrors(): boolean {
    return this.activeErrors.length > 0;
  }

  /**
   * Register a retry action with an ID
   */
  registerRetryAction(actionId: string, action: () => Promise<void>): void {
    this.retryActions.set(actionId, action);
  }

  /**
   * Retry the last registered action
   */
  async retryLastAction(): Promise<void> {
    const actions = Array.from(this.retryActions.values());
    if (actions.length === 0) {
      throw new Error('No retry action available');
    }

    const lastAction = actions[actions.length - 1];
    if (!lastAction) {
      throw new Error('No valid retry action found');
    }
    return lastAction();
  }

  /**
   * Clear specific retry action
   */
  clearRetryAction(actionId: string): void {
    this.retryActions.delete(actionId);
  }

  /**
   * Set maximum number of toasts
   */
  setMaxToasts(max: number): void {
    this.maxToasts = max;
  }

  /**
   * Set duplicate check window in milliseconds
   */
  setDuplicateCheckWindow(ms: number): void {
    this.duplicateCheckWindow = ms;
  }
}

// Export singleton instance
export const errorService = new ErrorService();