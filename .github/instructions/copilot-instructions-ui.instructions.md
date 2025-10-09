---
applyTo: 'src/digital-signage-web/**'
---
# 🤖 GitHub Copilot Instructions for Digital Signage Next.js Project
## Template for creating and maintaining a Next.js frontend application with clean architecture.

Auto-generated for Next.js Frontend. Last updated: 2025-10-03

**Scope:** This guide applies exclusively to the Digital Signage web frontend development (Next.js 15, React 18, TypeScript). For API/backend development, refer to `copilot-instructions-api.instructions.md`.

## Active Technologies
- **Next.js 15** with App Router (React 18, TypeScript)
- **Tailwind CSS 4** with custom design system and PostCSS configuration
- **React Query/TanStack Query** for server state management  
- **Redux Toolkit** for global state management
- **React Hook Form** + **Zod** for form validation
- **Axios** for API calls
- **shadcn/ui** or **Radix UI** for accessible components
- **Lucide React** for icons
- **clsx** or **tailwind-variants** for conditional styling

## Frontend Project Structure (Web Only)
```
digital_signage/
├── src/
│   ├── digital-signage-web/         # Frontend Application
│   │   ├── src/
│   │   │   ├── app/                 # Next.js 13+ App Router
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   └── types.ts
│   │   │   │   ├── (auth)/         # Route groups
│   │   │   │   ├── admin/          # Admin pages
│   │   │   │   ├── devices/        # Device management
│   │   │   │   ├── media/          # Media library
│   │   │   │   ├── layout.tsx      # Root layout
│   │   │   │   └── page.tsx        # Home page
│   │   │   │
│   │   │   ├── components/         # Reusable UI components
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   └── Button.types.ts
│   │   │   │   ├── Header/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   └── Header.types.ts
│   │   │   │   └── ui/             # Base UI components
│   │   │   │
│   │   │   ├── features/           # Feature-based organization
│   │   │   │   ├── devices/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── DeviceCard.tsx
│   │   │   │   │   │   └── DeviceCard.types.ts
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useDevices.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── deviceService.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── auth/
│   │   │   │   │   └── ...
│   │   │   │   └── media/
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── hooks/              # Global custom hooks
│   │   │   │   └── useLocalStorage.ts
│   │   │   │
│   │   │   ├── lib/                # Utilities / infrastructure
│   │   │   │   ├── api.ts         # Axios configuration
│   │   │   │   ├── auth.ts        # JWT authentication
│   │   │   │   └── utils.ts       # Helper functions
│   │   │   │
│   │   │   ├── services/          # Business logic / API integration
│   │   │   │   └── analyticsService.ts
│   │   │   │
│   │   │   ├── store/             # Redux store
│   │   │   │   ├── index.ts       # configureStore
│   │   │   │   ├── rootReducer.ts
│   │   │   │   └── slices/
│   │   │   │       ├── authSlice.ts
│   │   │   │       └── devicesSlice.ts
│   │   │   │
│   │   │   └── types/             # Global types/interfaces
│   │   │       └── index.ts
│   │   ├── public/                # Static assets
│   │   ├── tests/                 # Test files
│   │   ├── .env.local             # Environment variables
│   │   ├── next.config.js         # Next.js configuration
│   │   ├── tsconfig.json          # TypeScript configuration
│   │   ├── tailwind.config.js     # Tailwind configuration
│   │   ├── postcss.config.mjs     # PostCSS configuration
│   │   └── package.json
│   └── DigitalSignage.*/          # Backend projects (see API instructions)
└── DigitalSignage.sln             # Solution file
```

**Note:** This guide covers only the frontend web application in `src/digital-signage-web/`. Backend API development is handled separately with its own instruction file.

## System Overview: Admin-Only Digital Signage Management

**System Architecture:** This is an **admin-only** digital signage management system with **no public user registration**

**User Access Model:**
- **Administrators Only**: Full web dashboard access via admin authentication
- **No Public Users**: No user sign-up, registration, or public access
- **Device Registration**: Android TV devices self-register via PIN-based approval workflow

**Core Admin Features:**
- **Content Management**: Upload, organize, and manage media files (images, videos, HTML widgets)
- **Device Management**: Approve/reject Android TV self-registrations, monitor device status
- **Schedule Management**: Create time-based content schedules with priority and recurrence
- **Playlist Management**: Build content sequences with automatic fallback
- **Real-time Monitoring**: Live device status, heartbeat monitoring, connection tracking
- **System Analytics**: Usage statistics, device performance metrics

**Authentication Flow:**
- **Admin Login**: JWT-based authentication for dashboard access
- **No User Registration**: Remove all public sign-up flows and registration forms
- **Device Authentication**: Separate PIN-based workflow for Android TV devices

## General Guidelines
- Use **TypeScript** instead of JavaScript.
- Follow **Next.js 13+ App Router** structure (`app/` instead of `pages/`).
- Use **Layout Groups** for shared layouts without URL segments (e.g., `(dashboard)/`).
- Use **functional components** with React Hooks, no class components.
- Prefer **async/await** over `.then()`.
- Use **absolute imports** (`@/components/...`, `@/lib/...`).
- Keep code **modular**: split into `components/`, `features/`, `hooks/`, `lib/`, `services/`.
- **Separate interfaces and types from components**: Put them in dedicated `*.types.ts` files or `types/` folder.

## Frontend Architecture & Rules

### Component Development Rules
- **Server Components by default**: Use Client Components only when needed (prefer Server Components unless explicitly asked for client-side)
- **TypeScript Strict Mode**: All components must be fully typed
- **Functional Components**: Use React Hooks, no class components
- **Single Responsibility**: Each component has one clear purpose
- **Props Interface**: Always define explicit props interfaces in separate `.types.ts` files
- **Default to clean and minimal code**
- **Add JSDoc or TSDoc comments** for functions and exported utilities

```typescript
// Button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

// Button.tsx
import { ButtonProps } from './Button.types'

/**
 * Reusable button component with variants and loading states
 */
export function Button({ 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  )
}
```

### API Integration Rules

```typescript
// lib/api.ts - Axios configuration
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { apiClient }

// features/devices/hooks/useDevices.ts - React Query Hook
import { useQuery } from '@tanstack/react-query'
import { deviceService } from '../services/deviceService'

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: deviceService.getAll,
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  })
}
```

#### Service Layer API Calls
**Always use the configured `apiClient` from `/lib/api.ts` for all API calls in service files.**
- Do NOT use direct `axios` imports in any service file.
- The `apiClient` handles authentication token injection, error handling, and global interceptors.
- Example pattern:
  ```ts
  import { apiClient } from '@/lib/api';
  // ...existing code...
  export const getAllPlaylists = async () => {
    const response = await apiClient.get('/api/playlists');
    return response.data;
  };
  // ...existing code...
  ```
- All service methods (CRUD, fetch, etc.) must use `apiClient` for compliance and security.

**Do not import or use `axios` directly in any service file.**

Refer to migration report `/docs/SERVICES-APICLIENT-MIGRATION.md` for audit history and compliance status.

#### API Response Mapping & Data Binding
**CRITICAL: Always verify backend API response structure before mapping to frontend models.**

**Common Mistakes to Avoid:**
1. ❌ **Assuming wrapped responses**: Not all endpoints wrap data in `{ data: [], items: [] }`
2. ❌ **Missing null checks**: Backend may return `null` or `undefined` for optional fields
3. ❌ **Wrong property names**: Backend uses different naming (e.g., `fileName` vs `name`)

**Best Practices:**
1. ✅ **Check API controller response type** - Verify what the backend returns
   ```csharp
   // Backend: MediaController.cs
   [HttpGet]
   public async Task<ActionResult<IEnumerable<MediaDto>>> GetMedia()
   {
       return Ok(media); // Returns array directly, NOT wrapped
   }
   ```

2. ✅ **Add console logging** - Debug API responses during development
   ```typescript
   export async function getMedia(): Promise<MediaItem[]> {
     try {
       const response = await apiClient.get('/api/media');
       console.log('📦 Media API response:', response.data); // ← Debug log
       
       // Verify response structure
       const mediaArray = Array.isArray(response.data) ? response.data : [];
       
       return mediaArray.map((media: any) => ({
         id: media.id,
         name: media.fileName || media.name || 'Untitled', // ← Fallback values
         type: media.fileType || 'unknown',
       }));
     } catch (error) {
       console.error('❌ Failed to fetch media:', error);
       return []; // ← Always return empty array on error
     }
   }
   ```

3. ✅ **Use Array.isArray() guard** - Protect against unexpected response formats
   ```typescript
   // ❌ WRONG: Assumes response.data is always array
   return response.data.map(...)
   
   // ✅ CORRECT: Guard against non-array responses
   const dataArray = Array.isArray(response.data) ? response.data : [];
   return dataArray.map(...)
   ```

4. ✅ **Provide default values** - Handle missing/null fields gracefully
   ```typescript
   return mediaArray.map((media: any) => ({
     id: media.id,
     name: media.fileName || media.name || 'Untitled',     // ← Multiple fallbacks
     description: media.description || 'No description',    // ← Default text
     status: media.status || 'unknown',                     // ← Default status
     count: media.count || 0,                               // ← Default number
   }));
   ```

5. ✅ **Define TypeScript interfaces matching backend DTOs**
   ```typescript
   // Backend DTO (C#)
   public class MediaDto {
       public int Id { get; set; }
       public string FileName { get; set; }
       public MediaType FileType { get; set; }
       public long FileSize { get; set; }
   }
   
   // Frontend interface (TypeScript)
   export interface MediaItem {
     id: number;
     fileName: string;    // Match backend property names
     fileType: string;
     fileSize: number;
   }
   ```

**Response Structure Patterns:**

| Backend Return Type | Frontend Handling |
|---------------------|-------------------|
| `IEnumerable<T>` | Array directly: `response.data` |
| `List<T>` | Array directly: `response.data` |
| `PagedResult<T>` | Object: `response.data.items` |
| `ApiResponse<T>` | Object: `response.data.data` |
| Single object `T` | Object directly: `response.data` |

**Example: Correct API Response Mapping**
```typescript
// ✅ Complete example with all best practices
export async function getSchedules(): Promise<ScheduleItem[]> {
  try {
    const response = await apiClient.get('/api/admin/schedules');
    console.log('📅 Schedules API response:', response.data);
    
    // 1. Guard: Ensure array
    const schedulesArray = Array.isArray(response.data) ? response.data : [];
    
    // 2. Map with fallbacks
    return schedulesArray.map((schedule: any) => ({
      id: schedule.id,
      name: schedule.name || 'Untitled Schedule',        // Fallback
      description: schedule.description || 'No description', // Fallback
      status: schedule.status || 'active',                // Fallback
      priority: schedule.priority ?? 0,                   // Nullish coalescing for numbers
    }));
  } catch (error) {
    // 3. Error handling with logging
    console.error('❌ Failed to fetch schedules:', error);
    return []; // Always return empty array
  }
}
```

**Debugging Checklist:**
- [ ] Added console.log to see actual API response
- [ ] Verified backend controller return type
- [ ] Added Array.isArray() guard for array responses
- [ ] Provided default values for all optional fields
- [ ] Tested with empty API response (no data)
- [ ] Tested with API error (500, 404, etc.)
- [ ] TypeScript interface matches backend DTO

### Layout Groups & Routing Patterns

**CRITICAL: Use Layout Groups for shared layouts without adding URL segments**

#### Layout Group Structure (Current Implementation)
```
app/
├── layout.tsx                    # Root layout (HTML, fonts, providers)
├── page.tsx                      # "/" → redirect to /dashboard
├── (dashboard)/                  # Layout group (NOT in URL)
│   ├── layout.tsx               # Sidebar + AuthWrapper
│   ├── dashboard/page.tsx       # /dashboard
│   ├── devices/page.tsx         # /devices
│   ├── media/
│   │   ├── page.tsx            # /media
│   │   └── tags/page.tsx       # /media/tags
│   ├── playlists/page.tsx      # /playlists
│   └── schedules/page.tsx      # /schedules
├── login/page.tsx               # /login (outside layout group)
└── register/page.tsx            # /register (outside layout group)
```

#### Layout Group Best Practices

**✅ DO:**
1. **Use `(dashboard)` layout group for all authenticated pages**
   - Provides shared Sidebar and AuthWrapper
   - Clean URLs without `/dashboard` prefix
   - Layout persists across navigation (performance)

2. **Keep pages simple - NO wrapper components**
   ```tsx
   // ✅ CORRECT: pages/dashboard/page.tsx
   export default function DashboardPage() {
     return (
       <div className="space-y-6">
         <h1>Dashboard</h1>
         {/* content */}
       </div>
     )
   }
   ```

3. **Place shared UI in layout.tsx only**
   ```tsx
   // ✅ CORRECT: (dashboard)/layout.tsx
   export default function DashboardLayout({ children }) {
     return (
       <AuthWrapper>
         <div className="flex h-screen">
           <Sidebar />
           <main>{children}</main>
         </div>
       </AuthWrapper>
     )
   }
   ```

**❌ DON'T:**
1. **Never wrap pages with AdminLayout or similar components**
   ```tsx
   // ❌ WRONG: Creates duplicate Sidebar
   export default function Page() {
     return (
       <AdminLayout>
         <Content />
       </AdminLayout>
     )
   }
   ```

2. **Don't add AuthWrapper in individual pages**
   ```tsx
   // ❌ WRONG: AuthWrapper should be in layout only
   export default function Page() {
     return (
       <AuthWrapper>
         <Content />
       </AuthWrapper>
     )
   }
   ```

3. **Don't create nested layout wrappers**
   ```tsx
   // ❌ WRONG: Multiple layout wrappers
   (dashboard)/
     ├── layout.tsx        # Has Sidebar
     └── settings/
         ├── layout.tsx    # Don't add another Sidebar
         └── page.tsx
   ```

#### Layout Group Rules Summary
- **Single Source of Truth**: Only `(dashboard)/layout.tsx` provides Sidebar
- **Clean URLs**: Layout groups use `()` to avoid URL segments
- **Performance**: Persistent layouts don't re-render on navigation
- **Separation**: Public pages (login/register) outside layout group
- **No Wrapper Components**: Pages should start with simple div containers

### State Management Rules
- **Redux Toolkit**: For all state management (global state)
- **Server State**: React Query for API data
- **Form State**: React Hook Form for all forms  
- **URL State**: Next.js router for navigation state

```typescript
// store/slices/authSlice.ts - Redux Toolkit Pattern
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    loginFailure: (state) => {
      state.loading = false
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer
```

### Form Handling Rules
- **React Hook Form + Zod**: All forms use this combination
- **Type Safety**: Forms are fully typed with Zod schemas
- **Real-time Validation**: Client-side validation with server validation
- **Accessibility**: Proper form labels and error messages

```typescript
// Form Schema Pattern
const deviceSchema = z.object({
  name: z.string().min(1, 'Device name is required'),
  location: z.string().min(1, 'Location is required'),
  deviceGroupId: z.number().optional(),
  resolution: z.string().regex(/^\d+x\d+$/, 'Invalid resolution format'),
})

type DeviceFormData = z.infer<typeof deviceSchema>

// Form Component Pattern
export function DeviceForm({ onSubmit }: { onSubmit: (data: DeviceFormData) => void }) {
  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: '',
      location: '',
      resolution: '1920x1080',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Device Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter device name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  )
}
```

## Styling (Tailwind CSS 4)
- Use **TailwindCSS** for all styles.
- Install Tailwind CSS with PostCSS configuration:
  ```bash
  npm install tailwindcss @tailwindcss/postcss postcss
  ```
- Add **@tailwindcss/postcss** to your `postcss.config.mjs` file:
  ```javascript
  export default {
    plugins: {
      "@tailwindcss/postcss": {},
    }
  }
  ```
- Add **@import** to your CSS file:
  ```css
  @import "tailwindcss";
  ```
- Use **shadcn/ui** or **Radix UI** for accessible UI components.
- Keep className clean, use **clsx** or **tailwind-variants** when needed.
- **Responsive Design**: Mobile-first approach
- **Design System**: Custom color palette and spacing

```typescript
// Using tailwind-variants for component styling
import { tv } from 'tailwind-variants'

const buttonVariants = tv({
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    },
    size: {
      sm: "h-9 px-3",
      md: "h-10 px-4 py-2", 
      lg: "h-11 px-8",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})
```

## Data Fetching
- Use **axios** for API calls.
- For client-side data fetching, prefer **React Query** over SWR.

## Performance
- Use `next/image` for images.
- Use **dynamic imports** (`dynamic(() => import(...), { ssr: false })`) for heavy components.
- Avoid unnecessary re-renders by memoizing components/hooks.

## Security
- Never hardcode secrets, always use `.env`.
- Use `next-auth` or JWT for authentication.
- Do not expose sensitive information in logs.

### Authentication & Security Rules
- **Admin-Only System**: No public user registration - only admin authentication
- **JWT Token Management**: Secure token storage and refresh for admin users
- **Route Protection**: All routes protected - admin authentication required
- **Device Registration**: Separate PIN-based Android TV self-registration workflow
- **HTTPS Only**: Production must use HTTPS

```typescript
// Admin Auth Middleware Pattern (Admin-Only System)
export function withAdminAuth(WrappedComponent: React.ComponentType<any>) {
  return function AdminAuthenticatedComponent(props: any) {
    const { adminUser, isLoading } = useSelector((state: RootState) => state.auth)
    
    if (isLoading) {
      return <LoadingSpinner />
    }
    
    if (!adminUser) {
      redirect('/admin/login')
    }
    
    return <WrappedComponent {...props} />
  }
}

// Admin Layout (No User Registration - Admin Only)
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="flex h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
```

## Digital Signage Specific Features

### Admin Dashboard Components
- **Device Status Grid**: Real-time device monitoring with Android TV self-registration approval
- **Content Management**: Media library with drag-drop upload
- **Schedule Builder**: Visual schedule creation
- **Analytics Charts**: Device and content analytics
- **Device Registration Management**: PIN-based Android TV approval workflow (no public user registration)

### Real-time Features
- **WebSocket Integration**: Real-time device status updates
- **Live Notifications**: System alerts and notifications
- **Progress Indicators**: Upload and processing progress
- **Auto-refresh**: Automatic data refresh

### Mobile Responsiveness
- **Responsive Tables**: Mobile-friendly data tables
- **Touch Gestures**: Swipe and touch interactions
- **Mobile Navigation**: Collapsible sidebar
- **Progressive Web App**: PWA capabilities

## Copilot Usage Notes
When writing code with Copilot:
1. Always generate **TypeScript code**.
2. Prefer **Server Components** unless explicitly asked for client-side.
3. Suggest **TailwindCSS classes** for UI styling.
4. **Default to clean and minimal code**
5. Add JSDoc or TSDoc comments for functions and exported utilities.

## Development Workflow

### Commands
```bash
# Development server
npm run dev              # Start development server (port 3000)

# Building
npm run build           # Production build
npm run start           # Start production server

# Code quality
npm run lint            # ESLint check
npm run type-check      # TypeScript check
npm run test            # Run tests
```

### Environment Configuration
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5100
NEXT_PUBLIC_WS_URL=ws://localhost:5100/ws
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Deployment
- Optimize bundle size before deploy.
- Use **Vercel** as primary deployment target.
- Ensure `ESLint` and `Prettier` checks pass before PR merge.

## Code Style & Standards
- **Prettier**: Code formatting
- **ESLint**: Code linting with Next.js rules
- **TypeScript Strict**: Full type safety
- **Import Order**: Organized imports (external, internal, relative)
- **Nomenclature**: camelCase for variables, PascalCase for components
- **Absolute Imports**: Use `@/` prefix for imports

## Digital Signage Specific Implementation

### Admin Dashboard Components
- **Device Status Grid**: Real-time device monitoring
- **Content Management**: Media library with drag-drop upload  
- **Schedule Builder**: Visual schedule creation
- **Analytics Charts**: Device and content analytics
- **User Management**: Role-based user administration

### API Integration with Backend
- **Base URL**: `http://localhost:5100` (development)
- **Admin Authentication**: JWT Bearer tokens for admin dashboard access
- **Device API**: Separate authentication for Android TV device endpoints
- **Error Handling**: Centralized error management
- **Type Safety**: Generated types from OpenAPI spec
- **Retry Logic**: Automatic retry for failed requests

This frontend connects to the Digital Signage API backend and provides a modern, responsive **admin-only interface** for managing digital signage systems. **No public user features** - only admin dashboard functionality using **clean architecture patterns** with **feature-based organization**.

## References & Documentation
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) - Official guide on layout groups
- [Next.js Layouts and Templates](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates) - Layout patterns
- [Next.js App Router](https://nextjs.org/docs/app) - Complete App Router documentation

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->