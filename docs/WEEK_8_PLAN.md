# Week 8: Advanced Integration - Implementation Plan

## Overview
Week 8 focuses on advanced integration features that create a comprehensive activity tracking and success measurement system. This builds on Week 7's context generation to create a complete workflow loop.

## Current State Analysis

### ✅ Already Implemented (Week 7)
- **Session Templates**: 3 built-in templates (Fix Tests, Add Feature, Refactor)
- **Context Generation**: Smart context with test failures, git status
- **Outcome Tracking**: Sessions have outcome field with UI to set it
- **Session Timeline**: Visual timeline of sessions

### 🔨 Week 8 Goals
1. **Activity Feed** - Unified timeline of all project events
2. **Enhanced Task Checklists** - More actionable, error-specific tasks
3. **Success Metrics Dashboard** - Visual analytics and success tracking
4. **Custom Session Templates** - User-defined templates

---

## Feature 1: Activity Feed Component

### Purpose
Create a unified, chronological timeline showing ALL project activity:
- Session events (created, started, completed)
- Test runs (passed/failed)
- Git commits
- File changes

### Implementation

#### 1.1 Backend: ActivityService
**File**: `src/main/services/ActivityService.ts`

```typescript
interface Activity {
  id: string
  projectId: string
  type: 'session' | 'test_run' | 'commit' | 'file_change'
  timestamp: number
  title: string
  description: string
  metadata: {
    sessionId?: string
    testRunId?: string
    commitSha?: string
    files?: string[]
    outcome?: string
    testsPassed?: number
    testsFailed?: number
  }
}

class ActivityService {
  // Track all project activities
  async logActivity(activity: Omit<Activity, 'id'>): Promise<Activity>

  // Get activities for a project
  async getActivities(projectId: string, limit?: number): Promise<Activity[]>

  // Get global feed (all projects)
  async getGlobalFeed(limit?: number): Promise<Activity[]>

  // Auto-generate from events
  async onTestComplete(projectId: string, results: TestSuiteResult): Promise<void>
  async onSessionCreated(session: Session): Promise<void>
  async onCommit(projectId: string, commitSha: string, message: string): Promise<void>
}
```

#### 1.2 UI: ActivityFeed Component
**File**: `src/renderer/components/ActivityFeed.tsx`

Features:
- Timeline view with icons for each activity type
- Grouped by day (Today, Yesterday, This Week, etc.)
- Clickable items to navigate to details
- Filter by activity type
- Real-time updates

#### 1.3 Dashboard Integration
Add Activity Feed widget to Dashboard showing:
- Recent 10 activities across all projects
- Quick view of what's happening
- Link to full activity page

---

## Feature 2: Enhanced Task Checklists

### Purpose
Generate more specific, actionable task checklists based on:
- Actual test failures (not generic)
- Git status (uncommitted changes)
- Session template type

### Implementation

#### 2.1 Smart Checklist Generation
**Update**: `src/main/services/ContextBuilder.ts`

**For "Fix Tests" Template:**
```markdown
## Task Checklist

### Immediate Actions
- [ ] Review test error: "Expected redirect to /dashboard but got /login" in Auth.test.tsx:42
- [ ] Check authentication logic in src/components/Auth.tsx
- [ ] Verify redirect configuration in router.tsx
- [ ] Review test error: "Unhandled promise rejection: NetworkError" in UserService.test.tsx:67
- [ ] Add error handling to UserService.fetchUser()

### Verification
- [ ] Re-run tests: npm test Auth.test.tsx
- [ ] Re-run tests: npm test UserService.test.tsx
- [ ] Run full test suite: npm test
- [ ] Verify no new failures introduced

### Completion
- [ ] Commit changes: git add . && git commit -m "fix: resolve authentication redirect and error handling"
- [ ] Update session notes with fix summary
```

**For "Add Feature" Template:**
```markdown
## Task Checklist

### Planning
- [ ] Define feature requirements
- [ ] Identify files to modify
- [ ] Plan component structure
- [ ] Consider edge cases

### Implementation
- [ ] Create/modify components
- [ ] Add business logic
- [ ] Update types/interfaces
- [ ] Add error handling

### Testing
- [ ] Write unit tests
- [ ] Run test suite
- [ ] Manual testing
- [ ] Check for regressions

### Completion
- [ ] Commit with descriptive message
- [ ] Update documentation
- [ ] Mark session as complete
```

#### 2.2 Checklist Tracking (Future)
Store checklist state in session:
```typescript
interface Session {
  // ... existing fields
  checklist?: {
    items: { text: string; completed: boolean }[]
    completedCount: number
    totalCount: number
  }
}
```

---

## Feature 3: Success Metrics Dashboard

### Purpose
Visual analytics showing:
- Session success rate
- Test pass rate over time
- Most productive time periods
- Common failure patterns

### Implementation

#### 3.1 Analytics Service Enhancement
**Update**: `src/main/services/SessionService.ts`

Add methods:
```typescript
async getSuccessMetrics(projectId?: string): Promise<{
  totalSessions: number
  completedSessions: number
  successfulSessions: number
  successRate: number
  avgDuration: number
  testFixSuccessRate: number
  featureAddSuccessRate: number
  refactorSuccessRate: number
}>

async getRecentTrends(days: number): Promise<{
  date: string
  sessionsCompleted: number
  successRate: number
  testsFixed: number
}[]>
```

#### 3.2 MetricsWidget Component
**File**: `src/renderer/components/MetricsWidget.tsx`

Display:
- Overall success rate (pie chart)
- Trend over last 7/30 days (line chart)
- Quick stats:
  - Total sessions completed
  - Average session duration
  - Tests fixed this week
  - Success rate by template type

#### 3.3 Dashboard Integration
Add metrics widget to Dashboard:
- Top section: Quick metrics cards
- Middle section: Activity feed
- Bottom section: Project cards

---

## Feature 4: Custom Session Templates (Stretch Goal)

### Purpose
Allow users to create their own session templates with:
- Custom context generation
- Pre-filled goals
- Custom checklists

### Implementation

#### 4.1 Template Builder UI
**File**: `src/renderer/components/TemplateBuilder.tsx`

Features:
- Template name/description
- Context template (markdown)
- Variables: {projectName}, {testResults}, {gitStatus}
- Default goal text
- Checklist items
- Save/edit/delete custom templates

#### 4.2 Template Storage
Store in config:
```typescript
interface CustomTemplate extends ContextTemplate {
  isCustom: true
  createdAt: number
  contextTemplate: string  // Markdown with variables
  defaultGoal?: string
  defaultChecklist?: string[]
}
```

---

## Implementation Order

### Phase 1: Activity Feed (Days 1-3)
1. Create ActivityService backend
2. Hook into existing events (tests, sessions, commits)
3. Build ActivityFeed UI component
4. Add to Dashboard

### Phase 2: Enhanced Checklists (Day 4)
1. Update ContextBuilder with smart checklist generation
2. Add error-specific tasks for "Fix Tests" template
3. Test with real project failures

### Phase 3: Success Metrics (Days 5-6)
1. Add analytics methods to SessionService
2. Build MetricsWidget component
3. Integrate into Dashboard
4. Add simple charts (can use Chart.js or Recharts)

### Phase 4: Polish & Testing (Day 7)
1. Test all features together
2. Fix bugs
3. Update documentation
4. (Stretch) Start custom templates if time allows

---

## Success Criteria

### Must Have ✅
- [ ] Activity feed shows sessions, test runs, commits in timeline
- [ ] Enhanced task checklists with specific, actionable items
- [ ] Metrics widget shows success rate and trends
- [ ] Dashboard shows recent activity

### Nice to Have
- [ ] Custom template builder
- [ ] Checklist progress tracking in sessions
- [ ] Advanced charts and visualizations
- [ ] Export activity feed to markdown

---

## Technical Decisions

### Activity Storage
- Store in `~/.claude-automation/activities.json`
- Keep last 1000 activities per project
- Index by timestamp for fast retrieval

### UI Library for Charts
Options:
1. **Recharts** - React-friendly, good for simple charts
2. **Chart.js** - More features, but requires wrapper
3. **Custom SVG** - Lightweight, full control

**Decision**: Start with simple custom SVG, upgrade to Recharts if needed

### Real-time Updates
- Activity feed updates when:
  - Tests complete
  - Sessions change status
  - Commits are made
- Use existing event system (IPC channels)

---

## Files to Create

1. `src/main/services/ActivityService.ts` - Activity tracking backend
2. `src/renderer/components/ActivityFeed.tsx` - Timeline UI
3. `src/renderer/components/MetricsWidget.tsx` - Success metrics display
4. `src/renderer/components/TemplateBuilder.tsx` - Custom template creator (stretch)

## Files to Modify

1. `src/main/services/ContextBuilder.ts` - Enhanced checklist generation
2. `src/main/services/SessionService.ts` - Add analytics methods
3. `src/main/ipc-handlers.ts` - Add activity IPC channels
4. `src/renderer/pages/Dashboard.tsx` - Integrate activity feed and metrics
5. `src/shared/types.ts` - Add Activity and analytics types
6. `src/preload/index.ts` - Expose activity API

---

## Estimated Effort

- **ActivityService + Feed**: 8-10 hours
- **Enhanced Checklists**: 3-4 hours
- **Metrics Widget**: 6-8 hours
- **Integration + Testing**: 4-6 hours
- **Total**: ~21-28 hours (3-4 full work days)

---

## Next Steps

After Week 8 completion:
- Week 9: UX improvements (drag & drop, keyboard shortcuts, settings)
- Week 10: Testing, polish, packaging for release
