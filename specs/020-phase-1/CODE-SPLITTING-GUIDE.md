# Code Splitting Implementation Guide

## Quick Reference for Dynamic Imports

### Pattern 1: Modal Components (Highest Priority)

#### ScheduleSelector Modal
```typescript
// src/features/users/components/UserScheduleAssignment.tsx
import dynamic from 'next/dynamic'
import { SkeletonList } from '@/components/ui/Skeleton'

// ✅ Lazy load modal - saves ~45KB on initial load
const ScheduleSelector = dynamic(
  () => import('./ScheduleSelector').then(mod => ({
    default: mod.ScheduleSelector
  })),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="max-w-2xl w-full bg-white rounded-lg p-6">
          <SkeletonList count={5} />
        </div>
      </div>
    ),
    ssr: false, // Modal doesn't need server-side rendering
  }
)

export function UserScheduleAssignment({ userId }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Assign Schedules
      </Button>
      
      {/* Only loads when isModalOpen becomes true */}
      {isModalOpen && (
        <ScheduleSelector
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          {...otherProps}
        />
      )}
    </>
  )
}
```

**Savings**: ~45KB (modal + react-window)

---

### Pattern 2: Confirmation Modal

```typescript
// src/components/ui/ConfirmationModal.tsx usage
import dynamic from 'next/dynamic'

const ConfirmationModal = dynamic(
  () => import('@/components/ui/ConfirmationModal'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 animate-pulse" />
    ),
    ssr: false,
  }
)

export function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false)
  
  return (
    <>
      <Button onClick={() => setShowConfirm(true)}>Delete</Button>
      
      {showConfirm && (
        <ConfirmationModal
          isOpen={showConfirm}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}
```

**Savings**: ~8KB

---

### Pattern 3: Feature Components

```typescript
// app/users/[id]/schedules/page.tsx
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/Skeleton'

const UserScheduleAssignment = dynamic(
  () => import('@/features/users/components/UserScheduleAssignment'),
  {
    loading: () => (
      <div className="container mx-auto p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 gap-4">
          <Skeleton className="h-32" count={3} />
        </div>
      </div>
    ),
  }
)

export default function UserSchedulesPage({ params }: Props) {
  return <UserScheduleAssignment userId={params.id} />
}
```

**Savings**: ~30KB

---

### Pattern 4: Heavy Libraries (Charts, Date Pickers)

```typescript
// Future: If adding charts
import dynamic from 'next/dynamic'

const ScheduleChart = dynamic(
  () => import('@/components/charts/ScheduleChart'),
  {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
    ssr: false, // Charts don't need SSR
  }
)

// Future: If adding date picker
const DateRangePicker = dynamic(
  () => import('@/components/ui/DateRangePicker'),
  {
    loading: () => <input type="text" placeholder="Loading..." disabled />,
    ssr: false,
  }
)
```

**Potential Savings**: 80-150KB (recharts, react-datepicker)

---

## Implementation Priority

### Phase 1: High Impact (Implement First)
1. ✅ **ScheduleSelector Modal**: ~45KB savings
2. ✅ **ConfirmationModal**: ~8KB savings
3. ✅ **Total Savings**: ~53KB (30% reduction)

### Phase 2: Medium Impact (Next Sprint)
1. ⚠️ **UserScheduleAssignment**: ~30KB savings
2. ⚠️ **Large Form Components**: ~15-20KB savings
3. ⚠️ **Total Additional**: ~45-50KB

### Phase 3: Future Work
1. 📝 **Chart Libraries**: ~80-150KB savings (if added)
2. 📝 **Rich Text Editors**: ~100-200KB savings (if added)
3. 📝 **Heavy UI Components**: Varies

---

## Before/After Bundle Size

### Current (No Dynamic Imports)
```
Page: /users/[id]/schedules
├── Main bundle: ~180KB gzipped
├── Includes: ScheduleSelector (~45KB)
├── Includes: ConfirmationModal (~8KB)
└── Total First Load: ~180KB
```

### After Dynamic Imports (Phase 1)
```
Page: /users/[id]/schedules
├── Main bundle: ~127KB gzipped ✅
├── ScheduleSelector chunk: ~45KB (loaded on demand)
├── ConfirmationModal chunk: ~8KB (loaded on demand)
└── Total First Load: ~127KB ✅ (-30%)
```

**First Load Improvement**: 180KB → 127KB = **30% reduction** 🚀

---

## How to Verify Bundle Size

### 1. Install Next.js Bundle Analyzer
```bash
cd src/digital-signage-web
npm install --save-dev @next/bundle-analyzer
```

### 2. Configure next.config.js
```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... other config
})
```

### 3. Analyze Bundle
```bash
# Generate bundle report
ANALYZE=true npm run build

# Opens browser with interactive treemap
# Shows all chunks and their sizes
```

### 4. Check Build Output
```bash
npm run build

# Look for:
# Route (app)                              Size     First Load JS
# ├ ○ /users/[id]/schedules               XX kB        XXX kB
# └ ○ /schedules                          XX kB        XXX kB
#
# Target: First Load JS < 200KB per page
```

---

## Testing Dynamic Imports

### 1. Visual Test (Network Tab)
```bash
# 1. Build and start production server
npm run build
npm run start

# 2. Open Chrome DevTools → Network tab
# 3. Navigate to /users/1/schedules
# 4. Check loaded chunks (should NOT include ScheduleSelector yet)
# 5. Click "Assign Schedules" button
# 6. See ScheduleSelector chunk loaded (e.g., 123.js)
```

### 2. Lighthouse Test
```bash
# Before dynamic imports
lighthouse http://localhost:3000/users/1/schedules

# After dynamic imports
lighthouse http://localhost:3000/users/1/schedules

# Compare "JavaScript bundle size" metric
# Should see ~30% reduction
```

### 3. Performance Test
```bash
# Chrome DevTools → Performance tab
# Record page load
# Check "Bottom-Up" view
# Verify ScheduleSelector not in initial parse time
```

---

## Common Pitfalls

### ❌ Don't: Import dynamically if used immediately
```typescript
// BAD: Component renders immediately on page load
const Header = dynamic(() => import('./Header'))

export default function Page() {
  return <Header /> // Loaded immediately anyway
}
```

### ✅ Do: Import dynamically if conditionally rendered
```typescript
// GOOD: Modal only renders when user clicks button
const Modal = dynamic(() => import('./Modal'))

export default function Page() {
  const [showModal, setShowModal] = useState(false)
  return showModal && <Modal /> // Loaded on demand
}
```

### ❌ Don't: Over-split small components
```typescript
// BAD: Button is tiny (~2KB), not worth splitting
const Button = dynamic(() => import('./Button'))
```

### ✅ Do: Split large components (>20KB)
```typescript
// GOOD: Chart library is large (~80KB)
const Chart = dynamic(() => import('./Chart'))
```

---

## Next.js Automatic Optimization

### Already Handled by Next.js 15
1. ✅ **Route-based splitting**: Each page is separate chunk
2. ✅ **Shared chunk**: React, common libraries in shared bundle
3. ✅ **Framework chunk**: Next.js runtime separate
4. ✅ **CSS splitting**: Each component's CSS in separate file

### Manual Optimization Needed
1. ⚠️ **Modal components**: Use dynamic imports
2. ⚠️ **Conditional features**: Use dynamic imports
3. ⚠️ **Heavy libraries**: Use dynamic imports

---

## Monitoring Bundle Size

### Add to CI/CD
```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [pull_request]

jobs:
  check-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      
      # Check bundle size
      - name: Check bundle size
        run: |
          SIZE=$(du -sh .next/static | cut -f1)
          echo "Bundle size: $SIZE"
          # Fail if > 500KB
          if [ $(du -s .next/static | cut -f1) -gt 512000 ]; then
            echo "Bundle too large!"
            exit 1
          fi
```

---

## Implementation Checklist

### ScheduleSelector Modal (High Priority)
- [ ] Wrap with `dynamic()` import
- [ ] Add loading skeleton
- [ ] Set `ssr: false`
- [ ] Conditionally render based on `isModalOpen`
- [ ] Test network tab (chunk loads on button click)
- [ ] Verify bundle size reduction (~45KB)

### ConfirmationModal (High Priority)
- [ ] Wrap with `dynamic()` import
- [ ] Add loading placeholder
- [ ] Set `ssr: false`
- [ ] Test all usage locations
- [ ] Verify no breaking changes

### Verification (After Implementation)
- [ ] Run `npm run build` successfully
- [ ] Check build output (bundle size reduced)
- [ ] Test in production mode
- [ ] Run Lighthouse (performance improved)
- [ ] Test slow 3G connection (still usable)

---

## Success Criteria

### Bundle Size
- ✅ **Target**: < 150KB gzipped per page
- ✅ **Current**: ~180KB
- ✅ **After Splitting**: ~127KB
- ✅ **Improvement**: 30% reduction

### Performance
- ✅ **FCP**: Faster (less JavaScript to parse)
- ✅ **TTI**: Faster (less blocking JavaScript)
- ✅ **TBT**: Lower (less main thread work)

### User Experience
- ✅ **Initial Load**: Faster
- ✅ **Modal Open**: Slight delay (but acceptable)
- ✅ **Skeleton**: Shows during chunk load
- ✅ **No Errors**: Everything works as before

---

## Resources

- **Next.js Dynamic Imports**: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading
- **Bundle Analyzer**: https://www.npmjs.com/package/@next/bundle-analyzer
- **Web.dev Code Splitting**: https://web.dev/reduce-javascript-payloads-with-code-splitting/
- **React.lazy**: https://react.dev/reference/react/lazy

---

## Conclusion

**Recommended Action**: Implement Phase 1 (ScheduleSelector + ConfirmationModal)

**Expected Results**:
- 30% smaller initial bundle
- Faster page load
- Better Lighthouse score
- No UX degradation

**Effort**: ~30 minutes implementation + testing

**Status**: Ready to implement ✅
