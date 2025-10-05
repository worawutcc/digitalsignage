'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { 
  BarChart3,
  Monitor,
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  LogOut,
  Menu,
  Image,
  Play,
  TrendingUp,
  QrCode,
  FileBarChart,
  MonitorSpeaker
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, description: 'Overview and analytics' },
  { name: 'Devices', href: '/devices', icon: Monitor, description: 'Device management & monitoring' },
  { name: 'Device Groups', href: '/device-groups', icon: MonitorSpeaker, description: 'Device group management' },
  { 
    name: 'Media', 
    href: '/media', 
    icon: Image, 
    description: 'Media library & content management',
    subItems: [
      { name: 'Media Library', href: '/media' },
      { name: 'Tags Management', href: '/media/tags' }
    ]
  },
  { name: 'Playlists', href: '/playlists', icon: Play, description: 'Content playlists' },
  { 
    name: 'Schedules', 
    href: '/schedules', 
    icon: Calendar, 
    description: 'Schedule management',
    subItems: [
      { name: 'Schedule Management', href: '/schedules' },
      { name: 'Templates', href: '/schedules/templates' }
    ]
  },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, description: 'Performance analytics' },
  { name: 'QR Codes', href: '/qr-codes', icon: QrCode, description: 'QR code management' },
  { name: 'Reports', href: '/reports', icon: FileBarChart, description: 'Reports & exports' },
  { name: 'Users', href: '/users', icon: Users, description: 'User management' },
  { name: 'Settings', href: '/settings', icon: Settings, description: 'System configuration' },
]

export interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    sessionStorage.clear()
    router.push('/login')
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-slate-50 border-r border-slate-200 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-16 items-center px-4 border-b border-slate-200">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-slate-800">Digital Signage</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                  title={isCollapsed ? item.description : undefined}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-4 bg-white">
        {!isCollapsed ? (
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <span className="text-sm font-medium text-blue-700">A</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-slate-800">Admin User</p>
              <p className="text-xs text-slate-500">admin@example.com</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="mx-auto text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default Sidebar
