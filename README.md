# 🤖 Claude Code Automation Platform

**A visual desktop application for managing AI-assisted development across multiple projects**

---

## 🎯 What Is This?

The **Claude Code Automation Platform** transforms scattered development workflows into a unified, visual command center. It combines:

- 🎨 **Intuitive visual interface** with drag-and-drop test management
- 🧪 **Real-time test running** across all your projects
- 🌿 **Git integration** (no terminal needed)
- 🤖 **Claude Code Web integration** for AI-assisted development
- 📊 **Session tracking** to measure effectiveness

**Current Status:** Planning & Design Phase → Ready for Implementation

---

## 🚨 IMPORTANT: Claude Code Web Users

**If you're using Claude Code Web, READ THIS FIRST:**

Claude Code Web has a git synchronization issue where commits may not reach GitHub between sessions. This causes work to appear "lost" in the next session.

**Solution: Use our verification scripts**

Before ending ANY session:
```bash
./scripts/safe-commit-push.sh "your commit message"
```

This script verifies your commits actually reached GitHub (not just the local proxy).

**📖 Full guide:** [Claude Code Web Git Fix](docs/CLAUDE_CODE_WEB_GIT_FIX.md)

---

## 📖 Complete Documentation

### **Vision & Strategy**
- [📋 Vision Document](docs/VISION.md) - Complete product vision with UI mockups and workflows
- [🏗️ Technical Architecture](docs/ARCHITECTURE.md) - Electron + React architecture, tech stack, data models
- [🚀 Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md) - 10-week plan to MVP

### **Claude Code Integration**
- [🤖 Claude Code Integration Guide](docs/CLAUDE_CODE_INTEGRATION.md) - Context generation, session tracking, best practices
- [🔧 Claude Code Web Git Fix](docs/CLAUDE_CODE_WEB_GIT_FIX.md) - **CRITICAL**: Fix for git sync issues between sessions
- [📝 Claude Workflow](docs/CLAUDE_WORKFLOW.md) - How Claude uses TDD to fix tests autonomously
- [🌿 Branch Management](docs/BRANCH_MANAGEMENT.md) - Multi-session branch strategy

### **Automation Scripts**
- [safe-commit-push.sh](scripts/safe-commit-push.sh) - Commit and push with GitHub verification
- [verify-push.sh](scripts/verify-push.sh) - Verify commits reached GitHub
- [session-start.sh](scripts/session-start.sh) - Start sessions correctly with file verification

---

## 🎨 Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🤖 Claude Automation Platform                    [_] [□] [X]                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐  ┌──────────────────────────────────────────────────────┐ │
│  │   PROJECTS   │  │          Clinical Toolkit                             │ │
│  ├──────────────┤  ├──────────────────────────────────────────────────────┤ │
│  │              │  │  📊 Status: ✅ All Tests Passing (113/113)            │ │
│  │ 🏥 Clinical  │  │  🌿 Branch: claude/mobile-app-conversion-v1          │ │
│  │   Toolkit    │  │  📝 Last Session: 12 mins ago                         │ │
│  │   ✅ 113/113 │  │                                                        │ │
│  │              │  │  [🧪 Run Tests]  [🚀 Launch Claude Code]             │ │
│  │ 🔥 Burn Calc │  │  [📝 Commit]      [🌿 New Branch]                    │ │
│  │   ⚠️  8/12   │  │                                                        │ │
│  │              │  └──────────────────────────────────────────────────────┘ │
│  │ 🤖 Automation│                                                            │
│  │   ✅ 0/0     │     Drag & drop test files, see real-time results,        │
│  │              │     commit/push with one click, launch Claude Code        │
│  + Add Project  │     with rich context—all in one beautiful interface.     │
│  └──────────────┘                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

**See [Vision Document](docs/VISION.md) for full mockups and workflows**

---

## ✨ Key Features

### **Multi-Project Dashboard**
- Visual overview of all projects with test status
- At-a-glance pass/fail counts
- Click to dive into details

### **Drag & Drop Test Management**
- Drag test files to add them
- Visual test results with expandable errors
- One-click to re-run failed tests

### **Claude Code Integration**
- Generate rich context (failing tests, git status, tasks)
- Launch Claude Code Web with one click
- Track sessions and measure success rate

### **Git Made Easy**
- Visual branch management
- One-click commit & push
- No terminal commands needed

### **Real-Time Everything**
- Stream test output as it runs
- Live git status updates
- Instant feedback

---

## 🚀 Getting Started

### **Current Phase: Planning → Implementation**

We're transitioning from planning to building! Here's how to contribute:

1. **Read the docs** (start with [Vision](docs/VISION.md))
2. **Review the roadmap** ([Implementation Plan](docs/IMPLEMENTATION_ROADMAP.md))
3. **Set up development environment** (coming soon in Week 1)
4. **Pick a task** from the roadmap and start building!

---

## 🏗️ Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Desktop:** Electron (cross-platform)
- **UI Components:** shadcn/ui
- **Git:** simple-git library
- **State:** Zustand
- **Build:** Vite + electron-builder

**See [Architecture](docs/ARCHITECTURE.md) for complete technical details**

---

## 📊 Proven Approach

This platform builds on proven workflows from the **Clinical Toolkit** project:

**Before Automation:**
- 97/113 tests passing (86%)
- Manual test running, scattered tools
- Unclear what to fix next

**After Automation (with Claude Code):**
- 113/113 tests passing (100%) ✅
- 30 minutes, fully autonomous
- Clear feedback loop: test → error → fix → test

**Goal:** Scale this success to ALL your projects with a visual interface

---

## 🎯 Success Metrics (Post-Launch)

We'll track:
- **Time savings:** 50% reduction from "test fails" to "test passes"
- **Test health:** 90%+ pass rate across all projects
- **Claude effectiveness:** 80%+ of sessions complete autonomously
- **User satisfaction:** One interface for everything (no tool switching)

---

## 🛣️ Roadmap

### **Phase 1: MVP (Weeks 1-10)**
- Project dashboard
- Test runner with visual results
- Git integration (commit/push/branch)
- Claude Code context generation
- Session tracking

### **Phase 2: Enhancement (Weeks 11+)**
- Test coverage visualization
- Test history graphs
- Smart test selection
- Multi-project test runner

### **Phase 3: Collaboration**
- Export/import configs
- Team dashboard
- Slack/Discord notifications

### **Phase 4: AI Integration**
- AI-generated commit messages
- Local LLM suggestions
- Auto-fix simple test failures

**Full timeline in [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)**

---

## 💡 Philosophy

### **Test-Driven Development for AI**

Traditional TDD:
```
Developer writes test → Developer writes code → Test fails → Developer fixes → Test passes
```

AI-Optimized TDD:
```
AI writes test → AI writes code → AI runs test → AI sees exact error → AI fixes → Repeat until green
```

**Key insight:** AI assistants work best with unambiguous feedback. Tests provide that feedback.

---

## 🤝 Contributing

We're in the early stages! Contributions welcome:

1. **Documentation:** Improve existing docs or add new ones
2. **Design:** Suggest UI/UX improvements
3. **Code:** Start implementing features (see roadmap)
4. **Testing:** Try the platform with your projects
5. **Feedback:** What features matter most to you?

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/pmartin1915/automation/issues)
- **Questions:** Open a discussion or issue
- **Ideas:** We'd love to hear them!

---

## 📄 License

(To be determined - suggest MIT or Apache 2.0)

---

**Built with ❤️ to make AI-assisted development delightful, visual, and productive.**
