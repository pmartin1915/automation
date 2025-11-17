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
  name: string
  description: string
  goal?: string
  projectId: string
  branchName?: string
  status: 'planning' | 'in_progress' | 'paused' | 'completed' | 'blocked' | 'abandoned'
  outcome?: 'success' | 'partial' | 'blocked' | 'abandoned'
  notes: string  // markdown
  createdAt: number
  startedAt?: number
  completedAt?: number
  duration?: number  // milliseconds
  testRunIds: string[]
  commitShas: string[]
}

export interface SessionSummary {
  totalSessions: number
  completed: number
  inProgress: number
  successRate: number
  avgDuration: number
}

export interface TestRun {
  id: string
  projectId: string
  sessionId?: string
  timestamp: number
  duration: number
  totalTests: number
  passed: number
  failed: number
  skipped: number
  results: TestResult[]
}

export interface AppConfig {
  projects: Project[]
  theme: 'light' | 'dark' | 'auto'
  defaultTestCommand?: string
  gitAutoPush: boolean
  branchNamingPattern: string
  sessionAutoPause?: boolean  // Auto-pause sessions when app is idle
  sessionIdleTimeout?: number  // Minutes before auto-pause
  sessionAutoLink?: boolean  // Auto-link test runs and commits to active session
}

// Context generation types (Week 7)
export interface ContextTemplate {
  id: string
  name: string
  description: string
  category: 'fix-tests' | 'add-feature' | 'refactor' | 'custom'
}

export interface FailingTest {
  name: string
  file: string
  error: string
  stackTrace?: string
}

export interface ContextData {
  projectName: string
  projectPath: string
  language: string
  testFramework: string
  branch?: string
  gitStatus?: GitStatus
  testResults?: TestSuiteResult
  failingTests?: FailingTest[]
  sessionId?: string
  sessionName?: string
  sessionGoal?: string
}

export interface GeneratedContext {
  template: string
  content: string
  projectId: string
  timestamp: number
  sessionId?: string
}

// Activity tracking types (Week 8)
export interface Activity {
  id: string
  projectId: string
  type: 'session' | 'test_run' | 'commit' | 'file_change'
  timestamp: number
  title: string
  description: string
  metadata: {
    sessionId?: string
    sessionName?: string
    sessionStatus?: string
    testRunId?: string
    testsPassed?: number
    testsFailed?: number
    commitSha?: string
    commitMessage?: string
    files?: string[]
    outcome?: string
  }
}

// Analytics types (Week 8)
export interface SuccessMetrics {
  totalSessions: number
  completedSessions: number
  successfulSessions: number
  successRate: number
  avgDuration: number
  testFixSuccessRate: number
  featureAddSuccessRate: number
  refactorSuccessRate: number
}

export interface TrendData {
  date: string
  sessionsCompleted: number
  successRate: number
  testsFixed: number
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
  SESSION_GET_BY_ID: 'session:getById',
  SESSION_UPDATE: 'session:update',
  SESSION_DELETE: 'session:delete',
  SESSION_START: 'session:start',
  SESSION_PAUSE: 'session:pause',
  SESSION_RESUME: 'session:resume',
  SESSION_COMPLETE: 'session:complete',
  SESSION_GET_BY_PROJECT: 'session:getByProject',
  SESSION_GET_ANALYTICS: 'session:getAnalytics',
  SESSION_LINK_TEST_RUN: 'session:linkTestRun',
  SESSION_LINK_COMMIT: 'session:linkCommit',

  // Config operations
  CONFIG_GET: 'config:get',
  CONFIG_UPDATE: 'config:update',

  // Context operations (Week 7)
  CONTEXT_GENERATE: 'context:generate',
  CONTEXT_GET_TEMPLATES: 'context:getTemplates',
  CONTEXT_OPEN_EXTERNAL: 'context:openExternal',

  // Activity operations (Week 8)
  ACTIVITY_LOG: 'activity:log',
  ACTIVITY_GET_BY_PROJECT: 'activity:getByProject',
  ACTIVITY_GET_GLOBAL: 'activity:getGlobal',
  ACTIVITY_GET_METRICS: 'activity:getMetrics'
} as const
