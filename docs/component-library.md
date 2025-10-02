# Component Library Reference

## Overview
Comprehensive documentation for all reusable UI components in the Digital Signage Admin Backoffice. All components are built with TypeScript, React 19, and Tailwind CSS 4.

**Last Updated**: October 2, 2025  
**Phase**: 1 - Component Foundation  
**Directory**: `src/components/ui/`

---

## Table of Contents

1. [Button](#button)
2. [Input](#input)
3. [Modal](#modal)
4. [ConfirmationModal](#confirmationmodal)
5. [EmptyState](#emptystate)
6. [ErrorBoundary](#errorboundary)
7. [Skeleton Components](#skeleton-components)
8. [Loading States](#loading-states)
9. [Component Guidelines](#component-guidelines)
10. [Accessibility](#accessibility)

---

## Button

**File**: `components/ui/Button.tsx`

Versatile button component with multiple variants, sizes, and loading states.

### Props Interface

```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
  children: React.ReactNode
}
```

### Variants

| Variant | Use Case | Appearance |
|---------|----------|------------|
| **default** | Primary actions (Save, Submit, Confirm) | Blue background, white text |
| **destructive** | Dangerous actions (Delete, Remove) | Red background, white text |
| **outline** | Secondary actions (Cancel, Back) | Border only, transparent background |
| **secondary** | Tertiary actions (View Details, Edit) | Gray background |
| **ghost** | Minimal actions (Icon buttons in lists) | No background, hover effect |
| **link** | Text links with button behavior | Blue text, underline on hover |

### Sizes

- **default**: h-10 (40px) - Standard buttons
- **sm**: h-9 (36px) - Compact buttons in tables
- **lg**: h-11 (44px) - Hero buttons, CTAs
- **icon**: h-10 w-10 (40x40px) - Icon-only buttons

### Examples

#### Basic Usage
```tsx
import { Button } from '@/components/ui/Button'

// Primary button
<Button>Save Changes</Button>

// Destructive button
<Button variant="destructive">Delete Schedule</Button>

// Outline button
<Button variant="outline">Cancel</Button>

// Small button
<Button size="sm">View Details</Button>
```

#### With Loading State
```tsx
<Button loading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>
```

#### Icon Button
```tsx
<Button variant="ghost" size="icon" aria-label="Edit schedule">
  <Edit2 className="h-4 w-4" />
</Button>
```

#### With onClick Handler
```tsx
<Button 
  variant="destructive" 
  onClick={() => handleDelete(scheduleId)}
>
  Delete
</Button>
```

### Accessibility

- ✅ Keyboard accessible (Tab, Enter, Space)
- ✅ Focus ring visible (focus-visible:ring-2)
- ✅ Disabled state (disabled:opacity-50)
- ✅ Loading state disables interaction
- ✅ Use `aria-label` for icon-only buttons

### Best Practices

✅ **DO**:
- Use `variant="destructive"` for delete actions
- Disable button during async operations
- Provide loading state for better UX
- Use `aria-label` for icon-only buttons

❌ **DON'T**:
- Use multiple primary buttons in one view
- Make buttons too small for touch targets
- Forget to handle loading states
- Use ghost buttons for primary actions

---

## Input

**File**: `components/ui/Input.tsx`

Text input component with error state support and consistent styling.

### Props Interface

```typescript
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  className?: string
}
```

### Examples

#### Basic Input
```tsx
import { Input } from '@/components/ui/Input'

<Input 
  type="text" 
  placeholder="Enter schedule name" 
/>
```

#### With Error State
```tsx
<Input 
  type="email"
  placeholder="Email address"
  error={errors.email}
/>
```

#### Controlled Input
```tsx
const [value, setValue] = useState('')

<Input 
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Search schedules..."
/>
```

#### With Form Integration (React Hook Form)
```tsx
import { useForm } from 'react-hook-form'

const { register, formState: { errors } } = useForm()

<Input
  {...register('scheduleName', { 
    required: 'Schedule name is required',
    minLength: { value: 3, message: 'Minimum 3 characters' }
  })}
  error={errors.scheduleName?.message}
  placeholder="Schedule name"
/>
```

### Accessibility

- ✅ Label association with `id` and `htmlFor`
- ✅ Error messages linked with `aria-describedby`
- ✅ Focus ring (focus-visible:ring-2)
- ✅ Disabled state
- ✅ Placeholder text for guidance

### Best Practices

✅ **DO**:
- Always provide labels (visible or aria-label)
- Show clear error messages
- Use appropriate input types (email, tel, number)
- Provide helpful placeholder text

❌ **DON'T**:
- Use placeholder as label
- Show generic error messages
- Make inputs too narrow for content
- Forget disabled state styling

---

## Modal

**File**: `components/ui/Modal.tsx`

Full-featured modal dialog with animations, accessibility, and portal rendering.

### Props Interface

```typescript
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}
```

### Sizes

- **sm**: max-w-md (448px) - Small dialogs, confirmations
- **md**: max-w-lg (512px) - Standard dialogs *(default)*
- **lg**: max-w-2xl (672px) - Content-heavy dialogs
- **xl**: max-w-4xl (896px) - Full-width dialogs

### Features

- ✅ Portal rendering (no z-index issues)
- ✅ ESC key to close
- ✅ Click overlay to close (configurable)
- ✅ Body scroll lock when open
- ✅ Fade-in animation
- ✅ Keyboard trap (focus management)
- ✅ ARIA attributes (role="dialog", aria-modal="true")

### Examples

#### Basic Modal
```tsx
import { Modal } from '@/components/ui/Modal'

const [isOpen, setIsOpen] = useState(false)

<Button onClick={() => setIsOpen(true)}>Open Modal</Button>

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Edit Schedule"
>
  <div>Modal content goes here</div>
</Modal>
```

#### Large Modal with Form
```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Assign Schedules"
  size="lg"
  closeOnOverlayClick={false} // Prevent accidental close
>
  <ScheduleAssignmentForm 
    userId={userId}
    onSubmit={handleSubmit}
  />
</Modal>
```

#### Modal with Footer Actions
```tsx
<Modal isOpen={isOpen} onClose={handleClose} title="Confirm Action">
  <div className="space-y-4">
    <p>Are you sure you want to proceed?</p>
    
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </div>
  </div>
</Modal>
```

### Accessibility

- ✅ `role="dialog"` and `aria-modal="true"`
- ✅ `aria-labelledby` for title
- ✅ ESC key support
- ✅ Focus trap (keeps focus inside modal)
- ✅ Body scroll lock
- ✅ Close button with `aria-label="Close modal"`

### Best Practices

✅ **DO**:
- Use descriptive titles
- Provide clear actions (OK/Cancel)
- Disable overlay click for forms
- Show loading state during submission

❌ **DON'T**:
- Nest modals (modal inside modal)
- Use for trivial messages (use toast)
- Make content too long (scrollable)
- Open modal on page load (UX anti-pattern)

---

## ConfirmationModal

**File**: `components/ui/ConfirmationModal.tsx`

Specialized modal for confirming destructive or important actions.

### Props Interface

```typescript
export interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  requireConfirm?: boolean
  confirmCheckboxLabel?: string
  variant?: 'warning' | 'danger' | 'info' | 'success'
  isLoading?: boolean
  className?: string
}
```

### Variants

| Variant | Icon | Color | Use Case |
|---------|------|-------|----------|
| **warning** | ⚠️ AlertTriangle | Yellow | Potentially risky actions |
| **danger** | ❌ XCircle | Red | Destructive actions (delete) |
| **info** | ℹ️ Info | Blue | Informational confirmations |
| **success** | ✅ CheckCircle | Green | Positive confirmations |

### Examples

#### Basic Confirmation
```tsx
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'

<ConfirmationModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Schedule"
  message="Are you sure you want to delete this schedule? This action cannot be undone."
  variant="danger"
  confirmText="Delete"
/>
```

#### With Checkbox Confirmation
```tsx
<ConfirmationModal
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleRemoveAll}
  title="Remove All Schedules"
  message="This will remove all schedules assigned to this user."
  variant="danger"
  requireConfirm // ⚠️ Requires checkbox
  confirmCheckboxLabel="I understand this will remove all schedules"
  confirmText="Remove All"
/>
```

#### With Loading State
```tsx
<ConfirmationModal
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleAssign}
  title="Assign Schedules"
  message="This will REPLACE all existing schedules with the newly selected ones."
  variant="warning"
  isLoading={isAssigning}
  confirmText={isAssigning ? 'Assigning...' : 'Confirm'}
/>
```

### When to Use

✅ **Use ConfirmationModal for**:
- Deleting data
- Bulk operations
- REPLACE operations (destructive)
- Irreversible actions

❌ **Don't use for**:
- Simple form submissions
- Non-destructive actions
- Trivial confirmations

### Accessibility

- ✅ Icon with semantic meaning
- ✅ Clear title and message
- ✅ Keyboard support (ESC, Enter)
- ✅ Focus management
- ✅ Loading state disables confirm button

---

## EmptyState

**File**: `components/ui/EmptyState.tsx`

Visual component for displaying when no data is available.

### Props Interface

```typescript
export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  className?: string
}
```

### Examples

#### Basic Empty State
```tsx
import { EmptyState } from '@/components/ui/EmptyState'
import { Calendar } from 'lucide-react'

<EmptyState
  icon={Calendar}
  title="No schedules assigned"
  description="This user doesn't have any schedules assigned yet."
/>
```

#### With Action Button
```tsx
<EmptyState
  icon={Calendar}
  title="No schedules found"
  description="Get started by creating your first schedule."
  action={{
    label: "Create Schedule",
    onClick: () => navigate('/schedules/new'),
    variant: 'default'
  }}
/>
```

#### Search Results Empty State
```tsx
<EmptyState
  icon={Search}
  title={`No results for "${searchQuery}"`}
  description="Try adjusting your search or filters."
  action={{
    label: "Clear Search",
    onClick: () => setSearchQuery(''),
    variant: 'outline'
  }}
/>
```

### Common Icons

- **Calendar**: Schedules
- **Users**: Users list
- **Search**: Search results
- **FileText**: Documents/Reports
- **Inbox**: Messages/Notifications
- **Package**: Items/Products

### Best Practices

✅ **DO**:
- Use descriptive icons
- Provide helpful descriptions
- Offer clear next action
- Keep message concise

❌ **DON'T**:
- Use technical error messages
- Blame the user
- Use scary icons
- Make action button ambiguous

---

## ErrorBoundary

**File**: `components/ui/ErrorBoundary.tsx`

React error boundary for graceful error handling with fallback UI.

### Props Interface

```typescript
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  boundaryName?: string
}
```

### Examples

#### Basic Usage
```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

<ErrorBoundary>
  <UserScheduleAssignment userId={userId} />
</ErrorBoundary>
```

#### With Error Logging
```tsx
<ErrorBoundary
  boundaryName="UserScheduleAssignment"
  onError={(error, errorInfo) => {
    console.error('User Schedule Error:', {
      userId,
      error,
      componentStack: errorInfo.componentStack,
    })
    // Send to Sentry in production
    // Sentry.captureException(error, { contexts: { react: errorInfo } })
  }}
>
  <UserScheduleAssignment userId={userId} />
</ErrorBoundary>
```

#### With Custom Fallback
```tsx
<ErrorBoundary
  fallback={(error, reset) => (
    <div className="p-6 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
      <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <Button onClick={reset} className="mt-4">Try Again</Button>
    </div>
  )}
>
  <UserScheduleAssignment userId={userId} />
</ErrorBoundary>
```

#### Feature Error Boundary (Convenience)
```tsx
import { FeatureErrorBoundary } from '@/components/ui/ErrorBoundary'

<FeatureErrorBoundary featureName="User Schedules">
  <UserScheduleAssignment userId={userId} />
</FeatureErrorBoundary>
```

### When to Use

✅ **Wrap these components**:
- Feature modules (UserScheduleAssignment)
- Page components
- Third-party components
- Data-fetching components

❌ **Don't wrap**:
- Individual buttons
- Simple UI elements
- Root App component (use separate App ErrorBoundary)

### Features

- ✅ Catches JavaScript errors in child tree
- ✅ Retry functionality
- ✅ Development error details
- ✅ Production-friendly UI
- ✅ Error logging integration
- ✅ Custom fallback support

### Best Practices

✅ **DO**:
- Place at feature boundaries
- Log errors to monitoring service
- Provide retry button
- Show user-friendly messages

❌ **DON'T**:
- Wrap every small component
- Show technical stack traces to users
- Use as catch-all (fix bugs instead)
- Forget to log errors

---

## Skeleton Components

**File**: `components/ui/Skeleton.tsx`

Loading skeleton components for better perceived performance.

### Components

#### 1. Skeleton (Base)
```typescript
export interface SkeletonProps {
  className?: string
  count?: number
}
```

**Usage**:
```tsx
import { Skeleton } from '@/components/ui/Skeleton'

// Single skeleton
<Skeleton className="h-4 w-32" />

// Multiple skeletons
<Skeleton className="h-6 w-48" count={3} />
```

#### 2. SkeletonCard
Pre-styled skeleton for card layouts.

```tsx
import { SkeletonCard } from '@/components/ui/Skeleton'

<SkeletonCard />
```

**Appearance**:
```
┌─────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓        ▓▓▓       │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓                │
│ ● ▓▓▓▓▓▓                    │
└─────────────────────────────┘
```

#### 3. SkeletonList
Pre-styled skeleton for list items.

```tsx
import { SkeletonList } from '@/components/ui/Skeleton'

<SkeletonList count={5} />
```

**Appearance**:
```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

### Examples

#### User List Loading
```tsx
function UserList({ isLoading, users }) {
  if (isLoading) {
    return <SkeletonList count={10} />
  }
  
  return (
    <div>
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  )
}
```

#### Schedule Card Loading
```tsx
function ScheduleGrid({ isLoading, schedules }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {schedules.map(schedule => (
        <ScheduleCard key={schedule.id} schedule={schedule} />
      ))}
    </div>
  )
}
```

#### Custom Skeleton Layout
```tsx
<div className="space-y-4">
  <Skeleton className="h-8 w-64" /> {/* Title */}
  <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
  <Skeleton className="h-4 w-3/4" /> {/* Description line 2 */}
  <div className="flex gap-2">
    <Skeleton className="h-10 w-24" /> {/* Button 1 */}
    <Skeleton className="h-10 w-24" /> {/* Button 2 */}
  </div>
</div>
```

### Best Practices

✅ **DO**:
- Match skeleton to actual content layout
- Use during data fetching
- Animate for perceived performance
- Show immediately (no delay)

❌ **DON'T**:
- Use different layout than actual content
- Show for less than 300ms (jarring)
- Mix with loading spinners
- Forget to replace with actual content

---

## Loading States

**File**: `components/ui/LoadingStates.tsx`

Additional loading indicators and states.

### Components

#### 1. Spinner
```tsx
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

<Spinner size="md" />
```

**Sizes**:
- **sm**: h-4 w-4 (16px) - Inline, buttons
- **md**: h-8 w-8 (32px) - Cards, sections *(default)*
- **lg**: h-12 w-12 (48px) - Full page

#### 2. LoadingOverlay
```tsx
export interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  fullScreen?: boolean
  className?: string
}

<LoadingOverlay 
  isLoading={isSaving} 
  message="Saving changes..." 
/>
```

**Usage**:
```tsx
<div className="relative">
  <ScheduleForm />
  <LoadingOverlay isLoading={isSubmitting} message="Saving..." />
</div>
```

#### 3. SkeletonText
```tsx
export interface SkeletonTextProps {
  lines?: number
  className?: string
}

<SkeletonText lines={3} />
```

#### 4. SkeletonTable
```tsx
export interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
}

<SkeletonTable rows={10} columns={5} />
```

### Examples

#### Button with Inline Spinner
```tsx
<Button disabled={isLoading}>
  {isLoading && <Spinner size="sm" className="mr-2" />}
  {isLoading ? 'Saving...' : 'Save Changes'}
</Button>
```

#### Page Loading
```tsx
function UserSchedulePage() {
  const { data, isLoading } = useUserSchedules(userId)
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <SkeletonList count={5} />
      </div>
    )
  }
  
  return <UserScheduleList schedules={data} />
}
```

---

## Component Guidelines

### File Structure

```
components/
├── ui/                       # Reusable UI components
│   ├── Button.tsx
│   ├── Button.types.ts       # Props interface
│   ├── Input.tsx
│   ├── Input.types.ts
│   ├── Modal.tsx
│   ├── ErrorBoundary.tsx
│   └── Skeleton.tsx
└── features/                 # Feature-specific components
    └── schedules/
        ├── UserScheduleAssignment.tsx
        └── ScheduleSelector.tsx
```

### Naming Conventions

- **Components**: PascalCase (`Button`, `UserScheduleAssignment`)
- **Props Interfaces**: PascalCase with `Props` suffix (`ButtonProps`, `ModalProps`)
- **Files**: Match component name (`Button.tsx`, `Button.types.ts`)
- **Exports**: Named exports (`export function Button()`)

### Component Pattern

```typescript
// Component.types.ts
export interface ComponentProps {
  // Props here
}

// Component.tsx
import { ComponentProps } from './Component.types'

/**
 * Component description
 * 
 * @example
 * ```tsx
 * <Component prop="value" />
 * ```
 */
export function Component({
  prop1,
  prop2,
  ...props
}: ComponentProps) {
  return (
    <div {...props}>
      {/* Component JSX */}
    </div>
  )
}
```

### TypeScript Guidelines

✅ **DO**:
- Use explicit prop interfaces
- Extend HTML element types (`React.ButtonHTMLAttributes`)
- Use generics for flexible components
- Document props with JSDoc

❌ **DON'T**:
- Use `any` type
- Skip prop validation
- Use inline prop types
- Forget to export types

### Styling Guidelines

All components use Tailwind CSS with class-variance-authority (cva) for variants.

**Pattern**:
```tsx
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const componentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'variant-classes',
        secondary: 'variant-classes',
      },
      size: {
        sm: 'size-classes',
        md: 'size-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export function Component({ variant, size, className }) {
  return (
    <div className={cn(componentVariants({ variant, size }), className)}>
      {/* Content */}
    </div>
  )
}
```

---

## Accessibility

All components follow WCAG 2.1 AA standards.

### Keyboard Navigation

| Component | Keys | Action |
|-----------|------|--------|
| **Button** | Tab | Focus |
| | Enter/Space | Activate |
| **Modal** | ESC | Close |
| | Tab | Navigate through elements |
| **Input** | Tab | Focus |
| | Arrow keys | Move cursor (text) |
| **ConfirmationModal** | Enter | Confirm (when enabled) |
| | ESC | Cancel |

### Focus Management

✅ All interactive elements:
- Visible focus ring (focus-visible:ring-2)
- Logical tab order
- Skip links (for page-level navigation)
- Focus trap in modals

### ARIA Attributes

Components use appropriate ARIA attributes:

- **Button**: `aria-label` (icon buttons), `aria-pressed` (toggles)
- **Modal**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- **Input**: `aria-describedby` (errors), `aria-invalid`
- **EmptyState**: No ARIA needed (semantic HTML)
- **ErrorBoundary**: `role="alert"` on fallback

### Screen Reader Testing

All components tested with:
- ✅ VoiceOver (macOS/iOS)
- ✅ NVDA (Windows)
- ✅ JAWS (Windows)

---

## Component Checklist

When creating new components:

### Functionality ✅
- [ ] Props interface defined
- [ ] TypeScript strict mode passes
- [ ] Default props set appropriately
- [ ] Error states handled
- [ ] Loading states implemented

### Accessibility ✅
- [ ] Keyboard navigation works
- [ ] Focus ring visible
- [ ] ARIA attributes correct
- [ ] Screen reader tested
- [ ] Color contrast meets WCAG AA

### Testing ✅
- [ ] Unit tests written (Jest + RTL)
- [ ] Visual regression tests
- [ ] Accessibility tests (jest-axe)
- [ ] E2E tests (Playwright)

### Documentation ✅
- [ ] JSDoc comments added
- [ ] Props documented
- [ ] Examples provided
- [ ] Use cases explained
- [ ] Added to this guide

### Code Quality ✅
- [ ] ESLint passes
- [ ] Prettier formatted
- [ ] No console.log statements
- [ ] No TODOs or FIXMEs
- [ ] Optimized for performance

---

## Quick Reference

### Import Statements

```typescript
// UI Components
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Skeleton, SkeletonCard, SkeletonList } from '@/components/ui/Skeleton'
import { Spinner, LoadingOverlay } from '@/components/ui/LoadingStates'

// Icons (Lucide React)
import { Calendar, Users, Search, AlertTriangle } from 'lucide-react'

// Utils
import { cn } from '@/lib/utils'
```

### Common Patterns

#### Form with Validation
```tsx
<form onSubmit={handleSubmit}>
  <Input
    {...register('name', { required: 'Required' })}
    error={errors.name?.message}
    placeholder="Schedule name"
  />
  <Button type="submit" loading={isSubmitting}>
    Save
  </Button>
</form>
```

#### List with Loading & Empty State
```tsx
if (isLoading) return <SkeletonList count={5} />
if (error) return <ErrorState error={error} />
if (!data?.length) return <EmptyState icon={Calendar} title="No data" />
return <ListView data={data} />
```

#### Modal with Confirmation
```tsx
<Button onClick={() => setIsOpen(true)}>Delete</Button>

<ConfirmationModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Schedule"
  message="This action cannot be undone."
  variant="danger"
/>
```

---

## Related Documentation

- [API Integration Guide](./api-integration.md) - React Query patterns
- [Error Boundary Guide](../specs/020-phase-1/T058-ERROR-BOUNDARY-GUIDE.md) - Detailed error handling
- [Code Review Report](../specs/020-phase-1/T059-CODE-REVIEW-REPORT.md) - Code quality standards
- [Accessibility Guide](../specs/020-phase-1/T057-ACCESSIBILITY-AUDIT.md) - WCAG 2.1 AA compliance
- [Component Contracts](../specs/017-design-ui-backoffice/contracts/component-contracts.md) - Full specifications

---

**Last Updated**: October 2, 2025  
**Status**: Production Ready ✅  
**Coverage**: 9 core components documented
