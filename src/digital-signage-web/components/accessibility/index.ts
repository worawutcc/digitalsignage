// Accessibility Components Export
export { default as AccessibilitySimple } from './AccessibilitySimple';

// Simple Accessibility Components
export {
  KeyboardShortcutHelp,
  AccessibleInput,
  AccessibleTabs,
  SkipToContent,
  LiveRegion,
  AccessibilityProvider,
  useAccessibility
} from './AccessibilitySimple';

// Accessibility Hooks
export {
  useKeyboardShortcuts,
  useFocusManagement,
  useArrowKeyNavigation,
  createDefaultShortcuts,
  type KeyboardShortcut,
  type KeyboardShortcutGroup
} from '../../hooks/useAccessibilitySimple';