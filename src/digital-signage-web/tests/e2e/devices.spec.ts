/**
 * E2E Test: Device Management
 * Tests device CRUD operations
 */

import { test, expect } from '@playwright/test'

test.describe('Device Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display device list', async ({ page }) => {
    await page.goto('/devices')
    
    // Should show device table
    await expect(page.locator('table')).toBeVisible()
    
    // Should show device rows
    await expect(page.locator('tbody tr')).toHaveCount(expect.any(Number))
  })

  test('should create a new device', async ({ page }) => {
    await page.goto('/devices')
    
    // Click create button
    await page.click('button:has-text("Add Device")')
    
    // Fill device form
    await page.fill('input[name="name"]', 'Test Device')
    await page.fill('input[name="location"]', 'Test Location')
    await page.fill('input[name="resolution"]', '1920x1080')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=/device created/i')).toBeVisible()
    
    // Should show new device in list
    await expect(page.locator('text=Test Device')).toBeVisible()
  })

  test('should edit an existing device', async ({ page }) => {
    await page.goto('/devices')
    
    // Click edit button on first device
    await page.click('button[aria-label="Edit device"]:first-of-type')
    
    // Update device name
    await page.fill('input[name="name"]', 'Updated Device Name')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=/device updated/i')).toBeVisible()
    
    // Should show updated name
    await expect(page.locator('text=Updated Device Name')).toBeVisible()
  })

  test('should delete a device', async ({ page }) => {
    await page.goto('/devices')
    
    // Get initial row count
    const initialCount = await page.locator('tbody tr').count()
    
    // Click delete button on first device
    await page.click('button[aria-label="Delete device"]:first-of-type')
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")')
    
    // Should show success message
    await expect(page.locator('text=/device deleted/i')).toBeVisible()
    
    // Row count should decrease
    const newCount = await page.locator('tbody tr').count()
    expect(newCount).toBe(initialCount - 1)
  })

  test('should filter devices', async ({ page }) => {
    await page.goto('/devices')
    
    // Enter search term
    await page.fill('input[placeholder*="Search"]', 'Lobby')
    
    // Wait for filtered results
    await page.waitForTimeout(500)
    
    // All visible devices should match search
    const deviceNames = await page.locator('tbody tr td:first-child').allTextContents()
    deviceNames.forEach(name => {
      expect(name.toLowerCase()).toContain('lobby')
    })
  })

  test('should show device status', async ({ page }) => {
    await page.goto('/devices')
    
    // Should show status badges
    await expect(page.locator('[data-testid="device-status"]').first()).toBeVisible()
    
    // Status should be either Online or Offline
    const status = await page.locator('[data-testid="device-status"]').first().textContent()
    expect(['Online', 'Offline']).toContain(status?.trim())
  })
})
