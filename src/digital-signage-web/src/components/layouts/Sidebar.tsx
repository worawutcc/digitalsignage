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
        'flex h-full flex-col bg-gray-900 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-16 items-center px-4">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-white">Digital Signage</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto text-gray-400 hover:text-white"
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
                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                  title={isCollapsed ? item.description : undefined}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
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

      <div className="border-t border-gray-800 p-4">
        {!isCollapsed ? (
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
              <span className="text-sm font-medium text-gray-300">A</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">admin@example.com</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
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
            className="mx-auto text-gray-400 hover:text-white"
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
