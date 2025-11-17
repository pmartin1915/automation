# 🏗️ Technical Architecture

## Overview

**Claude Automation Platform** - Electron-based desktop application for managing AI-assisted development workflows.

---

## Tech Stack

### **Frontend**
- **Framework:** React 18+ with TypeScript
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **State Management:** Zustand (lightweight, simple)
- **Drag & Drop:** react-dnd or dnd-kit
- **Code Display:** react-syntax-highlighter
- **Charts:** Recharts (for test history graphs)

### **Backend (Electron Main Process)**
- **Runtime:** Node.js (bundled with Electron)
- **Git Operations:** simple-git
- **File System:** Node.js fs/promises
- **Process Management:** child_process for test runners
- **IPC:** Electron IPC (main ↔ renderer communication)

### **Desktop Framework**
- **Electron:** Latest stable (v28+)
- **electron-builder:** For packaging/distribution

### **Development Tools**
- **Build Tool:** Vite (fast, modern)
- **Linting:** ESLint + Prettier
- **Testing:** Vitest + React Testing Library
- **Type Checking:** TypeScript strict mode

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                        (Renderer Process)                       │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Project    │  │   Test       │  │   Git                │ │
│  │   Dashboard  │  │   Runner UI  │  │   Manager UI         │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────────┘ │
│         │                 │                  │                 │
└─────────┼─────────────────┼──────────────────┼─────────────────┘
          │                 │                  │
          │    IPC Messages │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ELECTRON MAIN PROCESS                      │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Project    │  │   Test       │  │   Git                │ │
│  │   Manager    │  │   Runner     │  │   Controller         │ │
│  │              │  │              │  │                      │ │
│  │ - Load/Save  │  │ - Execute    │  │ - Status             │ │
│  │ - Validate   │  │ - Parse      │  │ - Commit/Push        │ │
│  │ - Config     │  │ - Stream     │  │ - Branch ops         │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────────┘ │
│         │                 │                  │                 │
└─────────┼─────────────────┼──────────────────┼─────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SYSTEM RESOURCES                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Local      │  │   Child      │  │   Git Repository     │ │
│  │   File       │  │   Processes  │  │   (.git)             │ │
│  │   System     │  │   (npm test) │  │                      │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### **Example: Running Tests**

```
1. User clicks "Run Tests" button
   │
   ▼
2. Renderer sends IPC message: 'run-tests'
   { projectId: 'clinical-toolkit', testFile: 'Home.test.tsx' }
   │
   ▼
3. Main Process receives message
   │
   ▼
4. TestRunner spawns child process:
   cd /path/to/clinical-toolkit && npm test Home.test.tsx
   │
   ▼
5. TestRunner streams output via IPC:
   'test-output' events → Renderer updates UI in real-time
   │
   ▼
6. Tests complete
   │
   ▼
7. TestRunner parses results (pass/fail/errors)
   │
   ▼
8. Main sends final IPC message: 'test-complete'
   { passed: 4, failed: 0, duration: 1234ms, results: [...] }
   │
   ▼
9. Renderer updates UI:
   ✅ Home.test.tsx (4/4) - 1.2s
```

---

## File Structure

```
automation-platform/
├── src/
│   ├── main/                      # Electron Main Process
│   │   ├── index.ts               # Entry point
│   │   ├── ipc-handlers.ts        # IPC message handlers
│   │   ├── services/
│   │   │   ├── ProjectManager.ts  # Project CRUD operations
│   │   │   ├── TestRunner.ts      # Execute tests, parse results
│   │   │   ├── GitController.ts   # Git operations
│   │   │   └── ConfigStore.ts     # Persist app settings
│   │   └── types/
│   │       └── index.ts           # Shared types
│   │
│   ├── renderer/                  # React Frontend
│   │   ├── App.tsx                # Root component
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Project list
│   │   │   ├── ProjectDetail.tsx  # Single project view
│   │   │   └── Settings.tsx       # App settings
│   │   ├── components/
│   │   │   ├── ProjectCard.tsx    # Project summary card
│   │   │   ├── TestList.tsx       # Test file list
│   │   │   ├── TestResults.tsx    # Test result display
│   │   │   ├── GitStatus.tsx      # Git branch/status
│   │   │   └── QuickActions.tsx   # Action buttons
│   │   ├── hooks/
│   │   │   ├── useProjects.ts     # Project state management
│   │   │   ├── useTests.ts        # Test running state
│   │   │   └── useGit.ts          # Git operations state
│   │   ├── store/
│   │   │   └── index.ts           # Zustand store
│   │   └── utils/
│   │       ├── ipc.ts             # IPC helper functions
│   │       └── formatters.ts      # Data formatting
│   │
│   ├── shared/                    # Shared between main/renderer
│   │   ├── types.ts               # TypeScript interfaces
│   │   └── constants.ts           # App constants
│   │
│   └── preload/
│       └── index.ts               # Electron preload script
│
├── public/
│   ├── icon.png                   # App icon
│   └── index.html                 # HTML template
│
├── config/
│   └── projects.json              # Stored project configurations
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── electron-builder.yml           # Build configuration
```

---

## Key Components

### **1. ProjectManager (Main Process)**

```typescript
class ProjectManager {
  private projects: Map<string, Project>;

  async addProject(path: string): Promise<Project> {
    // Validate project path
    // Detect test framework (Jest, Pytest, etc.)
    // Save to config
    // Return project object
  }

  async removeProject(id: string): Promise<void> {
    // Remove from map and config
  }

  getProject(id: string): Project | undefined {
    // Return project by ID
  }

  getAllProjects(): Project[] {
    // Return all projects
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    // Update project and save config
  }
}
```

### **2. TestRunner (Main Process)**

```typescript
class TestRunner {
  async runTests(projectPath: string, testFile?: string): Promise<TestResults> {
    // Detect test command (npm test, pytest, cargo test, etc.)
    // Spawn child process
    // Stream output via IPC
    // Parse results
    // Return structured results
  }

  private parseJestOutput(output: string): TestResults {
    // Parse Jest output format
  }

  private parsePytestOutput(output: string): TestResults {
    // Parse Pytest output format
  }

  killRunningTests(projectId: string): void {
    // Kill child process
  }
}
```

### **3. GitController (Main Process)**

```typescript
class GitController {
  private git: SimpleGit;

  async getStatus(projectPath: string): Promise<GitStatus> {
    // Get current branch, uncommitted changes, etc.
  }

  async createBranch(projectPath: string, branchName: string): Promise<void> {
    // Create and checkout branch
  }

  async commit(projectPath: string, message: string): Promise<void> {
    // Stage all changes and commit
  }

  async push(projectPath: string, branch: string): Promise<void> {
    // Push to remote with retry logic
  }

  async pull(projectPath: string, branch: string): Promise<void> {
    // Pull latest changes
  }
}
```

### **4. Project Dashboard (Renderer)**

```typescript
const Dashboard: React.FC = () => {
  const { projects, loading } = useProjects();
  const { onDrop } = useProjectDropZone(); // For adding projects via drag & drop

  return (
    <div className="grid grid-cols-3 gap-4" onDrop={onDrop}>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <AddProjectCard />
    </div>
  );
};
```

### **5. Test Runner UI (Renderer)**

```typescript
const TestList: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { tests, runTest, results } = useTests(projectId);

  return (
    <div>
      {tests.map(test => (
        <TestItem
          key={test.path}
          test={test}
          result={results[test.path]}
          onRun={() => runTest(test.path)}
        />
      ))}
    </div>
  );
};
```

---

## Data Models

### **Project**

```typescript
interface Project {
  id: string;                    // Unique ID
  name: string;                  // Display name
  path: string;                  // Absolute path to project
  type: 'javascript' | 'python' | 'rust' | 'go'; // Language
  testFramework: 'jest' | 'vitest' | 'pytest' | 'cargo' | 'go-test';
  testCommand: string;           // Command to run tests (npm test, pytest, etc.)
  testPattern: string;           // Glob pattern for test files
  git: {
    currentBranch: string;
    uncommittedChanges: number;
    remoteBranch?: string;
  };
  lastRun?: {
    timestamp: Date;
    passed: number;
    failed: number;
    duration: number;
  };
}
```

### **TestResults**

```typescript
interface TestResults {
  projectId: string;
  timestamp: Date;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number; // milliseconds
  };
  suites: TestSuite[];
}

interface TestSuite {
  name: string;
  file: string;
  tests: Test[];
}

interface Test {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: {
    message: string;
    stack?: string;
  };
}
```

### **GitStatus**

```typescript
interface GitStatus {
  branch: string;
  remoteBranch?: string;
  ahead: number;         // Commits ahead of remote
  behind: number;        // Commits behind remote
  modified: string[];    // Modified files
  staged: string[];      // Staged files
  untracked: string[];   // Untracked files
  conflicted: string[];  // Merge conflicts
}
```

---

## IPC Communication

### **Channels**

```typescript
// Project operations
'project:add'         // Add new project
'project:remove'      // Remove project
'project:get-all'     // Get all projects
'project:update'      // Update project

// Test operations
'test:run'            // Run tests
'test:kill'           // Kill running tests
'test:output'         // Stream test output (main → renderer)
'test:complete'       // Test run complete (main → renderer)

// Git operations
'git:status'          // Get git status
'git:commit'          // Commit changes
'git:push'            // Push to remote
'git:pull'            // Pull from remote
'git:create-branch'   // Create new branch

// Claude Code integration
'claude:launch'       // Generate context and open Claude Code
'claude:get-context'  // Get current project context
```

### **Example IPC Handler**

```typescript
// In main process
ipcMain.handle('test:run', async (event, { projectId, testFile }) => {
  const project = projectManager.getProject(projectId);
  if (!project) throw new Error('Project not found');

  const results = await testRunner.runTests(project.path, testFile);
  return results;
});

// In renderer
const results = await window.electron.ipcRenderer.invoke('test:run', {
  projectId: 'clinical-toolkit',
  testFile: 'Home.test.tsx'
});
```

---

## Security Considerations

### **1. Context Isolation**
- Enable `contextIsolation: true` in BrowserWindow
- Use preload script to expose limited IPC methods
- Never expose full Node.js API to renderer

### **2. Input Validation**
- Validate all project paths (prevent path traversal)
- Sanitize git commands (prevent command injection)
- Validate test file paths

### **3. Process Security**
- Run test processes with limited permissions
- Timeout long-running processes
- Kill processes on app close

---

## Performance Optimization

### **1. Lazy Loading**
- Load project details only when viewed
- Lazy load test results
- Paginate large test suites

### **2. Caching**
- Cache git status (refresh on user action or timer)
- Cache test results until files change
- Cache project configurations

### **3. Incremental Updates**
- Stream test output (don't wait for completion)
- Update UI incrementally
- Use virtual scrolling for large lists

---

## Testing Strategy

### **Unit Tests**
- Test business logic (ProjectManager, TestRunner, GitController)
- Test React components (Dashboard, TestList, etc.)
- Test IPC handlers

### **Integration Tests**
- Test full workflows (add project → run tests → commit)
- Test IPC communication (main ↔ renderer)

### **E2E Tests**
- Test with real projects
- Test drag & drop
- Test git operations

---

## Build & Distribution

### **Development**
```bash
npm run dev    # Start Vite + Electron in dev mode
```

### **Production Build**
```bash
npm run build  # Build renderer (Vite)
npm run package  # Package Electron app (electron-builder)
```

### **Distribution**
- **Windows:** .exe installer (NSIS)
- **macOS:** .dmg disk image
- **Linux:** .AppImage

### **Auto-Updates**
- Use electron-updater
- Check for updates on app launch
- Download and install in background

---

## Claude Code Web Integration

### **Context Generation**

```typescript
interface ClaudeContext {
  project: {
    name: string;
    path: string;
    language: string;
  };
  git: {
    branch: string;
    uncommittedChanges: string[];
  };
  tests: {
    failed: Test[];
    lastRun: Date;
  };
  suggestedTasks: string[];
}

function generateClaudeContext(project: Project): ClaudeContext {
  // Gather failing tests
  // Analyze error messages
  // Check git status
  // Generate suggested tasks
  // Return structured context
}
```

### **Deep Linking**

```typescript
function launchClaudeCode(context: ClaudeContext): void {
  const summary = `
I'm working on ${context.project.name}.

Current status:
- Branch: ${context.git.branch}
- Failing tests: ${context.tests.failed.length}

Specific failures:
${context.tests.failed.map(t => `- ${t.name}: ${t.error?.message}`).join('\n')}

Could you help fix these test failures?
  `.trim();

  // Option 1: Open Claude Code with clipboard
  clipboard.writeText(summary);
  shell.openExternal('https://claude.ai/code');

  // Option 2: Deep link (if supported in future)
  // shell.openExternal(`https://claude.ai/code?context=${encodeURIComponent(summary)}`);
}
```

---

## Future Enhancements

### **Phase 2+**
- AI-powered commit message generation
- Smart test selection (run only affected tests)
- Visual git history (branch graph)
- Team collaboration (share configs)
- Plugin system (custom test parsers, actions)
- Local LLM integration (offline AI suggestions)

---

**This architecture provides a solid foundation for a production-ready automation platform while remaining flexible for future enhancements.**
