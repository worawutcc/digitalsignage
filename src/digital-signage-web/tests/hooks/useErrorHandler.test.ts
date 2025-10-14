// Error hook tests - MUST FAIL before implementation

import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ApiError } from '@/types/errors';

describe('useErrorHandler Hook', () => {
  it('should show and clear errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.hasErrors).toBe(false);

    act(() => {
      result.current.showError('Test error');
    });

    expect(result.current.hasErrors).toBe(true);
    expect(result.current.errors).toHaveLength(1);

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.hasErrors).toBe(false);
    expect(result.current.errors).toHaveLength(0);
  });

  it('should show toast notifications', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.showToast('Test toast', 'success');
    });

    // Toast should be handled by Redux store
    expect(result.current.showToast).toHaveBeenCalledWith('Test toast', 'success');
  });

  it('should handle API errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const apiError: ApiError = {
      title: 'API Error',
      status: 500,
      timestamp: new Date().toISOString(),
    };

    act(() => {
      result.current.showError(apiError);
    });

    expect(result.current.errors[0]).toEqual(apiError);
  });
});