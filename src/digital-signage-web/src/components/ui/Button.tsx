import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { ButtonProps } from './Button.types'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md',
        outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm',
        ghost: 'hover:bg-slate-100 hover:text-slate-900 text-slate-600',
        link: 'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

/**
 * Reusable button component with variants and loading states
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <span className="mr-2 h-4 w-4 animate-spin">⟳</span>}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }