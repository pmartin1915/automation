# Claude Automation Platform

**Visual desktop application for managing AI-assisted development across multiple projects**

## Project Status

**Week 3 of Implementation: COMPLETE ✅**

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

### Current Capabilities

- Add projects via UI (validates path, detects language/framework)
- **Run tests for any project with one click**
- **Real-time test output streaming to UI**
- **View detailed test results with pass/fail breakdown**
- View all projects in dashboard
- Projects saved to disk and loaded on startup
- Auto-detection of JavaScript/TypeScript, Python, Go, Rust
- Auto-detection of Jest, Vitest, Pytest, Cargo test, Go test
- **Live test status per project (❓ → 🔄 → ✅/❌)**
- Clean, modern interface with dark mode support
- Fully typed TypeScript codebase

## Tech Stack

- **Desktop Framework:** Electron 39+
- **Frontend:** React 19 + TypeScript 5
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **State Management:** Zustand ✅
- **Git Operations:** simple-git (coming in Week 5)

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

## Next Steps (Week 4)

According to the [Implementation Roadmap](/home/user/automation/docs/IMPLEMENTATION_ROADMAP.md):

### Week 4: Test Watching & Live Updates

**Goals:**
- Implement test file watching for continuous testing
- Auto-run tests on file changes
- Debounced test execution
- Toast notifications for test results

**Tasks:**
- [ ] File watcher service (chokidar)
- [ ] Debounced test runner
- [ ] Watch mode toggle per project
- [ ] Toast notifications for test completion
- [ ] Performance optimizations for large projects

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
