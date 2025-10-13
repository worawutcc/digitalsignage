// ErrorBoundary component test - MUST FAIL before implementation
// Following React Testing Library patterns

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Custom error fallback for testing
const TestErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div role="alert">
    <h2>Something went wrong</h2>
    <p>{error.message}</p>
    <button onClick={resetError}>Reset Error</button>
  </div>
);

describe('ErrorBoundary Component', () => {
  // Suppress console.error for these tests since we're intentionally throwing errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  it('should render default fallback when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should render custom fallback when error occurs', () => {
    render(
      <ErrorBoundary fallback={TestErrorFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Reset Error')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('should reset error state when resetError is called', () => {
    const { rerender } = render(
      <ErrorBoundary fallback={TestErrorFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error state should be shown
    expect(screen.getByText('Test error')).toBeInTheDocument();

    // Click reset button
    const resetButton = screen.getByText('Reset Error');
    resetButton.click();

    // Rerender with no error
    rerender(
      <ErrorBoundary fallback={TestErrorFallback}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should reset error state when resetKeys change', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={[1]}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error should be caught
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Change resetKeys
    rerender(
      <ErrorBoundary resetKeys={[2]}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should reset and show normal content
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should handle different error levels', () => {
    render(
      <ErrorBoundary level="page">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should provide error information to fallback component', () => {
    const CustomFallback = ({ error, resetError, level }: any) => (
      <div role="alert">
        <span data-testid="error-message">{error.message}</span>
        <span data-testid="error-level">{level}</span>
        <button onClick={resetError}>Reset</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback} level="component">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-message')).toHaveTextContent('Test error');
    expect(screen.getByTestId('error-level')).toHaveTextContent('component');
  });

  it('should handle multiple children', () => {
    render(
      <ErrorBoundary>
        <div>First child</div>
        <div>Second child</div>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error fallback instead of any children
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('First child')).not.toBeInTheDocument();
    expect(screen.queryByText('Second child')).not.toBeInTheDocument();
  });

  it('should not catch errors in event handlers', () => {
    const EventHandlerError = () => {
      const throwError = () => {
        throw new Error('Event handler error');
      };

      return <button onClick={throwError}>Click to throw</button>;
    };

    const { container } = render(
      <ErrorBoundary>
        <EventHandlerError />
      </ErrorBoundary>
    );

    // Should render normally
    expect(screen.getByText('Click to throw')).toBeInTheDocument();
    
    // Error boundary should not catch event handler errors
    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
  });
});