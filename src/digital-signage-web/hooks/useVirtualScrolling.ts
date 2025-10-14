'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Virtual scrolling hook for efficient rendering of large datasets
 * Follows UI copilot patterns for performance optimization and TypeScript strict mode
 */

export interface VirtualScrollingOptions {
  /** Total number of items in the dataset */
  totalItems: number;
  /** Height of each item in pixels */
  itemHeight: number;
  /** Number of items to render outside visible area for smooth scrolling */
  overscan?: number;
  /** Container height in pixels */
  containerHeight: number;
  /** Enable horizontal scrolling */
  horizontal?: boolean;
  /** Scroll buffer for touch devices */
  scrollBuffer?: number;
}

export interface VirtualScrollingResult {
  /** Array of visible item indices to render */
  visibleItems: number[];
  /** Start index of visible range */
  startIndex: number;
  /** End index of visible range */
  endIndex: number;
  /** Total height/width of virtual content */
  totalSize: number;
  /** Offset for visible content positioning */
  offsetBefore: number;
  /** Offset after visible content */
  offsetAfter: number;
  /** Scroll container ref */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Scroll to specific index */
  scrollToIndex: (index: number) => void;
  /** Scroll to top/left */
  scrollToTop: () => void;
  /** Current scroll position */
  scrollPosition: number;
  /** Whether scrolling is in progress */
  isScrolling: boolean;
}

/**
 * Hook for implementing virtual scrolling with large datasets
 */
export function useVirtualScrolling(options: VirtualScrollingOptions): VirtualScrollingResult {
  const {
    totalItems,
    itemHeight,
    overscan = 5,
    containerHeight,
    horizontal = false,
    scrollBuffer = 50
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate visible range based on scroll position
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollPosition / itemHeight);
    const visibleEnd = Math.min(
      totalItems - 1,
      Math.ceil((scrollPosition + containerHeight) / itemHeight)
    );

    // Apply overscan
    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(totalItems - 1, visibleEnd + overscan);

    return { startIndex, endIndex };
  }, [scrollPosition, itemHeight, containerHeight, totalItems, overscan]);

  // Generate visible items array
  const visibleItems = useMemo(() => {
    const items: number[] = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      items.push(i);
    }
    return items;
  }, [visibleRange.startIndex, visibleRange.endIndex]);

  // Calculate sizing and offsets
  const totalSize = totalItems * itemHeight;
  const offsetBefore = visibleRange.startIndex * itemHeight;
  const offsetAfter = (totalItems - visibleRange.endIndex - 1) * itemHeight;

  // Scroll event handler with throttling
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const newScrollPosition = horizontal ? container.scrollLeft : container.scrollTop;
    setScrollPosition(newScrollPosition);

    // Handle scrolling state with timeout
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [horizontal]);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const targetPosition = Math.max(0, Math.min(
      index * itemHeight,
      totalSize - containerHeight
    ));

    if (horizontal) {
      container.scrollLeft = targetPosition;
    } else {
      container.scrollTop = targetPosition;
    }
  }, [itemHeight, totalSize, containerHeight, horizontal]);

  // Scroll to top/left
  const scrollToTop = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (horizontal) {
      container.scrollLeft = 0;
    } else {
      container.scrollTop = 0;
    }
  }, [horizontal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    visibleItems,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    totalSize,
    offsetBefore,
    offsetAfter,
    containerRef,
    scrollToIndex,
    scrollToTop,
    scrollPosition,
    isScrolling
  };
}

/**
 * Hook for virtual grid scrolling (2D virtualization)
 */
export interface VirtualGridOptions {
  /** Total number of rows */
  totalRows: number;
  /** Total number of columns */
  totalColumns: number;
  /** Height of each row in pixels */
  rowHeight: number;
  /** Width of each column in pixels */
  columnWidth: number;
  /** Container width in pixels */
  containerWidth: number;
  /** Container height in pixels */
  containerHeight: number;
  /** Overscan for rows and columns */
  overscan?: { rows: number; columns: number };
}

export interface VirtualGridResult {
  /** Visible row indices */
  visibleRows: number[];
  /** Visible column indices */
  visibleColumns: number[];
  /** Grid dimensions and offsets */
  grid: {
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
    offsetTop: number;
    offsetLeft: number;
    offsetBottom: number;
    offsetRight: number;
    totalHeight: number;
    totalWidth: number;
  };
  /** Container ref for grid */
  gridRef: React.RefObject<HTMLDivElement | null>;
  /** Scroll to specific cell */
  scrollToCell: (row: number, column: number) => void;
  /** Current scroll position */
  scrollPosition: { top: number; left: number };
}

/**
 * Hook for 2D virtual scrolling (grid virtualization)
 */
export function useVirtualGrid(options: VirtualGridOptions): VirtualGridResult {
  const {
    totalRows,
    totalColumns,
    rowHeight,
    columnWidth,
    containerWidth,
    containerHeight,
    overscan = { rows: 3, columns: 3 }
  } = options;

  const gridRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });

  // Calculate visible ranges
  const visibleRange = useMemo(() => {
    const visibleStartRow = Math.floor(scrollPosition.top / rowHeight);
    const visibleEndRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollPosition.top + containerHeight) / rowHeight)
    );

    const visibleStartColumn = Math.floor(scrollPosition.left / columnWidth);
    const visibleEndColumn = Math.min(
      totalColumns - 1,
      Math.ceil((scrollPosition.left + containerWidth) / columnWidth)
    );

    // Apply overscan
    const startRow = Math.max(0, visibleStartRow - overscan.rows);
    const endRow = Math.min(totalRows - 1, visibleEndRow + overscan.rows);
    const startColumn = Math.max(0, visibleStartColumn - overscan.columns);
    const endColumn = Math.min(totalColumns - 1, visibleEndColumn + overscan.columns);

    return { startRow, endRow, startColumn, endColumn };
  }, [
    scrollPosition,
    rowHeight,
    columnWidth,
    containerHeight,
    containerWidth,
    totalRows,
    totalColumns,
    overscan
  ]);

  // Generate visible items
  const visibleRows = useMemo(() => {
    const rows: number[] = [];
    for (let i = visibleRange.startRow; i <= visibleRange.endRow; i++) {
      rows.push(i);
    }
    return rows;
  }, [visibleRange.startRow, visibleRange.endRow]);

  const visibleColumns = useMemo(() => {
    const columns: number[] = [];
    for (let i = visibleRange.startColumn; i <= visibleRange.endColumn; i++) {
      columns.push(i);
    }
    return columns;
  }, [visibleRange.startColumn, visibleRange.endColumn]);

  // Calculate grid properties
  const grid = useMemo(() => ({
    startRow: visibleRange.startRow,
    endRow: visibleRange.endRow,
    startColumn: visibleRange.startColumn,
    endColumn: visibleRange.endColumn,
    offsetTop: visibleRange.startRow * rowHeight,
    offsetLeft: visibleRange.startColumn * columnWidth,
    offsetBottom: (totalRows - visibleRange.endRow - 1) * rowHeight,
    offsetRight: (totalColumns - visibleRange.endColumn - 1) * columnWidth,
    totalHeight: totalRows * rowHeight,
    totalWidth: totalColumns * columnWidth
  }), [
    visibleRange,
    rowHeight,
    columnWidth,
    totalRows,
    totalColumns
  ]);

  // Scroll event handler
  const handleScroll = useCallback(() => {
    const container = gridRef.current;
    if (!container) return;

    setScrollPosition({
      top: container.scrollTop,
      left: container.scrollLeft
    });
  }, []);

  // Set up scroll listener
  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to specific cell
  const scrollToCell = useCallback((row: number, column: number) => {
    const container = gridRef.current;
    if (!container) return;

    const targetTop = Math.max(0, Math.min(
      row * rowHeight,
      grid.totalHeight - containerHeight
    ));
    
    const targetLeft = Math.max(0, Math.min(
      column * columnWidth,
      grid.totalWidth - containerWidth
    ));

    container.scrollTop = targetTop;
    container.scrollLeft = targetLeft;
  }, [rowHeight, columnWidth, grid.totalHeight, grid.totalWidth, containerHeight, containerWidth]);

  return {
    visibleRows,
    visibleColumns,
    grid,
    gridRef,
    scrollToCell,
    scrollPosition
  };
}

/**
 * Performance optimization utilities for virtual scrolling
 */
export const VirtualScrollingUtils = {
  /**
   * Calculate optimal item height based on content
   */
  calculateItemHeight: (sampleContent: string, fontSize: number = 14): number => {
    const baseHeight = fontSize * 1.5; // Line height multiplier
    const contentLines = sampleContent.split('\n').length;
    return Math.max(baseHeight * contentLines, 40); // Minimum 40px
  },

  /**
   * Estimate container dimensions for responsive design
   */
  getResponsiveContainerHeight: (windowHeight: number, headerHeight: number = 64): number => {
    return Math.max(windowHeight - headerHeight - 100, 400); // Minimum 400px
  },

  /**
   * Debounced scroll handler for performance
   */
  createDebouncedScrollHandler: (callback: () => void, delay: number = 16): () => void => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  }
};