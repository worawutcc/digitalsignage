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

## General Guidelines
- Use **TypeScript** instead of JavaScript.
- Follow **Next.js 13+ App Router** structure (`app/` instead of `pages/`).
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
- **Axios**: Use axios for all API calls (not fetch)
- **React Query**: For client-side data fetching (preferred over SWR)
- **Redux Toolkit**: For all state management
- **Typed API Client**: Full TypeScript API client
- **Error Boundaries**: Graceful error handling
- **Loading States**: Proper loading indicators

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
- **JWT Token Management**: Secure token storage and refresh
- **Route Protection**: Protected routes with middleware
- **RBAC Implementation**: Role-based access control
- **HTTPS Only**: Production must use HTTPS

```typescript
// Auth Middleware Pattern
export function withAuth(WrappedComponent: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const { user, isLoading } = useSelector((state: RootState) => state.auth)
    
    if (isLoading) {
      return <LoadingSpinner />
    }
    
    if (!user) {
      redirect('/login')
    }
    
    return <WrappedComponent {...props} />
  }
}

// Route Protection with Redux
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard requiredRole="Admin">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </RoleGuard>
  )
}
```

## Digital Signage Specific Features

### Admin Dashboard Components
- **Device Status Grid**: Real-time device monitoring
- **Content Management**: Media library with drag-drop upload
- **Schedule Builder**: Visual schedule creation
- **Analytics Charts**: Device and content analytics
- **User Management**: Role-based user administration

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
- **Authentication**: JWT Bearer tokens
- **Error Handling**: Centralized error management
- **Type Safety**: Generated types from OpenAPI spec
- **Retry Logic**: Automatic retry for failed requests

This frontend connects to the Digital Signage API backend and provides a modern, responsive admin interface for managing digital signage systems using **clean architecture patterns** with **feature-based organization**.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->