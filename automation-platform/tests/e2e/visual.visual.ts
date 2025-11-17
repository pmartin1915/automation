import { test, expect, _electron as electron } from '@playwright/test'
import path from 'path'
import { compareScreenshots } from '../helpers/visual-comparison'

/**
 * Visual regression tests for Automation Station
 * These tests capture screenshots and compare them against baselines
 * Tag: @visual
 */

test.describe('Visual Regression Tests', () => {
  test('dashboard page appearance @visual', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)
    await window.waitForSelector('text=Projects', { timeout: 10000 })

    // Take screenshot of dashboard
    await expect(window).toHaveScreenshot('dashboard-empty-state.png', {
      maxDiffPixels: 100,
    })

    await electronApp.close()
  })

  test('sessions page appearance @visual', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Navigate to Sessions
    await window.click('text=Sessions')
    await window.waitForSelector('text=Track your development work sessions')

    // Take screenshot of sessions page
    await expect(window).toHaveScreenshot('sessions-page.png', {
      maxDiffPixels: 100,
    })

    await electronApp.close()
  })

  test('settings page appearance @visual', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Navigate to Settings
    await window.click('text=Settings')
    await window.waitForSelector('text=⚙️ Settings')

    // Take screenshot of settings page
    await expect(window).toHaveScreenshot('settings-page.png', {
      maxDiffPixels: 100,
    })

    await electronApp.close()
  })

  test('sidebar navigation hover states @visual', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Hover over Sessions nav item
    await window.hover('button:has-text("Sessions")')
    await window.waitForTimeout(500) // Wait for transition

    // Take screenshot with hover state
    await expect(window).toHaveScreenshot('sidebar-hover-state.png', {
      maxDiffPixels: 100,
    })

    await electronApp.close()
  })

  test('keyboard shortcuts modal appearance @visual', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)

    // Open shortcuts modal
    await window.click('button:has-text("Shortcuts")')
    await window.waitForSelector('text=Keyboard Shortcuts')

    // Take screenshot of modal
    await expect(window).toHaveScreenshot('shortcuts-modal.png', {
      maxDiffPixels: 100,
    })

    await electronApp.close()
  })

  test('responsive layout at different sizes @visual', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')
    await window.waitForTimeout(2000)
    await window.waitForSelector('text=Projects', { timeout: 10000 })

    // Test at 1920x1080 (Full HD)
    await window.setViewportSize({ width: 1920, height: 1080 })
    await expect(window).toHaveScreenshot('layout-1920x1080.png', {
      maxDiffPixels: 100,
    })

    // Test at 1366x768 (Common laptop)
    await window.setViewportSize({ width: 1366, height: 768 })
    await expect(window).toHaveScreenshot('layout-1366x768.png', {
      maxDiffPixels: 100,
    })

    // Test at 1280x720 (HD)
    await window.setViewportSize({ width: 1280, height: 720 })
    await expect(window).toHaveScreenshot('layout-1280x720.png', {
      maxDiffPixels: 100,
    })

    await electronApp.close()
  })
})
