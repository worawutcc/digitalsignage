'use client'

import { Menu, X, Home, Monitor, Image, Users, Settings, LogOut, Calendar, FileText, PlayCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
// import { useAppStore } from '@/stores' // TODO: Replace with Redux Toolkit
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LucideIcon } from 'lucide-react'

type NavigationItem = {
  name: string
  href: string
  icon: LucideIcon
}

type NavigationSection = {
  name: string
  href?: string
  icon?: LucideIcon
  items?: NavigationItem[]
}

const navigation: NavigationSection[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { 
    name: 'Device Management', 
    items: [
      { name: 'Devices', href: '/devices', icon: Monitor },
      { name: 'Displays', href: '/displays', icon: PlayCircle },
    ]
  },
  { 
    name: 'Content & Scheduling', 
    items: [
      { name: 'Media Library', href: '/content', icon: Image },
      { name: 'Schedule Builder', href: '/schedule', icon: Clock },
      { name: 'Schedule Manager', href: '/schedules', icon: Calendar },
    ]
  },
  {
    name: 'Administration',
    items: [
      { name: 'User Management', href: '/users', icon: Users },
      { name: 'System Settings', href: '/settings', icon: Settings },
    ]
  }
]

export function Sidebar() {
  // TODO: Replace with Redux Toolkit store
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <h1 className="text-xl font-semibold">Digital Signage</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-4">
          {navigation.map((section) => {
            // Handle dashboard as single item
            if (section.name === 'Dashboard') {
              const isActive = pathname === '/dashboard'
              return (
                <Link
                  key={section.name}
                  href="/dashboard"
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Home className="mr-3 h-5 w-5" />
                  Dashboard
                </Link>
              )
            }

            // Handle sections with items
            return (
              <div key={section.name} className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.name}
                </h3>
                <div className="space-y-1">
                  {section.items?.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground"
            onClick={async () => {
              const { clearTokens } = await import('@/lib/auth')
              const { store } = await import('@/store')
              
              // Clear all tokens and storage
              clearTokens()
              
              // Clear Redux state by dispatching logout action
              const { authActions } = await import('@/store/slices/authSlice')
              store.dispatch(authActions.logout())
              
              // Clear React Query cache if available
              if (typeof window !== 'undefined' && (window as any).queryClient) {
                (window as any).queryClient.clear()
              }
              
              // Clear any additional localStorage/sessionStorage data
              if (typeof window !== 'undefined') {
                // Clear all localStorage keys that start with our app prefix
                const keysToRemove: string[] = []
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i)
                  if (key && (key.startsWith('digital-signage') || key.startsWith('ds_') || key.includes('auth'))) {
                    keysToRemove.push(key)
                  }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key))
                
                // Clear sessionStorage
                const sessionKeysToRemove: string[] = []
                for (let i = 0; i < sessionStorage.length; i++) {
                  const key = sessionStorage.key(i)
                  if (key && (key.startsWith('digital-signage') || key.startsWith('ds_') || key.includes('auth'))) {
                    sessionKeysToRemove.push(key)
                  }
                }
                sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))
              }
              
              // Force page reload to clear any remaining state and redirect to login
              window.location.href = '/login'
            }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}

export function Header() {
  // TODO: Replace with Redux Toolkit store
  const setSidebarOpen = (_open: boolean) => {}

  return (
    <header className="bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Welcome back, Admin</span>
        </div>
      </div>
    </header>
  )
}