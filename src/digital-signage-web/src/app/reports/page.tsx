'use client'

import { useState } from 'react'
import { 
  Download,
  FileText,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Clock,
  TrendingUp,
  Users,
  Monitor,
  Eye,
  Activity,
  PieChart,
  FileSpreadsheet,
  Printer,
  Mail,
  Settings,
  Play
} from 'lucide-react'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'analytics' | 'device' | 'content' | 'user' | 'custom'
  icon: React.ReactNode
  lastGenerated: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  format: 'pdf' | 'excel' | 'csv'
  status: 'active' | 'draft' | 'scheduled'
  recipients?: string[]
}

const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Daily Analytics Summary',
    description: 'Daily overview of views, engagement, and device performance',
    type: 'analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    lastGenerated: '2025-01-07 08:00',
    frequency: 'daily',
    format: 'pdf',
    status: 'active',
    recipients: ['admin@company.com', 'manager@company.com']
  },
  {
    id: '2',
    name: 'Weekly Device Health Report',
    description: 'Device uptime, connectivity, and performance metrics',
    type: 'device',
    icon: <Monitor className="h-5 w-5" />,
    lastGenerated: '2025-01-06 09:00',
    frequency: 'weekly',
    format: 'excel',
    status: 'active',
    recipients: ['tech@company.com']
  },
  {
    id: '3',
    name: 'Content Performance Analysis',
    description: 'Most viewed content, engagement rates, and recommendations',
    type: 'content',
    icon: <Eye className="h-5 w-5" />,
    lastGenerated: '2025-01-05 10:30',
    frequency: 'weekly',
    format: 'pdf',
    status: 'active',
    recipients: ['marketing@company.com']
  },
  {
    id: '4',
    name: 'Monthly Executive Summary',
    description: 'High-level metrics and trends for executive review',
    type: 'analytics',
    icon: <TrendingUp className="h-5 w-5" />,
    lastGenerated: '2025-01-01 09:00',
    frequency: 'monthly',
    format: 'pdf',
    status: 'active',
    recipients: ['exec@company.com']
  },
  {
    id: '5',
    name: 'User Activity Report',
    description: 'User login activity and system usage patterns',
    type: 'user',
    icon: <Users className="h-5 w-5" />,
    lastGenerated: '2025-01-04 14:00',
    frequency: 'weekly',
    format: 'csv',
    status: 'draft'
  }
]

interface GeneratedReport {
  id: string
  templateId: string
  templateName: string
  generatedDate: string
  period: string
  format: string
  size: string
  status: 'completed' | 'generating' | 'failed'
  downloadUrl?: string
}

const generatedReports: GeneratedReport[] = [
  {
    id: '1',
    templateId: '1',
    templateName: 'Daily Analytics Summary',
    generatedDate: '2025-01-07 08:00',
    period: '2025-01-06',
    format: 'PDF',
    size: '2.4 MB',
    status: 'completed',
    downloadUrl: '/reports/daily-analytics-2025-01-06.pdf'
  },
  {
    id: '2',
    templateId: '2',
    templateName: 'Weekly Device Health Report',
    generatedDate: '2025-01-06 09:00',
    period: 'Dec 30 - Jan 05, 2025',
    format: 'Excel',
    size: '1.8 MB',
    status: 'completed',
    downloadUrl: '/reports/device-health-week-01.xlsx'
  },
  {
    id: '3',
    templateId: '3',
    templateName: 'Content Performance Analysis',
    generatedDate: '2025-01-05 10:30',
    period: 'Dec 29 - Jan 04, 2025',
    format: 'PDF',
    size: '3.1 MB',
    status: 'completed',
    downloadUrl: '/reports/content-performance-week-01.pdf'
  },
  {
    id: '4',
    templateId: '1',
    templateName: 'Daily Analytics Summary',
    generatedDate: '2025-01-07 08:05',
    period: '2025-01-05',
    format: 'PDF',
    size: '0 MB',
    status: 'generating'
  }
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'analytics':
      return <BarChart3 className="h-4 w-4 text-blue-500" />
    case 'device':
      return <Monitor className="h-4 w-4 text-green-500" />
    case 'content':
      return <Eye className="h-4 w-4 text-purple-500" />
    case 'user':
      return <Users className="h-4 w-4 text-orange-500" />
    case 'custom':
      return <Settings className="h-4 w-4 text-gray-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

const getFormatIcon = (format: string) => {
  switch (format.toLowerCase()) {
    case 'pdf':
      return <FileText className="h-4 w-4 text-red-500" />
    case 'excel':
    case 'xlsx':
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />
    case 'csv':
      return <FileText className="h-4 w-4 text-blue-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'generating':
      return 'bg-blue-100 text-blue-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'generated'>('templates')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredTemplates = reportTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredReports = generatedReports.filter(report =>
    report.templateName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate and manage reports for your digital signage network
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Templates
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportTemplates.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Reports
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportTemplates.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Generated Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {generatedReports.filter(r => r.generatedDate.includes('2025-01-07')).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Auto-Sent
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportTemplates.filter(t => t.recipients && t.recipients.length > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Report Templates
            </button>
            <button
              onClick={() => setActiveTab('generated')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generated' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Generated Reports
            </button>
          </nav>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={`Search ${activeTab === 'templates' ? 'templates' : 'reports'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'templates' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {getTypeIcon(template.type)}
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(template.status)}`}>
                      {template.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                      <span className="font-medium capitalize">{template.frequency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Format:</span>
                      <div className="flex items-center">
                        {getFormatIcon(template.format)}
                        <span className="font-medium ml-1 uppercase">{template.format}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Generated:</span>
                      <span className="font-medium">{template.lastGenerated}</span>
                    </div>
                    {template.recipients && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                        <span className="font-medium">{template.recipients.length} emails</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Generate Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Report</th>
                    <th className="text-left p-4">Period</th>
                    <th className="text-left p-4">Generated</th>
                    <th className="text-left p-4">Format</th>
                    <th className="text-left p-4">Size</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {report.templateName}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {report.period}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {report.generatedDate}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {getFormatIcon(report.format)}
                          <span className="ml-2 text-sm font-medium">
                            {report.format}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {report.size}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {report.status === 'completed' && (
                            <>
                              <Button variant="ghost" size="sm" title="Download">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Email">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Print">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {report.status === 'generating' && (
                            <div className="px-2 py-1 text-xs text-blue-600">
                              Generating...
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Report Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-lg w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create Report Template
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Report Name
                    </label>
                    <Input placeholder="Enter report name" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={3}
                      placeholder="Describe this report..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Report Type
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option value="analytics">Analytics</option>
                        <option value="device">Device Performance</option>
                        <option value="content">Content Performance</option>
                        <option value="user">User Activity</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frequency
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Format
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Recipients
                      </label>
                      <Input placeholder="email1@company.com, email2@company.com" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button>
                    Create Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}