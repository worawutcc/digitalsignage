# Quickstart: Enhanced Backoffice Admin UI

## Overview
This guide provides a rapid setup path for implementing the enhanced digital signage backoffice admin UI. The implementation builds upon existing Next.js infrastructure and adds comprehensive admin functionality.

## Prerequisites

### Development Environment
- Node.js 18.x or later
- npm or yarn package manager
- Git for version control
- VS Code with recommended extensions

### Existing Infrastructure
- Digital signage backend API running
- PostgreSQL database with existing schema
- AWS S3 bucket for media storage
- JWT authentication system configured

## Quick Setup (15 minutes)

### 1. Environment Configuration
```bash
# Navigate to web project directory
cd src/digital-signage-web

# Install additional dependencies
npm install @reduxjs/toolkit react-query @tanstack/react-query lucide-react
npm install @hookform/resolvers zod framer-motion recharts
npm install -D @types/node @types/react @types/react-dom

# Update existing package.json to remove conflicting dependencies
npm uninstall heroicons swr
```

### 2. Configuration Files

**Update `next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-s3-bucket.s3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/your-bucket-name/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
}

module.exports = nextConfig
```

**Update `.env.local`:**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret

# AWS S3 (for presigned URL generation)
NEXT_PUBLIC_S3_BUCKET=your-media-bucket
NEXT_PUBLIC_S3_REGION=us-west-2
```

### 3. Core Infrastructure Setup

**Create Redux Store (`src/store/index.ts`):**
```typescript
import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'
import devicesSlice from './slices/devicesSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    devices: devicesSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

**Create API Client (`src/lib/api.ts`):**
```typescript
import axios from 'axios'
import type { ApiResponse } from '@/types/api'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiry
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

**Setup React Query (`src/app/providers.tsx`):**
```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  )
}
```

### 4. Root Layout Update

**Update `src/app/layout.tsx`:**
```typescript
import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Digital Signage Admin',
  description: 'Comprehensive digital signage management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### 5. Basic Component Structure

**Create Sidebar (`src/components/layouts/Sidebar.tsx`):**
```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Monitor, 
  FileImage, 
  Calendar, 
  Users, 
  Settings,
  BarChart3 
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Devices', href: '/devices', icon: Monitor },
  { name: 'Content', href: '/content', icon: FileImage },
  { name: 'Schedules', href: '/schedules', icon: Calendar },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-semibold text-white">Digital Signage</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
```

**Create Admin Layout (`src/components/layouts/AdminLayout.tsx`):**
```typescript
'use client'
import { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

### 6. Dashboard Page

**Create Dashboard (`src/app/dashboard/page.tsx`):**
```typescript
import AdminLayout from '@/components/layouts/AdminLayout'
import DashboardStats from '@/components/dashboard/DashboardStats'

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Overview of your digital signage system
          </p>
        </div>
        <DashboardStats />
      </div>
    </AdminLayout>
  )
}
```

**Create Dashboard Stats (`src/components/dashboard/DashboardStats.tsx`):**
```typescript
'use client'
import { useQuery } from '@tanstack/react-query'
import { Monitor, FileImage, Calendar, Users } from 'lucide-react'
import api from '@/lib/api'

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/analytics/dashboard?period=24h').then(res => res.data.data),
  })

  const metrics = [
    {
      name: 'Total Devices',
      value: stats?.summary?.totalDevices || 0,
      icon: Monitor,
      color: 'bg-blue-500',
    },
    {
      name: 'Online Devices', 
      value: stats?.summary?.onlineDevices || 0,
      icon: Monitor,
      color: 'bg-green-500',
    },
    {
      name: 'Media Files',
      value: stats?.summary?.totalMedia || 0,
      icon: FileImage,
      color: 'bg-purple-500',
    },
    {
      name: 'Active Schedules',
      value: stats?.summary?.activeSchedules || 0,
      icon: Calendar,
      color: 'bg-orange-500',
    },
  ]

  if (isLoading) {
    return <div>Loading stats...</div>
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-md ${metric.color}`}>
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {metric.name}
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {metric.value.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
# Access admin interface at http://localhost:3001/dashboard
```

### 2. Backend Integration
Ensure your backend API is running and accessible:
```bash
# Test API connectivity
curl http://localhost:5000/api/health
```

### 3. Authentication Setup
Implement login page at `/login` that:
- Collects username/password
- Makes POST request to `/api/auth/login`
- Stores JWT token in localStorage
- Redirects to dashboard on success

## Next Steps (Next 30 minutes)

### 1. Implement Core Features
- **Device Management**: List, filter, and manage devices
- **Media Library**: Upload, organize, and preview media files
- **Schedule Builder**: Visual schedule creation and management
- **User Management**: Role-based user administration

### 2. Add Real-time Features
```bash
# Install WebSocket client
npm install ws @types/ws

# Implement real-time device status updates
# Add notification system for alerts
# Enable live dashboard metrics
```

### 3. Enhanced Components
```bash
# Add advanced table functionality
npm install @tanstack/react-table

# Add form validation
npm install react-hook-form @hookform/resolvers zod

# Add charts and analytics
npm install recharts
```

## File Structure After Setup

```
src/digital-signage-web/
├── src/
│   ├── app/
│   │   ├── dashboard/page.tsx          ✅ Created
│   │   ├── devices/page.tsx            → Next: Device list
│   │   ├── content/page.tsx            → Next: Media library
│   │   ├── schedules/page.tsx          → Next: Schedule builder
│   │   ├── layout.tsx                  ✅ Updated
│   │   └── providers.tsx               ✅ Created
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── AdminLayout.tsx         ✅ Created
│   │   │   └── Sidebar.tsx             ✅ Created
│   │   ├── dashboard/
│   │   │   └── DashboardStats.tsx      ✅ Created
│   │   └── ui/                         → Next: Base components
│   ├── lib/
│   │   └── api.ts                      ✅ Created
│   ├── store/
│   │   └── index.ts                    ✅ Created
│   └── types/
│       └── api.ts                      → Next: Type definitions
└── package.json                        ✅ Updated
```

## Common Issues & Solutions

### 1. API Connection Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_API_URL

# Verify backend is running
curl -I http://localhost:5000/api/health

# Check CORS configuration on backend
```

### 2. Authentication Problems
```typescript
// Clear localStorage if token issues
localStorage.removeItem('token')

// Check JWT token expiry
const token = localStorage.getItem('token')
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]))
  console.log('Token expires:', new Date(payload.exp * 1000))
}
```

### 3. Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

## Testing the Setup

### 1. Verify Dashboard Access
- Navigate to `http://localhost:3001/dashboard`
- Should see dashboard with navigation sidebar
- Stats cards should load (may show 0 if no data)

### 2. Check API Integration
- Open browser dev tools → Network tab
- Refresh dashboard page
- Should see API request to `/analytics/dashboard`

### 3. Verify Authentication Flow
- Navigate to a protected route
- Should redirect to login if no token
- After login, should return to intended page

This quickstart provides a solid foundation for the enhanced admin UI. The next implementation phase focuses on building out individual feature modules with full CRUD operations, real-time updates, and advanced UI components.