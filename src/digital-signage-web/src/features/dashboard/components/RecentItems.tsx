import { useState, useEffect } from 'react'
import { Clock, FileImage, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { RecentItem, RecentItemsProps } from '../types'

/**
 * Recent items widget showing recently accessed media and schedules
 */
export function RecentItems({ className = '', maxItems = 5 }: RecentItemsProps) {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])

  // Mock recent items - in real app, this would be stored in localStorage or API
  useEffect(() => {
    const mockRecentItems: RecentItem[] = [
      {
        id: '1',
        title: 'Company Logo.png',
        type: 'media',
        path: '/media/1',
        accessedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: '2',
        title: 'Q1 Marketing Campaign',
        type: 'schedule',
        path: '/schedules/2',
        accessedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: '3',
        title: 'Holiday Video.mp4',
        type: 'media',
        path: '/media/3',
        accessedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      },
      {
        id: '4',
        title: 'Store Promotions',
        type: 'schedule',
        path: '/schedules/4',
        accessedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      },
      {
        id: '5',
        title: 'Product Showcase.png',
        type: 'media',
        path: '/media/5',
        accessedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      }
    ]

    setRecentItems(mockRecentItems.slice(0, maxItems))
  }, [maxItems])

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'media':
        return <FileImage className="w-4 h-4" />
      case 'schedule':
        return <Calendar className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatAccessTime = (accessedAt: string) => {
    const date = new Date(accessedAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return `${diffDays}d ago`
    }
  }

  if (recentItems.length === 0) {
    return (
      <div className={`p-4 rounded-lg border bg-card ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium">Recent Items</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          No recent items to display
        </p>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg border bg-card ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-medium">Recent Items</h3>
      </div>
      
      <div className="space-y-2">
        {recentItems.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group"
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {getItemIcon(item.type)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-primary">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatAccessTime(item.accessedAt)}
              </p>
            </div>
            
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
      
      {recentItems.length >= maxItems && (
        <div className="mt-3 pt-3 border-t">
          <Link
            href="/recent"
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            View all recent items →
          </Link>
        </div>
      )}
    </div>
  )
}