import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import path from 'path'
import fs from 'fs/promises'
import type { Project, TestSuiteResult, TestResult, TestFile } from '../../shared/types'
import { getProjectManager } from './ProjectManager'

interface TestProcess {
  process: ChildProcess
  projectId: string
  startTime: number
  outputBuffer: string[]
}

export class TestRunner extends EventEmitter {
  private runningTests: Map<string, TestProcess> = new Map()
  private projectManager = getProjectManager()
  private readonly TEST_TIMEOUT = 5 * 60 * 1000 // 5 minutes

  /**
   * Run tests for a project
   */
  async runTests(
    projectId: string,
    testFile?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if tests are already running
      if (this.runningTests.has(projectId)) {
        return { success: false, error: 'Tests are already running for this project' }
      }

      // Get project
      const project = this.projectManager.getProject(projectId)
      if (!project) {
        return { success: false, error: 'Project not found' }
      }

      // Verify project path exists
      try {
        await fs.access(project.path)
      } catch {
        return { success: false, error: 'Project path does not exist' }
      }

      // Get test command
      const testCommand = this.getTestCommand(project, testFile)
      console.log(`Running tests for ${project.name}: ${testCommand}`)

      // Emit test started event
      this.emit('test:started', { projectId, project: project.name })

      // Spawn test process
      const [command, ...args] = testCommand.split(' ')
      const childProcess = spawn(command, args, {
        cwd: project.path,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '0' } // Disable colors for easier parsing
      })

      // Track process
      const testProcess: TestProcess = {
        process: childProcess,
        projectId,
        startTime: Date.now(),
        outputBuffer: []
      }
      this.runningTests.set(projectId, testProcess)

      // Set timeout
      const timeout = setTimeout(() => {
        this.killTestProcess(projectId)
        this.emit('test:error', {
          projectId,
          error: `Test timeout after ${this.TEST_TIMEOUT / 1000} seconds`
        })
      }, this.TEST_TIMEOUT)

      // Handle stdout
      childProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString()
        testProcess.outputBuffer.push(output)
        this.emit('test:output', { projectId, output, type: 'stdout' })
      })

      // Handle stderr
      childProcess.stderr?.on('data', (data: Buffer) => {
        const output = data.toString()
        testProcess.outputBuffer.push(output)
        this.emit('test:output', { projectId, output, type: 'stderr' })
      })

      // Handle process completion
      childProcess.on('close', (code) => {
        clearTimeout(timeout)
        const duration = Date.now() - testProcess.startTime
        const fullOutput = testProcess.outputBuffer.join('')

        // Parse test results
        const results = this.parseTestOutput(project, fullOutput, code === 0)

        // Emit completion
        this.emit('test:complete', {
          projectId,
          results,
          duration,
          exitCode: code
        })

        // Cleanup
        this.runningTests.delete(projectId)
        console.log(`Tests completed for ${project.name} (exit code: ${code})`)
      })

      // Handle process errors
      childProcess.on('error', (error) => {
        clearTimeout(timeout)
        this.emit('test:error', { projectId, error: error.message })
        this.runningTests.delete(projectId)
      })

      return { success: true }
    } catch (error: any) {
      console.error('Failed to run tests:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Kill a running test process
   */
  killTestProcess(projectId: string): boolean {
    const testProcess = this.runningTests.get(projectId)
    if (!testProcess) {
      return false
    }

    testProcess.process.kill('SIGTERM')
    this.runningTests.delete(projectId)
    this.emit('test:killed', { projectId })
    return true
  }

  /**
   * Check if tests are running for a project
   */
  isRunning(projectId: string): boolean {
    return this.runningTests.has(projectId)
  }

  /**
   * Get test command for a project
   */
  private getTestCommand(project: Project, testFile?: string): string {
    const baseCommand = this.projectManager.getDefaultTestCommand(project)

    // Add specific test file if provided
    if (testFile) {
      switch (project.testFramework) {
        case 'jest':
        case 'vitest':
          return `${baseCommand} ${testFile}`
        case 'pytest':
          return `pytest ${testFile}`
        case 'go-test':
          return `go test ${testFile}`
        case 'cargo-test':
          return `cargo test ${testFile}`
        default:
          return `${baseCommand} ${testFile}`
      }
    }

    return baseCommand
  }

  /**
   * Parse test output based on framework
   */
  private parseTestOutput(
    project: Project,
    output: string,
    success: boolean
  ): TestSuiteResult {
    const timestamp = new Date().toISOString()

    switch (project.testFramework) {
      case 'jest':
      case 'vitest':
        return this.parseJestVitestOutput(project.id, output, timestamp)
      case 'pytest':
        return this.parsePytestOutput(project.id, output, timestamp)
      case 'go-test':
        return this.parseGoTestOutput(project.id, output, timestamp)
      case 'cargo-test':
        return this.parseCargoTestOutput(project.id, output, timestamp)
      default:
        return this.parseGenericOutput(project.id, output, success, timestamp)
    }
  }

  /**
   * Parse Jest/Vitest output
   */
  private parseJestVitestOutput(
    projectId: string,
    output: string,
    timestamp: string
  ): TestSuiteResult {
    const results: TestResult[] = []
    let totalTests = 0
    let passed = 0
    let failed = 0
    let skipped = 0
    let duration = 0

    // Match test results: "✓ test name" or "✗ test name"
    const testRegex = /^\s*[✓✗×]\s+(.+?)\s+\((\d+)\s*ms\)/gm
    let match

    while ((match = testRegex.exec(output)) !== null) {
      const isPassed = match[0].includes('✓')
      const testName = match[1].trim()
      const testDuration = parseInt(match[2], 10)

      results.push({
        testFile: 'unknown',
        name: testName,
        status: isPassed ? 'passed' : 'failed',
        duration: testDuration
      })

      totalTests++
      if (isPassed) passed++
      else failed++
    }

    // Match summary: "Tests: 1 failed, 9 passed, 10 total"
    const summaryRegex = /Tests:\s+(?:(\d+)\s+failed,?\s*)?(?:(\d+)\s+passed,?\s*)?(?:(\d+)\s+skipped,?\s*)?(\d+)\s+total/i
    const summaryMatch = output.match(summaryRegex)
    if (summaryMatch) {
      failed = parseInt(summaryMatch[1] || '0', 10)
      passed = parseInt(summaryMatch[2] || '0', 10)
      skipped = parseInt(summaryMatch[3] || '0', 10)
      totalTests = parseInt(summaryMatch[4], 10)
    }

    // Match duration: "Time: 3.456s"
    const durationRegex = /Time:\s+([\d.]+)\s*s/i
    const durationMatch = output.match(durationRegex)
    if (durationMatch) {
      duration = parseFloat(durationMatch[1]) * 1000
    }

    return {
      projectId,
      testFile: 'all',
      totalTests,
      passed,
      failed,
      skipped,
      duration,
      results,
      timestamp
    }
  }

  /**
   * Parse Pytest output
   */
  private parsePytestOutput(
    projectId: string,
    output: string,
    timestamp: string
  ): TestSuiteResult {
    const results: TestResult[] = []
    let totalTests = 0
    let passed = 0
    let failed = 0
    let skipped = 0
    let duration = 0

    // Match summary: "10 passed, 2 failed in 3.45s"
    const summaryRegex = /(\d+)\s+passed(?:,\s+(\d+)\s+failed)?(?:,\s+(\d+)\s+skipped)?\s+in\s+([\d.]+)s/i
    const summaryMatch = output.match(summaryRegex)
    if (summaryMatch) {
      passed = parseInt(summaryMatch[1], 10)
      failed = parseInt(summaryMatch[2] || '0', 10)
      skipped = parseInt(summaryMatch[3] || '0', 10)
      totalTests = passed + failed + skipped
      duration = parseFloat(summaryMatch[4]) * 1000
    }

    return {
      projectId,
      testFile: 'all',
      totalTests,
      passed,
      failed,
      skipped,
      duration,
      results,
      timestamp
    }
  }

  /**
   * Parse Go test output
   */
  private parseGoTestOutput(
    projectId: string,
    output: string,
    timestamp: string
  ): TestSuiteResult {
    const results: TestResult[] = []
    let totalTests = 0
    let passed = 0
    let failed = 0
    let duration = 0

    // Match test results: "--- PASS: TestName (0.00s)" or "--- FAIL: TestName (0.00s)"
    const testRegex = /---\s+(PASS|FAIL):\s+(\S+)\s+\(([\d.]+)s\)/g
    let match

    while ((match = testRegex.exec(output)) !== null) {
      const status = match[1] === 'PASS' ? 'passed' : 'failed'
      const testName = match[2]
      const testDuration = parseFloat(match[3]) * 1000

      results.push({
        testFile: 'unknown',
        name: testName,
        status,
        duration: testDuration
      })

      totalTests++
      if (status === 'passed') passed++
      else failed++
    }

    return {
      projectId,
      testFile: 'all',
      totalTests,
      passed,
      failed,
      skipped: 0,
      duration,
      results,
      timestamp
    }
  }

  /**
   * Parse Cargo test output
   */
  private parseCargoTestOutput(
    projectId: string,
    output: string,
    timestamp: string
  ): TestSuiteResult {
    const results: TestResult[] = []
    let totalTests = 0
    let passed = 0
    let failed = 0
    let duration = 0

    // Match test results: "test result: ok. 10 passed; 0 failed"
    const summaryRegex = /test result:\s+\w+\.\s+(\d+)\s+passed;\s+(\d+)\s+failed/i
    const summaryMatch = output.match(summaryRegex)
    if (summaryMatch) {
      passed = parseInt(summaryMatch[1], 10)
      failed = parseInt(summaryMatch[2], 10)
      totalTests = passed + failed
    }

    return {
      projectId,
      testFile: 'all',
      totalTests,
      passed,
      failed,
      skipped: 0,
      duration,
      results,
      timestamp
    }
  }

  /**
   * Parse generic test output (fallback)
   */
  private parseGenericOutput(
    projectId: string,
    output: string,
    success: boolean,
    timestamp: string
  ): TestSuiteResult {
    return {
      projectId,
      testFile: 'all',
      totalTests: success ? 1 : 0,
      passed: success ? 1 : 0,
      failed: success ? 0 : 1,
      skipped: 0,
      duration: 0,
      results: [],
      timestamp
    }
  }

  /**
   * Discover test files in a project
   */
  async discoverTestFiles(projectId: string): Promise<TestFile[]> {
    const project = this.projectManager.getProject(projectId)
    if (!project) {
      return []
    }

    const testFiles: TestFile[] = []

    try {
      const patterns = this.getTestFilePatterns(project)
      const files = await this.findFiles(project.path, patterns)

      for (const file of files) {
        testFiles.push({
          id: `${projectId}-${file}`,
          projectId,
          name: path.basename(file),
          path: file,
          status: 'unknown',
          passedCount: 0,
          failedCount: 0,
          skippedCount: 0
        })
      }
    } catch (error) {
      console.error('Failed to discover test files:', error)
    }

    return testFiles
  }

  /**
   * Get test file patterns based on framework
   */
  private getTestFilePatterns(project: Project): string[] {
    switch (project.testFramework) {
      case 'jest':
      case 'vitest':
        return ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts', '**/*.spec.js']
      case 'pytest':
        return ['**/test_*.py', '**/*_test.py']
      case 'go-test':
        return ['**/*_test.go']
      case 'cargo-test':
        return ['**/tests/*.rs']
      default:
        return ['**/*.test.*', '**/*.spec.*']
    }
  }

  /**
   * Find files matching patterns (simple implementation)
   */
  private async findFiles(dir: string, patterns: string[]): Promise<string[]> {
    const files: string[] = []

    const traverse = async (currentDir: string) => {
      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name)

          // Skip node_modules, .git, etc.
          if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
            continue
          }

          if (entry.isDirectory()) {
            await traverse(fullPath)
          } else if (entry.isFile()) {
            // Check if file matches any pattern
            const relativePath = path.relative(dir, fullPath)
            if (this.matchesPattern(entry.name, patterns)) {
              files.push(relativePath)
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }

    await traverse(dir)
    return files
  }

  /**
   * Check if filename matches any pattern
   */
  private matchesPattern(filename: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      const regex = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.')
      return new RegExp(regex).test(filename)
    })
  }
}

// Singleton instance
let testRunnerInstance: TestRunner | null = null

export function getTestRunner(): TestRunner {
  if (!testRunnerInstance) {
    testRunnerInstance = new TestRunner()
  }
  return testRunnerInstance
}
