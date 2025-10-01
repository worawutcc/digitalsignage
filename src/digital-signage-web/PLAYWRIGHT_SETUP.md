# Playwright E2E Testing Setup

## การติดตั้ง Playwright

ไฟล์ `playwright.config.ts` และ test suites ใน `tests/e2e/` ถูกสร้างไว้แล้ว แต่ยังไม่ได้ติดตั้ง Playwright package

### ขั้นตอนการติดตั้ง

1. **ติดตั้ง Playwright package:**
```bash
npm install -D @playwright/test
```

2. **ติดตั้ง browsers:**
```bash
npx playwright install
```

3. **ติดตั้ง browser dependencies (Linux/CI only):**
```bash
npx playwright install-deps
```

### การรัน E2E Tests

หลังจากติดตั้งแล้ว สามารถรัน tests ได้ด้วยคำสั่ง:

```bash
# รัน tests ทั้งหมด
npm run test:e2e

# รัน tests แบบ interactive mode
npm run test:e2e:ui

# รัน tests เฉพาะ browser
npx playwright test --project=chromium

# รัน tests เฉพาะไฟล์
npx playwright test tests/e2e/auth.spec.ts

# Debug mode
npx playwright test --debug
```

### เพิ่ม Scripts ใน package.json

ถ้ายังไม่มี ให้เพิ่ม scripts เหล่านี้ใน `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

## Test Suites ที่มีอยู่

### 1. Authentication Tests (`tests/e2e/auth.spec.ts`)
- ✅ Login redirect for unauthenticated users
- ✅ Successful login
- ✅ Invalid credentials handling
- ✅ Logout functionality
- ✅ Protected route access

### 2. Device Management Tests (`tests/e2e/devices.spec.ts`)
- ✅ Device list display
- ✅ Create new device
- ✅ Edit device
- ✅ Delete device
- ✅ Filter devices
- ✅ Search devices
- ✅ Device status changes

### 3. Dashboard Tests (`tests/e2e/dashboard.spec.ts`)
- ✅ Dashboard stats display
- ✅ Charts rendering
- ✅ Navigation
- ✅ Data refresh

## Configuration

ไฟล์ `playwright.config.ts` ได้ถูก configure ไว้แล้วดังนี้:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari, Edge
- **Auto dev server**: จะ start dev server อัตโนมัติก่อนรัน tests
- **Screenshots**: บันทึกเมื่อ test fail
- **Videos**: บันทึกเมื่อ test fail
- **Traces**: บันทึกเมื่อ retry test

## Exclude จาก Build

เนื่องจาก Playwright ยังไม่ได้ติดตั้ง ไฟล์ต่อไปนี้ถูก exclude ออกจาก TypeScript build:

```json
// tsconfig.json
{
  "exclude": [
    "node_modules",
    "playwright.config.ts",
    "tests/e2e/**/*"
  ]
}
```

หลังจากติดตั้ง Playwright แล้ว สามารถลบ excludes เหล่านี้ออกได้

## CI/CD Integration

สำหรับ GitHub Actions หรือ CI/CD pipeline อื่นๆ:

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## หมายเหตุ

- ⚠️ **ยังไม่ได้ติดตั้ง**: จำเป็นต้องรัน `npm install -D @playwright/test` ก่อนใช้งาน
- 📝 **Test Coverage**: ครอบคลุม critical user flows
- 🌐 **Cross-browser**: รองรับทุก major browsers
- 📱 **Mobile**: รองรับ mobile viewport testing
- 🎯 **Best Practices**: ใช้ Page Object Model pattern

## ขั้นตอนถัดไป

1. ติดตั้ง Playwright: `npm install -D @playwright/test`
2. ติดตั้ง browsers: `npx playwright install`
3. รัน tests: `npm run test:e2e`
4. เพิ่ม test cases ตามความต้องการ

สำหรับข้อมูลเพิ่มเติม อ่านได้ที่: `tests/e2e/README.md`
