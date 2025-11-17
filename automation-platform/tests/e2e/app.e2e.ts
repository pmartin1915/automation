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

    // Wait for DOM to be ready and React to mount
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Verify window title
    const title = await window.title()
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

    // Wait for DOM and React
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

    // Wait for DOM and React
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Wait for sidebar to load
    await window.waitForSelector('nav', { timeout: 10000 })

    // Click on Sessions page
    await window.click('text=Sessions')
    await window.waitForSelector('text=Track your development work sessions')

    // Verify we're on Sessions page - look for Sessions h1 specifically in main content
    const heading = await window.locator('main h1').textContent()
    expect(heading).toBe('Sessions')

    // Click on Settings page
    await window.click('text=Settings')
    await window.waitForSelector('text=⚙️ Settings')

    // Verify we're on Settings page
    const settingsHeading = await window.locator('main h2').textContent()
    expect(settingsHeading).toContain('Settings')

    await electronApp.close()
  })

  test('should show dashboard with projects or empty state', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    const window = await electronApp.firstWindow()

    // Wait for DOM and React
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Wait for Dashboard to load
    await window.waitForSelector('text=Projects', { timeout: 10000 })

    // Check if we have empty state OR project cards
    const hasEmptyState = await window.locator('h3:has-text("No Projects Yet")').count()
    const hasProjectCards = await window.locator('[data-testid="project-card"]').count()

    // Should have either empty state or projects, not both
    expect(hasEmptyState + hasProjectCards).toBeGreaterThan(0)

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

    // Wait for DOM and React
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Wait for shortcuts button
    await window.waitForSelector('text=Shortcuts', { timeout: 10000 })

    // Click shortcuts button
    await window.click('button:has-text("Shortcuts")')

    // Wait for modal to appear
    await window.waitForSelector('text=Keyboard Shortcuts')

    // Verify modal content
    const modalTitle = await window.textContent('text=Keyboard Shortcuts')
    expect(modalTitle).toBeTruthy()

    // Close modal with Escape
    await window.keyboard.press('Escape')

    // Verify modal is closed
    const modalExists = await window.locator('text=Keyboard Shortcuts').count()
    expect(modalExists).toBe(0)

    await electronApp.close()
  })
})
