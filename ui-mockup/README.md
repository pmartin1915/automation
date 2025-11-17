# 🤖 Claude Automation Platform - UI Mockup

A visual mockup/prototype of the Claude Code Automation Platform - a desktop application for managing AI-assisted development across multiple projects.

## 📸 What This Is

This is a **non-functional UI mockup** built to validate the design before implementing the full Electron application. It demonstrates:

- Multi-project dashboard with test status
- Expandable test results with error details
- Claude Code integration with context generation
- Git status visualization
- Activity feed
- Modal dialogs for actions

## 🎯 Features Implemented

### ✅ Core UI Components

- **Project Sidebar**: List of projects with test pass/fail indicators
- **Project Detail View**: Comprehensive project information including:
  - Test status summary
  - Git branch and uncommitted changes
  - Quick action buttons
  - Expandable test file list with individual test results
  - Recent activity feed

### ✅ Interactive Elements

- Click projects to switch views
- Expand/collapse test files to see individual tests
- Click failed tests to see error messages and stack traces
- "Launch Claude Code" button with context preview modal
- "Add Project" button with project addition form (UI only)

### ✅ Mock Data

- **Clinical Toolkit**: 113/113 tests passing ✅
- **Burn Calculator**: 8/12 tests passing (4 failing) ⚠️
- **Automation Platform**: 0/0 tests (no tests yet) ✅

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (or compatible version)
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 🏗️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: React useState (simple state for mockup)

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (Button, Card, Badge, Dialog)
│   ├── modals/                # Modal dialogs
│   │   ├── LaunchClaudeModal.tsx
│   │   └── AddProjectModal.tsx
│   ├── ProjectCard.tsx        # Project summary card for sidebar
│   ├── Sidebar.tsx            # Project list sidebar
│   ├── ProjectDetail.tsx      # Main project view
│   ├── GitStatus.tsx          # Git branch/status display
│   ├── QuickActions.tsx       # Action buttons
│   ├── TestFileList.tsx       # List of test files
│   ├── TestFileItem.tsx       # Single expandable test file
│   └── ActivityFeed.tsx       # Recent activity list
├── data/
│   └── mockData.ts            # Mock projects and test data
├── types/
│   └── index.ts               # TypeScript interfaces
├── lib/
│   └── utils.ts               # Utility functions (cn helper)
├── App.tsx                    # Main app component
└── index.css                  # Global styles with Tailwind
```

## 🎨 Key Design Decisions

### Color Coding
- **Green**: Passing tests ✅
- **Red**: Failing tests ❌
- **Yellow/Orange**: Warnings ⚠️
- **Blue**: Selected/active state
- **Gray**: Neutral/inactive

### Component Design
- **Cards**: Used shadcn/ui Card for consistent containers
- **Badges**: Color-coded status indicators
- **Buttons**: Outline and default variants for visual hierarchy
- **Modals**: Dialog component for non-blocking interactions

### Layout
- **Fixed Header**: App title always visible
- **Sidebar**: Fixed width (18rem / 288px) for project list
- **Main Content**: Scrollable area for project details
- **Responsive**: Grid layouts that adapt to screen size

## 🔍 What Works (Interactive)

1. **Project Selection**: Click any project in the sidebar to view its details
2. **Test Expansion**: Click test files to expand and see individual tests
3. **Error Details**: Failing tests show error messages and stack traces
4. **Launch Claude Modal**: Opens modal with generated context for Claude Code
5. **Add Project Modal**: Opens form for adding new project (UI only)

## 🚧 What Doesn't Work (Mockup Limitations)

- **No real test running**: All test data is mocked
- **No git operations**: Git status is static mock data
- **No file system access**: Can't actually browse for projects
- **No Claude Code integration**: Modal just shows example context
- **No persistence**: Refreshing resets to initial state

## 📋 Validation Checklist

- ✅ Dashboard shows 3 projects in sidebar
- ✅ Clicking a project switches the main view
- ✅ Test results are displayed with color coding
- ✅ Expandable test items show error details
- ✅ Quick action buttons are present and styled
- ✅ "Launch Claude Code" button opens modal with mock context
- ✅ Looks professional and polished
- ✅ Responsive design works on different screen sizes

## 🎯 Next Steps

After validating this mockup design:

1. Get feedback on the UI/UX
2. Make any necessary design adjustments
3. Use this as the foundation for the Electron app
4. Implement real functionality (test running, git operations, etc.)
5. Add state management (Zustand or Redux)
6. Connect to actual test runners and git

## 📚 Reference Documentation

For context on this project, see:

- `/home/user/automation/docs/VISION.md` - Product vision and features
- `/home/user/automation/docs/ARCHITECTURE.md` - Technical architecture
- `/home/user/automation/docs/PROMPT_MOCK_INTERFACE.md` - This mockup's requirements

## 🤝 Contributing

This is a mockup for design validation. For the full implementation, see the main automation platform project.

## 📝 License

Part of the Claude Code Automation Platform project.

---

**Built with React + TypeScript + Tailwind CSS + shadcn/ui**
