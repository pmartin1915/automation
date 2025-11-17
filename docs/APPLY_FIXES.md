# Apply E2E Test Fixes - Step by Step

## What These Fixes Do

1. **FIX_1_main_index.ts** - Prevents DevTools from opening during tests
2. **FIX_2_playwright.config.ts** - Configures Playwright for sequential Electron testing
3. **FIX_3_app.e2e.ts** - Adds proper wait times for React to mount

## Instructions

### Step 1: Copy Fixed Main Process File

```powershell
# In your automation-platform directory
cd D:\Automation\automation-platform

# Backup the original (optional)
Copy-Item src\main\index.ts src\main\index.ts.backup

# Now copy the content from FIX_1_main_index.ts and paste it into:
code src\main\index.ts
```

**Key changes:**
- Added `isTest` constant
- Wrapped `openDevTools()` in `if (!isTest)` condition

### Step 2: Copy Fixed Playwright Config

```powershell
# Backup the original (optional)
Copy-Item playwright.config.ts playwright.config.ts.backup

# Now copy the content from FIX_2_playwright.config.ts and paste it into:
code playwright.config.ts
```

**Key changes:**
- `fullyParallel: false` (was `true`)
- `workers: 1` (was `undefined`)

### Step 3: Copy Fixed E2E Tests

```powershell
# Backup the original (optional)
Copy-Item tests\e2e\app.e2e.ts tests\e2e\app.e2e.ts.backup

# Now copy the content from FIX_3_app.e2e.ts and paste it into:
code tests\e2e\app.e2e.ts
```

**Key changes:**
- Added `NODE_ENV: 'test'` to all test launches
- Added `await window.waitForLoadState('domcontentloaded')`
- Added `await window.waitForTimeout(2000)` to let React mount
- Increased selector timeouts to 10000ms

### Step 4: Rebuild and Test

```powershell
# Rebuild the application
npm run build

# Run E2E tests
npm run test:e2e
```

## Expected Results

✅ **Before:** All 11 tests failing with "DevTools" window title
✅ **After:** Tests should pass or get much further

### If Tests Still Fail

1. **Check screenshots:**
   ```powershell
   Start-Process test-results\screenshots\main-window.png
   ```
   This will show you what the test is actually seeing

2. **Enable debug mode:**
   ```powershell
   $env:DEBUG="pw:api"
   npm run test:e2e
   ```

3. **Run just one test:**
   ```powershell
   npx playwright test "should launch electron app"
   ```

## Quick Copy Commands

If you want to apply all fixes quickly:

```powershell
cd D:\Automation\automation-platform

# Open all files that need editing
code src\main\index.ts
code playwright.config.ts
code tests\e2e\app.e2e.ts
```

Then copy/paste from the FIX files in the docs folder.

## Verification

After applying fixes and rebuilding, run:

```powershell
# Should see main window, not DevTools
npm run test:e2e -- --grep "should launch"
```

If that test passes, run all tests:

```powershell
npm run test:e2e
```

## Need Help?

If tests still fail after these fixes:
1. Share the test output
2. Share the screenshot from `test-results/screenshots/main-window.png`
3. We'll debug from there!
