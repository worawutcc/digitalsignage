// API error handler integration test - MUST FAIL before implementation

import axios, { AxiosError } from 'axios';
import { setupApiErrorHandler } from '@/lib/errors/apiErrorHandler';
import { ProblemDetails } from '@/types/errors';

describe('API Error Handler Integration', () => {
  let axiosInstance: typeof axios;
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    axiosInstance = axios.create();
    setupApiErrorHandler(axiosInstance, mockDispatch);
  });

  it('should handle 400 validation errors', async () => {
    const validationError: ProblemDetails = {
      title: 'Validation failed',
      status: 400,
      errors: {
        email: ['Email is required'],
        password: ['Password too short'],
      },
    };

    // Mock axios to return validation error
    jest.spyOn(axiosInstance, 'get').mockRejectedValue({
      response: { data: validationError, status: 400 }
    } as AxiosError);

    await expect(axiosInstance.get('/test')).rejects.toThrow();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('showApiError')
      })
    );
  });

  it('should handle 401 authentication errors', async () => {
    const authError: ProblemDetails = {
      title: 'Authentication failed',
      status: 401,
      detail: 'Invalid credentials',
    };

    jest.spyOn(axiosInstance, 'post').mockRejectedValue({
      response: { data: authError, status: 401 }
    } as AxiosError);

    await expect(axiosInstance.post('/login')).rejects.toThrow();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('showApiError')
      })
    );
  });

  it('should handle network errors', async () => {
    jest.spyOn(axiosInstance, 'get').mockRejectedValue({
      message: 'Network Error',
      code: 'ECONNREFUSED',
    } as AxiosError);

    await expect(axiosInstance.get('/test')).rejects.toThrow();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('showApiError')
      })
    );
  });

  it('should retry failed requests with exponential backoff', async () => {
    let callCount = 0;
    jest.spyOn(axiosInstance, 'get').mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.reject({ response: { status: 500 } });
      }
      return Promise.resolve({ data: 'success' });
    });

    const result = await axiosInstance.get('/test');
    expect(callCount).toBe(3);
    expect(result.data).toBe('success');
  });
});