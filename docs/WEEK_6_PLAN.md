# Week 6 Implementation Plan: Session Management & Workflow Automation

**Vision**: Enable Claude Code to track development work sessions, linking them to projects, Git branches, test runs, and outcomes. This creates a complete audit trail of AI-assisted development work.

## Core Features

### 1. Session Data Model
A session represents a development work period (e.g., "Implement user authentication", "Fix login bug").

**Session Entity:**
- ID, name, description, goal
- Timestamps (created, started, ended)
- Status (planning → in_progress → paused → completed/blocked/abandoned)
- Linked project ID
- Linked Git branch (optional)
- Session notes (markdown)
- Outcome (success, partial, blocked, abandoned)
- Test runs during session (auto-linked)
- Commits made during session (auto-tracked)

### 2. SessionService (Backend)
- CRUD operations for sessions
- Session state management (start, pause, resume, complete, abandon)
- Query sessions by project, date, status
- Link sessions to branches and test runs
- Session analytics (duration, success rate)
- Persist to `~/.claude-automation/sessions.json`
- Auto-tracking of duration

### 3. Session UI Components
- **Session Timeline View**: Visual timeline of all sessions
  - Group by project
  - Filter by status, date range
  - Color-coded by outcome

- **Create Session Modal**:
  - Name, description, goal
  - Select project
  - Option to create Git branch for session
  - Option to link to existing branch

- **Session Detail View**:
  - Session info and status
  - Inline notes editor (markdown)
  - List of test runs during session
  - List of commits made during session
  - Duration tracker (live if in_progress)
  - Outcome selection

- **Session Cards in Dashboard**:
  - Show active session for each project
  - Quick session actions (pause, complete, abandon)

### 4. Integration Points

**Git Integration:**
- Create branch when starting session (optional)
- Track commits made during session time
- Auto-link commits to active session

**Test Integration:**
- Link test runs to active session
- Show test pass/fail trends per session
- Session analytics: total tests, pass rate

**Dashboard Integration:**
- Show active session per project
- Session history in project view

### 5. Workflow Automation
- Auto-start session timer when session begins
- Auto-pause when app is idle (optional)
- Suggest session completion when tests pass
- Export session summary (markdown report)

---

## Detailed Implementation Plan

### Phase 1: Data Layer (Day 1-2)

#### 1.1 Type Definitions (`src/shared/types.ts`)
Add Session types:

```typescript
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
```

#### 1.2 SessionService (`src/main/services/SessionService.ts`) - **NEW FILE**
Features:
- Session CRUD operations
- State management (start, pause, resume, complete, abandon)
- Query methods (by project, by status, by date range)
- Link sessions to test runs and commits
- Session analytics
- Persistence to `~/.claude-automation/sessions.json`
- Auto-tracking of duration

Key methods:
- `createSession(session: Omit<Session, 'id'>): Promise<Session>`
- `getAllSessions(): Promise<Session[]>`
- `getSessionById(id: string): Promise<Session | null>`
- `updateSession(id: string, updates: Partial<Session>): Promise<Session>`
- `deleteSession(id: string): Promise<boolean>`
- `startSession(id: string): Promise<Session>`
- `pauseSession(id: string): Promise<Session>`
- `resumeSession(id: string): Promise<Session>`
- `completeSession(id: string, outcome: string, notes?: string): Promise<Session>`
- `getSessionsByProject(projectId: string): Promise<Session[]>`
- `getActiveSessionForProject(projectId: string): Promise<Session | null>`
- `getSessionAnalytics(projectId?: string): Promise<SessionSummary>`
- `linkTestRun(sessionId: string, testRunId: string): Promise<boolean>`
- `linkCommit(sessionId: string, commitSha: string): Promise<boolean>`

#### 1.3 Update ConfigStore (`src/main/services/ConfigStore.ts`)
- Add sessions storage path
- Add session configuration options

---

### Phase 2: Backend Integration (Day 2-3)

#### 2.1 IPC Handlers (`src/main/ipc-handlers.ts`)
Add IPC channels for sessions:

```typescript
IPC_CHANNELS.SESSION_CREATE
IPC_CHANNELS.SESSION_GET_ALL
IPC_CHANNELS.SESSION_GET_BY_ID
IPC_CHANNELS.SESSION_UPDATE
IPC_CHANNELS.SESSION_DELETE
IPC_CHANNELS.SESSION_START
IPC_CHANNELS.SESSION_PAUSE
IPC_CHANNELS.SESSION_RESUME
IPC_CHANNELS.SESSION_COMPLETE
IPC_CHANNELS.SESSION_GET_BY_PROJECT
IPC_CHANNELS.SESSION_GET_ANALYTICS
IPC_CHANNELS.SESSION_LINK_TEST_RUN
IPC_CHANNELS.SESSION_LINK_COMMIT
```

Implement handlers connecting to SessionService singleton.

#### 2.2 Preload API (`src/preload/index.ts`)
Expose session API:

```typescript
session: {
  create: (session: Omit<Session, 'id'>) => Promise<Result<Session>>
  getAll: () => Promise<Result<Session[]>>
  getById: (id: string) => Promise<Result<Session>>
  update: (id: string, updates: Partial<Session>) => Promise<Result<Session>>
  delete: (id: string) => Promise<Result<boolean>>
  start: (id: string) => Promise<Result<Session>>
  pause: (id: string) => Promise<Result<Session>>
  resume: (id: string) => Promise<Result<Session>>
  complete: (id: string, outcome: string, notes?: string) => Promise<Result<Session>>
  getByProject: (projectId: string) => Promise<Result<Session[]>>
  getAnalytics: (projectId?: string) => Promise<Result<SessionSummary>>
  linkTestRun: (sessionId: string, testRunId: string) => Promise<Result<boolean>>
  linkCommit: (sessionId: string, commitSha: string) => Promise<Result<boolean>>
}
```

#### 2.3 Enhanced Test Runner (`src/main/services/TestRunner.ts`)
- Modify to accept optional `sessionId` parameter
- Auto-link test runs to active session

#### 2.4 Enhanced Git Commit (`src/main/ipc-handlers.ts`)
- Modify commit handler to check for active session
- Auto-link commits to active session

---

### Phase 3: State Management (Day 3-4)

#### 3.1 Zustand Store Updates (`src/renderer/store/useStore.ts`)
Add session state:

```typescript
// State
sessions: Session[]
activeSessions: Map<string, Session>  // projectId -> active session
selectedSession: Session | null
sessionAnalytics: SessionSummary | null

// Actions
loadSessions: () => Promise<void>
createSession: (session: Omit<Session, 'id'>) => Promise<void>
updateSession: (id: string, updates: Partial<Session>) => Promise<void>
deleteSession: (id: string) => Promise<void>
startSession: (id: string) => Promise<void>
pauseSession: (id: string) => Promise<void>
resumeSession: (id: string) => Promise<void>
completeSession: (id: string, outcome: string, notes?: string) => Promise<void>
setSelectedSession: (session: Session | null) => void
loadSessionAnalytics: (projectId?: string) => Promise<void>
```

---

### Phase 4: UI Components (Day 4-7)

#### 4.1 CreateSessionModal (`src/renderer/components/CreateSessionModal.tsx`) - **NEW FILE**
Features:
- Form fields: name, description, goal
- Project selector dropdown
- Checkbox: "Create Git branch for this session"
- Branch name input (auto-generated from session name, editable)
- Checkbox: "Link to existing branch"
- Branch selector (shows branches for selected project)
- Form validation
- Submit creates session and optionally creates/links Git branch

#### 4.2 SessionDetailModal (`src/renderer/components/SessionDetailModal.tsx`) - **NEW FILE**
Features:
- Session info display (name, description, goal, status)
- Status badge (color-coded)
- Duration display (live timer if in_progress)
- Markdown notes editor (textarea with preview toggle)
- Test runs section (table with test name, status, pass/fail counts, timestamp)
- Commits section (table with commit SHA, message, timestamp)
- Action buttons: Start, Pause, Resume, Complete, Abandon (context-aware)
- Complete form: outcome selector (dropdown), final notes (textarea)

#### 4.3 SessionTimeline (`src/renderer/components/SessionTimeline.tsx`) - **NEW FILE**
Features:
- Visual timeline of sessions (vertical or horizontal)
- Group by month/week (collapsible)
- Filter controls: project dropdown, status checkboxes, date range picker
- Color-coded by outcome (success=green, partial=yellow, blocked=red, abandoned=gray)
- Click session to open SessionDetailModal
- Analytics summary at top (total sessions, success rate, avg duration)

#### 4.4 SessionCard (`src/renderer/components/SessionCard.tsx`) - **NEW FILE**
Features:
- Compact session display for Dashboard
- Shows: session name, status badge, duration (live if in_progress)
- Quick action buttons: Pause/Resume, Complete, View Details
- Used in project cards

#### 4.5 Dashboard Updates (`src/renderer/pages/Dashboard.tsx`)
Changes:
- Add "Active Session" section to each project card
- Show SessionCard if session active for project
- Add "Start Session" button if no active session
- Add "Session History" button to view project sessions in timeline

#### 4.6 New Page: Sessions (`src/renderer/pages/Sessions.tsx`) - **NEW FILE**
Features:
- Full SessionTimeline view
- Analytics dashboard at top
- Filter and search controls
- "Create Session" button
- Export session reports button

#### 4.7 Navigation Updates (`src/renderer/App.tsx`)
- Add "Sessions" navigation item to sidebar
- Add route to Sessions page

---

### Phase 5: Workflow Features (Day 7)

#### 5.1 Auto-linking
- Modify test run handler to check for active session and auto-link
- Modify commit handler to check for active session and auto-link
- Toast notification when auto-linking occurs

#### 5.2 Session Timer
- Live duration calculation (update every second for in_progress sessions)
- Display in human-readable format (e.g., "2h 15m")
- Auto-pause detection based on app idle time (optional feature)

#### 5.3 Notifications
- Toast when session started
- Toast when test linked to session
- Toast when commit linked to session
- Smart suggestion: "All tests passed! Ready to complete session?"

#### 5.4 Export
- Generate markdown session report including:
  - Session info (name, description, goal, status, outcome)
  - Duration and timestamps
  - Notes (markdown formatted)
  - Test results summary (total runs, pass/fail breakdown)
  - Commit history (SHAs and messages)
- Save to file (file picker dialog)
- Copy to clipboard option

---

## Testing Checklist

- [ ] Create session without Git branch
- [ ] Create session with new Git branch creation
- [ ] Create session linked to existing branch
- [ ] Start session (status → in_progress, timer starts)
- [ ] Pause session (timer stops)
- [ ] Resume session (timer resumes)
- [ ] Run tests and verify auto-link to active session
- [ ] Make commit and verify auto-link to active session
- [ ] View session detail with all linked data (tests, commits, notes)
- [ ] Edit session notes (markdown)
- [ ] Complete session with outcome and final notes
- [ ] Abandon session
- [ ] View session timeline with multiple sessions
- [ ] Filter sessions by project
- [ ] Filter sessions by status
- [ ] Session analytics display correctly (total, success rate, avg duration)
- [ ] Export session report to file
- [ ] Copy session report to clipboard
- [ ] Delete session
- [ ] Multiple active sessions (different projects) work correctly
- [ ] Session persists across app restarts

---

## Files to Create/Modify

### New Files (7):
1. `src/main/services/SessionService.ts` (~300 lines)
2. `src/renderer/components/CreateSessionModal.tsx` (~200 lines)
3. `src/renderer/components/SessionDetailModal.tsx` (~300 lines)
4. `src/renderer/components/SessionTimeline.tsx` (~250 lines)
5. `src/renderer/components/SessionCard.tsx` (~100 lines)
6. `src/renderer/pages/Sessions.tsx` (~200 lines)
7. `~/.claude-automation/sessions.json` (data file)

### Modified Files (8):
1. `src/shared/types.ts` - Add Session and SessionSummary types (~50 lines added)
2. `src/main/ipc-handlers.ts` - Add session IPC handlers (~150 lines added)
3. `src/preload/index.ts` - Expose session API (~50 lines added)
4. `src/renderer/store/useStore.ts` - Add session state and actions (~150 lines added)
5. `src/renderer/pages/Dashboard.tsx` - Show active sessions (~100 lines added)
6. `src/renderer/App.tsx` - Add Sessions route (~20 lines added)
7. `src/main/services/ConfigStore.ts` - Session config (~10 lines added)
8. `automation-platform/README.md` - Update with Week 6 features

### Estimated Total LOC: ~1,880 lines (new + modified)

---

## Implementation Timeline

**Day 1-2**: Phase 1 - Data Layer
- SessionService implementation
- Type definitions
- ConfigStore updates

**Day 2-3**: Phase 2 - Backend Integration
- IPC handlers
- Preload API
- Test/Git auto-linking

**Day 3-4**: Phase 3 - State Management
- Zustand store updates
- Session state management
- Loading and caching

**Day 4-7**: Phase 4 - UI Components
- All modals and cards
- Dashboard integration
- Sessions page
- Navigation updates

**Day 7**: Phase 5 - Workflow Features
- Auto-linking polish
- Timer functionality
- Notifications
- Export feature

**Day 7**: Testing & Documentation
- Full testing checklist
- README update
- Commit and push

---

## Week 6 Success Criteria

✅ Can create sessions linked to projects
✅ Can start/pause/resume/complete sessions
✅ Session timer tracks duration accurately
✅ Test runs auto-link to active sessions
✅ Commits auto-link to active sessions
✅ Session detail view shows all linked data
✅ Session timeline view displays all sessions
✅ Can filter and search sessions
✅ Session analytics work correctly
✅ Can export session reports
✅ All sessions persist across app restarts
✅ UI is polished and intuitive

---

**Ready to begin Week 6 implementation!** 🚀
