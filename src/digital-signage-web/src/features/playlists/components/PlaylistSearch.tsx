'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/Badge';
import { 
  Search, 
  X, 
  Clock,
  TrendingUp,
  Hash,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchSuggestion {
  id: string;
  type: 'playlist' | 'tag' | 'user' | 'recent';
  label: string;
  description?: string;
  metadata?: string;
}

interface PlaylistSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  popularTags?: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showSuggestions?: boolean;
  debounceMs?: number;
}

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = 'playlist-search-recent';

export function PlaylistSearch({
  value,
  onChange,
  onSuggestionSelect,
  suggestions = [],
  recentSearches = [],
  popularTags = [],
  placeholder = 'Search playlists...',
  className,
  disabled = false,
  showSuggestions = true,
  debounceMs = 300,
}: PlaylistSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalRecentSearches, setInternalRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedValue = useDebounce(value, debounceMs);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setInternalRecentSearches(JSON.parse(stored));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim() || typeof window === 'undefined') return;

    const updatedRecent = [
      searchTerm,
      ...internalRecentSearches.filter(term => term !== searchTerm)
    ].slice(0, MAX_RECENT_SEARCHES);

    setInternalRecentSearches(updatedRecent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecent));
  }, [internalRecentSearches]);

  // Handle search submission
  const handleSubmit = useCallback((searchValue: string) => {
    if (searchValue.trim()) {
      saveRecentSearch(searchValue.trim());
      setIsOpen(false);
    }
  }, [saveRecentSearch]);

  // Handle input changes
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(newValue);
    
    if (showSuggestions && newValue.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [onChange, showSuggestions]);

  // Handle key press
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(value);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, [value, handleSubmit]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    onChange(suggestion.label);
    handleSubmit(suggestion.label);
    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
  }, [onChange, handleSubmit, onSuggestionSelect]);

  // Clear search
  const handleClear = useCallback(() => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, [onChange]);

  // Remove recent search
  const removeRecentSearch = useCallback((searchTerm: string) => {
    const updated = internalRecentSearches.filter(term => term !== searchTerm);
    setInternalRecentSearches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [internalRecentSearches]);

  // Build combined suggestions
  const allSuggestions = React.useMemo(() => {
    const combined: SearchSuggestion[] = [];
    
    // Add API suggestions first
    combined.push(...suggestions);

    // Add recent searches if no search value
    if (!value.trim() && internalRecentSearches.length > 0) {
      combined.push(...internalRecentSearches.map(term => ({
        id: `recent-${term}`,
        type: 'recent' as const,
        label: term,
        description: 'Recent search',
      })));
    }

    // Add popular tags if no search value or matching tags
    if (popularTags.length > 0) {
      const matchingTags = value.trim() 
        ? popularTags.filter(tag => 
            tag.toLowerCase().includes(value.toLowerCase())
          )
        : popularTags.slice(0, 3);
      
      combined.push(...matchingTags.map(tag => ({
        id: `tag-${tag}`,
        type: 'tag' as const,
        label: tag,
        description: 'Popular tag',
      })));
    }

    return combined;
  }, [suggestions, value, internalRecentSearches, popularTags]);

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'tag':
        return <Hash className="h-4 w-4 text-gray-400" />;
      case 'user':
        return <User className="h-4 w-4 text-gray-400" />;
      case 'playlist':
        return <TrendingUp className="h-4 w-4 text-gray-400" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen && showSuggestions} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              onFocus={() => showSuggestions && setIsOpen(true)}
              disabled={disabled}
              className="pl-10 pr-10"
            />
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0" 
          align="start"
          side="bottom"
        >
          <Command>
            <CommandList>
              {allSuggestions.length === 0 ? (
                <CommandEmpty>
                  {value.trim() ? 'No suggestions found' : 'Start typing to search...'}
                </CommandEmpty>
              ) : (
                <>
                  {/* Recent Searches */}
                  {internalRecentSearches.length > 0 && !value.trim() && (
                    <CommandGroup heading="Recent Searches">
                      {internalRecentSearches.map((term) => (
                        <CommandItem
                          key={`recent-${term}`}
                          value={term}
                          onSelect={() => handleSuggestionSelect({
                            id: `recent-${term}`,
                            type: 'recent',
                            label: term,
                          })}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{term}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(term);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* API Suggestions */}
                  {suggestions.length > 0 && (
                    <CommandGroup heading="Suggestions">
                      {suggestions.map((suggestion) => (
                        <CommandItem
                          key={suggestion.id}
                          value={suggestion.label}
                          onSelect={() => handleSuggestionSelect(suggestion)}
                          className="flex items-center gap-2"
                        >
                          {getSuggestionIcon(suggestion.type)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{suggestion.label}</div>
                            {suggestion.description && (
                              <div className="text-xs text-gray-500 truncate">
                                {suggestion.description}
                              </div>
                            )}
                          </div>
                          {suggestion.metadata && (
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.metadata}
                            </Badge>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Popular Tags */}
                  {popularTags.length > 0 && (
                    <CommandGroup heading="Popular Tags">
                      {popularTags
                        .filter(tag => 
                          !value.trim() || tag.toLowerCase().includes(value.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((tag) => (
                          <CommandItem
                            key={`tag-${tag}`}
                            value={tag}
                            onSelect={() => handleSuggestionSelect({
                              id: `tag-${tag}`,
                              type: 'tag',
                              label: tag,
                            })}
                            className="flex items-center gap-2"
                          >
                            <Hash className="h-4 w-4 text-gray-400" />
                            <span>{tag}</span>
                          </CommandItem>
                        ))
                      }
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}