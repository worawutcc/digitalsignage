# E2E Testing Setup Guide

This directory contains end-to-end tests using Playwright.

## Installation

Install Playwright and dependencies:

```bash
cd src/digital-signage-web
npm install -D @playwright/test
npx playwright install
```

## Configuration

The Playwright configuration is in `playwright.config.ts`. It includes:

- Test directory: `tests/e2e/`
- Base URL: `http://localhost:3000` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari, Edge
- Automatic dev server startup
- Screenshots and videos on failure
- Trace on retry

## Running Tests

```bash
# Run all tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests in debug mode
npx playwright test --debug

# Show test report
npx playwright show-report
```

## Test Structure

Tests are organized by feature:

- `auth.spec.ts` - Authentication flow tests
- `devices.spec.ts` - Device management tests
- `dashboard.spec.ts` - Dashboard tests
- `media.spec.ts` - Media library tests (to be added)
- `schedules.spec.ts` - Schedule management tests (to be added)

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/feature-page')
  })

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.click('button')
    await expect(page.locator('selector')).toBeVisible()
  })
})
```

### Common Patterns

**Login Helper:**
```typescript
async function login(page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
}
```

**Wait for Navigation:**
```typescript
await Promise.all([
  page.waitForNavigation(),
  page.click('a[href="/target"]')
])
```

**Test Data Cleanup:**
```typescript
test.afterEach(async ({ page }) => {
  // Clean up test data
  await page.evaluate(() => localStorage.clear())
})
```

## Best Practices

1. **Use data-testid attributes** for reliable selectors:
   ```html
   <button data-testid="submit-button">Submit</button>
   ```
   ```typescript
   await page.click('[data-testid="submit-button"]')
   ```

2. **Wait for elements** before interacting:
   ```typescript
   await page.waitForSelector('[data-testid="element"]')
   await page.click('[data-testid="element"]')
   ```

3. **Use meaningful test descriptions** that explain what is being tested

4. **Keep tests independent** - each test should be able to run in isolation

5. **Clean up test data** - don't leave test data in the database

6. **Use fixtures** for common setup:
   ```typescript
   test.use({ locale: 'en-US', timezoneId: 'America/New_York' })
   ```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    PLAYWRIGHT_TEST_BASE_URL: https://staging.example.com

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging

- Use `await page.pause()` to pause test execution
- Use `npx playwright test --debug` to open Playwright Inspector
- Check screenshots and videos in `test-results/` directory
- Use trace viewer: `npx playwright show-trace trace.zip`

## Test Coverage

Current test coverage:
- ✅ Authentication (login, logout, protected routes)
- ✅ Device Management (CRUD operations, filtering)
- ✅ Dashboard (stats, charts, navigation)
- ⏳ Media Library (to be implemented)
- ⏳ Schedule Management (to be implemented)
- ⏳ User Management (to be implemented)

## Updating Tests

When adding new features, remember to:
1. Create corresponding E2E tests
2. Add data-testid attributes to key elements
3. Update this README with new test files
4. Run tests locally before committing

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
