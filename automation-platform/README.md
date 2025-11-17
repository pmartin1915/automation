# Claude Automation Platform

**Visual desktop application for managing AI-assisted development across multiple projects**

## Project Status

**Week 1 of Implementation: COMPLETE ✅**

### What's Built

- ✅ Electron + React + TypeScript project structure
- ✅ Vite build tooling configured
- ✅ IPC communication boilerplate (main ↔ renderer)
- ✅ Tailwind CSS + shadcn/ui styling
- ✅ Basic app layout (header, sidebar, dashboard)
- ✅ TypeScript compilation for main and preload processes
- ✅ Mock data for initial UI testing

### Current Capabilities

- Basic UI shell with navigation
- Project dashboard with mock data
- Clean, modern interface with dark mode support
- Fully typed TypeScript codebase

## Tech Stack

- **Desktop Framework:** Electron 39+
- **Frontend:** React 19 + TypeScript 5
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **State Management:** Zustand (coming in Week 2)
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

## Next Steps (Week 2)

According to the [Implementation Roadmap](/home/user/automation/docs/IMPLEMENTATION_ROADMAP.md):

### Week 2: Core Data Layer

**Goals:**
- Implement ProjectManager service (CRUD operations)
- Create data models with Zustand
- Set up configuration persistence (save/load projects.json)
- Write unit tests for services

**Tasks:**
- [ ] Define TypeScript interfaces (Project, TestResults, GitStatus)
- [ ] Create Zustand store for state management
- [ ] Implement ProjectManager.addProject()
- [ ] Implement ProjectManager.removeProject()
- [ ] Implement ProjectManager.getProject() / getAllProjects()
- [ ] Add project validation (path exists, has package.json, etc.)
- [ ] Implement ConfigStore (save/load from ~/.claude-automation/projects.json)
- [ ] Auto-load projects on app start
- [ ] Handle errors gracefully
- [ ] Write unit tests for ProjectManager and ConfigStore

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
