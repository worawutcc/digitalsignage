// Reports Types - matching backend DTOs

export type ReportType = 'Analytics' | 'Device' | 'Content' | 'User' | 'Custom'
export type ReportFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Custom' | 'OnDemand'
export type ReportFormat = 'PDF' | 'Excel' | 'CSV' | 'JSON'
export type ReportStatus = 'Active' | 'Draft' | 'Scheduled' | 'Inactive'
export type ReportGenerationStatus = 'Pending' | 'Generating' | 'Completed' | 'Failed'

export interface ReportTemplate {
  id: number
  name: string
  description: string
  type: ReportType
  frequency: ReportFrequency
  format: ReportFormat
  status: ReportStatus
  lastGenerated: string
  recipients: string[]
  isScheduled: boolean
  scheduleCron: string | null
}

export interface GeneratedReport {
  id: number
  templateId: number
  templateName: string
  generatedDate: string
  period: string
  format: ReportFormat
  size: string
  status: ReportGenerationStatus
  downloadUrl: string | null
  errorMessage: string | null
}

export interface GenerateReportRequest {
  templateId: number
  startDate?: string
  endDate?: string
  formatOverride?: ReportFormat
}

export interface GenerateReportResponse {
  reportId: number
  status: ReportGenerationStatus
  message: string
  downloadUrl: string | null
}
