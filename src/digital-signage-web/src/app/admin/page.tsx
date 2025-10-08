import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Users, 
  Monitor, 
  Settings, 
  Shield, 
  Activity, 
  FileText,
  BarChart3,
  AlertTriangle,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react'

/**
 * Admin Dashboard - Main administration page
 * 
 * Server Component following Next.js 15 App Router patterns
 * Provides central access to all admin functions
 * 
 * @see copilot-instructions-ui.md - Server Components by default
 * @see copilot-instructions-ui.md - App Router structure
 */

export const metadata: Metadata = {
  title: 'Admin Dashboard | Digital Signage',
  description: 'Administrative dashboard for digital signage system management',
}

interface AdminCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  status?: 'active' | 'warning' | 'error'
  count?: number
}

function AdminCard({ href, icon, title, description, status, count }: AdminCardProps) {
  const statusColors = {
    active: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20',
    warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
  }

  return (
    <Link
      href={href}
      className={`
        relative block p-6 rounded-xl border transition-all hover:shadow-md
        ${status ? statusColors[status] : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}
        hover:scale-105
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          </div>
        </div>
        {count !== undefined && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {count}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage your digital signage system with comprehensive administrative tools
              </p>
            </div>
            
            {/* System Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Monitor className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Active Devices
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">142</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Pending Registrations
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">5</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Active Schedules
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">67</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      System Alerts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">3</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Workflow Guide */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Recommended Admin Workflow</h3>
            </div>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              Follow this workflow to set up and manage your digital signage system effectively:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">1</span>
                  <h4 className="font-medium text-gray-900 dark:text-white">Create Groups</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Start by creating device groups to organize your displays</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">2</span>
                  <h4 className="font-medium text-gray-900 dark:text-white">Upload Media</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload images, videos, and content for your displays</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">3</span>
                  <h4 className="font-medium text-gray-900 dark:text-white">Create Schedules</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Set up content schedules and assign them to groups</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">4</span>
                  <h4 className="font-medium text-gray-900 dark:text-white">Register Devices</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approve device registrations and assign to groups</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">5</span>
                  <h4 className="font-medium text-gray-900 dark:text-white">Monitor System</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track device status and content delivery</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-gray-900 dark:text-white">View Guide</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <Link href="/docs/admin-workflow-guide.md" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    See full workflow guide →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Content Management */}
          <AdminCard
            href="/media"
            icon={<FileText className="h-6 w-6 text-blue-600" />}
            title="Content Management"
            description="Manage media files, playlists, and schedules"
            count={248}
          />

          {/* Device Management */}
          <AdminCard
            href="/devices"
            icon={<Monitor className="h-6 w-6 text-green-600" />}
            title="Device Management"
            description="Monitor and configure display devices"
            status="active"
            count={156}
          />

          {/* Device Registrations */}
          <AdminCard
            href="/admin/device-registrations/pending"
            icon={<Shield className="h-6 w-6 text-purple-600" />}
            title="Device Registrations"
            description="Review and approve pending device registrations"
            status="warning"
            count={5}
          />

          {/* System Settings */}
          <AdminCard
            href="/settings"
            icon={<Settings className="h-6 w-6 text-gray-600" />}
            title="System Settings"
            description="Configure system-wide settings and preferences"
          />

          {/* Analytics & Reports */}
          <AdminCard
            href="/reports"
            icon={<BarChart3 className="h-6 w-6 text-indigo-600" />}
            title="Analytics & Reports"
            description="View system analytics and generate reports"
          />

          {/* System Logs */}
          <AdminCard
            href="/admin/logs"
            icon={<FileText className="h-6 w-6 text-orange-600" />}
            title="System Logs"
            description="Review system logs and audit trails"
          />

          {/* Hardware Management */}
          <AdminCard
            href="/admin/hardware"
            icon={<Cpu className="h-6 w-6 text-red-600" />}
            title="Hardware Management"
            description="Monitor hardware status and performance"
            status="active"
          />

          {/* Database Management */}
          <AdminCard
            href="/admin/database"
            icon={<Database className="h-6 w-6 text-teal-600" />}
            title="Database Management"
            description="Database backup, maintenance, and optimization"
          />

          {/* Storage Management */}
          <AdminCard
            href="/admin/storage"
            icon={<HardDrive className="h-6 w-6 text-cyan-600" />}
            title="Storage Management"
            description="Monitor storage usage and manage media files"
            status="warning"
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Recent Administrative Activity
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                            <Users className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              New user account created: <span className="font-medium text-gray-900 dark:text-white">john.doe@company.com</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                            <time>2 hours ago</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                            <Monitor className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Device registration approved: <span className="font-medium text-gray-900 dark:text-white">Lobby Display 3</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                            <time>4 hours ago</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>             
                  <li>
                    <div className="relative">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                            <AlertTriangle className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              System alert: <span className="font-medium text-gray-900 dark:text-white">High storage usage (78%)</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                            <time>6 hours ago</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}