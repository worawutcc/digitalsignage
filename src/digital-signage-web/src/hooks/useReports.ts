import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsService } from '@/services/reportsService'
import type { GenerateReportRequest } from '@/types/reports'

/**
 * Query keys for reports
 */
export const reportsKeys = {
  all: ['reports'] as const,
  templates: () => [...reportsKeys.all, 'templates'] as const,
  template: (id: number) => [...reportsKeys.templates(), id] as const,
  generated: (templateId?: number) => [...reportsKeys.all, 'generated', templateId] as const,
}

/**
 * Hook to fetch all report templates
 */
export const useReportTemplates = () => {
  return useQuery({
    queryKey: reportsKeys.templates(),
    queryFn: () => reportsService.getTemplates(),
    staleTime: 5 * 60 * 1000, // 5 minutes - templates don't change often
  })
}

/**
 * Hook to fetch report template by ID
 */
export const useReportTemplate = (id: number) => {
  return useQuery({
    queryKey: reportsKeys.template(id),
    queryFn: () => reportsService.getTemplateById(id),
    enabled: id > 0,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch generated reports
 */
export const useGeneratedReports = (templateId?: number, limit: number = 50) => {
  return useQuery({
    queryKey: reportsKeys.generated(templateId),
    queryFn: () => reportsService.getGeneratedReports(templateId, limit),
    refetchInterval: 30000, // 30 seconds - to show new reports
    staleTime: 20000,
  })
}

/**
 * Hook to generate a report
 */
export const useGenerateReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: GenerateReportRequest) => reportsService.generateReport(request),
    onSuccess: () => {
      // Invalidate generated reports to show the new report
      queryClient.invalidateQueries({ 
        queryKey: reportsKeys.generated() 
      })
      // Invalidate templates to update lastGenerated timestamp
      queryClient.invalidateQueries({ 
        queryKey: reportsKeys.templates() 
      })
    },
  })
}

/**
 * Hook to delete a report
 */
export const useDeleteReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reportId: number) => reportsService.deleteReport(reportId),
    onSuccess: () => {
      // Invalidate generated reports to remove deleted report from list
      queryClient.invalidateQueries({ 
        queryKey: reportsKeys.generated() 
      })
    },
  })
}
