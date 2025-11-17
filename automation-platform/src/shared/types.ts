// Shared types between main and renderer processes

export interface Project {
  id: string
  name: string
  path: string
  language: 'javascript' | 'typescript' | 'python' | 'go' | 'rust' | 'other'
  testFramework: 'jest' | 'vitest' | 'pytest' | 'go-test' | 'cargo-test' | 'other'
  testCommand?: string
  branch?: string
  lastSession?: string
  watchMode?: boolean  // Enable/disable file watching for auto-testing
  gitStatus?: GitStatus  // Cached Git status
  createdAt: string
  updatedAt: string
}

export interface TestFile {
  id: string
  projectId: string
  name: string
  path: string
  status: 'passing' | 'failing' | 'skipped' | 'running' | 'unknown'
  passedCount: number
  failedCount: number
  skippedCount: number
  duration?: number
  lastRun?: string
}

export interface TestResult {
  testFile: string
  name: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  stackTrace?: string
}

export interface TestSuiteResult {
  projectId: string
  testFile: string
  totalTests: number
  passed: number
  failed: number
  skipped: number
  duration: number
  results: TestResult[]
  timestamp: string
}

export interface GitStatus {
  branch: string
  ahead: number
  behind: number
  modified: number
  untracked: number
  staged: number
  conflicted: number
  isDirty: boolean
}

export interface Session {
  id: string
  projectId: string
  task: string
  branch: string
  timestamp: string
  outcome?: 'success' | 'partial' | 'failed'
  notes?: string
}

export interface AppConfig {
  projects: Project[]
  theme: 'light' | 'dark' | 'auto'
  defaultTestCommand?: string
  gitAutoPush: boolean
  branchNamingPattern: string
}

// IPC Channel names
export const IPC_CHANNELS = {
  // Project operations
  PROJECT_ADD: 'project:add',
  PROJECT_REMOVE: 'project:remove',
  PROJECT_GET: 'project:get',
  PROJECT_GET_ALL: 'project:getAll',
  PROJECT_UPDATE: 'project:update',

  // Test operations
  TEST_RUN: 'test:run',
  TEST_RUN_ALL: 'test:runAll',
  TEST_DISCOVER_FILES: 'test:discoverFiles',
  TEST_KILL: 'test:kill',
  TEST_STARTED: 'test:started',
  TEST_OUTPUT: 'test:output',
  TEST_COMPLETE: 'test:complete',
  TEST_ERROR: 'test:error',
  TEST_KILLED: 'test:killed',

  // Watch mode operations
  WATCH_START: 'watch:start',
  WATCH_STOP: 'watch:stop',
  WATCH_STARTED: 'watch:started',
  WATCH_STOPPED: 'watch:stopped',
  WATCH_TRIGGERED: 'watch:triggered',

  // Git operations
  GIT_STATUS: 'git:status',
  GIT_COMMIT: 'git:commit',
  GIT_PUSH: 'git:push',
  GIT_PULL: 'git:pull',
  GIT_CREATE_BRANCH: 'git:createBranch',
  GIT_SWITCH_BRANCH: 'git:switchBranch',
  GIT_GET_BRANCHES: 'git:getBranches',

  // Session operations
  SESSION_CREATE: 'session:create',
  SESSION_GET_ALL: 'session:getAll',
  SESSION_UPDATE: 'session:update',

  // Config operations
  CONFIG_GET: 'config:get',
  CONFIG_UPDATE: 'config:update'
} as const
