import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 * 
 * Configures E2E tests to run on multiple browsers:
 * - Chrome, Firefox, Safari, Edge (Desktop)
 * - Mobile Chrome, Mobile Safari
 * - Responsive viewports
 * 
 * @see https://playwright.dev/docs/test-configuration
 * @see specs/020-phase-1/tasks.md - T050 Cross-Browser Testing
 * @see tests/e2e/CROSS_BROWSER_TESTING.md
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1920, height: 1080 },
        channel: 'msedge',
      },
    },

    /* Test against mobile viewports */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },

    /* Test against tablet viewports */
    {
      name: 'tablet-ipad',
      use: { ...devices['iPad Pro'] },
    },

    /* Responsive testing */
    {
      name: 'small-mobile',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
      },
    },

    {
      name: 'large-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 2560, height: 1440 },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
