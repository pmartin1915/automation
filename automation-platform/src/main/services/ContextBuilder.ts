import type {
  Project,
  TestSuiteResult,
  GitStatus,
  ContextTemplate,
  ContextData,
  FailingTest
} from '../../shared/types'

/**
 * ContextBuilder
 *
 * Generates Claude Code context from project state, including:
 * - Test failures with error details
 * - Git status (branch, uncommitted changes)
 * - Project metadata (language, framework)
 * - Session information
 * - Suggested tasks based on context
 */
export class ContextBuilder {
  private static instance: ContextBuilder

  private constructor() {}

  static getInstance(): ContextBuilder {
    if (!ContextBuilder.instance) {
      ContextBuilder.instance = new ContextBuilder()
    }
    return ContextBuilder.instance
  }

  /**
   * Get available context templates
   */
  getTemplates(): ContextTemplate[] {
    return [
      {
        id: 'fix-tests',
        name: 'Fix Failing Tests',
        description: 'Generate context to fix failing test suites',
        category: 'fix-tests'
      },
      {
        id: 'add-feature',
        name: 'Add Feature',
        description: 'Generate context for implementing a new feature',
        category: 'add-feature'
      },
      {
        id: 'refactor',
        name: 'Refactor Code',
        description: 'Generate context for code refactoring',
        category: 'refactor'
      }
    ]
  }

  /**
   * Generate Claude Code context for a project
   */
  async generateContext(
    project: Project,
    templateId: string,
    options?: {
      testResults?: TestSuiteResult
      gitStatus?: GitStatus
      sessionId?: string
      sessionName?: string
      sessionGoal?: string
    }
  ): Promise<string> {
    const template = this.getTemplates().find(t => t.id === templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Build context data
    const contextData: ContextData = {
      projectName: project.name,
      projectPath: project.path,
      language: this.formatLanguage(project.language),
      testFramework: this.formatTestFramework(project.testFramework),
      branch: options?.gitStatus?.branch,
      gitStatus: options?.gitStatus,
      testResults: options?.testResults,
      failingTests: this.extractFailingTests(options?.testResults),
      sessionId: options?.sessionId,
      sessionName: options?.sessionName,
      sessionGoal: options?.sessionGoal
    }

    // Generate context based on template
    switch (template.category) {
      case 'fix-tests':
        return this.generateFixTestsContext(contextData)
      case 'add-feature':
        return this.generateAddFeatureContext(contextData)
      case 'refactor':
        return this.generateRefactorContext(contextData)
      default:
        return this.generateGenericContext(contextData)
    }
  }

  /**
   * Generate "Fix Tests" context
   */
  private generateFixTestsContext(data: ContextData): string {
    const lines: string[] = []

    lines.push(`# Fix Failing Tests: ${data.projectName}`)
    lines.push('')
    lines.push('## Project Information')
    lines.push(`- **Path:** \`${data.projectPath}\``)
    lines.push(`- **Language:** ${data.language}`)
    lines.push(`- **Test Framework:** ${data.testFramework}`)

    if (data.branch) {
      lines.push(`- **Branch:** \`${data.branch}\``)
    }

    lines.push('')

    // Git Status
    if (data.gitStatus) {
      lines.push('## Git Status')

      if (data.gitStatus.isDirty) {
        lines.push('⚠️ **Working directory has uncommitted changes:**')
        if (data.gitStatus.modified > 0) {
          lines.push(`- Modified files: ${data.gitStatus.modified}`)
        }
        if (data.gitStatus.untracked > 0) {
          lines.push(`- Untracked files: ${data.gitStatus.untracked}`)
        }
        if (data.gitStatus.staged > 0) {
          lines.push(`- Staged files: ${data.gitStatus.staged}`)
        }
      } else {
        lines.push('✅ Working directory is clean')
      }

      if (data.gitStatus.ahead > 0) {
        lines.push(`- ${data.gitStatus.ahead} commit(s) ahead of remote`)
      }
      if (data.gitStatus.behind > 0) {
        lines.push(`- ${data.gitStatus.behind} commit(s) behind remote`)
      }

      lines.push('')
    }

    // Test Results
    if (data.testResults) {
      lines.push('## Test Results')
      lines.push(`- **Total Tests:** ${data.testResults.totalTests}`)
      lines.push(`- ✅ **Passed:** ${data.testResults.passed}`)

      if (data.testResults.failed > 0) {
        lines.push(`- ❌ **Failed:** ${data.testResults.failed}`)
      }

      if (data.testResults.skipped > 0) {
        lines.push(`- ⊘ **Skipped:** ${data.testResults.skipped}`)
      }

      lines.push(`- **Duration:** ${(data.testResults.duration / 1000).toFixed(2)}s`)
      lines.push('')
    }

    // Failing Tests Details
    if (data.failingTests && data.failingTests.length > 0) {
      lines.push('## Failing Tests')
      lines.push('')

      data.failingTests.forEach((test, index) => {
        lines.push(`### ${index + 1}. ${test.name}`)
        lines.push(`**File:** \`${test.file}\``)
        lines.push('')
        lines.push('**Error:**')
        lines.push('```')
        lines.push(test.error)
        lines.push('```')

        if (test.stackTrace) {
          lines.push('')
          lines.push('<details>')
          lines.push('<summary>Stack Trace</summary>')
          lines.push('')
          lines.push('```')
          lines.push(test.stackTrace)
          lines.push('```')
          lines.push('</details>')
        }

        lines.push('')
      })
    } else if (data.testResults && data.testResults.failed > 0) {
      lines.push('## Failing Tests')
      lines.push(`${data.testResults.failed} test(s) failed. Run tests to see detailed error messages.`)
      lines.push('')
    }

    // Session Info
    if (data.sessionId) {
      lines.push('## Session')
      lines.push(`- **ID:** \`${data.sessionId}\``)

      if (data.sessionName) {
        lines.push(`- **Name:** ${data.sessionName}`)
      }

      if (data.sessionGoal) {
        lines.push(`- **Goal:** ${data.sessionGoal}`)
      }

      lines.push('')
    }

    // Enhanced Task Checklist (Week 8)
    lines.push('## Task Checklist')
    lines.push('')

    if (data.failingTests && data.failingTests.length > 0) {
      lines.push('### Immediate Actions')
      data.failingTests.forEach((test, index) => {
        // Extract key info from error message for actionable task
        const errorSummary = test.error.split('\n')[0].substring(0, 100)
        lines.push(`- [ ] Fix test ${index + 1}: "${test.name}" in \`${test.file}\``)
        lines.push(`  - Error: ${errorSummary}`)
      })
      lines.push('')

      lines.push('### Verification')
      lines.push('- [ ] Re-run failing tests individually to verify fixes')
      lines.push('- [ ] Run full test suite to check for regressions')
      lines.push('- [ ] Verify no new test failures introduced')
      lines.push('')

      lines.push('### Completion')
      if (data.gitStatus?.isDirty) {
        lines.push('- [ ] Review all changes: `git diff`')
      }
      lines.push('- [ ] Commit changes: `git add . && git commit -m "fix: resolve test failures"`')
      if (data.sessionId) {
        lines.push('- [ ] Update session notes with fix summary')
        lines.push('- [ ] Mark session as complete with outcome')
      }
    } else {
      lines.push('- [ ] Run tests to identify failures: `npm test` or equivalent')
      lines.push('- [ ] Review test output for detailed error messages')
      lines.push('- [ ] Generate new context with failing test details')
    }

    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push('*Context generated by Claude Automation Platform*')

    return lines.join('\n')
  }

  /**
   * Generate "Add Feature" context
   */
  private generateAddFeatureContext(data: ContextData): string {
    const lines: string[] = []

    lines.push(`# Add Feature: ${data.projectName}`)
    lines.push('')
    lines.push('## Project Information')
    lines.push(`- **Path:** \`${data.projectPath}\``)
    lines.push(`- **Language:** ${data.language}`)
    lines.push(`- **Test Framework:** ${data.testFramework}`)

    if (data.branch) {
      lines.push(`- **Branch:** \`${data.branch}\``)
    }

    lines.push('')

    // Git Status
    if (data.gitStatus) {
      lines.push('## Git Status')

      if (data.gitStatus.isDirty) {
        lines.push('⚠️ **Working directory has uncommitted changes**')
      } else {
        lines.push('✅ Working directory is clean')
      }

      lines.push('')
    }

    // Current Test Status
    if (data.testResults) {
      lines.push('## Current Test Status')

      if (data.testResults.failed === 0 && data.testResults.passed > 0) {
        lines.push(`✅ All ${data.testResults.totalTests} tests passing`)
      } else {
        lines.push(`- Total: ${data.testResults.totalTests}`)
        lines.push(`- Passing: ${data.testResults.passed}`)
        lines.push(`- Failing: ${data.testResults.failed}`)
      }

      lines.push('')
    }

    // Session Info
    if (data.sessionGoal) {
      lines.push('## Feature Goal')
      lines.push(data.sessionGoal)
      lines.push('')
    }

    // Enhanced Implementation Checklist (Week 8)
    lines.push('## Implementation Checklist')
    lines.push('')

    lines.push('### Planning')
    if (data.sessionGoal) {
      lines.push('- [ ] Review feature requirements and acceptance criteria')
    }
    lines.push('- [ ] Identify files that need to be created/modified')
    lines.push('- [ ] Plan component/module structure')
    lines.push('- [ ] Consider edge cases and error scenarios')
    lines.push('')

    lines.push('### Implementation')
    lines.push('- [ ] Write tests for new feature (TDD approach)')
    if (data.language === 'TypeScript' || data.language === 'JavaScript') {
      lines.push('- [ ] Create/update TypeScript interfaces and types')
    }
    lines.push('- [ ] Implement core feature functionality')
    lines.push('- [ ] Add error handling and validation')
    lines.push('- [ ] Add logging/debugging as needed')
    lines.push('')

    lines.push('### Testing & Verification')
    lines.push(`- [ ] Run tests: \`${data.testFramework}\` command`)
    lines.push('- [ ] Verify all new tests pass')
    if (data.testResults && data.testResults.passed > 0) {
      lines.push('- [ ] Ensure existing tests still pass (no regressions)')
    }
    lines.push('- [ ] Test feature manually in development environment')
    lines.push('')

    lines.push('### Completion')
    lines.push('- [ ] Code review: Check for code quality and best practices')
    lines.push('- [ ] Update documentation (README, inline comments)')
    lines.push('- [ ] Commit: `git add . && git commit -m "feat: <description>"`')
    if (data.sessionId) {
      lines.push('- [ ] Update session notes')
      lines.push('- [ ] Mark session as complete')
    }
    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push('*Context generated by Claude Automation Platform*')

    return lines.join('\n')
  }

  /**
   * Generate "Refactor" context
   */
  private generateRefactorContext(data: ContextData): string {
    const lines: string[] = []

    lines.push(`# Refactor Code: ${data.projectName}`)
    lines.push('')
    lines.push('## Project Information')
    lines.push(`- **Path:** \`${data.projectPath}\``)
    lines.push(`- **Language:** ${data.language}`)
    lines.push(`- **Test Framework:** ${data.testFramework}`)

    if (data.branch) {
      lines.push(`- **Branch:** \`${data.branch}\``)
    }

    lines.push('')

    // Current Test Status
    if (data.testResults) {
      lines.push('## Baseline Test Status')
      lines.push('*(Ensure tests still pass after refactoring)*')
      lines.push('')
      lines.push(`- Total: ${data.testResults.totalTests}`)
      lines.push(`- Passing: ${data.testResults.passed}`)
      lines.push(`- Failing: ${data.testResults.failed}`)
      lines.push('')
    }

    // Session Info
    if (data.sessionGoal) {
      lines.push('## Refactoring Goal')
      lines.push(data.sessionGoal)
      lines.push('')
    }

    // Enhanced Refactoring Checklist (Week 8)
    lines.push('## Refactoring Checklist')
    lines.push('')

    lines.push('### Pre-Refactoring')
    if (data.testResults) {
      const allPassing = data.testResults.failed === 0 && data.testResults.passed > 0
      if (allPassing) {
        lines.push(`- [x] Baseline tests passing (${data.testResults.passed}/${data.testResults.totalTests})`)
      } else {
        lines.push(`- [ ] Fix failing tests first (${data.testResults.failed} failing)`)
      }
    } else {
      lines.push('- [ ] Run tests to establish baseline')
    }
    if (data.gitStatus && !data.gitStatus.isDirty) {
      lines.push('- [x] Working directory clean')
    } else {
      lines.push('- [ ] Commit or stash current changes')
    }
    if (data.sessionGoal) {
      lines.push('- [ ] Review refactoring goals and scope')
    }
    lines.push('')

    lines.push('### Refactoring Process')
    lines.push('- [ ] Identify code smells: duplication, long functions, complex logic')
    lines.push('- [ ] Make small, incremental changes')
    lines.push('- [ ] Run tests after each small change')
    lines.push('- [ ] Keep refactoring focused on one area at a time')
    lines.push('- [ ] Preserve existing functionality (no behavior changes)')
    lines.push('')

    lines.push('### Verification')
    lines.push('- [ ] Run full test suite')
    lines.push('- [ ] Verify all tests still pass')
    lines.push('- [ ] Review code quality improvements')
    lines.push('- [ ] Check for unintended side effects')
    lines.push('')

    lines.push('### Completion')
    lines.push('- [ ] Update inline documentation if needed')
    lines.push('- [ ] Commit: `git add . && git commit -m "refactor: <description>"`')
    if (data.sessionId) {
      lines.push('- [ ] Document refactoring decisions in session notes')
      lines.push('- [ ] Mark session as complete')
    }
    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push('*Context generated by Claude Automation Platform*')

    return lines.join('\n')
  }

  /**
   * Generate generic context (fallback)
   */
  private generateGenericContext(data: ContextData): string {
    const lines: string[] = []

    lines.push(`# ${data.projectName}`)
    lines.push('')
    lines.push('## Project Information')
    lines.push(`- **Path:** \`${data.projectPath}\``)
    lines.push(`- **Language:** ${data.language}`)
    lines.push(`- **Test Framework:** ${data.testFramework}`)

    if (data.branch) {
      lines.push(`- **Branch:** \`${data.branch}\``)
    }

    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push('*Context generated by Claude Automation Platform*')

    return lines.join('\n')
  }

  /**
   * Extract failing tests from test results
   */
  private extractFailingTests(testResults?: TestSuiteResult): FailingTest[] {
    if (!testResults) {
      return []
    }

    return testResults.results
      .filter(r => r.status === 'failed')
      .map(r => ({
        name: r.name,
        file: r.testFile,
        error: r.error || 'No error message',
        stackTrace: r.stackTrace
      }))
  }

  /**
   * Format language name for display
   */
  private formatLanguage(language: string): string {
    const languageMap: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'go': 'Go',
      'rust': 'Rust',
      'other': 'Other'
    }
    return languageMap[language] || language
  }

  /**
   * Format test framework name for display
   */
  private formatTestFramework(framework: string): string {
    const frameworkMap: Record<string, string> = {
      'jest': 'Jest',
      'vitest': 'Vitest',
      'pytest': 'Pytest',
      'go-test': 'Go Test',
      'cargo-test': 'Cargo Test',
      'other': 'Other'
    }
    return frameworkMap[framework] || framework
  }
}

// Export singleton instance
export const contextBuilder = ContextBuilder.getInstance()
