/**
 * QR Code Service
 * 
 * API client for QR code generation and management operations.
 * Following copilot-instructions-ui.instructions.md patterns with apiClient
 */

import { apiClient } from '@/lib/api'

export interface QRCode {
  id: string
  name: string
  type: 'url' | 'wifi' | 'text' | 'email' | 'phone' | 'sms'
  content: string
  description: string
  scans: number
  lastScanned?: string | undefined
  createdDate: string
  status: 'active' | 'inactive' | 'expired'
  expiryDate?: string | undefined
  deviceId?: string | undefined
  deviceName?: string | undefined
  imageUrl?: string | undefined
}

export interface CreateQRCodeRequest {
  name: string
  type: string
  content: string
  description: string
  expiryDate?: string
  deviceId?: string
}

export interface UpdateQRCodeRequest {
  name?: string
  description?: string
  expiryDate?: string
  status?: string
}

export interface QRCodeStats {
  totalQRCodes: number
  activeQRCodes: number
  expiredQRCodes: number
  totalScans: number
  scansToday: number
  unusedQRCodes: number
}

/**
 * QR Code Service
 * 
 * Provides methods for managing QR codes
 */
export const qrCodeService = {
  /**
   * Get all QR codes with optional filtering
   */
  async getAll(search?: string, type?: string, status?: string): Promise<QRCode[]> {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (type) params.append('type', type)
      if (status) params.append('status', status)

      const response = await apiClient.get<QRCode[]>(`/api/qrcodes?${params.toString()}`)
      
      // Add Array.isArray() guard for safety
      const qrCodesArray = Array.isArray(response.data) ? response.data : []
      
      return qrCodesArray.map((qr: any) => ({
        id: qr.id?.toString() || '',
        name: qr.name || 'Untitled QR Code',
        type: qr.type || 'url',
        content: qr.content || '',
        description: qr.description || 'No description',
        scans: qr.scans || 0,
        lastScanned: qr.lastScanned || undefined,
        createdDate: qr.createdAt || new Date().toISOString(),
        status: qr.status || 'active',
        expiryDate: qr.expiryDate || undefined,
        deviceId: qr.deviceId || undefined,
        deviceName: qr.deviceName || undefined,
        imageUrl: qr.imageUrl || undefined,
      }))
    } catch (error) {
      console.error('❌ Failed to fetch QR codes:', error)
      return []
    }
  },

  /**
   * Get QR code by ID
   */
  async getById(id: string): Promise<QRCode | null> {
    try {
      const response = await apiClient.get<QRCode>(`/api/qrcodes/${id}`)
      const qr = response.data
      
      return {
        id: qr.id?.toString() || id,
        name: qr.name || 'Untitled QR Code',
        type: qr.type || 'url',
        content: qr.content || '',
        description: qr.description || 'No description',
        scans: qr.scans || 0,
        lastScanned: qr.lastScanned || undefined,
        createdDate: qr.createdDate || new Date().toISOString(),
        status: qr.status || 'active',
        expiryDate: qr.expiryDate || undefined,
        deviceId: qr.deviceId || undefined,
        deviceName: qr.deviceName || undefined,
        imageUrl: qr.imageUrl || undefined,
      }
    } catch (error) {
      console.error(`❌ Failed to fetch QR code ${id}:`, error)
      return null
    }
  },

  /**
   * Generate a new QR code
   */
  async generate(request: CreateQRCodeRequest): Promise<QRCode> {
    try {
      const response = await apiClient.post<QRCode>('/api/qrcodes/generate', {
        name: request.name,
        type: request.type,
        content: request.content,
        description: request.description,
        expiryDate: request.expiryDate || undefined,
        deviceId: request.deviceId || undefined,
      })
      
      const qr = response.data
      
      return {
        id: qr.id?.toString() || '',
        name: qr.name || request.name,
        type: qr.type || request.type,
        content: qr.content || request.content,
        description: qr.description || request.description,
        scans: qr.scans || 0,
        lastScanned: qr.lastScanned || undefined,
        createdDate: qr.createdDate || new Date().toISOString(),
        status: qr.status || 'active',
        expiryDate: qr.expiryDate || request.expiryDate,
        deviceId: qr.deviceId || request.deviceId,
        deviceName: qr.deviceName || undefined,
        imageUrl: qr.imageUrl || undefined,
      }
    } catch (error) {
      console.error('❌ Failed to generate QR code:', error)
      throw error
    }
  },

  /**
   * Update QR code
   */
  async update(id: string, request: UpdateQRCodeRequest): Promise<QRCode> {
    try {
      const response = await apiClient.put<QRCode>(`/api/qrcodes/${id}`, request)
      const qr = response.data
      
      return {
        id: qr.id?.toString() || id,
        name: qr.name || 'Untitled QR Code',
        type: qr.type || 'url',
        content: qr.content || '',
        description: qr.description || 'No description',
        scans: qr.scans || 0,
        lastScanned: qr.lastScanned || undefined,
        createdDate: qr.createdDate || new Date().toISOString(),
        status: qr.status || 'active',
        expiryDate: qr.expiryDate || undefined,
        deviceId: qr.deviceId || undefined,
        deviceName: qr.deviceName || undefined,
        imageUrl: qr.imageUrl || undefined,
      }
    } catch (error) {
      console.error(`❌ Failed to update QR code ${id}:`, error)
      throw error
    }
  },

  /**
   * Delete QR code
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/qrcodes/${id}`)
    } catch (error) {
      console.error(`❌ Failed to delete QR code ${id}:`, error)
      throw error
    }
  },

  /**
   * Download QR code image
   */
  async downloadImage(id: string, size: number = 256): Promise<Blob> {
    try {
      const response = await apiClient.get(`/api/qrcodes/${id}/download?size=${size}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error(`❌ Failed to download QR code image ${id}:`, error)
      throw error
    }
  },

  /**
   * Get QR code download URL
   */
  getDownloadUrl(id: string, size: number = 256): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100'
    return `${baseUrl}/api/qrcodes/${id}/download?size=${size}`
  },

  /**
   * Get QR code statistics
   */
  async getStatistics(): Promise<QRCodeStats> {
    try {
      // Note: This endpoint might not exist yet, using mock data as fallback
      const response = await apiClient.get<QRCodeStats>('/api/qrcodes/statistics')
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch QR code statistics:', error)
      // Return default stats
      return {
        totalQRCodes: 0,
        activeQRCodes: 0,
        expiredQRCodes: 0,
        totalScans: 0,
        scansToday: 0,
        unusedQRCodes: 0,
      }
    }
  }
}

export default qrCodeService