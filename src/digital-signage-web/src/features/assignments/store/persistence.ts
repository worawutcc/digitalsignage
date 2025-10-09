/**
 * @fileoverview Assignment State Persistence
 * @description LocalStorage integration for persisting assignment draft, filters, and UI state
 */

import type { AssignmentFilter, AssignmentSort } from '../types/assignment.types';
import type {
  AssignmentUIState,
  PersistedAssignmentState,
  PersistenceConfig,
} from '../types/state.types';

// Re-export types for convenience (avoid duplicate definitions)
export type { PersistedAssignmentState, PersistenceConfig };

// ========================================================================
// Constants
// ========================================================================

const STORAGE_KEY_PREFIX = 'digitalSignage_assignments_';

const STORAGE_KEYS = {
  DRAFT: `${STORAGE_KEY_PREFIX}draft`,
  FILTERS: `${STORAGE_KEY_PREFIX}filters`,
  SORT: `${STORAGE_KEY_PREFIX}sort`,
  UI_STATE: `${STORAGE_KEY_PREFIX}uiState`,
  LAST_SAVED: `${STORAGE_KEY_PREFIX}lastSaved`,
} as const;

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// ========================================================================
// Storage Helpers
// ========================================================================

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if persisted data is expired
 */
function isExpired(savedAt: string, maxAge: number): boolean {
  const savedTime = new Date(savedAt).getTime();
  const now = Date.now();
  return now - savedTime > maxAge;
}

// ========================================================================
// Draft Persistence
// ========================================================================

/**
 * Save draft assignment to localStorage
 */
export function saveDraft(draft: Record<string, unknown> | null): void {
  if (!isLocalStorageAvailable()) return;

  try {
    if (draft === null || Object.keys(draft).length === 0) {
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
      return;
    }

    const data = {
      draft,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save draft assignment:', error);
  }
}

/**
 * Load draft assignment from localStorage
 */
export function loadDraft(): Record<string, unknown> | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Check if expired
    if (isExpired(data.savedAt, MAX_AGE_MS)) {
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
      return null;
    }

    return data.draft;
  } catch (error) {
    console.error('Failed to load draft assignment:', error);
    return null;
  }
}

/**
 * Clear draft from localStorage
 */
export function clearDraft(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  } catch (error) {
    console.error('Failed to clear draft assignment:', error);
  }
}

// ========================================================================
// Filters Persistence
// ========================================================================

/**
 * Save filters to localStorage
 */
export function saveFilters(filters: AssignmentFilter): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const data = {
      filters,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save assignment filters:', error);
  }
}

/**
 * Load filters from localStorage
 */
export function loadFilters(): AssignmentFilter | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FILTERS);
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Check if expired
    if (isExpired(data.savedAt, MAX_AGE_MS)) {
      localStorage.removeItem(STORAGE_KEYS.FILTERS);
      return null;
    }

    return data.filters;
  } catch (error) {
    console.error('Failed to load assignment filters:', error);
    return null;
  }
}

/**
 * Clear filters from localStorage
 */
export function clearFilters(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.FILTERS);
  } catch (error) {
    console.error('Failed to clear assignment filters:', error);
  }
}

// ========================================================================
// Sort Persistence
// ========================================================================

/**
 * Save sort configuration to localStorage
 */
export function saveSort(sort: AssignmentSort): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const data = {
      sort,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.SORT, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save assignment sort:', error);
  }
}

/**
 * Load sort configuration from localStorage
 */
export function loadSort(): AssignmentSort | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SORT);
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Check if expired
    if (isExpired(data.savedAt, MAX_AGE_MS)) {
      localStorage.removeItem(STORAGE_KEYS.SORT);
      return null;
    }

    return data.sort;
  } catch (error) {
    console.error('Failed to load assignment sort:', error);
    return null;
  }
}

/**
 * Clear sort configuration from localStorage
 */
export function clearSort(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.SORT);
  } catch (error) {
    console.error('Failed to clear assignment sort:', error);
  }
}

// ========================================================================
// UI State Persistence
// ========================================================================

/**
 * Save UI state to localStorage
 */
export function saveUIState(uiState: Partial<AssignmentUIState>): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const data = {
      uiState,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save assignment UI state:', error);
  }
}

/**
 * Load UI state from localStorage
 */
export function loadUIState(): Partial<AssignmentUIState> | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.UI_STATE);
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Check if expired
    if (isExpired(data.savedAt, MAX_AGE_MS)) {
      localStorage.removeItem(STORAGE_KEYS.UI_STATE);
      return null;
    }

    return data.uiState;
  } catch (error) {
    console.error('Failed to load assignment UI state:', error);
    return null;
  }
}

/**
 * Clear UI state from localStorage
 */
export function clearUIState(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.UI_STATE);
  } catch (error) {
    console.error('Failed to clear assignment UI state:', error);
  }
}

// ========================================================================
// Composite Operations
// ========================================================================

/**
 * Load all persisted state
 */
export function loadPersistedState(): PersistedAssignmentState | null {
  if (!isLocalStorageAvailable()) return null;

  const draft = loadDraft();
  const filters = loadFilters();
  const sort = loadSort();
  const ui = loadUIState();
  const savedTimestamp = getLastSavedTimestamp();

  // Return null if nothing is persisted
  if (!draft && !filters && !sort && !ui) {
    return null;
  }

  // Parse savedAt timestamp
  const savedAt = savedTimestamp ? new Date(savedTimestamp).getTime() : Date.now();

  // Check if data is stale
  if (Date.now() - savedAt > MAX_AGE_MS) {
    clearPersistedState();
    return null;
  }

  const result: PersistedAssignmentState = {
    draftAssignment: draft || null,
    filters: filters || {},
    sort: sort || { field: 'createdAt', direction: 'desc' },
    ui: {
      viewMode: ui?.viewMode || 'list',
      showExpired: ui?.showExpired ?? false,
    },
    savedAt,
  };

  return result;
}

/**
 * Save all persisted state
 */
export function savePersistedState(state: Partial<PersistedAssignmentState>): void {
  if (!isLocalStorageAvailable()) return;

  if (state.draftAssignment !== undefined) {
    saveDraft(state.draftAssignment);
  }

  if (state.filters !== undefined) {
    saveFilters(state.filters);
  }

  if (state.sort !== undefined) {
    saveSort(state.sort);
  }

  if (state.ui !== undefined) {
    saveUIState(state.ui);
  }

  // Update last saved timestamp
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
  } catch (error) {
    console.error('Failed to update last saved timestamp:', error);
  }
}

/**
 * Clear all persisted state
 */
export function clearPersistedState(): void {
  if (!isLocalStorageAvailable()) return;

  clearDraft();
  clearFilters();
  clearSort();
  clearUIState();

  try {
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED);
  } catch (error) {
    console.error('Failed to clear last saved timestamp:', error);
  }
}

/**
 * Get last saved timestamp
 */
export function getLastSavedTimestamp(): string | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
  } catch (error) {
    console.error('Failed to get last saved timestamp:', error);
    return null;
  }
}

// ========================================================================
// Redux Middleware Helper
// ========================================================================

/**
 * Create middleware for auto-persisting assignment state
 * Usage: Add to Redux store middleware array
 */
export function createPersistenceMiddleware() {
  return (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    // Auto-persist on specific actions
    const actionType = action.type as string;

    if (actionType.startsWith('assignments/')) {
      const state = store.getState().assignments;

      // Persist draft on draft updates
      if (actionType.includes('Draft')) {
        saveDraft(state.draftAssignment);
      }

      // Persist filters on filter updates
      if (actionType.includes('Filter') || actionType.includes('setSearchQuery')) {
        saveFilters(state.filters);
      }

      // Persist sort on sort updates
      if (actionType.includes('Sort')) {
        saveSort(state.sort);
      }

      // Persist UI state on UI updates
      if (
        actionType.includes('Drawer') ||
        actionType.includes('Panel') ||
        actionType.includes('ViewMode') ||
        actionType.includes('ShowExpired') ||
        actionType.includes('Emergency')
      ) {
        saveUIState(state.ui);
      }
    }

    return result;
  };
}
