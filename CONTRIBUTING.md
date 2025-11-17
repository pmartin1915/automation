# Contributing to Automation Platform

Thank you for your interest in contributing! This guide will help you get started with development.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Coding Standards](#coding-standards)
7. [Testing](#testing)
8. [Submitting Changes](#submitting-changes)
9. [Release Process](#release-process)

---

## Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors.

### Our Standards

**Positive behavior:**
- Be respectful and inclusive
- Welcome newcomers
- Focus on what's best for the project
- Show empathy toward others

**Unacceptable behavior:**
- Harassment, trolling, or insulting comments
- Publishing others' private information
- Other conduct inappropriate in a professional setting

### Enforcement

Violations can be reported to the project maintainers. All complaints will be reviewed and investigated.

---

## Getting Started

### Prerequisites

**Required:**
- Node.js 18+ (we use v22.21.1)
- npm 9+ (we use v10.9.4)
- Git 2.30+
- Code editor (VS Code recommended)

**Optional:**
- GitHub account (for pull requests)
- Electron dev tools knowledge

### First-Time Contributors

**Good first issues:**
- Look for issues tagged `good first issue`
- Documentation improvements
- UI polish
- Bug fixes

**Don't know where to start?**
- Read the [Vision](docs/VISION.md) to understand goals
- Review [Architecture](docs/ARCHITECTURE.md) to understand technical design
- Ask questions in GitHub Discussions

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/automation.git
cd automation/automation-platform
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Electron 39
- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 4
- And all other dependencies

### 3. Run in Development Mode

```bash
# Start all watchers (renderer, main, preload)
npm run dev
```

This runs three processes concurrently:
- **Vite dev server** - Hot reload for React UI
- **TypeScript watcher** - Compiles main process
- **TypeScript watcher** - Compiles preload script

Open http://localhost:5173 in your browser or run Electron:

```bash
# In another terminal
npm start
```

### 4. Verify Setup

**Checklist:**
- [ ] App launches without errors
- [ ] Can add a project
- [ ] Can run tests
- [ ] Git operations work
- [ ] Hot reload works (edit a .tsx file and see changes)

---

## Project Structure

```
automation-platform/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Entry point
│   │   ├── ipc-handlers.ts # IPC communication
│   │   └── services/      # Backend services
│   │       ├── ProjectManager.ts  # Project CRUD
│   │       ├── TestRunner.ts      # Test execution
│   │       ├── GitService.ts      # Git operations
│   │       ├── SessionService.ts  # Session tracking
│   │       ├── ContextBuilder.ts  # Claude context generation
│   │       ├── FileWatcher.ts     # File system monitoring
│   │       ├── ActivityService.ts # Activity logging
│   │       └── ConfigStore.ts     # Settings persistence
│   │
│   ├── preload/           # Bridge between main and renderer
│   │   └── index.ts       # Exposed APIs
│   │
│   ├── renderer/          # React UI (runs in browser context)
│   │   ├── App.tsx        # Root component
│   │   ├── main.tsx       # Entry point
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.tsx  # Main dashboard
│   │   │   ├── Sessions.tsx   # Session management
│   │   │   └── Settings.tsx   # Settings page
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand state management
│   │   └── index.css      # Global styles
│   │
│   └── shared/            # Code shared between main and renderer
│       └── types.ts       # TypeScript interfaces
│
├── docs/                  # Documentation
├── build/                 # Build resources (icons, etc.)
├── dist/                  # Compiled output (gitignored)
├── release/               # Packaged apps (gitignored)
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig*.json         # TypeScript configurations
```

### Key Files

**Main Process:**
- `src/main/index.ts` - Creates BrowserWindow, manages app lifecycle
- `src/main/ipc-handlers.ts` - Handles all IPC communication from renderer
- `src/main/services/*` - Business logic (tests, git, sessions, etc.)

**Renderer Process:**
- `src/renderer/App.tsx` - Routes, global layout
- `src/renderer/pages/*` - Individual pages
- `src/renderer/store/useStore.ts` - Global state (Zustand)

**Shared:**
- `src/shared/types.ts` - TypeScript interfaces used by both processes

---

## Development Workflow

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Edit code
   - Test locally
   - Ensure TypeScript compiles without errors

3. **Test your changes**
   ```bash
   # Check TypeScript errors
   npx tsc --noEmit

   # Run the app
   npm run dev
   npm start

   # Test packaging
   npm run build
   npm run package
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add awesome feature"
   ```

   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `perf:` - Performance improvements
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a Pull Request on GitHub.

### Adding a New Feature

**Checklist:**
1. [ ] Update `src/shared/types.ts` with new interfaces
2. [ ] Add IPC handler in `src/main/ipc-handlers.ts`
3. [ ] Implement service logic in `src/main/services/`
4. [ ] Add API to `src/preload/index.ts`
5. [ ] Create UI in `src/renderer/`
6. [ ] Update state management in `src/renderer/store/useStore.ts`
7. [ ] Test all edge cases
8. [ ] Update documentation (USER_GUIDE.md, etc.)

**Example: Adding a "Favorite Projects" feature**

1. **Define types** (`src/shared/types.ts`):
   ```typescript
   export interface Project {
     // ... existing fields
     isFavorite?: boolean;
   }
   ```

2. **Add IPC handler** (`src/main/ipc-handlers.ts`):
   ```typescript
   ipcMain.handle('project:toggleFavorite', async (event, projectId) => {
     return await projectManager.toggleFavorite(projectId);
   });
   ```

3. **Implement service** (`src/main/services/ProjectManager.ts`):
   ```typescript
   async toggleFavorite(projectId: string): Promise<void> {
     const project = this.projects.find(p => p.id === projectId);
     if (project) {
       project.isFavorite = !project.isFavorite;
       await this.saveProjects();
     }
   }
   ```

4. **Expose API** (`src/preload/index.ts`):
   ```typescript
   toggleProjectFavorite: (projectId: string) =>
     ipcRenderer.invoke('project:toggleFavorite', projectId),
   ```

5. **Use in UI** (`src/renderer/pages/Dashboard.tsx`):
   ```typescript
   const toggleFavorite = async () => {
     await window.api.toggleProjectFavorite(project.id);
     // Refresh projects
   };
   ```

---

## Coding Standards

### TypeScript

**Use strict mode:**
```typescript
// tsconfig.json has "strict": true
// No `any` types without good reason
// Prefer interfaces over types for objects
```

**Example:**
```typescript
// ✅ Good
interface Project {
  id: string;
  name: string;
  path: string;
}

// ❌ Bad
let project: any = { ... };
```

### React

**Functional components with hooks:**
```typescript
// ✅ Good
const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  // ...
};

// ❌ Bad (class components)
class Dashboard extends React.Component { ... }
```

**Use custom hooks for reusable logic:**
```typescript
// hooks/useProjects.ts
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  return { projects, reloadProjects };
};
```

### Naming Conventions

- **Files:** PascalCase for components (`Dashboard.tsx`), camelCase for utilities (`useProjects.ts`)
- **Components:** PascalCase (`ProjectCard`)
- **Functions/variables:** camelCase (`getProject`, `isLoading`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces:** PascalCase with descriptive names (`ProjectSettings`)

### Comments

**Use JSDoc for public APIs:**
```typescript
/**
 * Runs tests for a project
 * @param projectId - Unique project identifier
 * @param options - Test runner options
 * @returns Test results with pass/fail counts
 */
async runTests(projectId: string, options?: TestOptions): Promise<TestResults> {
  // ...
}
```

**Inline comments for complex logic:**
```typescript
// Cache git status for 5 seconds to avoid hammering git commands
if (Date.now() - lastCheck < 5000) {
  return cachedStatus;
}
```

### Error Handling

**Always handle errors:**
```typescript
try {
  await window.api.runTests(projectId);
} catch (error) {
  console.error('Failed to run tests:', error);
  toast.error('Failed to run tests. Check console for details.');
}
```

**Provide user-friendly messages:**
```typescript
// ✅ Good
toast.error('Could not find test command. Check project settings.');

// ❌ Bad
toast.error(error.message); // Might be cryptic technical error
```

---

## Testing

### Manual Testing

**Before submitting a PR, test:**
1. Happy path (feature works as expected)
2. Edge cases (empty states, errors, etc.)
3. Cross-platform (if possible)

**Test checklist for major changes:**
- [ ] TypeScript compiles without errors
- [ ] App builds: `npm run build`
- [ ] App packages: `npm run package`
- [ ] No console errors in dev tools
- [ ] All existing features still work

### Automated Testing

*Coming soon: Jest tests for services, React Testing Library for components*

---

## Submitting Changes

### Pull Request Process

1. **Fork the repository** (if you haven't)

2. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make your changes and commit**
   ```bash
   git commit -m "feat: add my awesome feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

5. **Open a Pull Request on GitHub**

6. **Fill in the PR template:**
   - **What:** Describe the change
   - **Why:** Explain the motivation
   - **How:** Briefly explain the implementation
   - **Testing:** What you tested
   - **Screenshots:** If UI changes

7. **Wait for review**
   - Maintainers will review
   - Address feedback
   - Once approved, it'll be merged!

### PR Best Practices

**Do:**
- Keep PRs focused (one feature/fix per PR)
- Write clear commit messages
- Update documentation if needed
- Test thoroughly before submitting

**Don't:**
- Mix multiple unrelated changes
- Submit broken code
- Forget to update docs

---

## Release Process

*For maintainers*

### Version Numbering

We use Semantic Versioning (semver):
- **Major:** Breaking changes (2.0.0)
- **Minor:** New features, backward compatible (1.1.0)
- **Patch:** Bug fixes (1.0.1)

### Release Checklist

1. **Update version in `package.json`**
   ```bash
   npm version minor  # or major, patch
   ```

2. **Update CHANGELOG.md**
   - Add new version section
   - List all changes since last release

3. **Test packaging**
   ```bash
   npm run package
   # Test installers on each platform
   ```

4. **Create git tag**
   ```bash
   git tag -a v1.1.0 -m "Release v1.1.0"
   git push origin v1.1.0
   ```

5. **Create GitHub Release**
   - Go to Releases → New Release
   - Select tag
   - Write release notes
   - Upload installers (.dmg, .exe, .AppImage, etc.)
   - Publish

6. **Announce**
   - GitHub Discussions
   - Social media
   - Update README if needed

---

## Questions?

- **General questions:** [GitHub Discussions](https://github.com/pmartin1915/automation/discussions)
- **Bug reports:** [GitHub Issues](https://github.com/pmartin1915/automation/issues)
- **Maintainers:** @pmartin1915

**Thank you for contributing!** 🎉
