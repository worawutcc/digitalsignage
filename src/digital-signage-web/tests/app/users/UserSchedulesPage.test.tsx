/**
 * User Schedules Page Tests (T020)
 * 
 * Contract tests for /users/:userId/schedules page.
 * Tests routing, data fetching, authentication, and error handling.
 * 
 * These tests SHOULD FAIL initially (on assertions, not compilation).
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T020 Requirements
 */

import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserSchedulesPage from '@/app/users/[userId]/schedules/page'
import { userService } from '@/services/userService'
import { useRouter } from 'next/navigation'

// Mock services and hooks
jest.mock('@/services/userService')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockedUserService = userService as jest.Mocked<typeof userService>
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('UserSchedulesPage', () => {
  let queryClient: QueryClient

  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    jest.clearAllMocks()
    mockedUseRouter.mockReturnValue(mockRouter as any)
  })

  const renderPage = async (userId: string) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <UserSchedulesPage params={{ userId }} />
      </QueryClientProvider>
    )
  }

  describe('Page rendering', () => {
    test('renders page container', async () => {
      mockedUserService.getUserById.mockResolvedValue({
        id: 5,
        name: 'John Doe',
        email: 'john@test.com',
        role: 'Admin'
      })

      await renderPage('5')

      expect(screen.getByTestId('user-schedules-page')).toBeInTheDocument()
    })

    test('displays page title', async () => {
      mockedUserService.getUserById.mockResolvedValue({
        id: 5,
        name: 'John Doe',
        email: 'john@test.com',
        role: 'Admin'
      })

      await renderPage('5')

      expect(screen.getByRole('heading', { name: /schedule management/i })).toBeInTheDocument()
    })

    test('shows breadcrumbs navigation', async () => {
      mockedUserService.getUserById.mockResolvedValue({
        id: 5,
        name: 'John Doe',
        email: 'john@test.com',
        role: 'Admin'
      })

      await renderPage('5')

      const breadcrumbs = screen.getByTestId('breadcrumbs')
      expect(breadcrumbs).toHaveTextContent(/users/i)
      expect(breadcrumbs).toHaveTextContent(/user #5/i)
      expect(breadcrumbs).toHaveTextContent(/schedules/i)
    })
  })

  describe('User data fetching', () => {
    test('fetches user by ID from params', async () => {
      mockedUserService.getUserById.mockResolvedValue({
        id: 10,
        name: 'Test User',
        email: 'test@test.com',
        role: 'Viewer'
      })

      await renderPage('10')

      expect(mockedUserService.getUserById).toHaveBeenCalledWith(10)
    })

    test('displays user information', async () => {
      mockedUserService.getUserById.mockResolvedValue({
        id: 5,
        name: 'Jane Smith',
        email: 'jane@test.com',
        role: 'Content Manager'
      })

      await renderPage('5')

      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('jane@test.com')).toBeInTheDocument()
    })

    test('passes user data to UserScheduleAssignment component', async () => {
      const mockUser = {
        id: 5,
        name: 'John Doe',
        email: 'john@test.com',
        role: 'Admin'
      }
      mockedUserService.getUserById.mockResolvedValue(mockUser)

      await renderPage('5')

      // Component should receive user prop
      const component = screen.getByTestId('user-schedule-assignment')
      expect(component).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    test('redirects to 404 when user not found', async () => {
      mockedUserService.getUserById.mockRejectedValue({
        response: { status: 404 }
      })

      await renderPage('999')

      expect(mockRouter.replace).toHaveBeenCalledWith('/404')
    })

    test('shows error message on fetch failure', async () => {
      mockedUserService.getUserById.mockRejectedValue(new Error('Network error'))

      await renderPage('5')

      expect(screen.getByText(/error loading user/i)).toBeInTheDocument()
    })

    test('handles invalid userId param', async () => {
      await renderPage('invalid')

      expect(screen.getByText(/invalid user id/i)).toBeInTheDocument()
    })
  })

  describe('Authentication', () => {
    test('requires authentication to access page', async () => {
      // Mock unauthenticated state
      global.fetch = jest.fn().mockRejectedValue({
        response: { status: 401 }
      })

      await renderPage('5')

      expect(mockRouter.replace).toHaveBeenCalledWith('/login')
    })

    test('checks user permissions for schedule management', async () => {
      const mockUser = {
        id: 5,
        name: 'John Doe',
        email: 'john@test.com',
        role: 'Viewer' // No edit permission
      }
      mockedUserService.getUserById.mockResolvedValue(mockUser)

      await renderPage('5')

      // Should show read-only mode or permission message
      expect(screen.getByText(/view only|no permission/i)).toBeInTheDocument()
    })
  })

  describe('Loading states', () => {
    test('shows loading skeleton while fetching user', async () => {
      mockedUserService.getUserById.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      await renderPage('5')

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })
  })
})
