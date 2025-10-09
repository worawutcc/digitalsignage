'use client'

/**
 * RefreshButton Component
 * 
 * Client Component for refresh functionality.
 * Separated to keep parent page as Server Component.
 * 
 * @see copilot-instructions-ui.md - Client Component Pattern
 */

interface RefreshButtonProps {
  className?: string
}

export function RefreshButton({ className }: RefreshButtonProps) {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <button 
      type="button"
      className={className}
      onClick={handleRefresh}
    >
      Refresh
    </button>
  )
}
