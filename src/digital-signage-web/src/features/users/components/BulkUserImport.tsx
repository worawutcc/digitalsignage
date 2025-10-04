'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Download,
  Users,
  AlertTriangle,
  Loader2,
  FileUp,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { userService } from '../services/userService'
import { useBulkOperations } from '@/hooks/useBulkOperations'
import { useUserRealTimeUpdates } from '@/hooks/useRealTimeUpdates'
import type { CreateUserRequest, UserRole } from '../types'

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface ImportValidationError {
  row: number
  column: string
  error: string
  value?: any
  suggestion?: string
}

interface ImportUser extends CreateUserRequest {
  rowNumber: number
  isValid: boolean
  errors: ImportValidationError[]
  warnings: string[]
}

interface ImportPreview {
  totalRows: number
  validRows: number
  invalidRows: number
  users: ImportUser[]
  errors: ImportValidationError[]
  duplicates: Array<{
    email: string
    rows: number[]
  }>
}

interface ImportProgress {
  operationId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalUsers: number
  processedUsers: number
  successCount: number
  failureCount: number
  currentUser?: string
  errors: Array<{
    row: number
    email: string
    error: string
  }>
  estimatedTimeRemaining?: number
}

interface BulkUserImportProps {
  onImportComplete?: (result: { 
    successCount: number 
    failureCount: number 
    errors: Array<{ row: number; email: string; error: string }> 
  }) => void
  onClose?: () => void
  availableRoles?: UserRole[]
  maxFileSize?: number // in MB
  acceptedFormats?: string[]
  className?: string
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

/**
 * BulkUserImport Component
 * 
 * Comprehensive CSV/Excel user import component with:
 * - File upload with drag-and-drop
 * - CSV parsing and validation
 * - Data preview with error highlighting
 * - Bulk import with progress tracking
 * - Real-time progress updates
 * - Error handling and retry mechanisms
 * 
 * @see copilot-instructions-ui.instructions.md - Follow established patterns
 */
export function BulkUserImport({
  onImportComplete,
  onClose,
  availableRoles = [],
  maxFileSize = 10, // 10MB default
  acceptedFormats = ['.csv', '.xlsx', '.xls'],
  className = ''
}: BulkUserImportProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [importSettings, setImportSettings] = useState({
    skipDuplicates: true,
    updateExisting: false,
    defaultRole: availableRoles[0]?.id || '',
    sendWelcomeEmail: true
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ============================================================================
  // HOOKS
  // ============================================================================

  const bulkOperations = useBulkOperations({
    operation: async (user: CreateUserRequest) => {
      return await userService.createUser(user)
    },
    concurrency: 5,
    retry: { attempts: 2, delay: 1000 },
    onProgress: (progress) => {
      setImportProgress(prev => prev ? {
        ...prev,
        processedUsers: progress.completed,
        successCount: progress.completed - progress.failed,
        failureCount: progress.failed
      } : null)
    }
  })

  const { events } = useUserRealTimeUpdates()

  // ============================================================================
  // FILE HANDLING
  // ============================================================================

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFormats.includes(fileExtension)) {
      alert(`Unsupported file format. Please use: ${acceptedFormats.join(', ')}`)
      return
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      alert(`File too large. Maximum size is ${maxFileSize}MB`)
      return
    }

    setSelectedFile(file)
    await parseFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  // ============================================================================
  // FILE PARSING AND VALIDATION
  // ============================================================================

  const parseFile = async (file: File) => {
    setProcessing(true)
    
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('File must contain at least a header row and one data row')
      }

      // Parse header
      const headerLine = lines[0]
      if (!headerLine) {
        throw new Error('File appears to be empty')
      }
      
      const headers = headerLine.split(',').map(h => h.trim().toLowerCase())
      const requiredHeaders = ['email', 'firstname', 'lastname', 'username']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
      }

      // Parse data rows
      const users: ImportUser[] = []
      const errors: ImportValidationError[] = []
      const emailSet = new Set<string>()
      const duplicates: Array<{ email: string; rows: number[] }> = []

      for (let i = 1; i < lines.length; i++) {
        const dataLine = lines[i]
        if (!dataLine) continue
        
        const values = dataLine.split(',').map(v => v.trim())
        const rowNumber = i + 1
        
        const user: ImportUser = {
          rowNumber,
          email: values[headers.indexOf('email')] || '',
          firstName: values[headers.indexOf('firstname')] || '',
          lastName: values[headers.indexOf('lastname')] || '',
          username: values[headers.indexOf('username')] || '',
          password: values[headers.indexOf('password')] || generateTempPassword(),
          roleId: values[headers.indexOf('role')] || importSettings.defaultRole,
          isValid: true,
          errors: [],
          warnings: []
        }

        // Validate required fields
        if (!user.email) {
          user.errors.push({
            row: rowNumber,
            column: 'email',
            error: 'Email is required',
            suggestion: 'Provide a valid email address'
          })
          user.isValid = false
        } else if (!isValidEmail(user.email)) {
          user.errors.push({
            row: rowNumber,
            column: 'email',
            error: 'Invalid email format',
            value: user.email,
            suggestion: 'Use format: user@domain.com'
          })
          user.isValid = false
        }

        if (!user.firstName) {
          user.errors.push({
            row: rowNumber,
            column: 'firstName',
            error: 'First name is required'
          })
          user.isValid = false
        }

        if (!user.lastName) {
          user.errors.push({
            row: rowNumber,
            column: 'lastName',
            error: 'Last name is required'
          })
          user.isValid = false
        }

        if (!user.username) {
          user.errors.push({
            row: rowNumber,
            column: 'username',
            error: 'Username is required'
          })
          user.isValid = false
        }

        // Check for duplicates within file
        if (user.email && emailSet.has(user.email)) {
          const existingDupe = duplicates.find(d => d.email === user.email)
          if (existingDupe) {
            existingDupe.rows.push(rowNumber)
          } else {
            duplicates.push({ email: user.email, rows: [rowNumber] })
          }
          user.warnings.push('Duplicate email in file')
        } else if (user.email) {
          emailSet.add(user.email)
        }

        // Validate role
        if (user.roleId && !availableRoles.some(r => r.id === user.roleId)) {
          user.warnings.push(`Role "${user.roleId}" not found, will use default role`)
          user.roleId = importSettings.defaultRole
        }

        users.push(user)
        errors.push(...user.errors)
      }

      const preview: ImportPreview = {
        totalRows: users.length,
        validRows: users.filter(u => u.isValid).length,
        invalidRows: users.filter(u => !u.isValid).length,
        users,
        errors,
        duplicates
      }

      setImportPreview(preview)
      setCurrentStep('preview')
    } catch (error: any) {
      alert(`Error parsing file: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  // ============================================================================
  // IMPORT EXECUTION
  // ============================================================================

  const executeImport = async () => {
    if (!importPreview) return

    const validUsers = importPreview.users.filter(u => u.isValid)
    if (validUsers.length === 0) {
      alert('No valid users to import')
      return
    }

    setCurrentStep('importing')
    setProcessing(true)

    try {
      // Initialize progress tracking
      setImportProgress({
        operationId: `import-${Date.now()}`,
        status: 'processing',
        totalUsers: validUsers.length,
        processedUsers: 0,
        successCount: 0,
        failureCount: 0,
        errors: []
      })

      // Convert users to CreateUserRequest format and execute
      const userRequests: CreateUserRequest[] = validUsers.map(user => ({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        password: user.password,
        roleId: user.roleId
      }))

      // Execute bulk operation
      await bulkOperations.execute(userRequests)

      setCurrentStep('complete')
    } catch (error: any) {
      console.error('Import failed:', error)
      alert(`Import failed: ${error.message}`)
      setImportProgress(prev => prev ? {
        ...prev,
        status: 'failed'
      } : null)
    } finally {
      setProcessing(false)
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const generateTempPassword = (): string => {
    return Math.random().toString(36).slice(-8)
  }

  const downloadTemplate = () => {
    const headers = ['email', 'firstName', 'lastName', 'username', 'role']
    const sampleData = [
      'user@example.com,John,Doe,johndoe,operator',
      'jane@example.com,Jane,Smith,janesmith,manager'
    ]
    
    const csvContent = [headers.join(','), ...sampleData].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'user_import_template.csv'
    a.click()
    
    URL.revokeObjectURL(url)
  }

  const resetImport = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setImportPreview(null)
    setImportProgress(null)
    setShowErrorDetails(false)
    setProcessing(false)
  }

  // Auto-advance to complete step when bulk operation finishes
  useEffect(() => {
    if (currentStep === 'importing' && !bulkOperations.state.isRunning && bulkOperations.state.progress.total > 0) {
      setCurrentStep('complete')
    }
  }, [currentStep, bulkOperations.state.isRunning, bulkOperations.state.progress.total])

  // ============================================================================
  // STEP COMPONENTS
  // ============================================================================

  const UploadStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Users</h2>
        <p className="text-gray-600">
          Upload a CSV or Excel file to bulk import users into the system
        </p>
      </div>

      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">Need a template?</h3>
            <p className="text-sm text-blue-700 mt-1">
              Download our CSV template with sample data to get started quickly.
            </p>
            <button
              onClick={downloadTemplate}
              className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <Download className="h-4 w-4 mr-1" />
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer border-gray-300 hover:border-gray-400"
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".csv,.xlsx,.xls"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {processing ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
            <div>
              <p className="text-lg font-medium text-gray-900">Processing file...</p>
              <p className="text-sm text-gray-500">Please wait while we analyze your file</p>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <FileUp className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-sm text-red-600 hover:text-red-500"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Choose a file or drag it here
              </p>
              <p className="text-sm text-gray-500">
                Supports CSV, Excel (.xlsx, .xls) up to {maxFileSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Required Columns Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Required Columns</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            email
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            firstName
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            lastName
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            username
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            role (optional)
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            password (optional)
          </div>
        </div>
      </div>
    </div>
  )

  const PreviewStep = () => {
    if (!importPreview) return null

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import Preview</h2>
            <p className="text-gray-600">Review the data before importing</p>
          </div>
          <button
            onClick={() => setCurrentStep('upload')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{importPreview.totalRows}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Valid</p>
                <p className="text-2xl font-bold text-green-900">{importPreview.validRows}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Invalid</p>
                <p className="text-2xl font-bold text-red-900">{importPreview.invalidRows}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Duplicates</p>
                <p className="text-2xl font-bold text-yellow-900">{importPreview.duplicates.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Import Settings */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Import Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importSettings.skipDuplicates}
                onChange={(e) => setImportSettings(prev => ({ 
                  ...prev, 
                  skipDuplicates: e.target.checked 
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Skip duplicate emails</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importSettings.sendWelcomeEmail}
                onChange={(e) => setImportSettings(prev => ({ 
                  ...prev, 
                  sendWelcomeEmail: e.target.checked 
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Send welcome emails</span>
            </label>
          </div>
        </div>

        {/* Error Details Toggle */}
        {importPreview.errors.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="flex items-center text-red-600 hover:text-red-500"
            >
              {showErrorDetails ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showErrorDetails ? 'Hide' : 'Show'} Error Details ({importPreview.errors.length})
            </button>

            {showErrorDetails && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h4 className="font-medium text-red-900 mb-3">Validation Errors</h4>
                <div className="space-y-2">
                  {importPreview.errors.map((error, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-red-800">Row {error.row}</span>
                      <span className="text-red-600"> - {error.column}: {error.error}</span>
                      {error.suggestion && (
                        <div className="text-red-500 ml-4 italic">Suggestion: {error.suggestion}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('upload')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to Upload
          </button>
          
          <button
            onClick={executeImport}
            disabled={importPreview.validRows === 0 || processing}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Import {importPreview.validRows} Users
          </button>
        </div>
      </div>
    )
  }

  const ImportingStep = () => {
    const progress = bulkOperations.state.progress

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Importing Users</h2>
          <p className="text-gray-600">Please wait while we process your users...</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{progress.completed + progress.failed} of {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-500">
            {progress.percentage.toFixed(1)}% complete
          </div>
        </div>

        {/* Current Processing */}
        {bulkOperations.state.isRunning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-3" />
              <div>
                <p className="font-medium text-blue-900">Processing users...</p>
                <p className="text-blue-700">{progress.inProgress} items in progress</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-900">{progress.completed}</p>
            <p className="text-sm text-green-600">Successful</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-900">{progress.failed}</p>
            <p className="text-sm text-red-600">Failed</p>
          </div>
        </div>
      </div>
    )
  }

  const CompleteStep = () => {
    const progress = bulkOperations.state.progress
    const hasErrors = progress.failed > 0

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          {hasErrors ? (
            <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
          ) : (
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          )}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Import {hasErrors ? 'Completed with Issues' : 'Completed Successfully'}
          </h2>
          <p className="text-gray-600">
            {progress.completed} users imported successfully
            {hasErrors && `, ${progress.failed} failed`}
          </p>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-900">{progress.completed}</p>
            <p className="text-sm text-green-600">Users Created</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-900">{progress.failed}</p>
            <p className="text-sm text-red-600">Failed</p>
          </div>
        </div>

        {/* Error Details */}
        {hasErrors && progress.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-3">Import Errors</h3>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {progress.errors.map((error, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-red-800">Error {index + 1}</span>
                  <span className="text-red-600"> - {typeof error.error === 'string' ? error.error : 'Import failed'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={resetImport}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Import More Users
          </button>
          
          {onClose && (
            <button
              onClick={() => {
                onImportComplete?.({
                  successCount: progress.completed,
                  failureCount: progress.failed,
                  errors: progress.errors.map((error, index) => ({
                    row: index + 1,
                    email: error.item?.email || 'Unknown',
                    error: typeof error.error === 'string' ? error.error : 'Import failed'
                  }))
                })
                onClose()
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto ${className}`}>
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['upload', 'preview', 'importing', 'complete'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? 'bg-blue-600 text-white'
                  : index < ['upload', 'preview', 'importing', 'complete'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {index < ['upload', 'preview', 'importing', 'complete'].indexOf(currentStep) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div className={`w-24 h-1 mx-2 ${
                  index < ['upload', 'preview', 'importing', 'complete'].indexOf(currentStep)
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Upload</span>
          <span>Preview</span>
          <span>Import</span>
          <span>Complete</span>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'upload' && <UploadStep />}
      {currentStep === 'preview' && <PreviewStep />}
      {currentStep === 'importing' && <ImportingStep />}
      {currentStep === 'complete' && <CompleteStep />}
    </div>
  )
}