'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  BarChart3,
  Monitor,
  FileText,
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  LogOut,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, description: 'Overview and analytics' },
  { name: 'Devices', href: '/devices', icon: Monitor, description: 'Manage digital displays' },
  { name: 'Content', href: '/content', icon: FileText, description: 'Media library' },
  { name: 'Schedules', href: '/schedules', icon: Calendar, description: 'Content scheduling' },
  { name: 'Users', href: '/users', icon: Users, description: 'User management' },
  { name: 'Settings', href: '/settings', icon: Settings, description: 'System configuration' },
]

export interface SidebarProps {
  className?: string
}

/**
 * Sidebar navigation component with collapsible functionality
 * 
 * @param className - Additional CSS classes
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-gray-900 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center px-4">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="font-semibold text-white">SignageHub</h1>
              <p className="text-sm text-gray-400">Admin Portal</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'ml-auto text-gray-400 hover:text-white',
            isCollapsed && 'mx-auto'
          )}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        {!isCollapsed && (
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Navigation
          </p>
        )}
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                    isCollapsed && 'justify-center'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      !isCollapsed && 'mr-3',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    )}
                  />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
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