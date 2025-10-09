import { apiClient } from '@/lib/api'
import type { 
  ReportTemplate, 
  GeneratedReport, 
  GenerateReportRequest, 
  GenerateReportResponse 
} from '@/types/reports'

/**
 * Reports service for managing report templates and generating reports
 */
export const reportsService = {
  /**
   * Get all report templates
   */
  getTemplates: async (): Promise<ReportTemplate[]> => {
    const response = await apiClient.get<ReportTemplate[]>('/api/reports/templates')
    return response.data
  },

  /**
   * Get report template by ID
   */
  getTemplateById: async (id: number): Promise<ReportTemplate> => {
    const response = await apiClient.get<ReportTemplate>(`/api/reports/templates/${id}`)
    return response.data
  },

  /**
   * Get generated reports with optional filtering
   */
  getGeneratedReports: async (
    templateId?: number, 
    limit: number = 50
  ): Promise<GeneratedReport[]> => {
    const params = new URLSearchParams()
    if (templateId) params.append('templateId', templateId.toString())
    params.append('limit', limit.toString())

    const response = await apiClient.get<GeneratedReport[]>(
      `/api/reports/generated?${params.toString()}`
    )
    return response.data
  },

  /**
   * Generate a report from template
   */
  generateReport: async (request: GenerateReportRequest): Promise<GenerateReportResponse> => {
    const response = await apiClient.post<GenerateReportResponse>(
      '/api/reports/generate',
      request
    )
    return response.data
  },

  /**
   * Get report download URL
   */
  getDownloadUrl: async (reportId: number): Promise<string> => {
    const response = await apiClient.get<{ downloadUrl: string }>(
      `/api/reports/${reportId}/download-url`
    )
    return response.data.downloadUrl
  },

  /**
   * Delete a generated report
   */
  deleteReport: async (reportId: number): Promise<void> => {
    await apiClient.delete(`/api/reports/${reportId}`)
  }
}
