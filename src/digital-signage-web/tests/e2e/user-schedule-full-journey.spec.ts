/**
 * User Schedule Assignment - Full Journey Integration Test
 * 
 * Comprehensive end-to-end test that simulates a complete admin workflow:
 * - Login as admin
 * - Navigate through the application
 * - Manage user schedules (assign, remove, re-assign)
 * - Manage schedule settings (default flag, view users)
 * - Logout
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T049
 */

import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100'

// Test data
const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'admin123',
}

const TEST_USER = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
}

const SCHEDULES = [
  {
    id: 1,
    name: 'Morning Content',
    description: 'Display morning content 6am-12pm',
    status: 'active',
    isDefault: false,
  },
  {
    id: 2,
    name: 'Afternoon Content',
    description: 'Display afternoon content 12pm-6pm',
    status: 'active',
    isDefault: false,
  },
  {
    id: 3,
    name: 'Evening Content',
    description: 'Display evening content 6pm-12am',
    status: 'active',
    isDefault: true,
  },
  {
    id: 4,
    name: 'Weekend Special',
    description: 'Weekend promotional content',
    status: 'active',
    isDefault: false,
  },
  {
    id: 5,
    name: 'Holiday Content',
    description: 'Holiday season content',
    status: 'active',
    isDefault: false,
  },
]

/**
 * Helper: Setup API mocks for the full journey
 */
async function setupApiMocks(page: Page) {
  let userSchedules: number[] = []
  let defaultScheduleId: number | null = 3

  // Mock login
  await page.route(`${API_URL}/api/auth/login`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: ADMIN_USER.email,
          role: 'Admin',
        },
      }),
    })
  })

  // Mock users list
  await page.route(`${API_URL}/api/users*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: TEST_USER.id,
          firstName: 'John',
          lastName: 'Doe',
          email: TEST_USER.email,
          role: { name: 'User' },
        },
      ]),
    })
  })

  // Mock user schedules GET
  await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route) => {
    if (route.request().method() === 'GET') {
      const schedulesList = userSchedules.map(id => {
        const schedule = SCHEDULES.find(s => s.id === id)
        return {
          scheduleId: id,
          scheduleName: schedule?.name || 'Unknown',
          scheduleDescription: schedule?.description || '',
          assignedAt: new Date().toISOString(),
          assignedBy: ADMIN_USER.email,
          isActive: true,
        }
      })

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: TEST_USER.id,
          schedules: schedulesList,
          totalCount: schedulesList.length,
        }),
      })
    } else if (route.request().method() === 'POST') {
      // Assign schedules (REPLACE)
      const body = JSON.parse(route.request().postData() || '{}')
      const oldSchedules = [...userSchedules]
      userSchedules = body.scheduleIds || []

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: TEST_USER.id,
          assignedScheduleIds: userSchedules,
          replacedScheduleIds: oldSchedules,
          message: 'Schedules assigned successfully',
        }),
      })
    } else if (route.request().method() === 'DELETE') {
      // Remove all schedules
      const removed = userSchedules.length
      userSchedules = []

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: TEST_USER.id,
          removedCount: removed,
          message: 'All schedules removed successfully',
        }),
      })
    }
  })

  // Mock available schedules
  await page.route(`${API_URL}/api/schedules*`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          SCHEDULES.map(s => ({
            ...s,
            isDefault: s.id === defaultScheduleId,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            targetDevices: [],
          }))
        ),
      })
    }
  })

  // Mock set default schedule
  await page.route(`${API_URL}/api/schedules/*/default`, async (route) => {
    const url = route.request().url()
    const scheduleIdMatch = url.match(/schedules\/(\d+)\/default/)
    const scheduleId = scheduleIdMatch ? parseInt(scheduleIdMatch[1]) : null

    if (route.request().method() === 'PUT') {
      const body = JSON.parse(route.request().postData() || '{}')
      
      if (body.isDefault) {
        defaultScheduleId = scheduleId
      } else if (defaultScheduleId === scheduleId) {
        defaultScheduleId = null
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          scheduleId,
          isDefault: body.isDefault,
          message: 'Default schedule updated successfully',
        }),
      })
    }
  })

  // Mock schedule users (for viewing assigned users)
  await page.route(`${API_URL}/api/schedules/*/users`, async (route) => {
    const url = route.request().url()
    const scheduleIdMatch = url.match(/schedules\/(\d+)\/users/)
    const scheduleId = scheduleIdMatch ? parseInt(scheduleIdMatch[1]) : null

    const isAssigned = scheduleId && userSchedules.includes(scheduleId)

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        scheduleId,
        users: isAssigned ? [
          {
            userId: TEST_USER.id,
            userName: TEST_USER.name,
            userEmail: TEST_USER.email,
            assignedAt: new Date().toISOString(),
          },
        ] : [],
        totalCount: isAssigned ? 1 : 0,
      }),
    })
  })
}

/**
 * T049: Complete User Journey Integration Test
 * 
 * This test validates the entire workflow from login to logout,
 * ensuring all components work together seamlessly.
 */
test.describe('T049: Full User Journey - Schedule Management', () => {
  test('should complete full admin journey managing user schedules', async ({ page }) => {
    // Setup API mocks
    await setupApiMocks(page)

    // ========================================
    // STEP 1: Login as admin
    // ========================================
    await page.goto(`${BASE_URL}/login`)
    await page.fill('[data-testid="email-input"]', ADMIN_USER.email)
    await page.fill('[data-testid="password-input"]', ADMIN_USER.password)
    await page.click('[data-testid="login-button"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`)
    console.log('✅ Step 1: Login successful')

    // ========================================
    // STEP 2: Navigate to users list
    // ========================================
    await page.goto(`${BASE_URL}/users`)
    await page.waitForSelector('[data-testid="user-list"]')
    
    await expect(page.locator('[data-testid="user-list"]')).toBeVisible()
    await expect(page.locator('text=John Doe')).toBeVisible()
    console.log('✅ Step 2: Users list displayed')

    // ========================================
    // STEP 3: Click "Manage Schedules" for user
    // ========================================
    await page.click(`[data-testid="user-row-${TEST_USER.id}"] [data-testid="manage-schedules-link"]`)
    await page.waitForURL(`${BASE_URL}/users/${TEST_USER.id}/schedules`)
    
    await expect(page.locator('[data-testid="user-schedules-page"]')).toBeVisible()
    await expect(page.locator('text=John Doe')).toBeVisible()
    console.log('✅ Step 3: User schedules page loaded')

    // ========================================
    // STEP 4: Assign 3 schedules to user
    // ========================================
    await page.click('[data-testid="assign-schedules-button"]')
    await page.waitForSelector('[data-testid="schedule-selector-modal"]')
    
    // Select schedules 1, 2, 3
    await page.click('[data-testid="schedule-checkbox-1"]')
    await page.click('[data-testid="schedule-checkbox-2"]')
    await page.click('[data-testid="schedule-checkbox-3"]')
    
    await expect(page.locator('text=3 schedule(s) selected')).toBeVisible()
    
    await page.click('[data-testid="confirm-button"]')
    await page.waitForSelector('text=Schedules Assigned')
    
    console.log('✅ Step 4: Assigned 3 schedules')

    // Verify schedules appear in list
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="schedule-card-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="schedule-card-2"]')).toBeVisible()
    await expect(page.locator('[data-testid="schedule-card-3"]')).toBeVisible()

    // ========================================
    // STEP 5: Remove all schedules
    // ========================================
    await page.click('[data-testid="remove-all-button"]')
    await page.waitForSelector('[data-testid="confirmation-modal"]')
    
    // Confirm removal
    await page.click('[data-testid="confirm-checkbox"]')
    await page.click('[data-testid="modal-confirm-button"]')
    await page.waitForSelector('text=Schedules Removed')
    
    console.log('✅ Step 5: Removed all schedules')

    // Verify empty state
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()

    // ========================================
    // STEP 6: Re-assign 2 different schedules (REPLACE)
    // ========================================
    await page.click('[data-testid="assign-schedules-button"]')
    await page.waitForSelector('[data-testid="schedule-selector-modal"]')
    
    // Select schedules 4, 5
    await page.click('[data-testid="schedule-checkbox-4"]')
    await page.click('[data-testid="schedule-checkbox-5"]')
    
    await expect(page.locator('text=2 schedule(s) selected')).toBeVisible()
    
    await page.click('[data-testid="confirm-button"]')
    await page.waitForSelector('text=Schedules Assigned')
    
    console.log('✅ Step 6: Re-assigned 2 different schedules')

    // Verify new schedules
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="schedule-card-4"]')).toBeVisible()
    await expect(page.locator('[data-testid="schedule-card-5"]')).toBeVisible()

    // ========================================
    // STEP 7: Navigate to schedules page
    // ========================================
    await page.goto(`${BASE_URL}/schedules`)
    await page.waitForSelector('text=Schedule Management')
    
    await expect(page.locator('text=Morning Content')).toBeVisible()
    await expect(page.locator('text=Afternoon Content')).toBeVisible()
    console.log('✅ Step 7: Schedules page loaded')

    // ========================================
    // STEP 8: Toggle default flag on schedule
    // ========================================
    // Currently schedule 3 (Evening Content) is default
    await expect(page.locator('[data-testid="schedule-row-3"] text=Default Schedule')).toBeVisible()
    
    // Set schedule 1 as default
    const schedule1Row = page.locator('[data-testid="schedule-row-1"]')
    await schedule1Row.locator('[data-testid="set-default-button"]').click()
    await page.waitForSelector('text=Default Schedule Set')
    
    console.log('✅ Step 8: Toggled default flag')

    // Verify schedule 1 now shows as default
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="schedule-row-1"] text=Default Schedule')).toBeVisible()

    // ========================================
    // STEP 9: View assigned users for a schedule
    // ========================================
    // Click "View Users" for schedule 4 (which we assigned to John Doe)
    await page.click('[data-testid="schedule-row-4"] [data-testid="view-users-button"]')
    await page.waitForSelector('[data-testid="assigned-users-modal"]')
    
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator(`text=${TEST_USER.email}`)).toBeVisible()
    
    console.log('✅ Step 9: Viewed assigned users')

    // Close modal
    await page.click('[data-testid="modal-close-button"]')
    await expect(page.locator('[data-testid="assigned-users-modal"]')).not.toBeVisible()

    // ========================================
    // STEP 10: Logout
    // ========================================
    await page.click('[data-testid="user-menu-button"]')
    await page.click('[data-testid="logout-button"]')
    await page.waitForURL(`${BASE_URL}/login`)
    
    await expect(page).toHaveURL(`${BASE_URL}/login`)
    console.log('✅ Step 10: Logout successful')

    // ========================================
    // JOURNEY COMPLETE
    // ========================================
    console.log('🎉 Full journey completed successfully!')
  })

  test('should handle errors gracefully during journey', async ({ page }) => {
    await setupApiMocks(page)

    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('[data-testid="email-input"]', ADMIN_USER.email)
    await page.fill('[data-testid="password-input"]', ADMIN_USER.password)
    await page.click('[data-testid="login-button"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // Navigate to user schedules
    await page.goto(`${BASE_URL}/users/${TEST_USER.id}/schedules`)

    // Mock API error for assignment
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal Server Error',
            message: 'Database connection failed',
          }),
        })
      }
    })

    // Try to assign schedules
    await page.click('[data-testid="assign-schedules-button"]')
    await page.click('[data-testid="schedule-checkbox-1"]')
    await page.click('[data-testid="confirm-button"]')

    // Verify error handling
    await expect(page.locator('text=Assignment Failed')).toBeVisible()
    await expect(page.locator('text=Database connection failed')).toBeVisible()

    // Verify user can retry
    await expect(page.locator('[data-testid="assign-schedules-button"]')).toBeEnabled()
    
    console.log('✅ Error handling verified')
  })

  test('should maintain state across navigation', async ({ page }) => {
    await setupApiMocks(page)

    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('[data-testid="email-input"]', ADMIN_USER.email)
    await page.fill('[data-testid="password-input"]', ADMIN_USER.password)
    await page.click('[data-testid="login-button"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // Assign schedules to user
    await page.goto(`${BASE_URL}/users/${TEST_USER.id}/schedules`)
    await page.click('[data-testid="assign-schedules-button"]')
    await page.click('[data-testid="schedule-checkbox-1"]')
    await page.click('[data-testid="confirm-button"]')
    await page.waitForSelector('text=Schedules Assigned')

    // Navigate away
    await page.goto(`${BASE_URL}/schedules`)
    
    // Navigate back
    await page.goto(`${BASE_URL}/users/${TEST_USER.id}/schedules`)

    // Verify schedule still assigned
    await expect(page.locator('[data-testid="schedule-card-1"]')).toBeVisible()
    
    console.log('✅ State maintained across navigation')
  })
})
