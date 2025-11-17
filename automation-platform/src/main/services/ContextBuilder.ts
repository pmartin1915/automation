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

    // Suggested Tasks
    lines.push('## Suggested Tasks')
    lines.push('')

    if (data.failingTests && data.failingTests.length > 0) {
      lines.push('- [ ] Review each failing test error message')
      lines.push('- [ ] Identify the root cause of failures')
      lines.push('- [ ] Fix implementation code or update tests')
      lines.push('- [ ] Re-run tests to verify fixes')
      lines.push('- [ ] Commit changes with descriptive message')
    } else {
      lines.push('- [ ] Run tests to identify failures')
      lines.push('- [ ] Review test output for errors')
      lines.push('- [ ] Fix any failing tests')
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

    // Suggested Tasks
    lines.push('## Implementation Checklist')
    lines.push('')
    lines.push('- [ ] Design feature architecture')
    lines.push('- [ ] Write tests for new feature (TDD)')
    lines.push('- [ ] Implement feature code')
    lines.push('- [ ] Ensure all tests pass')
    lines.push('- [ ] Update documentation')
    lines.push('- [ ] Review and refactor if needed')
    lines.push('- [ ] Commit changes')
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

    // Suggested Tasks
    lines.push('## Refactoring Checklist')
    lines.push('')
    lines.push('- [ ] Identify code smells or areas for improvement')
    lines.push('- [ ] Ensure tests are passing before refactoring')
    lines.push('- [ ] Make incremental refactoring changes')
    lines.push('- [ ] Run tests after each change')
    lines.push('- [ ] Verify all tests still pass')
    lines.push('- [ ] Update documentation if needed')
    lines.push('- [ ] Commit refactoring changes')
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
