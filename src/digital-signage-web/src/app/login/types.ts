/**
 * Login page types and interfaces
 */

/**
 * Login form data
 */
export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

/**
 * Form validation errors
 */
export interface FormErrors {
  email?: string
  password?: string
  general?: string
}
