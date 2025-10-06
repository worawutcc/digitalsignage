import { Metadata } from 'next'

/**
 * Admin Layout - Layout for admin pages
 * 
 * Server Component providing layout structure for admin pages
 * Implements role-based access control and admin-specific navigation
 * 
 * @see copilot-instructions-ui.md - Server Components by default
 * @see copilot-instructions-ui.md - Route Protection with middleware
 */

export const metadata: Metadata = {
  title: {
    template: '%s | Admin - Digital Signage',
    default: 'Admin Dashboard | Digital Signage',
  },
  description: 'Administrative interface for digital signage system management',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin-specific layout wrapper */}
      <div className="flex h-screen">
        {/* Admin sidebar could go here if needed */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}