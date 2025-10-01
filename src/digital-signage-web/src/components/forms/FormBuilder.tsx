/**
 * FormBuilder Component
 * Dynamic form generation with React Hook Form and Zod validation
 */

'use client'

import React, { ReactNode } from 'react'
import { FieldValues, Controller } from 'react-hook-form'
import { ZodType } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useForm, UseFormOptions } from '@/hooks/useForm'

/**
 * Field configuration for form generation
 */
export interface FormField {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio'
  placeholder?: string
  defaultValue?: any
  disabled?: boolean
  required?: boolean
  options?: Array<{ label: string; value: string | number }>
  rows?: number
  helperText?: string
  render?: (field: any) => ReactNode
}

/**
 * FormBuilder component props
 */
export interface FormBuilderProps<TFieldValues extends FieldValues> {
  fields: FormField[]
  schema?: ZodType<any>
  onSubmit: (data: TFieldValues) => void | Promise<void>
  onError?: (error: Error) => void
  defaultValues?: Partial<TFieldValues>
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  isLoading?: boolean
  successMessage?: string
  errorMessage?: string
  resetOnSuccess?: boolean
  className?: string
  children?: ReactNode
}

/**
 * Dynamic form builder component with validation
 * @param props - FormBuilder configuration
 * @returns Form component with fields and validation
 * 
 * @example
 * ```tsx
 * <FormBuilder
 *   fields={[
 *     { name: 'email', label: 'Email', type: 'email', required: true },
 *     { name: 'password', label: 'Password', type: 'password', required: true }
 *   ]}
 *   schema={loginSchema}
 *   onSubmit={handleSubmit}
 *   submitLabel="Login"
 * />
 * ```
 */
export function FormBuilder<TFieldValues extends FieldValues = FieldValues>({
  fields,
  schema,
  onSubmit,
  onError,
  defaultValues,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  isLoading = false,
  successMessage,
  errorMessage,
  resetOnSuccess = false,
  className = '',
  children,
}: FormBuilderProps<TFieldValues>) {
  // Initialize form with hooks
  const formOptions: any = {
    schema,
    defaultValues: defaultValues as any,
    onSuccess: onSubmit as any,
    onError,
    successMessage,
    errorMessage,
    resetOnSuccess,
  }

  const {
    control,
    handleSubmitWithNotifications,
    formState: { errors, isSubmitting },
  } = useForm<TFieldValues>(formOptions)

  /**
   * Render field based on type
   */
  const renderField = (field: FormField) => {
    const error = errors[field.name]?.message as string | undefined

    // Custom render function
    if (field.render) {
      return (
        <Controller
          key={field.name}
          name={field.name as any}
          control={control}
          render={({ field: controllerField }) => <>{field.render!(controllerField)}</>}
        />
      )
    }

    // Textarea
    if (field.type === 'textarea') {
      return (
        <Controller
          key={field.name}
          name={field.name as any}
          control={control}
          render={({ field: controllerField }) => (
            <div className="space-y-2">
              <label htmlFor={field.name} className="block text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              <textarea
                {...controllerField}
                id={field.name}
                placeholder={field.placeholder}
                disabled={field.disabled || isSubmitting}
                rows={field.rows || 4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              {field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>}
            </div>
          )}
        />
      )
    }

    // Select
    if (field.type === 'select' && field.options) {
      return (
        <Controller
          key={field.name}
          name={field.name as any}
          control={control}
          render={({ field: controllerField }) => (
            <div className="space-y-2">
              <label htmlFor={field.name} className="block text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              <select
                {...controllerField}
                id={field.name}
                disabled={field.disabled || isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>}
            </div>
          )}
        />
      )
    }

    // Checkbox
    if (field.type === 'checkbox') {
      return (
        <Controller
          key={field.name}
          name={field.name as any}
          control={control}
          render={({ field: controllerField }) => (
            <div className="flex items-center space-x-2">
              <input
                {...controllerField}
                type="checkbox"
                id={field.name}
                disabled={field.disabled || isSubmitting}
                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                checked={controllerField.value}
                onChange={(e) => controllerField.onChange(e.target.checked)}
              />
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {error && <p className="text-sm text-destructive ml-6">{error}</p>}
            </div>
          )}
        />
      )
    }

    // Radio
    if (field.type === 'radio' && field.options) {
      return (
        <Controller
          key={field.name}
          name={field.name as any}
          control={control}
          render={({ field: controllerField }) => (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              <div className="space-y-2">
                {field.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <input
                      {...controllerField}
                      type="radio"
                      id={`${field.name}-${option.value}`}
                      value={option.value}
                      disabled={field.disabled || isSubmitting}
                      className="h-4 w-4 border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      checked={controllerField.value === option.value}
                      onChange={() => controllerField.onChange(option.value)}
                    />
                    <label htmlFor={`${field.name}-${option.value}`} className="text-sm">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>}
            </div>
          )}
        />
      )
    }

    // Default: Input field
    return (
      <Controller
        key={field.name}
        name={field.name as any}
        control={control}
        render={({ field: controllerField }) => (
          <div className="space-y-2">
            <label htmlFor={field.name} className="block text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <Input
              {...controllerField}
              id={field.name}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              disabled={field.disabled || isSubmitting}
              {...(error && { error })}
            />
            {field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>}
          </div>
        )}
      />
    )
  }

  return (
    <form
      onSubmit={handleSubmitWithNotifications(onSubmit as any)}
      className={`space-y-6 ${className}`}
      noValidate
    >
      {/* Render all fields */}
      {fields.map((field) => renderField(field))}

      {/* Custom children (additional fields or content) */}
      {children}

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="min-w-[120px]"
        >
          {isSubmitting || isLoading ? 'Submitting...' : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            {cancelLabel}
          </Button>
        )}
      </div>
    </form>
  )
}
