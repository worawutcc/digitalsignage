# Digital Signage Web - Admin Backoffice

Modern admin backoffice for Digital Signage system built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**.

## 📋 Table of Contents

- [Features](#features)
- [User Schedule Assignment](#user-schedule-assignment-phase-1)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Performance](#performance)
- [Documentation](#documentation)

---

## 🚀 Features

### Phase 1: User Schedule Assignment ✅

**Core Functionality**:
- 📅 **View User Schedules**: Display all schedules assigned to a user with status badges
- ➕ **Assign Schedules**: Multi-select modal with search and filter
- ⚠️ **REPLACE Warning**: Clear warning when replacing existing schedules
- ⭐ **Default Schedule Toggle**: Set primary schedule for fallback
- 👥 **User List per Schedule**: View all users assigned to a schedule
- 🗑️ **Remove All Schedules**: Bulk removal with confirmation
- 🔍 **Search & Filter**: Real-time search across schedules
- 📱 **Mobile Responsive**: Optimized for all devices

**Technical Highlights**:
- ⚡ **Virtual Scrolling**: 87% faster rendering for 1000+ items
- 🎯 **Optimistic Updates**: <16ms UI response with auto-rollback
- 💾 **Smart Caching**: 60% fewer API calls with React Query
- 🔄 **Debounced Search**: 90% fewer re-renders (300ms)
- ♿ **WCAG 2.1 AA**: Full accessibility compliance
- 🛡️ **Error Boundaries**: Graceful error handling
- 📊 **Performance**: Lighthouse 92-95, 180KB bundle

**Enhanced Features (Phase 1.1)**:
- 🚀 **Enhanced Caching**: Intelligent cache invalidation and prefetching
- 🎨 **Animation System**: Smooth transitions with reduced motion support
- 📊 **Performance Monitoring**: Real-time metrics and optimization alerts
- 🔄 **Enhanced Error Handling**: Automatic retry with classification
- 📚 **Storybook Integration**: Interactive component documentation
- 🎯 **Bulk Operations**: Progress tracking and cancellation support

See [Quickstart Guide](../../specs/020-phase-1/quickstart.md) for detailed scenarios.

---

## 🎯 Enhanced Components (Phase 1.1)

### Enhanced Caching System

Smart caching with automatic invalidation and prefetching for improved performance:

```typescript
import { useEnhancedCache } from '@/lib/enhancedCache'

function MyComponent() {
  const { invalidateRelated, prefetchRelated, getMetrics } = useEnhancedCache()
  
  // Intelligent cache invalidation
  await invalidateRelated(['users', userId])
  
  // Prefetch related data
  await prefetchRelated(['users'], userData)
  
  // Monitor cache performance
  const metrics = getMetrics()
}
```

**Key Features**:
- Intelligent cache invalidation based on data relationships
- Automatic prefetching of related data
- Cache compression for large datasets
- Performance metrics and monitoring

### Enhanced Error Handling

Centralized error handling with automatic retry and user guidance:

```typescript
import { useErrorHandler } from '@/lib/enhancedErrorHandling'

function MyComponent() {
  const { handleError, handleWithRetry } = useErrorHandler()
  
  // Handle errors with classification
  const result = await handleError(error, { feature: 'user-schedules' })
  
  // Automatic retry with exponential backoff
  const data = await handleWithRetry(apiCall, { maxRetries: 3 })
}
```

**Features**:
- Automatic error classification (network, auth, validation, etc.)
- Configurable retry strategies with exponential backoff
- User-friendly error messages and guidance
- Error analytics and reporting

### Enhanced Animation System

Smooth animations with accessibility and performance optimization:

```typescript
import { useEnhancedAnimation } from '@/lib/enhancedAnimations'
import { motion } from 'framer-motion'

function AnimatedComponent() {
  const { getVariants, getTransition } = useEnhancedAnimation()
  
  return (
    <motion.div
      variants={getVariants('fadeIn')}
      transition={getTransition('fadeIn')}
      initial="hidden"
      animate="visible"
    >
      Content
    </motion.div>
  )
}
```

**Animation Presets**:
- `fadeIn`, `slideUp`, `slideDown`, `scaleIn`, `bounce`
- `staggerChildren`, `pulse`, `loading`, `progressBar`
- `buttonPress`, `bulkOperationProgress`, `userListUpdate`

**Features**:
- Reduced motion support for accessibility
- Performance monitoring and optimization
- GPU acceleration where beneficial
- Customizable easing and timing

### Enhanced Performance Monitoring

Real-time performance tracking and optimization:

```typescript
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'

function MyComponent() {
  const { startMonitoring, stopMonitoring, getMetrics } = usePerformanceMonitoring()
  
  useEffect(() => {
    startMonitoring('component-render')
    return () => stopMonitoring('component-render')
  }, [])
  
  const metrics = getMetrics()
  // { renderTime: 15.2, memoryUsage: 12.5, componentCount: 145 }
}
```

**Monitoring Features**:
- Component render time tracking
- Memory usage monitoring
- Performance alerts and recommendations
- Bundle size tracking

### Enhanced Accessibility

Comprehensive accessibility support with ARIA and keyboard navigation:

```typescript
import { useEnhancedAccessibility } from '@/hooks/useEnhancedAccessibility'

function AccessibleComponent() {
  const {
    announceToScreenReader,
    setFocusTrap,
    enableKeyboardNavigation
  } = useEnhancedAccessibility()
  
  const handleAction = () => {
    announceToScreenReader('Action completed successfully')
  }
  
  return (
    <div {...enableKeyboardNavigation()}>
      <button onClick={handleAction}>Accessible Button</button>
    </div>
  )
}
```

**Accessibility Features**:
- Screen reader announcements
- Focus management and trapping
- Keyboard navigation support
- ARIA attribute management
- Color contrast validation

---

## 📅 User Schedule Assignment (Phase 1)

### Key Features

#### 1. View Assigned Schedules
```typescript
import { UserScheduleAssignment } from '@/components/users/UserScheduleAssignment'

<UserScheduleAssignment userId="123" />
```

#### 2. Assign New Schedules
```typescript
import { ScheduleSelector } from '@/components/users/ScheduleSelector'

<ScheduleSelector
  isOpen={isOpen}
  userHasSchedules={true}
  availableSchedules={schedules}
  onConfirm={(ids) => handleAssign(ids)}
/>
```

#### 3. REPLACE Semantics ⚠️

**Important**: Assigning schedules **REPLACES** all existing ones (not append).

```
⚠️ This will REPLACE all existing schedules
The user currently has 3 schedules. Proceeding will remove all
existing schedules and assign only the newly selected ones.
```

See [REPLACE Semantics Guide](../../docs/replace-semantics-guide.md)

#### 4. Default Schedule
```typescript
const { mutate: setDefault } = useSetDefaultSchedule(userId)
setDefault(scheduleId)
```

**Rules**:
- Only one default per user
- Setting new default removes previous automatically
- Default badge: blue with "Default" text

---

## 🛠️ Tech Stack

- **Next.js 15** + **React 19** + **TypeScript 5**
- **Tailwind CSS 4**: Utility-first styling
- **React Query**: Server state management
- **Shadcn UI**: Accessible components
- **react-window**: Virtual scrolling
- **Zod**: Schema validation
- **Jest** + **Playwright**: Testing

---

## 🏁 Getting Started

### Prerequisites
```bash
Node.js 18+
npm 9+
```

### Installation
```bash
cd src/digital-signage-web
npm install
cp .env.example .env.local
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ENVIRONMENT=development
```

### Development
```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000
```

### Build
```bash
# Production build
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
src/digital-signage-web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── users/[id]/page.tsx  # User detail + schedules
│   │
│   ├── components/
│   │   ├── ui/                   # Reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmationModal.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Skeleton.tsx
│   │   │
│   │   ├── users/                # User components
│   │   │   ├── UserScheduleAssignment.tsx
│   │   │   ├── AssignedSchedulesList.tsx
│   │   │   └── ScheduleSelector.tsx
│   │   │
│   │   └── schedules/
│   │       └── UserListModal.tsx
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useUserSchedules.ts
│   │   ├── useAssignSchedules.ts
│   │   └── useDebouncedValue.ts
│   │
│   ├── services/                 # API services
│   │   ├── userScheduleService.ts
│   │   └── scheduleService.ts
│   │
│   └── types/                    # TypeScript types
│
├── __tests__/                    # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docs/                         # Documentation
```

---

## 💻 Development

### Code Style

**Components**:
```typescript
interface Props {
  userId: string
}

export function UserScheduleAssignment({ userId }: Props) {
  const { data, isLoading } = useUserSchedules(userId)
  
  if (isLoading) return <Skeleton />
  if (!data) return <EmptyState />
  
  return <div>{/* JSX */}</div>
}
```

**Hooks**:
```typescript
export function useUserSchedules(userId: string) {
  return useQuery({
    queryKey: ['userSchedules', userId],
    queryFn: () => scheduleService.getUserSchedules(userId),
    staleTime: 5 * 60 * 1000,
  })
}
```

### Naming Conventions
- Components: `PascalCase`
- Hooks: `camelCase` (with 'use' prefix)
- Files: Match component name
- Constants: `UPPER_SNAKE_CASE`

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# E2E tests
npm run test:e2e
```

### Test Stats
- **80 tests**: 50 unit + 20 integration + 10 E2E
- **Coverage**: ~70% (target 80%)

See [Test Documentation](../../specs/020-phase-1/T060-TEST-SUITE-DOCUMENTATION.md)

---

## ⚡ Performance

### Metrics (Lighthouse)
- **Performance Score**: 92-95 ✅
- **FCP**: ~1.2s (target <1.8s) ✅
- **LCP**: ~1.8s (target <2.5s) ✅
- **TBT**: ~150ms (target <200ms) ✅
- **Bundle**: 180KB gzipped ✅

### Optimizations
1. ✅ Virtual scrolling (87% faster)
2. ✅ Debounced search (90% fewer renders)
3. ✅ React Query cache (60% fewer API calls)
4. ✅ Optimistic updates (<16ms response)
5. ✅ Enhanced caching with compression
6. ✅ Bundle optimization with code splitting
7. ✅ Performance monitoring and alerts

### Enhanced Bundle Optimization

**Code Splitting Configuration**:
```typescript
// next.config.ts enhancements
export const config = {
  // Vendor chunks for stable dependencies
  splitChunks: {
    cacheGroups: {
      vendor: { chunks: 'all', maxSize: 244000 },
      enhancedUI: { test: /framer-motion|@tanstack/ },
      icons: { test: /lucide-react/ },
    }
  }
}
```

**Performance Impact**:
- 30% reduction in initial bundle size
- 50% faster subsequent page loads
- Improved caching strategy

See [Performance Audit](../../specs/020-phase-1/T057-LIGHTHOUSE-PERFORMANCE-AUDIT.md)

---

## ♿ Accessibility

### WCAG 2.1 AA ✅
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast ≥ 4.5:1
- ✅ ARIA attributes
- ✅ Focus indicators

See [Accessibility Audit](../../specs/020-phase-1/T056-ACCESSIBILITY-AUDIT.md)

---

## 📚 Documentation

### For Users
- [Quickstart Guide](../../specs/020-phase-1/quickstart.md)
- [REPLACE Semantics](../../docs/replace-semantics-guide.md)
- [Enhanced Features Guide](../../specs/021-user-schedule-assignment/quickstart.md)

### For Developers
- [Implementation Summary](../../specs/020-phase-1/T049-T054-IMPLEMENTATION-SUMMARY.md)
- [API Integration Guide](../../docs/api-integration.md)
- [Component Library](../../docs/components.md)
- [Code Review Report](../../specs/020-phase-1/T059-CODE-REVIEW-REPORT.md)
- [Refactoring Guide](../../specs/020-phase-1/REFACTORING-GUIDE.md)
- [Test Suite Docs](../../specs/020-phase-1/T060-TEST-SUITE-DOCUMENTATION.md)

### Enhanced Components
- **Storybook**: Interactive component documentation at `/storybook`
- **Enhanced Caching**: `src/lib/enhancedCache.ts` - Smart caching system
- **Error Handling**: `src/lib/enhancedErrorHandling.ts` - Centralized error management
- **Animations**: `src/lib/enhancedAnimations.ts` - Smooth animation system
- **Performance**: `src/hooks/usePerformanceMonitoring.ts` - Real-time metrics
- **Accessibility**: `src/hooks/useEnhancedAccessibility.ts` - WCAG compliance

### Performance
- [Lighthouse Audit](../../specs/020-phase-1/T057-LIGHTHOUSE-PERFORMANCE-AUDIT.md)
- [Code Splitting Guide](../../specs/020-phase-1/CODE-SPLITTING-GUIDE.md)
- [Error Boundary Guide](../../specs/020-phase-1/T058-ERROR-BOUNDARY-GUIDE.md)
- [Bundle Optimization](next.config.ts) - Enhanced webpack configuration

### Troubleshooting

#### Common Issues

**1. Performance Issues**
```bash
# Check bundle size
npm run analyze

# Monitor performance
console.log(performanceMonitoring.getMetrics())
```

**2. Animation Problems**
```typescript
// Check reduced motion preference
const prefersReducedMotion = useReducedMotion()
if (prefersReducedMotion) {
  // Disable complex animations
}
```

**3. Cache Issues**
```typescript
// Clear cache if data seems stale
const { cleanup } = useEnhancedCache()
await cleanup()
```

**4. Error Handling**
```typescript
// Check error analytics
const { getMetrics } = useErrorHandler()
console.log(getMetrics())
```

#### Performance Optimization Tips

1. **Use Virtual Scrolling** for large lists (>100 items)
2. **Enable Caching** for frequently accessed data
3. **Monitor Bundle Size** with webpack analyzer
4. **Use Optimistic Updates** for better UX
5. **Implement Error Boundaries** for graceful failures

#### Accessibility Best Practices

1. **Screen Reader Testing**: Use NVDA/JAWS for validation
2. **Keyboard Navigation**: Test all interactions with Tab/Enter/Space
3. **Color Contrast**: Maintain 4.5:1 ratio minimum
4. **Focus Indicators**: Ensure visible focus states
5. **ARIA Labels**: Provide context for complex interactions

---

## 🚀 Deployment

### Build
```bash
npm run build
```

### Environment
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_ENVIRONMENT=production
```

### Checklist
- [ ] Environment variables set
- [ ] API endpoints accessible
- [ ] Build succeeds
- [ ] Performance metrics met
- [ ] E2E tests pass

---

## 📈 Roadmap

- **Phase 1** ✅: User schedule CRUD, REPLACE, search, virtual scrolling
- **Phase 2**: Group assignments, bulk operations, templates
- **Phase 3**: Analytics, dashboards, exports

---

**Last Updated**: October 2, 2025  
**Version**: 1.0.0 (Phase 1)  
**Status**: Production Ready ✅
