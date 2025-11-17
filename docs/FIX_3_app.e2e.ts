import { test, expect, _electron as electron } from '@playwright/test'
import path from 'path'

/**
 * E2E tests for Automation Station Electron app
 * These tests launch the actual Electron application and test it end-to-end
 */

test.describe('Automation Station App', () => {
  test('should launch electron app and show main window', async () => {
    // Launch Electron app with NODE_ENV=test to prevent DevTools from opening
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    // Wait for the first window
    const window = await electronApp.firstWindow()

    // FIXED: Wait for DOM to be ready and React to mount
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000) // Give React time to render

    // Verify window title
    const title = await window.title()
    console.log('Window title:', title)
    expect(title).toContain('Automation Station')

    // Take screenshot
    await window.screenshot({ path: 'test-results/screenshots/main-window.png' })

    // Close app
    await electronApp.close()
  })

  test('should display branding correctly', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    const window = await electronApp.firstWindow()

    // FIXED: Wait for DOM and React
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Wait for app to load
    await window.waitForSelector('text=Automation Station', { timeout: 10000 })

    // Verify header text exists
    const header = await window.textContent('h1')
    expect(header).toBe('Automation Station')

    // Verify tagline exists
    const tagline = await window.textContent('text=Your AI Development Hub')
    expect(tagline).toBeTruthy()

    await electronApp.close()
  })

  test('should navigate between pages', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    const window = await electronApp.firstWindow()

    // FIXED: Wait for DOM and React
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Wait for app to be ready
    await window.waitForSelector('text=Projects', { timeout: 10000 })

    // Click on Sessions page
    await window.click('text=Sessions')
    await window.waitForSelector('text=Track your development work sessions')

    // Verify we're on Sessions page
    const content = await window.textContent('main')
    expect(content).toContain('Track your development work sessions')

    // Navigate to Settings
    await window.click('text=Settings')
    await window.waitForSelector('text=General Settings')

    // Verify we're on Settings page
    const settingsContent = await window.textContent('main')
    expect(settingsContent).toContain('General Settings')

    await electronApp.close()
  })

  test('should show empty state when no projects exist', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    const window = await electronApp.firstWindow()

    // FIXED: Wait for DOM and React
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Wait for Dashboard to load
    await window.waitForSelector('text=Projects', { timeout: 10000 })

    // Check for empty state
    const emptyState = await window.textContent('text=No Projects Yet')
    expect(emptyState).toBeTruthy()

    await electronApp.close()
  })

  test('should show keyboard shortcuts modal', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    const window = await electronApp.firstWindow()

    // FIXED: Wait for DOM and React
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Wait for shortcuts button
    await window.waitForSelector('text=Shortcuts', { timeout: 10000 })

    // Click shortcuts button
    await window.click('button:has-text("Shortcuts")')

    // Wait for modal to appear
    await window.waitForSelector('text=Keyboard Shortcuts')

    // Verify modal content
    const modalContent = await window.textContent('[role="dialog"]')
    expect(modalContent).toContain('Keyboard Shortcuts')

    await electronApp.close()
  })
})
