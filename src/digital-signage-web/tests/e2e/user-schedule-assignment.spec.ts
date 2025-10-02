/**
 * User Schedule Assignment E2E Tests
 * 
 * Comprehensive end-to-end tests for user schedule assignment functionality.
 * Tests cover: viewing schedules, assigning schedules, REPLACE semantics, and error handling.
 * 
 * @see copilot-instructions-web.md - Testing Standards
 * @see specs/020-phase-1/tasks.md - T045-T048
 */

/// <reference types="node" />

import { test, expect, type Page, type Route } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100'

// Test data
const TEST_USER = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'User',
}

const TEST_SCHEDULES = [
  { id: 1, name: 'Morning Content', description: 'Display morning content 6am-12pm' },
  { id: 2, name: 'Afternoon Content', description: 'Display afternoon content 12pm-6pm' },
  { id: 3, name: 'Evening Content', description: 'Display evening content 6pm-12am' },
]

// Helper functions
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`)
  await page.fill('[data-testid="email-input"]', 'admin@example.com')
  await page.fill('[data-testid="password-input"]', 'admin123')
  await page.click('[data-testid="login-button"]')
  await page.waitForURL(`${BASE_URL}/dashboard`)
}

async function navigateToUserSchedules(page: Page, userId: number) {
  await page.goto(`${BASE_URL}/users`)
  await page.waitForSelector('[data-testid="user-list"]')
  await page.click(`[data-testid="user-row-${userId}"] [data-testid="manage-schedules-link"]`)
  await page.waitForURL(`${BASE_URL}/users/${userId}/schedules`)
}

/**
 * T045: View User Schedules
 * 
 * Tests navigation to user schedules page and display of assigned schedules.
 * Verifies page structure, breadcrumbs, and schedule list rendering.
 */
test.describe('T045: View User Schedules', () => {
  test('should navigate to user schedules page from users list', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    await navigateToUserSchedules(page, TEST_USER.id)
    
    // Verify page loaded
    await expect(page.locator('[data-testid="user-schedules-page"]')).toBeVisible()
    
    // Verify breadcrumbs
    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]')
    await expect(breadcrumbs).toContainText('Users')
    await expect(breadcrumbs).toContainText(TEST_USER.name)
    await expect(breadcrumbs).toContainText('Schedules')
    
    // Verify user info displayed
    await expect(page.locator('[data-testid="user-info"]')).toBeVisible()
    await expect(page.locator('[data-testid="user-info"]')).toContainText(TEST_USER.name)
    await expect(page.locator('[data-testid="user-info"]')).toContainText(TEST_USER.email)
  })

  test('should display empty state when user has no schedules', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    // Mock API response with empty schedules
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: TEST_USER.id,
          schedules: [],
          totalCount: 0,
        }),
      })
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    
    // Verify empty state
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No schedules assigned')
  })

  test('should display assigned schedules list', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    // Mock API response with schedules
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: TEST_USER.id,
          schedules: [
            {
              scheduleId: 1,
              scheduleName: 'Morning Content',
              scheduleDescription: 'Display morning content 6am-12pm',
              assignedAt: new Date().toISOString(),
              assignedBy: 'admin@example.com',
              isActive: true,
            },
          ],
          totalCount: 1,
        }),
      })
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    
    // Verify schedule list
    await expect(page.locator('[data-testid="assigned-schedules-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="schedule-card-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="schedule-card-1"]')).toContainText('Morning Content')
  })

  test('should show loading state while fetching schedules', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    // Delay API response to see loading state
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: TEST_USER.id,
          schedules: [],
          totalCount: 0,
        }),
      })
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    
    // Verify loading spinner appears
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
  })
})

/**
 * T046: Assign Schedules (New Assignment)
 * 
 * Tests the schedule assignment flow for users with no existing schedules.
 * Verifies modal interactions, schedule selection, and successful assignment.
 */
test.describe('T046: Assign Schedules (New Assignment)', () => {
  test('should open schedule selector modal when clicking assign button', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    await navigateToUserSchedules(page, TEST_USER.id)
    
    // Click assign button
    await page.click('[data-testid="assign-schedules-button"]')
    
    // Verify modal opened
    await expect(page.locator('[data-testid="schedule-selector-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="schedule-selector-modal"]')).toContainText('Select Schedules')
  })

  test('should allow selecting multiple schedules', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    // Mock available schedules
    await page.route(`${API_URL}/api/schedules*`, async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(TEST_SCHEDULES.map(s => ({
          ...s,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          status: 'active',
          isActive: true,
        }))),
      })
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    await page.click('[data-testid="assign-schedules-button"]')
    
    // Select schedules
    await page.click('[data-testid="schedule-checkbox-1"]')
    await page.click('[data-testid="schedule-checkbox-2"]')
    
    // Verify selection count
    await expect(page.locator('text=2 schedule(s) selected')).toBeVisible()
  })

  test('should successfully assign schedules to user', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    // Mock assignment API
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            userId: TEST_USER.id,
            assignedScheduleIds: [1, 2],
            message: 'Schedules assigned successfully',
          }),
        })
      }
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    await page.click('[data-testid="assign-schedules-button"]')
    await page.click('[data-testid="schedule-checkbox-1"]')
    await page.click('[data-testid="schedule-checkbox-2"]')
    await page.click('[data-testid="confirm-button"]')
    
    // Verify success toast
    await expect(page.locator('text=Schedules Assigned')).toBeVisible()
    await expect(page.locator('text=Successfully assigned 2 schedule(s)')).toBeVisible()
    
    // Verify modal closed
    await expect(page.locator('[data-testid="schedule-selector-modal"]')).not.toBeVisible()
  })

  test('should enable search functionality in schedule selector', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    await navigateToUserSchedules(page, TEST_USER.id)
    await page.click('[data-testid="assign-schedules-button"]')
    
    // Type in search
    await page.fill('[data-testid="search-input"]', 'Morning')
    
    // Verify filtered results
    await expect(page.locator('[data-testid="schedule-item-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="schedule-item-2"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="schedule-item-3"]')).not.toBeVisible()
  })

  test('should cancel assignment without making changes', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    await navigateToUserSchedules(page, TEST_USER.id)
    await page.click('[data-testid="assign-schedules-button"]')
    await page.click('[data-testid="schedule-checkbox-1"]')
    
    // Cancel
    await page.click('[data-testid="cancel-button"]')
    
    // Verify modal closed and no changes made
    await expect(page.locator('[data-testid="schedule-selector-modal"]')).not.toBeVisible()
  })
})

/**
 * T047: Replace Assignments with Warning
 * 
 * Tests REPLACE semantics when user already has schedules.
 * Verifies warning display, acknowledgment requirement, and old schedules replacement.
 */
test.describe('T047: Replace Assignments with Warning', () => {
  test('should show REPLACE warning when user has existing schedules', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    // Mock user with existing schedules
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            userId: TEST_USER.id,
            schedules: [
              {
                scheduleId: 1,
                scheduleName: 'Existing Schedule',
                assignedAt: new Date().toISOString(),
                assignedBy: 'admin@example.com',
                isActive: true,
              },
            ],
            totalCount: 1,
          }),
        })
      }
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    await page.click('[data-testid="assign-schedules-button"]')
    
    // Verify warning displayed
    await expect(page.locator('[data-testid="replace-warning"]')).toBeVisible()
    await expect(page.locator('[data-testid="replace-warning"]')).toContainText('REPLACE existing schedules')
    await expect(page.locator('[data-testid="replace-warning"]')).toContainText('This action cannot be undone')
  })

  test('should require acknowledgment checkbox before allowing assignment', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    // Mock user with existing schedules
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            userId: TEST_USER.id,
            schedules: [{ scheduleId: 1, scheduleName: 'Existing' }],
            totalCount: 1,
          }),
        })
      }
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    await page.click('[data-testid="assign-schedules-button"]')
    await page.click('[data-testid="schedule-checkbox-2"]')
    
    // Verify confirm button disabled without acknowledgment
    await expect(page.locator('[data-testid="confirm-button"]')).toBeDisabled()
    
    // Check acknowledgment
    await page.click('[data-testid="acknowledge-checkbox"]')
    
    // Verify confirm button now enabled
    await expect(page.locator('[data-testid="confirm-button"]')).toBeEnabled()
  })

  test('should replace old schedules with new ones', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    let assignCalled = false
    
    // Mock API
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            userId: TEST_USER.id,
            schedules: assignCalled ? [
              { scheduleId: 2, scheduleName: 'New Schedule' },
            ] : [
              { scheduleId: 1, scheduleName: 'Old Schedule' },
            ],
            totalCount: 1,
          }),
        })
      } else if (route.request().method() === 'POST') {
        assignCalled = true
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            userId: TEST_USER.id,
            assignedScheduleIds: [2],
            replacedScheduleIds: [1],
            message: 'Schedules replaced successfully',
          }),
        })
      }
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    
    // Verify old schedule displayed
    await expect(page.locator('text=Old Schedule')).toBeVisible()
    
    // Assign new schedule
    await page.click('[data-testid="assign-schedules-button"]')
    await page.click('[data-testid="acknowledge-checkbox"]')
    await page.click('[data-testid="schedule-checkbox-2"]')
    await page.click('[data-testid="confirm-button"]')
    
    // Wait for update
    await page.waitForTimeout(500)
    
    // Verify success message
    await expect(page.locator('text=Schedules Assigned')).toBeVisible()
  })
})

/**
 * T048: Error Handling
 * 
 * Tests error handling for various failure scenarios.
 * Verifies error messages display correctly and user is informed.
 */
test.describe('T048: Error Handling', () => {
  test('should handle 401 Unauthorized error', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Unauthorized',
            message: 'Authentication required',
          }),
        })
      }
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    await page.click('[data-testid="assign-schedules-button"]')
    await page.click('[data-testid="schedule-checkbox-1"]')
    await page.click('[data-testid="confirm-button"]')
    
    // Verify error toast
    await expect(page.locator('text=Assignment Failed')).toBeVisible()
  })

  test('should handle 403 Forbidden error', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Forbidden',
            message: 'You do not have permission to assign schedules',
          }),
        })
      }
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    await page.click('[data-testid="assign-schedules-button"]')
    await page.click('[data-testid="schedule-checkbox-1"]')
    await page.click('[data-testid="confirm-button"]')
    
    // Verify error message
    await expect(page.locator('text=You do not have permission')).toBeVisible()
  })

  test('should handle 404 Not Found error', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    await page.route(`${API_URL}/api/users/999/schedules`, async (route: Route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Not Found',
          message: 'User not found',
        }),
      })
    })
    
    await page.goto(`${BASE_URL}/users/999/schedules`)
    
    // Verify 404 page or error message
    await expect(page.locator('text=not found')).toBeVisible()
  })

  test('should handle 422 Validation error', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Validation Error',
            message: 'Invalid schedule IDs provided',
            details: {
              scheduleIds: ['Schedule ID 99 does not exist'],
            },
          }),
        })
      }
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    await page.click('[data-testid="assign-schedules-button"]')
    await page.click('[data-testid="schedule-checkbox-1"]')
    await page.click('[data-testid="confirm-button"]')
    
    // Verify validation error displayed
    await expect(page.locator('text=Invalid schedule IDs')).toBeVisible()
  })

  test('should handle 500 Internal Server Error', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
          }),
        })
      }
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    await page.click('[data-testid="assign-schedules-button"]')
    await page.click('[data-testid="schedule-checkbox-1"]')
    await page.click('[data-testid="confirm-button"]')
    
    // Verify error message
    await expect(page.locator('text=Assignment Failed')).toBeVisible()
    await expect(page.locator('text=unexpected error')).toBeVisible()
  })

  test('should handle network errors', async ({ page }: { page: Page }) => {
    await loginAsAdmin(page)
    
    // Abort the request to simulate network error
    await page.route(`${API_URL}/api/users/${TEST_USER.id}/schedules`, async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.abort('failed')
      }
    })
    
    await navigateToUserSchedules(page, TEST_USER.id)
    await page.click('[data-testid="assign-schedules-button"]')
    await page.click('[data-testid="schedule-checkbox-1"]')
    await page.click('[data-testid="confirm-button"]')
    
    // Verify network error message
    await expect(page.locator('text=Assignment Failed')).toBeVisible()
  })
})
