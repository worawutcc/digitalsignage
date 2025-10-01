/**
 * Custom Form Hooks with React Hook Form
 * Reusable form logic and utilities
 */

'use client'

import { useForm as useReactHookForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodType } from 'zod'
import { useState, useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addNotification } from '@/store/slices/uiSlice'

/**
 * Enhanced form configuration options
 */
export interface UseFormOptions<TFieldValues extends FieldValues> extends Omit<UseFormProps<TFieldValues>, 'resolver'> {
  schema?: ZodType<any>
  onSuccess?: (data: TFieldValues) => void | Promise<void>
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
  resetOnSuccess?: boolean
}

/**
 * Enhanced useForm hook with Zod validation and error handling
 * @param options - Form configuration options
 * @returns Enhanced form methods and state
 * 
 * @example
 * ```tsx
 * const form = useForm({
 *   schema: loginSchema,
 *   defaultValues: { email: '', password: '' },
 *   onSuccess: async (data) => {
 *     await authService.login(data)
 *   },
 *   successMessage: 'Login successful!',
 * })
 * ```
 */
export function useForm<TFieldValues extends FieldValues = FieldValues>(
  options?: UseFormOptions<TFieldValues>
) {
  const {
    schema,
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    resetOnSuccess = false,
    ...formOptions
  } = options || {}

  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<Error | null>(null)

  // Create form with Zod resolver if schema provided
  const formConfig: UseFormProps<TFieldValues> = {
    ...formOptions,
  }
  
  if (schema) {
    // Type assertion needed due to Zod/RHF type system incompatibility
    formConfig.resolver = zodResolver(schema as any) as any
  }
  
  const form = useReactHookForm<TFieldValues>(formConfig)

  /**
   * Enhanced submit handler with error handling and notifications
   */
  const handleSubmitWithNotifications = useCallback(
    (onValid: (data: TFieldValues) => void | Promise<void>) => {
      return form.handleSubmit(async (data) => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
          await onValid(data)

          // Call success callback
          if (onSuccess) {
            await onSuccess(data)
          }

          // Show success notification
          if (successMessage) {
            dispatch(
              addNotification({
                title: 'Success',
                type: 'success',
                message: successMessage,
                duration: 3000,
              })
            )
          }

          // Reset form if requested
          if (resetOnSuccess) {
            form.reset()
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error('An error occurred')
          setSubmitError(err)

          // Call error callback
          if (onError) {
            onError(err)
          }

          // Show error notification
          dispatch(
            addNotification({
              title: 'Error',
              type: 'error',
              message: errorMessage || err.message || 'An error occurred',
              duration: 5000,
            })
          )
        } finally {
          setIsSubmitting(false)
        }
      })
    },
    [form, onSuccess, onError, successMessage, errorMessage, resetOnSuccess, dispatch]
  )

  return {
    ...form,
    isSubmitting,
    submitError,
    handleSubmitWithNotifications,
  }
}

/**
 * Form validation hook for manual validation triggers
 * @param form - Form instance from useForm
 * @returns Validation helpers
 * 
 * @example
 * ```tsx
 * const { validateField, validateAll } = useFormValidation(form)
 * await validateField('email')
 * const isValid = await validateAll()
 * ```
 */
export function useFormValidation<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>
) {
  const validateField = useCallback(
    async (name: string) => {
      return await form.trigger(name as any)
    },
    [form]
  )

  const validateAll = useCallback(async () => {
    return await form.trigger()
  }, [form])

  const clearErrors = useCallback(() => {
    form.clearErrors()
  }, [form])

  const clearFieldError = useCallback(
    (name: string) => {
      form.clearErrors(name as any)
    },
    [form]
  )

  return {
    validateField,
    validateAll,
    clearErrors,
    clearFieldError,
  }
}

/**
 * Form persistence hook for saving/restoring form data
 * @param key - Storage key
 * @param form - Form instance from useForm
 * @param options - Persistence options
 * 
 * @example
 * ```tsx
 * useFormPersistence('deviceForm', form, {
 *   storage: 'localStorage',
 *   debounceMs: 500,
 * })
 * ```
 */
export function useFormPersistence<TFieldValues extends FieldValues>(
  key: string,
  form: UseFormReturn<TFieldValues>,
  options?: {
    storage?: 'localStorage' | 'sessionStorage'
    debounceMs?: number
    exclude?: string[]
  }
) {
  const { storage = 'localStorage', debounceMs = 1000, exclude = [] } = options || {}
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout>()

  // Load saved data on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storageApi = storage === 'localStorage' ? localStorage : sessionStorage
      const saved = storageApi.getItem(key)
      if (saved) {
        const data = JSON.parse(saved)
        form.reset(data)
      }
    } catch (error) {
      console.error('Failed to load form data:', error)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Save data on changes (debounced)
  const watchedData = form.watch()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Clear existing timer
    if (saveTimer) {
      clearTimeout(saveTimer)
    }

    // Set new timer
    const timer = setTimeout(() => {
      try {
        // Filter out excluded fields
        const dataToSave = Object.entries(watchedData).reduce(
          (acc, [key, value]) => {
            if (!exclude.includes(key)) {
              acc[key] = value
            }
            return acc
          },
          {} as Record<string, any>
        )

        const storageApi = storage === 'localStorage' ? localStorage : sessionStorage
        storageApi.setItem(key, JSON.stringify(dataToSave))
      } catch (error) {
        console.error('Failed to save form data:', error)
      }
    }, debounceMs)

    setSaveTimer(timer)

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [watchedData, key, storage, debounceMs, exclude]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear saved data
  const clearSavedData = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const storageApi = storage === 'localStorage' ? localStorage : sessionStorage
      storageApi.removeItem(key)
    } catch (error) {
      console.error('Failed to clear form data:', error)
    }
  }, [key, storage])

  return {
    clearSavedData,
  }
}

/**
 * Form reset helper for complex reset scenarios
 * @param form - Form instance from useForm
 * @returns Reset helpers
 * 
 * @example
 * ```tsx
 * const { resetToDefaults, resetField, resetFields } = useFormReset(form)
 * ```
 */
export function useFormReset<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>
) {
  const resetToDefaults = useCallback(() => {
    form.reset()
  }, [form])

  const resetField = useCallback(
    (name: string, defaultValue?: any) => {
      form.resetField(name as any, { defaultValue })
    },
    [form]
  )

  const resetFields = useCallback(
    (names: string[], defaultValues?: Record<string, any>) => {
      names.forEach((name) => {
        form.resetField(name as any, {
          defaultValue: defaultValues?.[name],
        })
      })
    },
    [form]
  )

  return {
    resetToDefaults,
    resetField,
    resetFields,
  }
}
