# Performance Monitoring Guide

Complete guide to performance monitoring and Web Vitals tracking in the Digital Signage application.

## Overview

The performance monitoring system tracks:
- **Web Vitals** (CLS, FID, FCP, LCP, TTFB, INP)
- **API Performance** (request duration, errors)
- **Component Render Times** (slow renders)
- **Resource Loading** (slow assets)
- **Long Tasks** (main thread blocking)
- **Memory Usage** (heap size monitoring)
- **Errors** (global error tracking)

## Quick Start

### 1. Enable in Root Layout

```tsx
// app/layout.tsx
import { PerformanceMonitor } from '@/lib/performanceMonitoring'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PerformanceMonitor>
          {children}
        </PerformanceMonitor>
      </body>
    </html>
  )
}
```

### 2. Track Web Vitals

```tsx
// app/layout.tsx
import { reportWebVitals } from '@/lib/performanceMonitoring'

export { reportWebVitals }
```

### 3. Monitor Component Performance

```tsx
import { usePerformanceMonitor } from '@/lib/performanceMonitoring'

export function MyComponent() {
  usePerformanceMonitor('MyComponent')
  
  return <div>Content</div>
}
```

## Features

### Web Vitals Tracking

Automatically tracks Core Web Vitals:

- **CLS (Cumulative Layout Shift)**: Visual stability (good < 0.1)
- **FID (First Input Delay)**: Interactivity (good < 100ms)
- **FCP (First Contentful Paint)**: Load speed (good < 1.8s)
- **LCP (Largest Contentful Paint)**: Load speed (good < 2.5s)
- **TTFB (Time to First Byte)**: Server response (good < 800ms)
- **INP (Interaction to Next Paint)**: Responsiveness (good < 200ms)

Each metric is rated:
- ✅ **Good**: Optimal performance
- ⚠️ **Needs Improvement**: Moderate performance
- ❌ **Poor**: Performance issues

### API Performance Tracking

Track API request performance:

```tsx
import { trackApiPerformance } from '@/lib/performanceMonitoring'

async function fetchData() {
  const startTime = performance.now()
  
  try {
    const response = await fetch('/api/devices')
    const duration = performance.now() - startTime
    
    trackApiPerformance('/api/devices', duration, response.status)
    
    return await response.json()
  } catch (error) {
    const duration = performance.now() - startTime
    trackApiPerformance('/api/devices', duration, 0, error.message)
    throw error
  }
}
```

**Automatic Alerts:**
- API calls > 1s are flagged as slow
- Failed requests are logged with error details

### Component Render Monitoring

Track component render performance:

```tsx
import { usePerformanceMonitor } from '@/lib/performanceMonitoring'

export function ExpensiveComponent() {
  usePerformanceMonitor('ExpensiveComponent')
  
  // Complex rendering logic
  return <div>...</div>
}
```

**Automatic Alerts:**
- Renders > 100ms are flagged as slow
- Includes component name and duration

### User Interaction Tracking

Track user actions:

```tsx
import { trackInteraction } from '@/lib/performanceMonitoring'

function handleButtonClick() {
  trackInteraction('button-click', {
    buttonId: 'save-device',
    deviceId: device.id,
  })
  
  // Handle click
}
```

### Error Tracking

Track runtime errors:

```tsx
import { trackError } from '@/lib/performanceMonitoring'

try {
  riskyOperation()
} catch (error) {
  trackError(error as Error, {
    context: 'device-save',
    deviceId: device.id,
  })
}
```

**Global Error Tracking:**
- Unhandled errors are automatically tracked
- Promise rejections are captured
- Stack traces included in development

### Resource Timing

Monitors slow-loading resources:

```tsx
import { observeResourceTiming } from '@/lib/performanceMonitoring'

useEffect(() => {
  const cleanup = observeResourceTiming()
  return cleanup
}, [])
```

**Automatic Alerts:**
- Resources > 2s are flagged as slow
- Includes resource URL, size, and type

### Long Task Detection

Monitors main thread blocking:

```tsx
import { observeLongTasks } from '@/lib/performanceMonitoring'

useEffect(() => {
  const cleanup = observeLongTasks()
  return cleanup
}, [])
```

**Automatic Alerts:**
- Tasks > 50ms are tracked
- Helps identify JavaScript blocking rendering

### Memory Usage Monitoring

Track memory consumption:

```tsx
import { getMemoryUsage } from '@/lib/performanceMonitoring'

const memory = getMemoryUsage()
console.log('Memory usage:', memory?.percentage.toFixed(2) + '%')
```

**Automatic Alerts:**
- Memory > 80% triggers warning
- Checked every 30 seconds when monitoring is active

## Analytics Integration

### Google Analytics

The monitoring system sends data to Google Analytics if `gtag` is available:

```html
<!-- Add to app/layout.tsx head -->
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

### Custom Analytics Endpoint

Create an API endpoint to receive metrics:

```ts
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const data = await request.json()
  
  // Store in database
  // await db.analytics.create({ data })
  
  // Or send to external service
  // await externalService.track(data)
  
  return NextResponse.json({ success: true })
}
```

## Performance Metrics Reference

### Web Vitals

| Metric | Good | Needs Improvement | Poor | Unit |
|--------|------|-------------------|------|------|
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 | score |
| FID | ≤ 100 | ≤ 300 | > 300 | ms |
| FCP | ≤ 1800 | ≤ 3000 | > 3000 | ms |
| LCP | ≤ 2500 | ≤ 4000 | > 4000 | ms |
| TTFB | ≤ 800 | ≤ 1800 | > 1800 | ms |
| INP | ≤ 200 | ≤ 500 | > 500 | ms |

### Custom Metrics

| Metric | Threshold | Description |
|--------|-----------|-------------|
| API Request | > 1000ms | Slow API calls |
| Component Render | > 100ms | Slow component renders |
| Resource Load | > 2000ms | Slow-loading assets |
| Long Task | > 50ms | Main thread blocking |
| Memory Usage | > 80% | High memory consumption |

## Best Practices

### 1. Monitor Critical Components

Focus on components that:
- Render frequently
- Process large datasets
- Perform expensive calculations

```tsx
// Good: Monitor expensive list component
export function DeviceList({ devices }: { devices: Device[] }) {
  usePerformanceMonitor('DeviceList')
  return <VirtualList items={devices} />
}
```

### 2. Track Important User Flows

Track key interactions:

```tsx
function handleDeviceCreate() {
  trackInteraction('device-create-start')
  
  // Create device
  
  trackInteraction('device-create-complete', { deviceId })
}
```

### 3. Optimize Based on Data

Use metrics to identify bottlenecks:
- High LCP → Optimize images/fonts
- High CLS → Fix layout shifts
- Slow API calls → Add caching
- Long tasks → Split work with `requestIdleCallback`

### 4. Development vs Production

Different behaviors:

**Development:**
- Console logging enabled
- Detailed error messages
- Real-time alerts

**Production:**
- Console logging disabled
- Metrics sent to analytics
- Error reporting to monitoring service

### 5. Privacy Considerations

Be mindful of PII:

```tsx
// Bad: Tracking sensitive data
trackInteraction('login', { username, password })

// Good: Track without PII
trackInteraction('login', { method: 'password' })
```

## Troubleshooting

### Web Vitals Not Appearing

1. Ensure `reportWebVitals` is exported from `app/layout.tsx`
2. Check browser console for errors
3. Verify analytics endpoint is working

### High Memory Usage Warnings

1. Check for memory leaks in components
2. Review large state objects
3. Ensure proper cleanup in `useEffect`

### Slow API Calls

1. Add response caching
2. Implement request debouncing
3. Use pagination for large datasets
4. Consider server-side rendering

### Long Tasks Detected

1. Use `React.memo` for expensive components
2. Split work with `requestIdleCallback`
3. Move calculations to Web Workers
4. Implement code splitting

## Example: Complete Monitoring Setup

```tsx
// app/layout.tsx
import { PerformanceMonitor, reportWebVitals } from '@/lib/performanceMonitoring'

export { reportWebVitals }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PerformanceMonitor>
          {children}
        </PerformanceMonitor>
      </body>
    </html>
  )
}

// components/DeviceList.tsx
import { usePerformanceMonitor } from '@/lib/performanceMonitoring'
import { trackInteraction } from '@/lib/performanceMonitoring'

export function DeviceList() {
  usePerformanceMonitor('DeviceList')
  
  const handleCreate = () => {
    trackInteraction('device-create-initiated')
    // Handle create
  }
  
  return (
    <div>
      <button onClick={handleCreate}>Create Device</button>
      {/* Device list */}
    </div>
  )
}

// lib/api/devices.ts
import { trackApiPerformance } from '@/lib/performanceMonitoring'

export async function getDevices() {
  const startTime = performance.now()
  
  try {
    const response = await fetch('/api/devices')
    const duration = performance.now() - startTime
    
    trackApiPerformance('/api/devices', duration, response.status)
    
    return await response.json()
  } catch (error) {
    const duration = performance.now() - startTime
    trackApiPerformance('/api/devices', duration, 0, (error as Error).message)
    throw error
  }
}
```

## Next Steps

1. **Enable Monitoring**: Add `<PerformanceMonitor>` to root layout
2. **Set Up Analytics**: Create `/api/analytics` endpoint or configure GA
3. **Monitor Critical Paths**: Add tracking to key components
4. **Review Metrics**: Check performance data weekly
5. **Optimize**: Address performance issues based on data

## Related Documentation

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Bundle Optimization](./BUNDLE_OPTIMIZATION.md)
