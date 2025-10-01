import Sidebar from './Sidebar'
import { cn } from '@/lib/utils'

export interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  showSidebar?: boolean
}

/**
 * Admin Layout Component - Main layout wrapper for admin pages
 * Provides consistent layout with sidebar navigation, header, and main content area
 * 
 * @param children - Main content to render
 * @param className - Additional CSS classes for the layout
 * @param header - Optional header content
 * @param showSidebar - Whether to show the sidebar (default: true)
 */
export default function AdminLayout({ 
  children, 
  className,
  header,
  showSidebar = true 
}: AdminLayoutProps) {
  return (
    <div className={cn('flex h-screen bg-gray-50', className)}>
      {showSidebar && <Sidebar />}
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        {header && (
          <header className="border-b bg-white px-6 py-4 shadow-sm">
            {header}
          </header>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}