# Production Build Guide (T068)

## Overview
Complete guide for building the Digital Signage Admin Backoffice for production deployment. This document covers build prerequisites, commands, optimization verification, and troubleshooting.

**Phase**: 1 - User Schedule Assignment  
**Framework**: Next.js 15 with App Router  
**Build Tool**: Next.js built-in (Turbopack)  
**Last Updated**: October 2, 2025

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Build Commands](#build-commands)
4. [Build Output Analysis](#build-output-analysis)
5. [Optimization Verification](#optimization-verification)
6. [Troubleshooting](#troubleshooting)
7. [Build Checklist](#build-checklist)

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended | Why |
|-------------|---------|-------------|-----|
| **Node.js** | 18.17+ | 20.x LTS | Next.js 15 requirement |
| **npm** | 9.0+ | 10.x | Package management |
| **Memory** | 4 GB RAM | 8 GB RAM | Build process |
| **Disk Space** | 2 GB free | 5 GB free | node_modules + build output |
| **OS** | Any | Linux/macOS | Production-like environment |

### Verify Node.js Version

```bash
node --version
# Expected: v18.17.0 or higher

npm --version
# Expected: 9.0.0 or higher
```

### Clean Install Dependencies

```bash
# Remove existing node_modules and lock file
rm -rf node_modules package-lock.json

# Fresh install
npm install

# Verify no vulnerabilities
npm audit
# Expected: 0 vulnerabilities (or low severity only)
```

### Verify TypeScript Compilation

```bash
# Check for TypeScript errors
npm run type-check
# Expected: No errors

# Or manually:
npx tsc --noEmit
```

### Run Linter

```bash
# Check for linting errors
npm run lint
# Expected: No errors or warnings

# Auto-fix if possible:
npm run lint -- --fix
```

---

## Environment Variables

### Production Environment Variables

Create `.env.production` file in project root:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.digitalsignage.example.com
NEXT_PUBLIC_API_TIMEOUT=10000

# Authentication
NEXT_PUBLIC_AUTH_TOKEN_KEY=ds_auth_token

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true

# Build Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Optional: Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-token

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Environment Variable Validation

**Critical Variables** (must be set):
- ✅ `NEXT_PUBLIC_API_URL` - Backend API endpoint
- ✅ `NODE_ENV=production` - Production mode

**Optional Variables**:
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Google Analytics
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Analytics ID

### Check Environment Variables

```bash
# Display environment variables (sanitized)
npm run env:check

# Or manually check:
echo $NEXT_PUBLIC_API_URL
echo $NODE_ENV
```

**Security Warning** ⚠️:
- NEVER commit `.env.production` to Git
- Use `.env.production.example` as template
- Store secrets in CI/CD environment variables

---

## Build Commands

### Standard Production Build

```bash
# Build for production
npm run build

# Expected output:
# - ✓ Compiled successfully
# - Route (App)                                Size     First Load JS
# - ○ /                                       X kB         Y kB
# - ○ /schedules/users                        X kB         Y kB
# - Total First Load JS                       ~180 kB
```

**Build Process Steps**:
1. ✅ TypeScript compilation
2. ✅ Code optimization (minification, tree-shaking)
3. ✅ CSS processing (Tailwind CSS purge)
4. ✅ Image optimization
5. ✅ Static page generation (if applicable)
6. ✅ Bundle analysis

### Build with Analysis

```bash
# Build with bundle analysis
ANALYZE=true npm run build

# Opens webpack bundle analyzer in browser
# Expected: Visualizes bundle sizes
```

### Build Output Structure

```
.next/
├── cache/                    # Build cache (reusable)
├── server/                   # Server-side code
│   ├── app/                  # App Router pages
│   └── chunks/               # Shared chunks
├── static/                   # Static assets
│   ├── chunks/               # JavaScript chunks
│   ├── css/                  # CSS files
│   └── media/                # Images, fonts
└── build-manifest.json       # Build metadata
```

### Build Time Expectations

| Project Size | Build Time | Notes |
|-------------|------------|-------|
| Small (< 50 pages) | 30-60s | Initial build |
| Medium (50-200 pages) | 1-2 min | Phase 1 (~10 pages) |
| Large (200+ pages) | 2-5 min | Future phases |
| Incremental | 5-15s | Cached build |

---

## Build Output Analysis

### Route Analysis

After build, Next.js displays route information:

```
Route (App)                                Size     First Load JS
┌ ○ /                                      142 B    83.2 kB
├ ○ /schedules/users                       8.45 kB  91.7 kB
└ ○ /schedules/users/[userId]              5.23 kB  88.5 kB

○ (Static)  automatically rendered as static HTML (no data fetching)
```

**Symbols**:
- **○** Static - Pre-rendered at build time
- **●** SSG - Static Site Generation (with data)
- **λ** Server - Server-side rendered on-demand

### Size Breakdown

| Metric | Target | Notes |
|--------|--------|-------|
| **First Load JS** | < 200 KB | Initial page load |
| **Page Size** | < 50 KB | Per page (excluding shared) |
| **Shared Chunks** | < 150 KB | React, Next.js, common code |
| **Total Size** | < 500 KB | All assets combined |

### Analyze Bundle Size

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js:
# const withBundleAnalyzer = require('@next/bundle-analyzer')({
#   enabled: process.env.ANALYZE === 'true',
# })
# module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

**Bundle Analyzer Output**:
- Opens `http://localhost:8888` in browser
- Shows visual tree map of bundle sizes
- Identify large dependencies (e.g., moment.js → use date-fns instead)

---

## Optimization Verification

### 1. Bundle Size Check ✅

**Target**: < 200 KB First Load JS

```bash
# Check build output for sizes
npm run build | grep "First Load JS"

# Expected:
# Total First Load JS: ~180 kB
```

**If too large** (> 200 KB):
- Check for large dependencies (use bundle analyzer)
- Ensure tree-shaking enabled
- Use dynamic imports for heavy components
- Remove unused dependencies

### 2. TypeScript Strict Mode ✅

**Target**: 0 TypeScript errors

```bash
# Verify TypeScript strict mode
npm run type-check

# Expected:
# ✓ No TypeScript errors found
```

**If errors**:
- Fix all TypeScript errors before building
- Check `tsconfig.json` has `"strict": true`
- Ensure all components properly typed

### 3. Lighthouse Performance ✅

**Target**: Performance Score ≥ 90

```bash
# Start production server
npm run build
npm run start

# Run Lighthouse (Chrome DevTools)
# 1. Open Chrome DevTools (F12)
# 2. Go to "Lighthouse" tab
# 3. Select "Performance" category
# 4. Click "Analyze page load"
```

**Expected Metrics**:
| Metric | Target | Notes |
|--------|--------|-------|
| **Performance** | ≥ 90 | Overall score |
| **First Contentful Paint** | < 1.5s | First visible content |
| **Largest Contentful Paint** | < 2.5s | Largest element visible |
| **Time to Interactive** | < 3.0s | Page fully interactive |
| **Total Blocking Time** | < 200ms | Main thread blocking |
| **Cumulative Layout Shift** | < 0.1 | Visual stability |

**Screenshot Placeholder**: ![Lighthouse Report](./screenshots/lighthouse-production.png)

### 4. CSS Optimization ✅

**Verify Tailwind CSS Purge**:

```bash
# Check CSS file size
ls -lh .next/static/css/*.css

# Expected: < 50 KB (purged, minified)
```

**If too large** (> 100 KB):
- Ensure Tailwind purge enabled in `tailwind.config.js`
- Remove unused CSS classes
- Check for duplicate styles

### 5. Image Optimization ✅

**Verify Next.js Image Optimization**:

```tsx
// Use Next.js Image component
import Image from 'next/image'

<Image 
  src="/schedule-icon.png" 
  alt="Schedule"
  width={40}
  height={40}
/>
```

**Benefits**:
- Automatic WebP conversion
- Lazy loading
- Responsive images
- Size optimization

### 6. Code Splitting ✅

**Verify Dynamic Imports**:

```tsx
// Heavy components loaded dynamically
import dynamic from 'next/dynamic'

const ScheduleSelector = dynamic(
  () => import('@/components/ScheduleSelector'),
  { loading: () => <SkeletonCard /> }
)
```

**Check Build Output**:
```
Route (App)                                Size     First Load JS
├ ○ /schedules/users                       8.45 kB  91.7 kB
└   └ ScheduleSelector.js                  12.3 kB  (loaded on demand)
```

---

## Troubleshooting

### Common Build Errors

#### 1. Out of Memory Error

**Error**:
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or add to package.json scripts:
# "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

#### 2. TypeScript Errors

**Error**:
```
Type error: Property 'xyz' does not exist on type 'ABC'
```

**Solution**:
```bash
# Run type check to see all errors
npm run type-check

# Fix all TypeScript errors
# Then rebuild
npm run build
```

**Common TypeScript Issues**:
- Missing props interface
- Incorrect type imports
- `any` type usage
- Missing return types

#### 3. Module Not Found

**Error**:
```
Module not found: Can't resolve '@/components/XYZ'
```

**Solution**:
```bash
# Check tsconfig.json paths
cat tsconfig.json | grep "paths"

# Expected:
# "@/*": ["./src/*"]

# Verify file exists
ls src/components/XYZ.tsx

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. CSS Errors (Tailwind)

**Error**:
```
Error: Cannot find module 'tailwindcss/plugin'
```

**Solution**:
```bash
# Reinstall Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Verify tailwind.config.js exists
ls tailwind.config.js

# Rebuild
npm run build
```

#### 5. Environment Variable Not Set

**Error**:
```
Error: NEXT_PUBLIC_API_URL is not defined
```

**Solution**:
```bash
# Check .env.production exists
ls .env.production

# Verify variable set
cat .env.production | grep NEXT_PUBLIC_API_URL

# Expected:
# NEXT_PUBLIC_API_URL=https://api.example.com

# Rebuild with explicit env
NEXT_PUBLIC_API_URL=https://api.example.com npm run build
```

#### 6. Dependency Conflicts

**Error**:
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution**:
```bash
# Check for conflicting versions
npm ls react

# Use legacy peer deps (temporary)
npm install --legacy-peer-deps

# Or update dependencies
npm update

# Or force install (not recommended)
npm install --force
```

### Build Performance Issues

#### Slow Build Times (> 5 min)

**Diagnosis**:
```bash
# Profile build
DEBUG=* npm run build 2>&1 | grep "duration"
```

**Solutions**:
1. **Enable Incremental Builds**:
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "incremental": true
     }
   }
   ```

2. **Use SWC Instead of Babel**:
   ```js
   // next.config.js
   module.exports = {
     swcMinify: true, // Already default in Next.js 13+
   }
   ```

3. **Reduce Build Scope**:
   - Remove unused pages
   - Use dynamic imports
   - Split large components

4. **Increase Memory**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=8192" npm run build
   ```

#### Large Bundle Size (> 500 KB)

**Diagnosis**:
```bash
# Analyze bundle
ANALYZE=true npm run build
```

**Solutions**:
1. **Remove Large Dependencies**:
   ```bash
   # Example: Replace moment.js with date-fns
   npm uninstall moment
   npm install date-fns
   ```

2. **Use Dynamic Imports**:
   ```tsx
   // Before: Always loaded
   import HeavyComponent from './HeavyComponent'

   // After: Loaded on demand
   const HeavyComponent = dynamic(() => import('./HeavyComponent'))
   ```

3. **Enable Tree Shaking**:
   ```js
   // Import specific functions, not entire library
   // Bad:
   import _ from 'lodash'

   // Good:
   import debounce from 'lodash/debounce'
   ```

4. **Optimize Images**:
   - Use Next.js `Image` component
   - Compress images (TinyPNG, ImageOptim)
   - Use WebP format

---

## Build Checklist

### Pre-Build Checklist ✅

- [ ] Node.js version ≥ 18.17
- [ ] All dependencies installed (`npm install`)
- [ ] No dependency vulnerabilities (`npm audit`)
- [ ] TypeScript strict mode passes (`npm run type-check`)
- [ ] Linter passes (`npm run lint`)
- [ ] Unit tests pass (`npm test`)
- [ ] Environment variables set (`.env.production`)
- [ ] `NEXT_PUBLIC_API_URL` configured correctly
- [ ] Git repository clean (no uncommitted changes)

### Build Execution ✅

- [ ] Run `npm run build` successfully
- [ ] Build completes in < 5 minutes
- [ ] No build errors or warnings
- [ ] Build output shows all routes
- [ ] First Load JS < 200 KB
- [ ] No TypeScript errors
- [ ] No ESLint errors

### Post-Build Verification ✅

- [ ] Production server starts (`npm run start`)
- [ ] Homepage loads successfully
- [ ] All routes accessible
- [ ] API calls work (check Network tab)
- [ ] Authentication works
- [ ] Lighthouse Performance ≥ 90
- [ ] Core Web Vitals: All "Good"
- [ ] No console errors
- [ ] No 404 errors
- [ ] Images load correctly
- [ ] CSS styles applied

### Bundle Analysis ✅

- [ ] Run bundle analyzer (`ANALYZE=true npm run build`)
- [ ] Total bundle size < 500 KB
- [ ] First Load JS < 200 KB
- [ ] No duplicate dependencies
- [ ] Tree shaking enabled
- [ ] Code splitting working

### Security Checks ✅

- [ ] `.env.production` not committed to Git
- [ ] No hardcoded secrets in code
- [ ] API keys stored securely
- [ ] HTTPS enforced (check `next.config.js`)
- [ ] Content Security Policy configured
- [ ] No sensitive data in client-side code

---

## Production Build Commands Reference

```bash
# Basic Commands
npm run build                  # Build for production
npm run start                  # Start production server
npm run type-check             # Check TypeScript
npm run lint                   # Run ESLint

# Advanced Commands
ANALYZE=true npm run build     # Build with bundle analysis
NODE_OPTIONS="--max-old-space-size=4096" npm run build  # Increase memory
DEBUG=* npm run build          # Debug build process

# Verification Commands
npm audit                      # Check vulnerabilities
npm outdated                   # Check outdated dependencies
npx next info                  # Show Next.js environment info
```

---

## Environment-Specific Builds

### Development Build
```bash
npm run dev
# - Fast rebuilds (HMR)
# - Source maps enabled
# - Error overlay
# - Not optimized
```

### Production Build
```bash
npm run build
npm run start
# - Optimized bundles
# - Minified code
# - Source maps disabled (or external)
# - Ready for deployment
```

### Staging Build
```bash
# Use .env.staging
cp .env.staging .env.production
npm run build
npm run start
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Production Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next/
```

---

## Next Steps After Build

1. **Test Production Build Locally**:
   ```bash
   npm run start
   # Visit http://localhost:3000
   ```

2. **Run Lighthouse Audit**:
   - Performance ≥ 90
   - Accessibility ≥ 90
   - Best Practices ≥ 90
   - SEO ≥ 90

3. **Deploy to Staging**:
   - Follow deployment guide (T069)
   - Run smoke tests
   - Verify all features

4. **Deploy to Production**:
   - Follow deployment checklist
   - Monitor errors (Sentry)
   - Monitor performance (Lighthouse CI)

---

## Related Documentation

- [Manual Testing Guide](./manual-testing-guide.md) - Test scenarios
- [Deployment Guide](./deployment-guide.md) - Staging/Production deployment (T069)
- [QA Validation Checklist](./qa-checklist.md) - Final QA checklist (T070)
- [README](../src/digital-signage-web/README.md) - Getting Started

---

**Last Updated**: October 2, 2025  
**Status**: Production Ready ✅  
**Next**: T069 Staging Deployment Guide
