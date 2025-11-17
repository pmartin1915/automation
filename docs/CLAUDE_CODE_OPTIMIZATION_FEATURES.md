# 🤖 Automation Station - Claude Code Web Optimization Features

## Priority Features for Claude Code Copy/Paste Workflow

### 1. **"Copy for Claude" Button** ⭐ HIGH PRIORITY
Add a button next to test results:
```
[View Results] [Copy for Claude Code]
```

**What it copies:**
```markdown
## Test Failures

Project: React App
Framework: Jest
Failed: 3/45

### Test 1: Login component renders correctly
File: src/components/Login.test.tsx:15
Error: Expected element to have text "Sign In" but got "Login"

Stack trace:
  at Object.<anonymous> (src/components/Login.test.tsx:15:23)

### Test 2: API call handles errors
File: src/api/auth.test.ts:42
Error: TypeError: Cannot read property 'data' of undefined

Stack trace:
  at handleApiError (src/api/auth.ts:87:14)
  at Object.<anonymous> (src/api/auth.test.ts:42:19)

---
Fix these test failures. Make minimal changes to pass the tests.
```

### 2. **Claude Code Context Generation** ⭐ HIGH PRIORITY
Button to generate rich context:
```
[Generate Claude Context]
```

**Copies:**
- Test failures (formatted)
- Git status (uncommitted changes)
- Recent commits
- File tree of changed files
- Project metadata

**Format:**
```markdown
# Project Context: React App

## Test Status
- Failed: 3/45
- Framework: Jest
- Last run: 2 minutes ago

## Test Failures
[formatted test output]

## Git Status
Branch: feature/login-improvements
Uncommitted changes:
  - M src/components/Login.tsx
  - M src/api/auth.ts

## Recent Commits
- abc123f: Add login form validation (2 hours ago)
- def456a: Update API error handling (3 hours ago)

## Files Changed
src/
├── components/
│   └── Login.tsx (modified)
└── api/
    └── auth.ts (modified)

## Task
Fix the failing tests above. Review the changes and make corrections.
```

### 3. **Output Formatting Options**
Dropdown next to copy button:
```
Copy as: [Markdown ▼] [Plain Text] [JSON]
```

### 4. **Quick Launch Claude Code**
Button that:
1. Copies context to clipboard
2. Opens Claude Code Web in browser
3. User just pastes (already in clipboard)

**Implementation:**
```typescript
async function launchClaudeCode(projectId: string) {
  // Generate context
  const context = await generateClaudeContext(projectId)

  // Copy to clipboard
  await navigator.clipboard.writeText(context)

  // Open Claude Code Web
  shell.openExternal('https://claude.ai/chat')

  // Show toast
  toast.success('Context copied! Paste into Claude Code')
}
```

### 5. **Test History Comparison**
Show what changed between test runs:
```
Previous Run: 42/45 passing
Current Run: 39/45 passing

New Failures (3):
  ❌ Login component renders correctly
  ❌ API call handles errors
  ❌ Navigation to dashboard works

Fixed (0):
  (none)
```

### 6. **Suggested Prompt Templates**
Pre-written prompts for common scenarios:

**Template 1: Fix Failing Tests**
```
Here are test failures from my {project.language} project using {project.testFramework}:

{test_output}

Please:
1. Analyze each failure
2. Identify the root cause
3. Fix the code to make tests pass
4. Explain what was wrong
```

**Template 2: Review Changes Before Testing**
```
I'm about to run tests on these changes:

{git_diff}

Review the changes and predict:
1. Which tests might fail
2. Any edge cases I should handle
3. Suggestions before I run tests
```

**Template 3: Understand Test Failure**
```
This test is failing but I don't understand why:

{specific_test_output}

Please explain:
1. What the test expects
2. What's actually happening
3. How to fix it
```

### 7. **Auto-Refresh After Git Pull**
When Claude fixes code in your project:
1. You pull changes (or Claude pushes to branch)
2. Automation Station detects git changes
3. Prompts: "Files changed. Re-run tests?"
4. One click to verify fixes

### 8. **Success/Failure Summary for Claude**
After Claude's fixes, generate summary:
```
## Test Run Summary

Before Claude's fixes: 39/45 passing (87%)
After Claude's fixes: 45/45 passing (100%) ✅

Fixed tests:
  ✅ Login component renders correctly
  ✅ API call handles errors
  ✅ Navigation to dashboard works

Claude succeeded! All tests now pass.
```

Copy this back to Claude for confirmation/learning.

## Implementation Priority

### Phase 1 (Immediate - Next Session)
1. ✅ "Copy Test Output" button (raw output)
2. ✅ "Copy for Claude" button (formatted markdown)
3. ✅ Clipboard API integration
4. ✅ Toast notification "Copied to clipboard!"

### Phase 2 (Soon)
5. ✅ Rich context generation (git status + tests + files)
6. ✅ Quick launch Claude Code button
7. ✅ Test history comparison

### Phase 3 (Later)
8. ✅ Prompt templates
9. ✅ Auto-refresh on git changes
10. ✅ Success summary generation

## Technical Implementation

### Copy Button Component
```typescript
function CopyTestOutputButton({ projectId }: { projectId: string }) {
  const testOutput = useStore(state => state.testOutput.get(projectId))

  const copyForClaude = async () => {
    const formatted = formatTestOutputForClaude(testOutput)
    await navigator.clipboard.writeText(formatted)
    toast.success('Test output copied! Paste into Claude Code')
  }

  return (
    <button onClick={copyForClaude} className="...">
      📋 Copy for Claude Code
    </button>
  )
}
```

### Context Generator
```typescript
async function generateClaudeContext(projectId: string): Promise<string> {
  const project = await getProject(projectId)
  const testOutput = await getTestOutput(projectId)
  const gitStatus = await getGitStatus(project.path)
  const recentCommits = await getRecentCommits(project.path, 5)
  const changedFiles = await getChangedFiles(project.path)

  return `
# Project Context: ${project.name}

## Test Status
${formatTestSummary(testOutput)}

## Test Failures
${formatTestFailures(testOutput)}

## Git Status
${formatGitStatus(gitStatus)}

## Recent Commits
${formatCommits(recentCommits)}

## Changed Files
${formatFileTree(changedFiles)}

## Task
Fix the failing tests above. Review the changes and make necessary corrections.
  `.trim()
}
```

## User Workflow Optimization

### Before (Manual)
```
1. Terminal: npm test
2. Read errors
3. Copy relevant parts
4. Switch to browser
5. Open Claude Code
6. Paste (fragmented)
7. Claude asks for more context
8. Go back, get more info
9. Paste again
10. Finally get response
11. Pull changes
12. Switch to terminal
13. Run tests again
```

### After (Optimized)
```
1. Automation Station: Click "Run Tests"
2. Click "Copy for Claude"
3. Paste into Claude Code (complete context)
4. Claude fixes immediately
5. Click "Run Tests" again
6. Done
```

**Time saved: ~70%**
**Context quality: 10x better**
**Friction: Eliminated**

## Success Metrics

Track:
- Average time from "test fails" to "test passes"
- Number of Claude iterations needed (should decrease)
- Copy button usage (should be primary action)
- Test re-run frequency (measure rapid iteration)

Goal: Make Automation Station the **essential bridge** between testing and Claude Code.
