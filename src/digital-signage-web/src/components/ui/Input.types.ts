import { InputHTMLAttributes } from 'react'

/**
 * Props for the Input component
 * Extends standard HTML input attributes
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}