# Automation Station - Testing Documentation

This document describes the comprehensive self-testing infrastructure for Automation Station.

## Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Self-Testing with Claude Code](#self-testing-with-claude-code)

---

## Overview

Automation Station includes a complete testing infrastructure designed to be self-testable by AI systems like Claude Code. The testing suite includes:

- **Unit Tests** - Testing individual components and services
- **Integration Tests** - Testing service interactions
- **E2E Tests** - Full application testing with Playwright
- **Visual Regression Tests** - Screenshot comparison testing
- **Build Verification** - Automated build validation

---

## Test Types

### 1. Unit Tests (Vitest)

Unit tests verify individual components, hooks, and utilities in isolation.

**Location:** `tests/unit/`

**Technologies:**
- Vitest (test runner)
- @testing-library/react (component testing)
- happy-dom (DOM environment)

**Example:**
```typescript
import { describe, it, expect } from 'vitest'
import { useStore } from '@renderer/store/useStore'

describe('useStore', () => {
  it('should initialize with empty projects', () => {
    const { projects } = useStore.getState()
    expect(projects).toEqual([])
  })
})
```

### 2. End-to-End Tests (Playwright + Electron)

E2E tests launch the actual Electron application and test complete user workflows.

**Location:** `tests/e2e/`

**Technologies:**
- Playwright (browser automation)
- @playwright/test (test runner)
- Electron integration

**Example:**
```typescript
import { test, expect, _electron as electron } from '@playwright/test'

test('should launch electron app', async () => {
  const app = await electron.launch({
    args: ['./dist/main/index.js'],
  })

  const window = await app.firstWindow()
  await expect(window).toHaveTitle(/Automation Station/)

  await app.close()
})
```

### 3. Visual Regression Tests

Visual tests capture screenshots and compare them against baseline images to detect unintended UI changes.

**Location:** `tests/e2e/*.visual.ts`

**Features:**
- Automated screenshot comparison
- Pixel-level diff detection
- Multiple viewport sizes
- Hover state testing

**Example:**
```typescript
test('dashboard appearance @visual', async () => {
  const window = await app.firstWindow()
  await expect(window).toHaveScreenshot('dashboard.png', {
    maxDiffPixels: 100,
  })
})
```

### 4. Build Verification

Automated script that verifies the build output contains all required files and meets quality standards.

**Location:** `scripts/verify-build.js`

**Checks:**
- All required files exist
- TypeScript compilation successful
- Build size within limits
- Package.json configuration correct

---

## Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run visual regression tests only
npm run test:visual

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Verify build
npm run verify:build

# Run full verification (build + all tests)
npm run verify:app
```

### Development Workflow

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Run tests in watch mode:**
   ```bash
   npm run test:watch
   ```

3. **Make changes and see tests update automatically**

4. **Before committing, run all tests:**
   ```bash
   npm run test:all
   ```

---

## Writing Tests

### Unit Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup code
  })

  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = myFunction(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### E2E Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Area', () => {
  test('should perform user workflow', async () => {
    // Launch app
    const app = await electron.launch({ ... })
    const window = await app.firstWindow()

    // Interact with UI
    await window.click('button:has-text("Click Me")')

    // Verify result
    await expect(window.locator('text=Success')).toBeVisible()

    // Cleanup
    await app.close()
  })
})
```

### Visual Test Structure

```typescript
test('component appearance @visual', async () => {
  const window = await app.firstWindow()

  // Navigate to component
  await window.goto('/component-path')

  // Take screenshot
  await expect(window).toHaveScreenshot('component-name.png', {
    maxDiffPixels: 100, // Allow small differences
  })
})
```

---

## Test Best Practices

### 1. Test Naming

- Use descriptive names that explain what is being tested
- Start with "should" for expected behavior
- Be specific about the scenario

**Good:**
```typescript
it('should display error message when login fails')
```

**Bad:**
```typescript
it('test login')
```

### 2. Test Independence

- Each test should be independent
- Use `beforeEach` and `afterEach` for setup/cleanup
- Don't rely on test execution order

### 3. Assertions

- Use specific matchers
- Assert one thing per test when possible
- Provide helpful error messages

```typescript
// Good
expect(result).toBe(5)
expect(element).toHaveText('Expected Text')

// Better with message
expect(result, 'calculation should return sum').toBe(5)
```

### 4. Mocking

- Mock external dependencies
- Use vi.mock() for module mocks
- Reset mocks in afterEach

```typescript
import { vi } from 'vitest'

vi.mock('@main/services/GitService', () => ({
  GitService: {
    getStatus: vi.fn(() => Promise.resolve({ ... })),
  },
}))
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Build application
        run: npm run build

      - name: Verify build
        run: npm run verify:build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Self-Testing with Claude Code

Automation Station is designed to test itself using Claude Code. Here's how:

### 1. Add Automation Station as a Project

1. Launch Automation Station
2. Click "Add Project"
3. Enter:
   - **Name:** Automation Station
   - **Path:** `/path/to/automation-platform`
4. Save

### 2. Run Tests Through the UI

1. Select "Automation Station" project
2. Click "Run Tests"
3. View results in real-time
4. Click "View Results" to see detailed output

### 3. Enable Watch Mode

1. Toggle "Watch Mode" to ON
2. Make changes to code
3. Tests run automatically
4. See immediate feedback

### 4. Generate Context for Claude Code

1. Click "Launch Claude Code"
2. Review generated context
3. Use context to help Claude Code understand the codebase
4. Claude Code can run tests, review results, and suggest fixes

### 5. Automated Testing Workflow

Claude Code can:
- Run all test suites (`npm test`)
- Run specific test types
- Review test failures
- Update snapshots
- Fix failing tests
- Add new tests

**Example Claude Code Interaction:**

```
User: Run the tests for Automation Station

Claude: Running tests...
[Executes: npm run test:all]

Results:
- Unit Tests: 45/45 passed
- E2E Tests: 12/12 passed
- Visual Tests: 8/8 passed
All tests passed!

User: Add a test for the new feature

Claude: I'll add a test for the session export feature:
[Creates test file with appropriate test cases]
[Runs tests to verify they pass]
Test added and passing!
```

### 6. Continuous Improvement

The test suite can:
- Detect regressions automatically
- Catch UI changes through visual tests
- Verify builds before deployment
- Provide detailed reports for analysis

---

## Test Reports

### Coverage Reports

After running `npm run test:coverage`, view reports:

- **HTML Report:** `coverage/index.html`
- **JSON Report:** `coverage/coverage-final.json`
- **LCOV Report:** `coverage/lcov.info`

### Visual Test Reports

Visual test differences are stored in:

- **Baseline:** `tests/e2e/*.visual.ts-snapshots/`
- **Diffs:** `test-results/visual-diffs/`
- **Reports:** `test-results/html/`

### E2E Test Artifacts

Failed E2E tests generate:

- **Screenshots:** `test-results/screenshots/`
- **Videos:** `test-results/videos/`
- **Traces:** `test-results/traces/`

---

## Troubleshooting

### Tests Fail on CI but Pass Locally

- Ensure same Node.js version
- Check for timing issues (add waits)
- Verify environment variables
- Check for file system differences

### Visual Tests Show Differences

- Update baselines: `npm run test:visual -- --update-snapshots`
- Check font rendering differences
- Verify screen resolution matches
- Check for animation timing issues

### Electron Tests Hang

- Check for unclosed windows
- Verify app.close() is called
- Add timeout configuration
- Check for modal dialogs blocking

### Coverage is Low

- Add tests for uncovered code
- Check exclude patterns in vitest.config.ts
- Run with --coverage to see gaps
- Focus on business logic first

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Electron Testing](https://www.electronjs.org/docs/latest/tutorial/automated-testing)

---

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Add E2E tests for user-facing features
4. Update visual baselines if UI changed
5. Run full verification before submitting PR

```bash
npm run verify:app
```

---

**Last Updated:** 2024-01-17
