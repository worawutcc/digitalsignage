// FormFieldError component test - MUST FAIL before implementation

import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormFieldError } from '@/components/errors/FormFieldError';
import { FormError } from '@/types/errors';

const mockErrors: FormError[] = [
  { field: 'email', message: 'Email is required', code: 'required' },
  { field: 'email', message: 'Email format is invalid', code: 'format' },
];

describe('FormFieldError Component', () => {
  it('should render field errors', () => {
    render(<FormFieldError errors={mockErrors} field="email" />);
    
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Email format is invalid')).toBeInTheDocument();
  });

  it('should not render when no errors', () => {
    render(<FormFieldError errors={[]} field="email" />);
    
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  it('should show icon when enabled', () => {
    render(<FormFieldError errors={mockErrors} field="email" showIcon={true} />);
    
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  it('should handle different variants', () => {
    const { container } = render(
      <FormFieldError errors={mockErrors} field="email" variant="tooltip" />
    );
    
    expect(container.firstChild).toHaveClass('tooltip');
  });
});