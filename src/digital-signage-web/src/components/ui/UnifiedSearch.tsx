import { useState, useEffect, useRef } from 'react'
import { Search, FileImage, Calendar, X, Monitor, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import Image from 'next/image'
import { dashboardService } from '@/services'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchResultItem, UnifiedSearchProps } from './UnifiedSearch.types'

/**
 * Unified search component for all system entities
 * Provides quick access across media, schedules, and devices
 */
export function UnifiedSearch({ className = '' }: UnifiedSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Handle search with API integration and fallback
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsOpen(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Try API integration first
      // TODO: Implement search functionality
      const searchResult = {
        media: [],
        schedules: [],
        devices: [],
        tags: []
      }

      // Transform API results to component format
      const transformedResults: SearchResultItem[] = [
        ...searchResult.media.map((item: any) => ({
          id: item.id.toString(),
          title: item.name,
          type: 'media' as const,
          path: `/media?id=${item.id}`,
          ...(item.thumbnailUrl && { thumbnail: item.thumbnailUrl }),
          lastModified: new Date().toISOString().split('T')[0],
          description: `${item.mediaType}`,
          relevanceScore: item.relevanceScore
        })),
                ...searchResult.schedules.map((item: any) => ({
          id: item.id.toString(),
          title: item.name,
          type: 'schedule' as const,
          path: `/schedules?id=${item.id}`,
          lastModified: item.startDate ? item.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
          description: item.description || `${item.deviceCount} devices`,
          relevanceScore: item.relevanceScore
        })),
        ...searchResult.devices.map((item: any) => ({
          id: item.id.toString(),
          title: item.name,
          type: 'device' as const,
          path: `/devices?id=${item.id}`,
          lastModified: item.lastHeartbeat ? item.lastHeartbeat.split('T')[0] : new Date().toISOString().split('T')[0],
          description: `${item.location || 'Unknown location'} - ${item.status}`,
          relevanceScore: item.relevanceScore
        })),
        ...searchResult.tags.map((item: any) => ({
          id: item.id.toString(),
          title: item.name,
          type: 'tag' as const,
          path: `/tags?tag=${item.name}`,
          lastModified: new Date().toISOString().split('T')[0],
          description: `${item.usageCount} items`,
          relevanceScore: item.relevanceScore
        }))
      ]

      // Sort by relevance score
      transformedResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

      setResults(transformedResults)
      setIsOpen(true)
    } catch (err) {
      console.error('API Search failed, falling back to mock data:', err)
      
      // Fallback to mock data when API is unavailable
      const mockResults: SearchResultItem[] = [
        {
          id: '1',
          title: 'Company Logo',
          type: 'media',
          path: '/media?id=1',
          thumbnail: '/api/placeholder/media/1/thumbnail',
          lastModified: '2025-01-07',
          description: 'Image • logo, branding'
        },
        {
          id: '2',
          title: 'Morning Schedule',
          type: 'schedule',
          path: '/schedules?id=2',
          lastModified: '2025-01-06',
          description: '3 devices'
        },
        {
          id: '3',
          title: 'Promotional Video',
          type: 'media',
          path: '/media?id=3',
          thumbnail: '/api/placeholder/media/3/thumbnail',
          lastModified: '2025-01-05',
          description: 'Video • promotion, marketing'
        },
        {
          id: '4',
          title: 'Lobby Display Device',
          type: 'device',
          path: '/devices?id=4',
          lastModified: '2025-01-07',
          description: 'Main Lobby • Online'
        },
        {
          id: '5',
          title: 'Marketing',
          type: 'tag',
          path: '/media?tag=5',
          lastModified: '2025-01-06',
          description: '15 media files'
        }
      ]

      const filtered = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (result.description && result.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      
      setResults(filtered)
      setIsOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Effect for debounced search
  useEffect(() => {
    handleSearch(debouncedQuery)
  }, [debouncedQuery])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'media':
        return <FileImage className="h-4 w-4" />
      case 'schedule':
        return <Calendar className="h-4 w-4" />
      case 'device':
        return <Monitor className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search media, schedules, or devices..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
              setError(null)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {error && (
            <div className="p-4 text-center text-red-500 text-sm">
              {error}
            </div>
          )}
          
          {!error && results.length === 0 && !isLoading && query.trim() && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No results found for "{query}"
            </div>
          )}

          {!error && results.length > 0 && (
            <div className="py-2">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.path}
                  className="block px-4 py-3 hover:bg-muted/50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {result.thumbnail ? (
                        <Image
                          src={result.thumbnail}
                          alt={result.title}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded bg-muted flex items-center justify-center ${
                          result.type === 'media'
                            ? 'text-blue-500'
                            : result.type === 'schedule'
                            ? 'text-green-500'
                            : result.type === 'device'
                            ? 'text-purple-500'
                            : 'text-orange-500'
                        }`}>
                          {getResultIcon(result.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {result.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.description || `${result.type}`} • {result.lastModified || 'N/A'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!error && results.length > 0 && (
            <div className="border-t p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground text-center">
                Showing {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}