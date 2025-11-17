# 🤖 Claude Code Web Integration Guide

## Overview

**Goal:** Seamlessly launch Claude Code Web from the Automation Platform with rich context about failing tests, git status, and suggested tasks.

---

## Integration Strategy

### **Current State: Manual Context Transfer**

Since Claude Code Web doesn't support deep linking yet, we use a **copy-paste workflow**:

1. User clicks "Launch Claude Code" in Automation Platform
2. Platform generates rich context (failing tests, errors, git status)
3. Context is copied to clipboard automatically
4. Platform opens Claude Code Web in browser
5. User pastes context into Claude Code
6. Claude Code starts working with full context

### **Future State: Deep Linking (When Available)**

```
https://claude.ai/code?context=<encoded-json>&project=<id>
```

Platform would send structured data directly to Claude Code Web.

---

## Context Generation

### **What to Include**

A good Claude context has:
1. **Project overview** (name, language, test framework)
2. **Current state** (git branch, uncommitted changes)
3. **The problem** (failing tests with specific errors)
4. **Suggested tasks** (what you want Claude to do)
5. **Constraints** (don't change X, keep Y consistent)

### **Example Context**

```markdown
I'm working on the **Clinical Toolkit** project.

## Project Details
- **Language:** TypeScript + React
- **Test Framework:** Jest + React Testing Library
- **Branch:** claude/mobile-app-conversion-v1

## Current Status
- **Tests:** 97/113 passing (86%)
- **Failing:** 16 tests across 3 files
- **Uncommitted changes:** 12 files modified

## Failing Tests

### 1. AboutCOPD.test.tsx (7/9 passing)

**Failed:** "should navigate through assessment wizard"
**Error:**
```
TestingLibraryElementError: Unable to find element: Take Assessment

This could be because the text is broken up by multiple elements.

<button>Start Assessment</button>
```

**Analysis:** Component uses "Start Assessment" but test expects "Take Assessment"

**Failed:** "should show next button after first question"
**Error:**
```
Expected element to be in document
```

**Analysis:** Wizard navigation might not be rendering correctly

### 2. Assessments.test.tsx (0/7 passing)

**Failed:** All tests - same root cause as above

## Git Status
- **Uncommitted files:**
  - src/components/AboutCOPD.tsx (modified)
  - src/components/Assessments.tsx (modified)
  - tests/AboutCOPD.test.tsx (modified)
  - ... (9 more files)

## Tasks

Could you help me:
1. ✅ Fix the button text issue ("Take Assessment" vs "Start Assessment")
2. ✅ Debug why wizard navigation isn't rendering
3. ✅ Update all related tests to match the actual implementation
4. ✅ Run tests after each fix to verify
5. ✅ Commit and push when all tests pass

## Constraints
- Keep the existing component structure
- Don't modify the assessment logic (only UI/tests)
- Follow the existing code style

Let me know when you're ready to start! 🚀
```

---

## Context Builder Implementation

### **TypeScript Interface**

```typescript
interface ClaudeContext {
  project: {
    name: string;
    language: string;
    testFramework: string;
  };
  git: {
    branch: string;
    uncommittedFiles: string[];
    ahead?: number;
    behind?: number;
  };
  tests: {
    summary: {
      total: number;
      passed: number;
      failed: number;
    };
    failures: TestFailure[];
  };
  tasks: Task[];
  constraints?: string[];
}

interface TestFailure {
  file: string;
  testName: string;
  error: {
    message: string;
    stack?: string;
  };
  analysis?: string; // AI-generated or manual
}

interface Task {
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}
```

### **Context Builder Class**

```typescript
class ClaudeContextBuilder {
  private project: Project;
  private testResults: TestResults;
  private gitStatus: GitStatus;

  constructor(project: Project, testResults: TestResults, gitStatus: GitStatus) {
    this.project = project;
    this.testResults = testResults;
    this.gitStatus = gitStatus;
  }

  /**
   * Generate markdown-formatted context for Claude Code
   */
  build(): string {
    const sections = [
      this.buildHeader(),
      this.buildProjectDetails(),
      this.buildCurrentStatus(),
      this.buildFailingTests(),
      this.buildGitStatus(),
      this.buildSuggestedTasks(),
      this.buildConstraints(),
    ];

    return sections.filter(Boolean).join('\n\n');
  }

  private buildHeader(): string {
    return `I'm working on the **${this.project.name}** project.`;
  }

  private buildProjectDetails(): string {
    return `
## Project Details
- **Language:** ${this.project.language}
- **Test Framework:** ${this.project.testFramework}
- **Branch:** ${this.gitStatus.branch}
    `.trim();
  }

  private buildCurrentStatus(): string {
    const { total, passed, failed } = this.testResults.summary;
    const percentage = Math.round((passed / total) * 100);

    return `
## Current Status
- **Tests:** ${passed}/${total} passing (${percentage}%)
- **Failing:** ${failed} tests
- **Uncommitted changes:** ${this.gitStatus.modified.length} files modified
    `.trim();
  }

  private buildFailingTests(): string {
    const failures = this.testResults.suites
      .filter(suite => suite.tests.some(t => t.status === 'failed'))
      .map(suite => this.formatSuite(suite));

    return `
## Failing Tests

${failures.join('\n\n')}
    `.trim();
  }

  private formatSuite(suite: TestSuite): string {
    const failedTests = suite.tests.filter(t => t.status === 'failed');
    const total = suite.tests.length;
    const passed = total - failedTests.length;

    let output = `### ${suite.file} (${passed}/${total} passing)\n\n`;

    failedTests.forEach(test => {
      output += `**Failed:** "${test.name}"\n`;
      output += `**Error:**\n\`\`\`\n${test.error?.message}\n\`\`\`\n\n`;

      // Optional: Add AI-generated analysis
      const analysis = this.analyzeFailure(test);
      if (analysis) {
        output += `**Analysis:** ${analysis}\n\n`;
      }
    });

    return output;
  }

  private analyzeFailure(test: Test): string | null {
    // Simple heuristics for common errors
    const msg = test.error?.message || '';

    if (msg.includes('Unable to find element')) {
      const match = msg.match(/Unable to find element: (.+)/);
      if (match) {
        return `Test expects element "${match[1]}" but it's not in the DOM. Check component rendering.`;
      }
    }

    if (msg.includes('Expected element to be in document')) {
      return `Expected element is not rendered. Check conditional rendering logic.`;
    }

    if (msg.includes('Timeout')) {
      return `Test timed out. Likely an async operation that didn't complete.`;
    }

    // More patterns...
    return null;
  }

  private buildGitStatus(): string {
    return `
## Git Status
- **Uncommitted files:**
${this.gitStatus.modified.slice(0, 10).map(f => `  - ${f} (modified)`).join('\n')}
${this.gitStatus.modified.length > 10 ? `  - ... (${this.gitStatus.modified.length - 10} more files)` : ''}
    `.trim();
  }

  private buildSuggestedTasks(): string {
    const tasks = this.generateTasks();

    return `
## Tasks

Could you help me:
${tasks.map((task, i) => `${i + 1}. ${task}`).join('\n')}

Let me know when you're ready to start! 🚀
    `.trim();
  }

  private generateTasks(): string[] {
    const tasks: string[] = [];

    // Based on test failures
    if (this.testResults.summary.failed > 0) {
      tasks.push('Fix all failing tests');
    }

    // Based on git status
    if (this.gitStatus.modified.length > 0) {
      tasks.push('Review and commit changes when tests pass');
    }

    if (this.gitStatus.behind && this.gitStatus.behind > 0) {
      tasks.push('Pull latest changes from remote');
    }

    // Generic
    tasks.push('Run tests after each fix to verify');
    tasks.push('Follow TDD workflow (test → fix → test → repeat)');

    return tasks;
  }

  private buildConstraints(): string | null {
    // Optional: Add project-specific constraints
    // Could be stored in project config
    return null;
  }
}
```

---

## Usage in Automation Platform

### **1. "Launch Claude Code" Button**

```typescript
const LaunchClaudeCodeButton: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { project } = useProject(projectId);
  const { testResults } = useTests(projectId);
  const { gitStatus } = useGit(projectId);

  const handleLaunch = async () => {
    // Build context
    const builder = new ClaudeContextBuilder(project, testResults, gitStatus);
    const context = builder.build();

    // Copy to clipboard
    await navigator.clipboard.writeText(context);

    // Open Claude Code Web
    window.open('https://claude.ai/code', '_blank');

    // Track session
    trackSession({
      projectId,
      timestamp: new Date(),
      context,
      branch: gitStatus.branch,
    });

    // Show notification
    toast.success('Context copied to clipboard! Paste it into Claude Code.');
  };

  return (
    <button
      onClick={handleLaunch}
      className="btn btn-primary"
    >
      🚀 Launch Claude Code
    </button>
  );
};
```

### **2. Context Preview Modal**

```typescript
const ClaudeContextModal: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const context = useMemo(() => {
    // Generate context...
  }, [projectId]);

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <h2>Claude Code Context</h2>
      <p>This context will be copied to your clipboard:</p>

      <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
        {context}
      </pre>

      <div className="flex gap-2">
        <button onClick={() => {
          navigator.clipboard.writeText(context);
          window.open('https://claude.ai/code', '_blank');
          setIsOpen(false);
        }}>
          Copy & Launch
        </button>
        <button onClick={() => setIsOpen(false)}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};
```

---

## Session Tracking

### **Why Track Sessions?**

- **Measure effectiveness:** Did Claude fix the issue?
- **Build history:** What has been done in each session?
- **Learn patterns:** What kinds of tasks work best?
- **Improve context:** Iterate on context format based on outcomes

### **Session Model**

```typescript
interface ClaudeSession {
  id: string;
  projectId: string;
  timestamp: Date;
  context: string;
  branch: string;
  testsBefore: {
    total: number;
    passed: number;
    failed: number;
  };
  testsAfter?: {
    total: number;
    passed: number;
    failed: number;
  };
  outcome?: 'success' | 'partial' | 'failed' | 'unknown';
  notes?: string;
  commits?: string[]; // Commit hashes made during session
}
```

### **Tracking Implementation**

```typescript
class SessionTracker {
  async startSession(project: Project, context: string): Promise<ClaudeSession> {
    const session: ClaudeSession = {
      id: generateId(),
      projectId: project.id,
      timestamp: new Date(),
      context,
      branch: project.git.currentBranch,
      testsBefore: { ...project.lastRun },
    };

    await this.saveSession(session);
    return session;
  }

  async endSession(sessionId: string, outcome: 'success' | 'partial' | 'failed'): Promise<void> {
    const session = await this.getSession(sessionId);
    const project = await projectManager.getProject(session.projectId);

    session.testsAfter = { ...project.lastRun };
    session.outcome = outcome;

    await this.saveSession(session);
  }

  async getSessionHistory(projectId: string): Promise<ClaudeSession[]> {
    // Return all sessions for a project, sorted by date
  }

  async getSuccessRate(projectId: string): Promise<number> {
    const sessions = await this.getSessionHistory(projectId);
    const successful = sessions.filter(s => s.outcome === 'success').length;
    return (successful / sessions.length) * 100;
  }
}
```

---

## Advanced: Webhook Integration (Future)

### **Concept**

If Claude Code Web eventually supports webhooks, we could:

1. Platform generates context and launches Claude Code
2. Claude Code sends updates back to Platform via webhook
3. Platform shows real-time progress in UI
4. Auto-updates when Claude commits/pushes

### **Webhook Endpoint**

```typescript
// In Electron main process, start a local HTTP server
import express from 'express';

const app = express();

app.post('/webhook/claude-update', (req, res) => {
  const { sessionId, event, data } = req.body;

  switch (event) {
    case 'test-run':
      // Claude ran tests
      updateUI({ sessionId, testResults: data });
      break;

    case 'commit':
      // Claude made a commit
      updateUI({ sessionId, commit: data });
      break;

    case 'complete':
      // Claude finished the task
      endSession(sessionId, data.outcome);
      break;
  }

  res.json({ success: true });
});

app.listen(3456, () => {
  console.log('Webhook server running on http://localhost:3456');
});
```

### **Claude Code Sends**

```bash
# After running tests
curl -X POST http://localhost:3456/webhook/claude-update \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "event": "test-run",
    "data": {
      "passed": 100,
      "failed": 13,
      "total": 113
    }
  }'

# After committing
curl -X POST http://localhost:3456/webhook/claude-update \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "event": "commit",
    "data": {
      "hash": "abc1234",
      "message": "fix: update test expectations"
    }
  }'
```

---

## User Flow Example

### **Scenario: Fix Failing Tests**

```
1. User opens Automation Platform
   └─> Sees "Clinical Toolkit: 97/113 tests passing"

2. User clicks on "Clinical Toolkit"
   └─> Sees list of failing tests with errors

3. User clicks "🚀 Launch Claude Code"
   └─> Platform:
       ├─> Generates context (project, tests, git, tasks)
       ├─> Copies context to clipboard
       ├─> Opens claude.ai/code in browser
       └─> Creates session record (Session #42)

4. User pastes context into Claude Code
   └─> Claude sees:
       ├─> 16 failing tests
       ├─> Specific error messages
       ├─> Suggested tasks

5. Claude starts working
   └─> Reads test files
   └─> Identifies issues
   └─> Fixes components
   └─> Re-runs tests
   └─> Sees 113/113 passing ✅

6. Claude commits and pushes
   └─> Commit: "fix: update test expectations for mobile conversion"

7. User returns to Automation Platform
   └─> Clicks "Refresh" or auto-refreshes
   └─> Sees "Clinical Toolkit: 113/113 tests passing" ✅
   └─> Session #42 marked as "Success"
   └─> Activity feed shows: "Claude fixed 16 tests in Session #42"

8. User clicks "End Session" (optional)
   └─> Rates session outcome: Success / Partial / Failed
   └─> Adds notes (optional)
```

---

## Best Practices

### **1. Keep Context Concise**
- Include only failing tests (not all 113 tests)
- Truncate long error messages
- Focus on actionable information

### **2. Provide Clear Tasks**
- Be specific: "Fix button text" not "Fix tests"
- Prioritize: Most critical task first
- Include exit criteria: "All tests passing"

### **3. Include Constraints**
- "Don't modify X"
- "Keep Y consistent with Z"
- "Follow existing patterns in file.tsx"

### **4. Update Context as You Learn**
- If a particular format works well, use it consistently
- Add more detail where Claude often asks for clarification
- Remove unnecessary info that Claude ignores

### **5. Track Outcomes**
- Always mark session as success/failure
- Note what worked and what didn't
- Iterate on context format

---

## Measuring Success

### **Metrics**

1. **Session Success Rate**
   - Target: 80%+ of sessions result in "success"
   - Measure: Track outcome when ending session

2. **Time to Resolution**
   - Target: 50% faster than manual fixing
   - Measure: Time from "Launch Claude Code" to "tests passing"

3. **Context Effectiveness**
   - Target: Claude asks <2 clarifying questions per session
   - Measure: Manual tracking (ask Claude "Did you have enough context?")

4. **Test Pass Rate Improvement**
   - Target: Average project test pass rate >90%
   - Measure: Track pass rate before/after using platform

---

## Troubleshooting

### **Issue: Context too long**
**Solution:** Truncate error messages, show only first 5 failing tests, link to rest

### **Issue: Claude doesn't understand context**
**Solution:** Add more structure (headings, bullet points), use clearer language

### **Issue: Claude asks for missing info**
**Solution:** Add that info to context builder for future sessions

### **Issue: Session tracking not accurate**
**Solution:** Prompt user to manually update outcome, don't auto-determine

---

## Future Enhancements

1. **AI-Powered Context**
   - Use local LLM to analyze errors and generate better context
   - Auto-suggest constraints based on code patterns

2. **Two-Way Sync**
   - Real-time updates from Claude Code (via webhooks)
   - Show Claude's progress in Platform UI

3. **Context Templates**
   - Pre-built templates for common scenarios
   - User-editable templates

4. **Smart Suggestions**
   - "Claude successfully fixed similar issues in Session #38"
   - Link to previous sessions with similar errors

5. **Feedback Loop**
   - Ask Claude "Was the context helpful?" at end of session
   - Use feedback to improve context generation

---

**With thoughtful context generation and session tracking, the Automation Platform becomes a powerful bridge between you and Claude Code, enabling efficient, AI-assisted development across all your projects.** 🚀
