export interface SearchResultItem {
  id: string
  title: string
  type: 'media' | 'schedule' | 'device' | 'tag'
  path: string
  thumbnail?: string | undefined
  lastModified: string | undefined
  description?: string | undefined
  relevanceScore?: number | undefined
}

export interface UnifiedSearchProps {
  className?: string
  placeholder?: string
  maxResults?: number
}