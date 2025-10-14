'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { PlaylistCard } from './PlaylistCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Playlist } from '@/types/playlist';
import { cn } from '@/lib/utils';

interface PlaylistGridProps {
  playlists: Playlist[];
  isLoading?: boolean;
  error?: Error | null;
  selectedIds?: Set<number>;
  onSelect?: (id: number, selected: boolean) => void;
  onView?: (playlist: Playlist) => void;
  onEdit?: (playlist: Playlist) => void;
  className?: string;
  enableSelection?: boolean;
  enableVirtualization?: boolean;
  itemsPerRow?: number;
  minItemWidth?: number;
}

interface GridItemProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    playlists: Playlist[];
    itemsPerRow: number;
    selectedIds?: Set<number>;
    onSelect?: (id: number, selected: boolean) => void;
    onView?: (playlist: Playlist) => void;
    onEdit?: (playlist: Playlist) => void;
  };
}

const GridItem: React.FC<GridItemProps> = ({ columnIndex, rowIndex, style, data }) => {
  const { playlists, itemsPerRow, selectedIds, onSelect, onView, onEdit } = data;
  const index = rowIndex * itemsPerRow + columnIndex;
  const playlist = playlists[index];

  if (!playlist) {
    return <div style={style} />;
  }

  return (
    <div style={{ ...style, padding: '8px' }}>
      <PlaylistCard
        playlist={playlist}
        isSelected={selectedIds?.has(playlist.id) || false}
        {...(onSelect && { onSelect })}
        {...(onView && { onView })}
        {...(onEdit && { onEdit })}
        className="h-full"
      />
    </div>
  );
};

const PlaylistSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

export function PlaylistGrid({
  playlists,
  isLoading = false,
  error = null,
  selectedIds,
  onSelect,
  onView,
  onEdit,
  className,
  enableSelection = false,
  enableVirtualization = false,
  itemsPerRow,
  minItemWidth = 320,
}: PlaylistGridProps) {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Calculate items per row based on container width
  const calculatedItemsPerRow = useMemo(() => {
    if (itemsPerRow) return itemsPerRow;
    if (containerSize.width === 0) return 1;
    
    const availableWidth = containerSize.width - 32; // Account for padding
    const itemWidth = minItemWidth + 16; // Card width + gap
    return Math.max(1, Math.floor(availableWidth / itemWidth));
  }, [containerSize.width, itemsPerRow, minItemWidth]);

  // Calculate grid dimensions
  const gridData = useMemo(() => {
    const rows = Math.ceil(playlists.length / calculatedItemsPerRow);
    const itemHeight = 400; // Approximate card height
    
    return {
      rows,
      itemHeight,
      totalHeight: rows * itemHeight,
    };
  }, [playlists.length, calculatedItemsPerRow]);

  // Handle container resize
  const handleContainerResize = useCallback(() => {
    if (containerRef) {
      const rect = containerRef.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, [containerRef]);

  // Set up resize observer
  React.useEffect(() => {
    if (!containerRef) return;

    const resizeObserver = new ResizeObserver(handleContainerResize);
    resizeObserver.observe(containerRef);
    handleContainerResize(); // Initial measurement

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, handleContainerResize]);

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load playlists: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('grid gap-4', className)} style={{
        gridTemplateColumns: `repeat(${calculatedItemsPerRow}, minmax(${minItemWidth}px, 1fr))`
      }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <PlaylistSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <div className="rounded-full bg-gray-100 p-6 mb-4">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No playlists found</h3>
        <p className="text-gray-600 max-w-md">
          There are no playlists matching your current filters. 
          Try adjusting your search or create a new playlist.
        </p>
      </div>
    );
  }

  // Virtualized grid for large datasets
  if (enableVirtualization && playlists.length > 50) {
    return (
      <div 
        ref={setContainerRef}
        className={cn('h-full w-full', className)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              isSelected={selectedIds?.has(playlist.id) || false}
              {...(onSelect && { onSelect })}
              {...(onView && { onView })}
              {...(onEdit && { onEdit })}
            />
          ))}
        </div>
      </div>
    );
  }

  // Regular CSS Grid for smaller datasets
  return (
    <div 
      ref={setContainerRef}
      className={cn('grid gap-4 auto-rows-fr', className)}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`
      }}
    >
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          isSelected={selectedIds?.has(playlist.id) || false}
          {...(enableSelection && onSelect && { onSelect })}
          {...(onView && { onView })}
          {...(onEdit && { onEdit })}
        />
      ))}
    </div>
  );
}