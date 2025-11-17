# Week 7 Analysis & Implementation Plan

## Current Status: Week 1-6 Review

### ✅ What's Been Implemented

**Week 1: Foundation (COMPLETE)**
- Electron + React + TypeScript project structure
- Vite build tooling configured
- IPC communication working
- Tailwind CSS + basic UI layout
- TypeScript compilation for all processes

**Week 2: Core Data Layer (COMPLETE)**
- Zustand store for state management
- ConfigStore service (persists to ~/.claude-automation/config.json)
- ProjectManager service with full CRUD operations
- Project validation (detects language, test framework)
- Functional IPC handlers
- React UI connected to Electron API
- Projects persist across app restarts

**Week 3: Test Execution (COMPLETE)**
- TestRunner service with child process spawning
- Real-time test output streaming via IPC events
- Multi-framework parser (Jest, Vitest, Pytest, Go, Rust)
- Test file discovery
- Test result state management
- Run Tests button per project
- Live test status indicators
- Test Results modal with detailed output
- Test timeout handling
- Kill test process functionality

**Week 4: File Watching & Live Updates (COMPLETE)**
- FileWatcher service with chokidar integration
- Debounced test execution (500ms default)
- Watch mode toggle per project
- Auto-run tests on file changes
- Smart file pattern matching
- Toast notification system (react-hot-toast)
- Real-time notifications for test results
- File change notifications

**Week 5: Git Integration (COMPLETE)**
- GitService wrapper around simple-git
- Git status detection (branch, dirty state, ahead/behind)
- Git status display in project cards
- Visual indicators for uncommitted changes
- Commit modal with message input
- Branch creation and switching UI
- Push/pull functionality
- Automatic Git status refresh
- Branch management modal
- Full IPC handlers for all Git operations

**Week 6: Session Management (COMPLETE)**
- SessionService with CRUD operations
- Session state management (start, pause, resume, complete, abandon)
- Session analytics (success rate, avg duration, counts)
- Test run and commit linking (backend ready)
- Persistent storage to ~/.claude-automation/sessions.json
- Live duration calculation
- Sessions page with timeline view
- CreateSessionModal with Git branch creation
- SessionDetailModal with notes editor
- SessionTimeline with filters
- SessionCard components
- Export session reports to markdown

### 🔴 What's Missing (Week 7 Focus)

According to the original 10-week roadmap, **Week 7** should implement:

1. **Context Generation** - The core feature that makes this a Claude Code automation platform
   - Analyze failing tests and gather error messages
   - Include git status in context
   - Generate suggested tasks based on test failures
   - Format context for Claude Code

2. **Launch Claude Code Button** - Integration point
   - "Launch Claude Code" button on each project
   - Preview context before launching
   - Edit context manually
   - Copy to clipboard (since we can't actually launch Claude Code Web programmatically)

3. **Enhanced Session Tracking**
   - Log each "Launch Claude Code" action
   - Link sessions to context generation events
   - Track which context was used for each session

4. **Context Templates**
   - Different context formats for different scenarios
   - "Fix Tests" context template
   - "Add Feature" context template
   - "Refactor" context template

---

## Week 7 Implementation Plan: Context Generation & Claude Code Integration

### Goals
- Generate intelligent Claude Code context from project state
- Add "Launch Claude Code" button to project cards
- Enable context preview and editing
- Auto-link context generation to sessions
- Support multiple context templates

### Phase 1: Backend - Context Generation Service (Days 1-2)

#### 1.1 Create ContextBuilder Service

**File:** `src/main/services/ContextBuilder.ts`

```typescript
export class ContextBuilder {
  /**
   * Generate Claude Code context for a project
   */
  async generateContext(
    project: Project,
    template: 'fix-tests' | 'add-feature' | 'refactor' | 'custom',
    options?: ContextOptions
  ): Promise<string>

  /**
   * Analyze failing tests and extract error information
   */
  private analyzeTestFailures(testResults: TestSuiteResult[]): FailureAnalysis

  /**
   * Format context based on template
   */
  private formatContext(
    template: string,
    data: ContextData
  ): string
}
```

**Features:**
- Analyze most recent test results
- Extract error messages and stack traces
- Include git status (branch, uncommitted changes)
- Generate task list based on failures
- Support multiple context templates
- Include project metadata (language, framework)

#### 1.2 Context Templates

Create built-in templates:

1. **Fix Tests Template:**
```markdown
# Fix Failing Tests: {project_name}

## Project Info
- Path: {project_path}
- Language: {language}
- Framework: {test_framework}
- Branch: {branch_name}

## Git Status
- Modified files: {modified_count}
- Uncommitted changes: {uncommitted_files}

## Test Results
- Total: {total_tests}
- Passed: {passed}
- Failed: {failed}
- Skipped: {skipped}

## Failing Tests
{failing_test_details}

## Suggested Tasks
- [ ] Review failing test output
- [ ] Identify root cause of failures
- [ ] Fix implementation or test code
- [ ] Verify all tests pass

## Session
Session ID: {session_id}
Goal: Fix {failed} failing tests
```

2. **Add Feature Template:**
```markdown
# Add Feature: {project_name}

## Project Info
- Path: {project_path}
- Language: {language}
- Current tests: {total_tests} (all passing ✅)

## Git Status
- Branch: {branch_name}
- Clean: {is_clean}

## Task
Add new feature to this project.

## Checklist
- [ ] Implement feature
- [ ] Write tests
- [ ] Verify all tests pass
- [ ] Update documentation
```

3. **Refactor Template** (similar structure)

#### 1.3 IPC Handlers

Add new IPC channels to `types.ts`:
```typescript
CONTEXT_GENERATE: 'context:generate',
CONTEXT_PREVIEW: 'context:preview',
CONTEXT_GET_TEMPLATES: 'context:getTemplates',
```

### Phase 2: Frontend - UI Integration (Days 3-4)

#### 2.1 Add "Launch Claude Code" Button to Dashboard

Update `src/renderer/pages/Dashboard.tsx`:

Add button to project card:
```tsx
<button
  onClick={() => handleLaunchClaude(project)}
  className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded hover:opacity-90 transition"
>
  🤖 Launch Claude Code
</button>
```

#### 2.2 Create ContextPreviewModal Component

**File:** `src/renderer/components/ContextPreviewModal.tsx`

**Features:**
- Display generated context
- Allow editing before copying
- Template selector dropdown
- Copy to clipboard button
- Create session option
- Markdown preview

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Claude Code Context - {project_name}           [X] │
├─────────────────────────────────────────────────────┤
│ Template: [Fix Tests ▼]  [Regenerate]              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Preview Tab] [Edit Tab]                          │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ {Generated context preview}                   │ │
│  │ - Markdown rendered or                        │ │
│  │ - Editable textarea                           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│ ☐ Create new session for this task                 │
│                                                     │
│ [Copy to Clipboard] [Open in Claude Code]          │
└─────────────────────────────────────────────────────┘
```

#### 2.3 Clipboard Integration

Use the Clipboard API:
```typescript
const handleCopyContext = async () => {
  await navigator.clipboard.writeText(context)
  toast.success('Context copied to clipboard!')
}
```

#### 2.4 Open Claude Code (External Browser)

Since we can't programmatically paste into Claude Code Web, we'll:
1. Copy context to clipboard
2. Open Claude Code in default browser
3. Show toast: "Context copied! Paste it into Claude Code."

```typescript
const handleOpenClaude = async () => {
  await navigator.clipboard.writeText(context)
  window.electronAPI.openExternal('https://claude.ai')
  toast.success('Context copied! Opening Claude Code...')
}
```

### Phase 3: Session Integration (Days 5-6)

#### 3.1 Link Context to Sessions

When generating context:
- Offer to create a new session
- Auto-populate session name from context template
- Link context generation event to session
- Track "Claude Code launches" in session timeline

#### 3.2 Add Context to SessionService

Extend Session type:
```typescript
export interface Session {
  // ... existing fields
  contextGenerated?: boolean
  contextTemplate?: string
  contextTimestamp?: number
  claudeCodeLaunched?: boolean
}
```

Add methods to SessionService:
```typescript
async linkContextGeneration(sessionId: string, template: string): Promise<void>
async recordClaudeLaunch(sessionId: string): Promise<void>
```

#### 3.3 Session Analytics Enhancement

Add to session analytics:
- Number of contexts generated
- Most used templates
- Success rate by template type

### Phase 4: Testing & Polish (Day 7)

#### 4.1 Manual Testing

Test scenarios:
1. Generate context for project with failing tests
2. Generate context for project with all tests passing
3. Switch templates and verify different output
4. Edit context manually before copying
5. Create session from context modal
6. Verify clipboard copy works
7. Test "Open Claude Code" button
8. Verify context includes all relevant info (git status, test failures, etc.)

#### 4.2 Edge Cases

Handle:
- No test results yet
- Project not in git repo
- Empty error messages
- Very long stack traces (truncate)
- Special characters in markdown

#### 4.3 UI Polish

- Add loading state while generating context
- Add error handling for context generation failures
- Add tooltips explaining context features
- Add keyboard shortcut (Cmd/Ctrl+K) for "Launch Claude Code"

---

## Data Models

### New Types (add to `src/shared/types.ts`)

```typescript
export interface ContextTemplate {
  id: string
  name: string
  description: string
  content: string  // Template string with {placeholders}
  category: 'fix-tests' | 'add-feature' | 'refactor' | 'custom'
}

export interface ContextData {
  project: Project
  gitStatus?: GitStatus
  testResults?: TestSuiteResult
  failingTests?: FailingTest[]
  sessionId?: string
  customFields?: Record<string, string>
}

export interface FailingTest {
  name: string
  file: string
  error: string
  stackTrace?: string
  suggestion?: string  // AI-generated suggestion (future)
}

export interface ContextGenerationEvent {
  id: string
  projectId: string
  sessionId?: string
  template: string
  timestamp: number
  contextLength: number
  copiedToClipboard: boolean
  claudeCodeLaunched: boolean
}
```

### New IPC Channels

```typescript
// Context operations
CONTEXT_GENERATE: 'context:generate',
CONTEXT_PREVIEW: 'context:preview',
CONTEXT_GET_TEMPLATES: 'context:getTemplates',
CONTEXT_CREATE_TEMPLATE: 'context:createTemplate',
CONTEXT_OPEN_CLAUDE: 'context:openClaude',

// Session-context linking
SESSION_RECORD_CONTEXT: 'session:recordContext',
SESSION_RECORD_LAUNCH: 'session:recordLaunch',
```

---

## Implementation Checklist

### Backend (Days 1-2)
- [ ] Create `ContextBuilder.ts` service
- [ ] Implement `generateContext()` method
- [ ] Create built-in templates (Fix Tests, Add Feature, Refactor)
- [ ] Implement test failure analysis
- [ ] Add git status to context
- [ ] Add IPC handlers for context operations
- [ ] Test context generation with different project states

### Frontend (Days 3-4)
- [ ] Add "Launch Claude Code" button to Dashboard project cards
- [ ] Create `ContextPreviewModal.tsx` component
- [ ] Implement template selector
- [ ] Add markdown preview/edit tabs
- [ ] Implement clipboard copy functionality
- [ ] Implement "Open Claude Code" (browser + clipboard)
- [ ] Add loading and error states
- [ ] Connect to Electron API

### Session Integration (Days 5-6)
- [ ] Extend Session type with context fields
- [ ] Add "Create session" checkbox to context modal
- [ ] Implement `linkContextGeneration()` in SessionService
- [ ] Implement `recordClaudeLaunch()` in SessionService
- [ ] Update SessionDetailModal to show context events
- [ ] Add context analytics to session summary
- [ ] Test session-context linking

### Testing & Polish (Day 7)
- [ ] Test all context templates
- [ ] Test with failing tests
- [ ] Test with passing tests
- [ ] Test clipboard integration
- [ ] Test browser opening
- [ ] Test session creation from context
- [ ] Handle edge cases (no git, no tests, etc.)
- [ ] Add keyboard shortcuts
- [ ] Add tooltips and help text
- [ ] Update README with Week 7 status

---

## Success Criteria

### Must-Have Features
- ✅ Generate context from project state
- ✅ Include test failures, git status, project info
- ✅ "Launch Claude Code" button on each project
- ✅ Context preview modal with edit capability
- ✅ Copy context to clipboard
- ✅ Open Claude Code in browser
- ✅ Link context generation to sessions
- ✅ Support multiple templates (Fix Tests, Add Feature, Refactor)

### Quality Bars
- ✅ Context is helpful and actionable for Claude
- ✅ All test failures are clearly presented
- ✅ Git status is accurate
- ✅ Templates are well-formatted markdown
- ✅ Clipboard copy is reliable
- ✅ UI is intuitive (no explanation needed)

### User Experience
- ✅ One-click to generate context
- ✅ Preview before copying
- ✅ Edit context if needed
- ✅ Seamless session creation
- ✅ Fast context generation (<500ms)
- ✅ Clear visual feedback

---

## Post-Week 7 (Week 8 Preview)

Once Week 7 is complete, the next logical steps are:

**Week 8: Advanced Integration**
- Session templates with pre-configured goals
- Task checklists embedded in context
- Activity feed showing all context generations
- Outcome tracking ("Did Claude fix it?")
- Context history per project
- Compare contexts over time

**Week 9: User Experience**
- Drag & drop project folders to add
- Keyboard shortcuts for all actions
- Settings panel for preferences
- Onboarding flow for new users
- Custom template builder UI

**Week 10: Testing & Release**
- Comprehensive testing
- Performance optimization
- Complete documentation
- Package for distribution
- Public release

---

## Files to Create/Modify

### New Files
- `src/main/services/ContextBuilder.ts` (~300 lines)
- `src/renderer/components/ContextPreviewModal.tsx` (~250 lines)

### Files to Modify
- `src/shared/types.ts` (add new types and IPC channels)
- `src/main/ipc-handlers.ts` (add context handlers)
- `src/main/services/SessionService.ts` (add context tracking)
- `src/preload/index.ts` (expose context API)
- `src/renderer/pages/Dashboard.tsx` (add Launch button)
- `src/renderer/store/useStore.ts` (add context state)
- `automation-platform/README.md` (update status to Week 7)

### Documentation to Update
- `docs/WEEK_7_ANALYSIS_AND_PLAN.md` (this file)
- `automation-platform/README.md` (mark Week 7 complete)

---

## Next Steps

1. Review this plan and confirm approach
2. Start with Phase 1 (Backend - ContextBuilder service)
3. Implement built-in templates
4. Add IPC handlers
5. Build UI components
6. Test end-to-end workflow
7. Polish and handle edge cases
8. Update documentation
9. Commit and push to branch

---

**Ready to implement Week 7! 🚀**
