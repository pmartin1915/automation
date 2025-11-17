# 🤖 Prompt: Continue Automation Platform Project

**Context:** You're continuing work on the Claude Code Automation Platform - a visual desktop application for managing AI-assisted development across multiple projects with seamless Claude Code Web integration.

---

## 📍 Where We Are

### **Current Status: Planning Complete ✅**

The planning and design phase is **DONE**. We have:
- Complete product vision with UI mockups
- Technical architecture (Electron + React + TypeScript)
- 10-week implementation roadmap
- Claude Code integration strategy
- All documentation committed and pushed

**Branch:** `claude/automation-project-0158TCzixw1vznjgWkYd3eWa`
**Repository:** `/home/user/automation` (pmartin1915/automation)

---

## 📚 Documentation (Read These First!)

All documentation is in `/home/user/automation/docs/`:

### **Core Documents**
1. **`VISION.md`** - Product vision, UI mockups, workflows, feature specs
2. **`ARCHITECTURE.md`** - Technical architecture, data models, file structure
3. **`IMPLEMENTATION_ROADMAP.md`** - 10-week plan with detailed tasks
4. **`CLAUDE_CODE_INTEGRATION.md`** - Context generation, session tracking
5. **`README.md`** - Project overview and links

### **Supporting Documents**
- **`CLAUDE_WORKFLOW.md`** - How Claude uses TDD (proven with Clinical Toolkit)
- **`BRANCH_MANAGEMENT.md`** - Git workflow for multi-session projects

### **Additional Prompts**
- **`PROMPT_MOCK_INTERFACE.md`** - Instructions for building UI mockup (optional next step)

---

## 🎯 What Was Built

### **Complete Planning Suite**

1. **Vision Document**
   - ASCII UI mockup of the dashboard
   - Typical user workflow
   - Feature specifications (MVP + future phases)
   - Success metrics
   - Open questions answered by user

2. **Technical Architecture**
   - Tech stack: Electron + React + TypeScript + Tailwind CSS + shadcn/ui
   - Architecture diagram (main process ↔ renderer via IPC)
   - Data models: Project, TestResults, GitStatus
   - Complete file structure for the codebase
   - IPC communication patterns
   - Security & performance considerations

3. **Implementation Roadmap**
   - 10-week plan to MVP
   - Week-by-week breakdown:
     - Weeks 1-2: Project setup (Electron + React)
     - Weeks 3-4: Test running
     - Weeks 5-6: Git integration
     - Weeks 7-8: Claude Code integration
     - Weeks 9-10: Polish & launch
   - Post-MVP roadmap (Phases 2-4)

4. **Claude Code Integration Guide**
   - Context builder implementation (TypeScript class)
   - Session tracking
   - Webhook integration (future)
   - Best practices
   - Example user flow

---

## ✅ Key Decisions Made

The user answered open questions:

### **1. Multi-Language Support**
- **Decision:** Yes, support multiple languages
- **Priority:** Start with JavaScript/TypeScript + Python
- **Future:** Add Go, Rust, Java, etc.

### **2. Test Framework Support**
- **Decision:** Support multiple frameworks
- **Priority:** Jest (JS) + Pytest (Python)
- **Future:** Vitest, RSpec, Cargo test, Go test, etc.

### **3. AI Integration**
- **Decision:** Claude Code + local LLMs
- **Implementation:**
  - Start with Claude Code Web integration (copy-paste workflow)
  - Add local LLM suggestions in Phase 4
  - Future: AI-generated commit messages, auto-fix simple failures

### **4. Team Features**
- **Decision:** Single-user first, team capabilities later
- **Implementation:**
  - MVP is single-user
  - Phase 3 adds export/import configs
  - Future: Team dashboard, shared templates

### **5. Desktop Platform**
- **Decision:** Electron desktop app (not web-based)
- **Rationale:**
  - True file system access (drag & drop)
  - Can run local test runners
  - Native OS integration
  - Works offline

---

## 🏗️ Tech Stack (Final)

**Frontend:**
- React 18+ with TypeScript
- Tailwind CSS for styling
- shadcn/ui for components (Radix UI primitives)
- Zustand for state management
- react-dnd or dnd-kit for drag & drop

**Backend (Electron Main Process):**
- Node.js (bundled with Electron)
- simple-git for git operations
- child_process for test runners

**Desktop:**
- Electron (latest stable)
- electron-builder for packaging

**Development:**
- Vite for build tooling
- Vitest + React Testing Library for testing
- ESLint + Prettier for linting

---

## 📊 Proven Success

This platform builds on proven workflows:

**Clinical Toolkit Example:**
- **Before:** 97/113 tests passing (86%)
- **With Claude Code:** 113/113 tests passing (100%)
- **Time:** ~30 minutes, autonomous
- **Workflow:** Test fails → Claude sees error → Claude fixes → Test passes → Repeat

**Goal:** Scale this to ALL projects with a visual interface.

---

## 🚀 Next Steps (Choose One)

### **Option 1: Build UI Mockup (Recommended Next)**

**Why:** Validate the design before building the full Electron app.

**How:** Use the prompt in `docs/PROMPT_MOCK_INTERFACE.md`

**What to build:**
- React + TypeScript + Vite app
- Visual mockup of the dashboard (non-functional)
- Use mock data for 3 projects
- Tailwind CSS + shadcn/ui for styling
- Interactive elements (click projects, expand tests)

**Time estimate:** 2-4 hours

**Deliverable:** Working mockup at `/home/user/automation-platform-mock`

---

### **Option 2: Start Week 1 of Roadmap**

**Why:** Jump straight into building the real Electron app.

**Tasks (from `IMPLEMENTATION_ROADMAP.md`):**

**Day 1-2: Project Initialization**
```bash
cd /home/user
mkdir automation-platform
cd automation-platform

# Initialize package.json
npm init -y

# Install dependencies
npm install electron electron-builder
npm install -D vite @vitejs/plugin-react typescript
npm install react react-dom
npm install -D @types/react @types/react-dom

# Set up TypeScript
npx tsc --init

# Configure Vite
# Create vite.config.ts, electron main process, etc.
```

**Day 3-4: Basic App Structure**
- Create file structure (src/main, src/renderer, src/shared)
- Set up IPC boilerplate
- Create basic BrowserWindow
- Add hot reload for development

**Day 5-6: UI Framework Setup**
- Install Tailwind CSS
- Install shadcn/ui components
- Create basic layout (header, sidebar, main content)

**Day 7: First Run**
- Package app for local testing
- Verify it runs
- Document setup process

---

### **Option 3: Create Starter Template**

**Why:** Pre-configured boilerplate for faster development.

**What to create:**
- Electron + React + TypeScript + Vite starter template
- Pre-configured with Tailwind CSS and shadcn/ui
- Basic project structure already set up
- README with setup instructions
- Save as separate repo or branch

**Benefit:** Anyone can clone and start developing immediately.

---

### **Option 4: Implement Core Services (Backend First)**

**Why:** Build the business logic without UI.

**What to build:**
- `ProjectManager` service (add/remove/list projects)
- `ConfigStore` service (save/load from JSON)
- `GitController` service (status, commit, push, branch ops)
- `TestRunner` service (execute tests, parse output)

**Approach:** Test-driven development (write tests first!)

---

## 🔄 Development Workflow

### **Git Workflow**

**Current branch:** `claude/automation-project-0158TCzixw1vznjgWkYd3eWa`

**For each session:**
1. Start: `git pull origin claude/automation-project-0158TCzixw1vznjgWkYd3eWa`
2. Make changes
3. Commit: `git commit -m "feat: description"`
4. Push: `git push -u origin claude/automation-project-0158TCzixw1vznjgWkYd3eWa`

**For new features/experiments:**
- Create new branch: `claude/feature-name-v1`
- Develop, commit, push
- Merge back when ready

### **Todo List Management**

**ALWAYS use the TodoWrite tool** to track tasks:
- Break down work into specific tasks
- Mark tasks in_progress and completed as you work
- Keep exactly ONE task in_progress at a time

### **Testing**

**Write tests for everything:**
- Unit tests for services (ProjectManager, GitController, etc.)
- Component tests for React UI
- Integration tests for IPC communication
- E2E tests for full workflows

**Run tests before committing!**

---

## 📁 Project Structure (Future)

When you start building, create this structure:

```
automation-platform/
├── src/
│   ├── main/                      # Electron Main Process
│   │   ├── index.ts               # Entry point
│   │   ├── ipc-handlers.ts        # IPC message handlers
│   │   ├── services/
│   │   │   ├── ProjectManager.ts
│   │   │   ├── TestRunner.ts
│   │   │   ├── GitController.ts
│   │   │   └── ConfigStore.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── renderer/                  # React Frontend
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── utils/
│   │
│   ├── shared/                    # Shared between main/renderer
│   │   ├── types.ts
│   │   └── constants.ts
│   │
│   └── preload/
│       └── index.ts               # Electron preload script
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── electron-builder.yml
```

See `docs/ARCHITECTURE.md` for complete details.

---

## 💡 Key Principles

### **1. Test-Driven Development**
- Write tests BEFORE implementation
- Run tests after EVERY change
- Fix based on specific errors
- 100% pass rate before committing

### **2. User-Centric Design**
- Every feature solves a real problem
- Prioritize ease of use over feature count
- Make common tasks one-click

### **3. Iterate Fast**
- Build minimum feature, test, iterate
- Get feedback early and often
- Don't over-engineer

### **4. Maintain Quality**
- High test coverage
- Fix bugs before adding features
- Clean, readable code

---

## 🎯 Success Metrics (When Built)

We'll measure:
- **Time savings:** 50% reduction from "test fails" to "test passes"
- **Test health:** 90%+ pass rate across all projects
- **Claude effectiveness:** 80%+ of sessions complete autonomously
- **User satisfaction:** One interface for everything

---

## 🛠️ Available Resources

### **Related Projects**
- **Clinical Toolkit:** `/home/user/clinical-toolkit` - Real project to test with
- **Burn Calculator:** (mentioned in vision, may exist)

### **Documentation**
- All docs in `/home/user/automation/docs/`
- Vision, architecture, roadmap, integration guide
- Prompts for specific tasks

### **Mock Data**
- See `PROMPT_MOCK_INTERFACE.md` for TypeScript interfaces and mock projects
- Use Clinical Toolkit + Burn Calculator as real test cases

---

## 🤔 Common Questions

### **Q: Where do I start coding?**
**A:** Option 1 (UI mockup) is recommended. Read `docs/PROMPT_MOCK_INTERFACE.md`.

### **Q: Should I build Electron first or mockup first?**
**A:** Mockup first (faster to validate design). Then build real Electron app.

### **Q: What if I want to change the design?**
**A:** Document changes, get user approval, update docs, then implement.

### **Q: How do I test with real projects?**
**A:** Use Clinical Toolkit (`/home/user/clinical-toolkit`) as a test case.

### **Q: Can I use a different tech stack?**
**A:** Check with user first. Current stack was chosen for specific reasons (see `ARCHITECTURE.md`).

---

## 🚦 Quick Start (Recommended)

### **If you want to build the UI mockup:**

1. Read `docs/VISION.md` to see the design
2. Read `docs/PROMPT_MOCK_INTERFACE.md` for instructions
3. Run:
   ```bash
   cd /home/user
   npm create vite@latest automation-platform-mock -- --template react-ts
   cd automation-platform-mock
   npm install
   npx shadcn-ui@latest init
   ```
4. Start building components
5. Reference mock data from prompt
6. Commit and push when done

### **If you want to start the full Electron app:**

1. Read `docs/IMPLEMENTATION_ROADMAP.md` Week 1 tasks
2. Initialize Electron + React + TypeScript project
3. Configure Vite, Tailwind, shadcn/ui
4. Create basic app shell
5. Follow roadmap week by week

---

## 📞 Getting Help

**Stuck? Check these:**
- `docs/ARCHITECTURE.md` - Technical details
- `docs/IMPLEMENTATION_ROADMAP.md` - Step-by-step plan
- `docs/VISION.md` - What we're building and why

**User preferences:**
- Multi-language support (JS/TS + Python to start)
- Claude Code + local LLMs
- Single-user first, team features later
- Electron desktop app

---

## ✅ What's Already Done

- ✅ Complete product vision
- ✅ Technical architecture designed
- ✅ 10-week implementation plan
- ✅ Claude Code integration strategy
- ✅ User decisions on key questions
- ✅ Documentation committed and pushed
- ✅ Prompts for next steps created

## ⏭️ What's Next

- ⏹️ Build UI mockup (or jump to Electron app)
- ⏹️ Validate design with user
- ⏹️ Start Week 1 of roadmap
- ⏹️ Implement core services
- ⏹️ Build test runner
- ⏹️ Integrate Claude Code

---

## 🎬 Final Checklist

Before you start coding:
- [ ] Read `docs/VISION.md` (understand what we're building)
- [ ] Read `docs/ARCHITECTURE.md` (understand how to build it)
- [ ] Read `docs/IMPLEMENTATION_ROADMAP.md` (understand the plan)
- [ ] Choose your path: UI mockup OR full Electron app
- [ ] Set up todo list with TodoWrite tool
- [ ] Start coding!

---

**Everything is documented and ready to build. Pick your starting point and go! The vision is clear, the architecture is solid, and the roadmap is detailed. Let's make this happen!** 🚀✨
