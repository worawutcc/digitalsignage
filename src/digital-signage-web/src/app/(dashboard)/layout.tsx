import { Sidebar } from '@/components/layouts/Sidebar'
import { AuthWrapper } from '@/components/auth/AuthWrapper'

/**
 * Dashboard Layout - Shared layout for all authenticated pages
 * 
 * This layout provides:
 * - Sidebar navigation
 * - Authentication wrapper
 * - Consistent layout structure
 * 
 * Applied to all routes in (dashboard) group except login/register/public pages
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </AuthWrapper>
  )
}
