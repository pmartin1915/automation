/**
 * Vitest setup file
 * Runs before all tests
 */

import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Extend Vitest's expect with custom matchers if needed
// expect.extend(customMatchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock Electron APIs for unit tests
global.window = global.window || {}

// @ts-ignore
global.window.electronAPI = {
  projects: {
    getAll: vi.fn(() => Promise.resolve([])),
    add: vi.fn(() => Promise.resolve({ success: true })),
    remove: vi.fn(() => Promise.resolve({ success: true })),
    update: vi.fn(() => Promise.resolve({ success: true })),
    analyzeFolder: vi.fn(() => Promise.resolve({ valid: true })),
  },
  git: {
    status: vi.fn(() => Promise.resolve({
      branch: 'main',
      isDirty: false,
      ahead: 0,
      behind: 0
    })),
    commit: vi.fn(() => Promise.resolve({ success: true })),
    push: vi.fn(() => Promise.resolve({ success: true })),
    pull: vi.fn(() => Promise.resolve({ success: true })),
    getBranches: vi.fn(() => Promise.resolve({
      local: ['main'],
      remote: [],
      current: 'main'
    })),
    switchBranch: vi.fn(() => Promise.resolve({ success: true })),
    createBranch: vi.fn(() => Promise.resolve({ success: true })),
  },
  tests: {
    runAll: vi.fn(() => Promise.resolve({ success: true })),
    onStarted: vi.fn(),
    onOutput: vi.fn(),
    onComplete: vi.fn(),
    onError: vi.fn(),
    onKilled: vi.fn(),
  },
  watch: {
    start: vi.fn(() => Promise.resolve({ success: true })),
    stop: vi.fn(() => Promise.resolve({ success: true })),
    onStarted: vi.fn(),
    onStopped: vi.fn(),
    onTriggered: vi.fn(),
  },
  sessions: {
    getAll: vi.fn(() => Promise.resolve([])),
    create: vi.fn(() => Promise.resolve({ success: true })),
    update: vi.fn(() => Promise.resolve({ success: true })),
    delete: vi.fn(() => Promise.resolve({ success: true })),
    start: vi.fn(() => Promise.resolve({ success: true })),
    pause: vi.fn(() => Promise.resolve({ success: true })),
    resume: vi.fn(() => Promise.resolve({ success: true })),
    complete: vi.fn(() => Promise.resolve({ success: true })),
    getAnalytics: vi.fn(() => Promise.resolve({
      totalSessions: 0,
      completedSessions: 0,
      averageDuration: 0,
      successRate: 0
    })),
  },
  context: {
    generate: vi.fn(() => Promise.resolve({ success: true, context: '' })),
  },
}
