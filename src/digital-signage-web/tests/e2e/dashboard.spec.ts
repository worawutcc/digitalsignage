/**
 * E2E Test: Dashboard
 * Tests dashboard display and stats
 */

import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display dashboard stats', async ({ page }) => {
    // Should show stat cards
    await expect(page.locator('[data-testid="stat-card"]')).toHaveCount(4)
    
    // Each stat card should have a title and value
    const statCards = page.locator('[data-testid="stat-card"]')
    for (let i = 0; i < await statCards.count(); i++) {
      const card = statCards.nth(i)
      await expect(card.locator('h3')).toBeVisible()
      await expect(card.locator('p')).toBeVisible()
    }
  })

  test('should display charts', async ({ page }) => {
    // Should show chart containers
    await expect(page.locator('[data-testid="chart"]')).toHaveCount(expect.any(Number))
  })

  test('should navigate to devices from dashboard', async ({ page }) => {
    await page.click('a:has-text("View All Devices")')
    await expect(page).toHaveURL('/devices')
  })

  test('should refresh data', async ({ page }) => {
    // Click refresh button
    await page.click('button[aria-label="Refresh data"]')
    
    // Should show loading state
    await expect(page.locator('text=Loading')).toBeVisible()
    
    // Data should reload
    await expect(page.locator('[data-testid="stat-card"]')).toHaveCount(4)
  })
})
