# Claude Automation Platform

**Visual desktop application for managing AI-assisted development across multiple projects**

## Project Status

**Week 7 of Implementation: COMPLETE ✅**

### What's Built

**Week 1 - Foundation:**
- ✅ Electron + React + TypeScript project structure
- ✅ Vite build tooling configured
- ✅ IPC communication boilerplate (main ↔ renderer)
- ✅ Tailwind CSS + shadcn/ui styling
- ✅ Basic app layout (header, sidebar, dashboard)
- ✅ TypeScript compilation for main and preload processes

**Week 2 - Core Data Layer:**
- ✅ Zustand store for state management
- ✅ ConfigStore service (persists to ~/.claude-automation/config.json)
- ✅ ProjectManager service with full CRUD operations
- ✅ Project validation (detects language, test framework)
- ✅ Functional IPC handlers connected to services
- ✅ React UI connected to Electron API
- ✅ Add Project modal with validation
- ✅ Projects persist across app restarts

**Week 3 - Test Execution:**
- ✅ TestRunner service with child process spawning
- ✅ Real-time test output streaming via IPC events
- ✅ Multi-framework parser (Jest, Vitest, Pytest, Go, Rust)
- ✅ Test file discovery (auto-detect test files in projects)
- ✅ Test result state management (Zustand)
- ✅ Run Tests button in dashboard per project
- ✅ Live test status indicators (running, passed, failed)
- ✅ Test Results modal with detailed output
- ✅ Pass/fail counts with color-coded display
- ✅ Test timeout handling (5 min default)
- ✅ Kill test process functionality

**Week 4 - File Watching & Live Updates:**
- ✅ FileWatcher service with chokidar integration
- ✅ Debounced test execution (500ms default)
- ✅ Watch mode toggle per project (ON/OFF)
- ✅ Auto-run tests on file changes
- ✅ Smart file pattern matching by framework
- ✅ Performance optimizations (ignore node_modules, .git, etc.)
- ✅ Toast notification system (react-hot-toast)
- ✅ Real-time notifications for test results
- ✅ Watch mode status notifications
- ✅ File change notifications with filename

**Week 5 - Git Integration:**
- ✅ GitService wrapper around simple-git
- ✅ Git status detection (branch, dirty state, ahead/behind)
- ✅ Git status display in project cards
- ✅ Visual indicators for uncommitted changes
- ✅ Commit modal with message input
- ✅ Branch creation and switching UI
- ✅ Push/pull functionality with toast notifications
- ✅ Automatic Git status refresh after operations
- ✅ Branch management modal (switch/create)
- ✅ Full IPC handlers for all Git operations

**Week 6 - Session Management & Workflow Automation:**
- ✅ SessionService with CRUD operations
- ✅ Session state management (planning → in_progress → paused → completed)
- ✅ Session analytics (success rate, avg duration, counts)
- ✅ Test run and commit linking
- ✅ Persistent storage to ~/.claude-automation/sessions.json
- ✅ Live duration calculation
- ✅ Sessions page with timeline view
- ✅ CreateSessionModal with Git branch creation option
- ✅ SessionDetailModal with markdown notes editor
- ✅ SessionTimeline with filters
- ✅ SessionCard components with live timers
- ✅ Export session reports to markdown

**Week 7 - Context Generation & Claude Code Integration:**
- ✅ ContextBuilder service with template engine
- ✅ Built-in templates (Fix Tests, Add Feature, Refactor)
- ✅ Intelligent context generation from project state
- ✅ Test failure analysis and error extraction
- ✅ Git status inclusion in context
- ✅ "Launch Claude Code" button on each project
- ✅ ContextPreviewModal with preview/edit modes
- ✅ Template selector with regeneration
- ✅ Clipboard integration (copy context)
- ✅ Open Claude Code in browser with context pre-copied
- ✅ Full IPC handlers for context operations

### Current Capabilities

- Add projects via UI (validates path, detects language/framework)
- **Run tests for any project with one click**
- **Real-time test output streaming to UI**
- **View detailed test results with pass/fail breakdown**
- **Watch mode: Auto-run tests on file changes** 👁️
- **Toast notifications for test results and watch events** 🔔
- **Git integration with status display** 🌿
- **View Git status: branch, uncommitted changes, ahead/behind**
- **Commit changes with custom message**
- **Push and pull with one click**
- **Create and switch branches from UI**
- **Session tracking with timeline and analytics** 📊
- **Track development sessions with goals and outcomes**
- **Link sessions to Git branches, test runs, and commits**
- **Session notes with markdown support**
- **Live session duration tracking**
- **🤖 Launch Claude Code with intelligent context generation**
- **Generate context from test failures, git status, and project state**
- **Multiple context templates (Fix Tests, Add Feature, Refactor)**
- **Preview and edit generated context before copying**
- **One-click copy to clipboard and open Claude Code**
- View all projects in dashboard
- Projects saved to disk and loaded on startup
- Auto-detection of JavaScript/TypeScript, Python, Go, Rust
- Auto-detection of Jest, Vitest, Pytest, Cargo test, Go test
- **Live test status per project (❓ → 🔄 → ✅/❌)**
- **Debounced test execution to prevent spam**
- Clean, modern interface with dark mode support
- Fully typed TypeScript codebase

## Tech Stack

- **Desktop Framework:** Electron 39+
- **Frontend:** React 19 + TypeScript 5
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **State Management:** Zustand ✅
- **Git Operations:** simple-git ✅
- **File Watching:** chokidar ✅
- **Notifications:** react-hot-toast ✅

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build:main
npm run build:preload

# Start development server
npm run dev:renderer

# In another terminal, start Electron (after Vite is running)
npm start
```

### Build Scripts

- `npm run dev:renderer` - Start Vite dev server (port 5173)
- `npm run dev:main` - Watch and compile main process
- `npm run dev:preload` - Watch and compile preload script
- `npm run build` - Build all processes for production
- `npm start` - Start Electron app
- `npm run package` - Package app for distribution

## Project Structure

```
automation-platform/
├── src/
│   ├── main/                   # Electron Main Process
│   │   ├── index.ts            # Entry point, window creation
│   │   └── ipc-handlers.ts     # IPC message handlers (stubs)
│   │
│   ├── preload/                # Electron Preload Script
│   │   └── index.ts            # Expose safe APIs to renderer
│   │
│   ├── renderer/               # React Frontend
│   │   ├── App.tsx             # Root component with layout
│   │   ├── main.tsx            # React entry point
│   │   ├── index.css           # Tailwind imports + theme
│   │   ├── pages/
│   │   │   └── Dashboard.tsx   # Project dashboard
│   │   └── global.d.ts         # TypeScript declarations
│   │
│   └── shared/                 # Shared Types
│       └── types.ts            # Project, TestResults, GitStatus, etc.
│
├── dist/                       # Build output
│   ├── main/                   # Compiled main process
│   ├── preload/                # Compiled preload script
│   └── renderer/               # Built React app
│
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config (renderer)
├── tsconfig.main.json          # TypeScript config (main)
├── tsconfig.preload.json       # TypeScript config (preload)
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies and scripts
```

## Next Steps (Week 6)

### Week 6: Session Management & Workflow Automation

**Goals:**
- Implement session tracking for development work
- Link sessions to Git branches and test runs
- Add session notes and outcome tracking
- Create session history view

**Potential Tasks:**
- [ ] Session service for CRUD operations
- [ ] Session UI in dashboard (create, view, update)
- [ ] Link sessions to branches and test results
- [ ] Session notes and outcome tracking
- [ ] Session history timeline view

## Documentation

All documentation is in the parent `/home/user/automation/docs/` directory:

- [Vision Document](../docs/VISION.md) - Product vision and UI mockups
- [Technical Architecture](../docs/ARCHITECTURE.md) - System design and data models
- [Implementation Roadmap](../docs/IMPLEMENTATION_ROADMAP.md) - 10-week plan to MVP
- [Claude Code Integration](../docs/CLAUDE_CODE_INTEGRATION.md) - AI integration strategy

## License

MIT

---

**Built with Claude Code 🤖**
