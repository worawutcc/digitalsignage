// LoadingOverlay component test - MUST FAIL before implementation

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoadingOverlay } from '@/components/errors/LoadingOverlay';
import { ApiError } from '@/types/errors';

const mockError: ApiError = {
  title: 'Load Failed',
  status: 500,
  detail: 'Server error occurred',
  timestamp: new Date().toISOString(),
};

describe('LoadingOverlay Component', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when not loading and no error', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should show loading spinner when loading', () => {
    render(
      <LoadingOverlay isLoading={true}>
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show error state with retry button', () => {
    render(
      <LoadingOverlay isLoading={false} error={mockError} onRetry={mockOnRetry}>
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Load Failed')).toBeInTheDocument();
    expect(screen.getByText('Server error occurred')).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('should show overlay when enabled', () => {
    const { container } = render(
      <LoadingOverlay isLoading={true} overlay={true}>
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(container.querySelector('.overlay')).toBeInTheDocument();
  });
});