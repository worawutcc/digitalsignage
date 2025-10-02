# Cross-Browser Testing Documentation

## Overview
This document describes the cross-browser testing strategy and configuration for the Digital Signage Web Application.

## Supported Browsers

### Desktop Browsers
- **Chrome/Chromium** (Latest stable)
  - Primary development browser
  - Full feature support
  - Viewport: 1920x1080

- **Firefox** (Latest stable)
  - Secondary browser
  - Full feature support
  - Viewport: 1920x1080

- **Safari** (Latest stable - macOS only)
  - WebKit engine
  - Important for Mac users
  - Viewport: 1920x1080

- **Microsoft Edge** (Latest stable)
  - Chromium-based
  - Enterprise browser support
  - Viewport: 1920x1080

### Mobile Browsers
- **Chrome Mobile** (Android)
  - Pixel 5 device profile
  - Touch interaction testing
  - Portrait and landscape modes

- **Safari Mobile** (iOS)
  - iPhone 13 device profile
  - iOS-specific behavior
  - Touch and gesture support

### Tablet Devices
- **iPad Pro**
  - Large touch screen
  - Hybrid desktop/mobile experience
  - Responsive layout validation

### Responsive Testing
- **Small Mobile**: iPhone SE (375x667)
- **Large Desktop**: 2560x1440

## Running Tests

### All Browsers
```bash
npx playwright test
```

### Specific Browser
```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit

# Edge only
npx playwright test --project=edge

# Mobile Chrome
npx playwright test --project=mobile-chrome

# Mobile Safari
npx playwright test --project=mobile-safari
```

### Specific Test File
```bash
npx playwright test user-schedule-assignment.spec.ts
```

### Debug Mode
```bash
npx playwright test --debug
```

### UI Mode (Interactive)
```bash
npx playwright test --ui
```

## Test Reports

### HTML Report
```bash
npx playwright show-report
```
- Opens interactive HTML report
- Shows test results across all browsers
- Includes screenshots and videos of failures

### JSON Report
- Location: `playwright-report/results.json`
- Machine-readable format for CI/CD integration

### JUnit Report
- Location: `playwright-report/junit.xml`
- Compatible with CI/CD systems (Jenkins, GitLab CI, etc.)

## Browser-Specific Considerations

### Chrome/Chromium
- **Strengths**: Fast, reliable, best DevTools
- **Known Issues**: None
- **Special Features**: Chrome DevTools Protocol support

### Firefox
- **Strengths**: Strong privacy features, good standards compliance
- **Known Issues**: Slightly slower than Chrome
- **Special Features**: Gecko rendering engine differences

### Safari/WebKit
- **Strengths**: Native Mac experience, iOS consistency
- **Known Issues**: 
  - Some CSS features may differ
  - Date picker rendering differences
  - Flexbox quirks in older versions
- **Special Features**: WebKit-specific behaviors

### Microsoft Edge
- **Strengths**: Enterprise features, Windows integration
- **Known Issues**: None (Chromium-based)
- **Special Features**: IE mode (if enabled)

### Mobile Browsers
- **Touch Events**: All touch interactions tested
- **Viewport**: Responsive breakpoints validated
- **Performance**: Mobile-optimized components
- **Gestures**: Swipe, tap, long-press

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npx playwright test
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Running in Docker
```bash
docker run -it --rm \
  -v $(pwd):/work \
  -w /work \
  mcr.microsoft.com/playwright:v1.40.0-focal \
  npx playwright test
```

## Browser Installation

### Install All Browsers
```bash
npx playwright install
```

### Install Specific Browser
```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### Install with System Dependencies
```bash
npx playwright install --with-deps
```

## Test Execution Strategy

### Parallel Execution
- Tests run in parallel across all browsers
- Configurable worker count
- Faster feedback

### Retry Policy
- CI/CD: 2 retries for flaky tests
- Local: No retries (faster feedback)

### Test Isolation
- Each test runs in a new browser context
- No state shared between tests
- Clean environment per test

## Known Browser Differences

### CSS Rendering
- **Safari**: Different default fonts, line-height calculations
- **Firefox**: Sub-pixel rendering differences
- **Solution**: Use cross-browser CSS reset

### Date/Time Inputs
- **Safari**: Native date picker (different UI)
- **Firefox**: Custom calendar widget
- **Chrome**: Google-style date picker
- **Solution**: Use consistent date picker library

### Modal/Dialog Behavior
- **Safari**: Different focus trap behavior
- **Firefox**: Escape key handling differences
- **Solution**: Explicit focus management

### Flexbox/Grid
- **Safari**: Older versions have quirks
- **Solution**: Use modern flexbox syntax, test thoroughly

## Performance Benchmarks

### Page Load Times (Target)
- Chrome: < 2s
- Firefox: < 2.5s
- Safari: < 2.5s
- Edge: < 2s
- Mobile: < 3s

### Interaction Response (Target)
- Button click: < 100ms
- Modal open: < 200ms
- Form submission: < 500ms
- Search results: < 300ms

## Accessibility Testing

All browsers tested for:
- Keyboard navigation
- Screen reader compatibility
- ARIA attributes
- Focus management
- Color contrast

## Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---------|--------|---------|--------|------|--------|
| User Schedule Assignment | ✅ | ✅ | ✅ | ✅ | ✅ |
| Schedule Selector | ✅ | ✅ | ✅ | ✅ | ✅ |
| REPLACE Warning | ✅ | ✅ | ✅ | ✅ | ✅ |
| Default Toggle | ✅ | ✅ | ✅ | ✅ | ✅ |
| Toast Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Breadcrumb Navigation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mobile Responsive | ✅ | ✅ | ✅ | ✅ | ✅ |

## Troubleshooting

### Tests Fail on Safari
- Ensure Safari allows remote automation
- Enable "Allow Remote Automation" in Develop menu
- Update to latest Safari version

### Tests Fail on Firefox
- Check Gecko driver version
- Clear Firefox cache
- Update Firefox to latest version

### Mobile Tests Fail
- Verify device emulation settings
- Check touch event handling
- Test on actual devices when possible

### Flaky Tests
- Add explicit waits
- Use data-testid attributes
- Avoid time-based waits
- Check for race conditions

## Best Practices

1. **Write browser-agnostic tests**
   - Use standard web APIs
   - Avoid browser-specific code
   - Test cross-browser early

2. **Use semantic selectors**
   - data-testid attributes
   - ARIA labels
   - Semantic HTML

3. **Handle timing properly**
   - Wait for elements
   - Wait for network requests
   - Use Playwright's auto-waiting

4. **Test mobile responsively**
   - Touch interactions
   - Viewport sizes
   - Mobile-specific features

5. **Maintain test isolation**
   - No global state
   - Clean browser context per test
   - Independent test data

## Maintenance

### Update Browsers
```bash
npx playwright install --with-deps
```

### Update Playwright
```bash
npm update @playwright/test
```

### Check for Deprecated APIs
```bash
npx playwright test --reporter=list --grep=deprecated
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Browser Compatibility](https://caniuse.com)
- [Web Platform Tests](https://wpt.fyi)
- [MDN Web Docs](https://developer.mozilla.org)

## Support

For issues or questions about cross-browser testing:
1. Check this documentation
2. Review Playwright docs
3. Check browser-specific release notes
4. Test on actual devices when possible
5. File issue with test recording and browser info
