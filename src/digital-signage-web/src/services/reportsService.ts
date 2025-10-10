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
    try {
      const response = await apiClient.get<ReportTemplate[]>('/api/reports/templates')
      const templatesArray = Array.isArray(response.data) ? response.data : []
      console.log('[ReportsService] Report templates retrieved:', templatesArray.length)
      return templatesArray
    } catch (error) {
      console.error('[ReportsService] Failed to get report templates:', error)
      return []
    }
  },

  /**
   * Get report template by ID
   */
  getTemplateById: async (id: number): Promise<ReportTemplate | null> => {
    try {
      const response = await apiClient.get<ReportTemplate>(`/api/reports/templates/${id}`)
      if (!response.data) {
        console.error('[ReportsService] Invalid response structure for getTemplateById')
        return null
      }
      console.log('[ReportsService] Report template retrieved:', id)
      return response.data
    } catch (error) {
      console.error('[ReportsService] Failed to get report template by ID:', error)
      return null
    }
  },

  /**
   * Get generated reports with optional filtering
   */
  getGeneratedReports: async (
    templateId?: number, 
    limit: number = 50
  ): Promise<GeneratedReport[]> => {
    try {
      const params = new URLSearchParams()
      if (templateId) params.append('templateId', templateId.toString())
      params.append('limit', limit.toString())

      const response = await apiClient.get<GeneratedReport[]>(
        `/api/reports/generated?${params.toString()}`
      )
      const reportsArray = Array.isArray(response.data) ? response.data : []
      console.log('[ReportsService] Generated reports retrieved:', reportsArray.length)
      return reportsArray
    } catch (error) {
      console.error('[ReportsService] Failed to get generated reports:', error)
      return []
    }
  },

  /**
   * Generate a report from template
   */
  generateReport: async (request: GenerateReportRequest): Promise<GenerateReportResponse | null> => {
    try {
      const response = await apiClient.post<GenerateReportResponse>(
        '/api/reports/generate',
        request
      )
      if (!response.data) {
        console.error('[ReportsService] Invalid response structure for generateReport')
        return null
      }
      console.log('[ReportsService] Report generated:', response.data.reportId || 'N/A')
      return response.data
    } catch (error) {
      console.error('[ReportsService] Failed to generate report:', error)
      return null
    }
  },

  /**
   * Get report download URL
   */
  getDownloadUrl: async (reportId: number): Promise<string> => {
    try {
      const response = await apiClient.get<{ downloadUrl: string }>(
        `/api/reports/${reportId}/download-url`
      )
      if (!response.data?.downloadUrl) {
        console.error('[ReportsService] Invalid response structure for getDownloadUrl')
        return ''
      }
      console.log('[ReportsService] Download URL retrieved for report:', reportId)
      return response.data.downloadUrl
    } catch (error) {
      console.error('[ReportsService] Failed to get download URL:', error)
      return ''
    }
  },

  /**
   * Delete a generated report
   */
  deleteReport: async (reportId: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/reports/${reportId}`)
      console.log('[ReportsService] Report deleted:', reportId)
    } catch (error) {
      console.error('[ReportsService] Failed to delete report:', error)
      throw error
    }
  }
}
