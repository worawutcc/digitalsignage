import { ButtonHTMLAttributes } from 'react'
import { VariantProps } from 'class-variance-authority'
import { buttonVariants } from './Button'

/**
 * Props for the Button component
 * Extends standard HTML button attributes with custom variants
 */
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}