// Error service contract test - MUST FAIL before implementation
// Following TDD approach and React Testing Library patterns

import { ErrorService } from '@/lib/errors/errorService';
import { ApiError, ToastNotification } from '@/types/errors';

describe('ErrorService Contract', () => {
  let errorService: ErrorService;

  beforeEach(() => {
    errorService = new ErrorService();
  });

  afterEach(() => {
    errorService.clearAllErrors();
  });

  describe('Error Display Methods', () => {
    it('should show error with ApiError object', () => {
      const apiError: ApiError = {
        title: 'Test Error',
        status: 400,
        detail: 'Test error detail',
        timestamp: new Date().toISOString(),
      };

      expect(() => errorService.showError(apiError)).not.toThrow();
      expect(errorService.getActiveErrors()).toContain(apiError);
    });

    it('should show error with string message', () => {
      const errorMessage = 'Simple error message';
      
      expect(() => errorService.showError(errorMessage)).not.toThrow();
      const errors = errorService.getActiveErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].title).toBe(errorMessage);
    });

    it('should show toast notification', () => {
      const message = 'Test toast message';
      
      errorService.showToast(message, 'error');
      
      const toasts = errorService.getToastNotifications();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe(message);
      expect(toasts[0].type).toBe('error');
    });

    it('should show toast with options', () => {
      const message = 'Test toast with options';
      const options = {
        duration: 5000,
        persistent: true,
        position: 'top-right' as const,
      };
      
      errorService.showToast(message, 'warning', options);
      
      const toasts = errorService.getToastNotifications();
      expect(toasts[0].duration).toBe(5000);
      expect(toasts[0].persistent).toBe(true);
    });
  });

  describe('Error Management Methods', () => {
    it('should clear specific error', () => {
      const error: ApiError = {
        title: 'Test Error',
        status: 400,
        timestamp: new Date().toISOString(),
      };
      
      errorService.showError(error);
      expect(errorService.hasActiveErrors()).toBe(true);
      
      errorService.clearError();
      expect(errorService.hasActiveErrors()).toBe(false);
    });

    it('should clear all errors', () => {
      errorService.showError('Error 1');
      errorService.showError('Error 2');
      errorService.showToast('Toast 1', 'error');
      
      expect(errorService.hasActiveErrors()).toBe(true);
      expect(errorService.getToastNotifications()).toHaveLength(1);
      
      errorService.clearAllErrors();
      
      expect(errorService.hasActiveErrors()).toBe(false);
      expect(errorService.getToastNotifications()).toHaveLength(0);
    });

    it('should dismiss specific toast', () => {
      errorService.showToast('Toast 1', 'info');
      errorService.showToast('Toast 2', 'warning');
      
      const toasts = errorService.getToastNotifications();
      expect(toasts).toHaveLength(2);
      
      const firstToastId = toasts[0].id;
      errorService.dismissToast(firstToastId);
      
      const remainingToasts = errorService.getToastNotifications();
      expect(remainingToasts).toHaveLength(1);
      expect(remainingToasts[0].id).not.toBe(firstToastId);
    });
  });

  describe('Error State Methods', () => {
    it('should return active errors', () => {
      expect(errorService.getActiveErrors()).toEqual([]);
      
      const error: ApiError = {
        title: 'Active Error',
        status: 500,
        timestamp: new Date().toISOString(),
      };
      
      errorService.showError(error);
      
      const activeErrors = errorService.getActiveErrors();
      expect(activeErrors).toHaveLength(1);
      expect(activeErrors[0]).toEqual(error);
    });

    it('should return toast notifications', () => {
      expect(errorService.getToastNotifications()).toEqual([]);
      
      errorService.showToast('Test notification', 'success');
      
      const notifications = errorService.getToastNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].message).toBe('Test notification');
      expect(notifications[0].type).toBe('success');
    });

    it('should check if has active errors', () => {
      expect(errorService.hasActiveErrors()).toBe(false);
      
      errorService.showError('Test error');
      expect(errorService.hasActiveErrors()).toBe(true);
      
      errorService.clearError();
      expect(errorService.hasActiveErrors()).toBe(false);
    });
  });

  describe('Error Recovery Methods', () => {
    it('should register retry action', () => {
      const mockRetryAction = jest.fn().mockResolvedValue(undefined);
      const actionId = 'test-action';
      
      expect(() => errorService.registerRetryAction(actionId, mockRetryAction)).not.toThrow();
    });

    it('should retry last action', async () => {
      const mockRetryAction = jest.fn().mockResolvedValue(undefined);
      const actionId = 'retry-test';
      
      errorService.registerRetryAction(actionId, mockRetryAction);
      
      await errorService.retryLastAction();
      
      expect(mockRetryAction).toHaveBeenCalled();
    });

    it('should handle retry action failure', async () => {
      const mockFailingAction = jest.fn().mockRejectedValue(new Error('Retry failed'));
      
      errorService.registerRetryAction('failing-action', mockFailingAction);
      
      await expect(errorService.retryLastAction()).rejects.toThrow('Retry failed');
    });
  });

  describe('Error Deduplication', () => {
    it('should prevent duplicate error toasts', () => {
      const sameError = 'Duplicate error message';
      
      errorService.showToast(sameError, 'error');
      errorService.showToast(sameError, 'error');
      
      const toasts = errorService.getToastNotifications();
      expect(toasts).toHaveLength(1);
    });

    it('should allow different error messages', () => {
      errorService.showToast('Error 1', 'error');
      errorService.showToast('Error 2', 'error');
      
      const toasts = errorService.getToastNotifications();
      expect(toasts).toHaveLength(2);
    });
  });
});