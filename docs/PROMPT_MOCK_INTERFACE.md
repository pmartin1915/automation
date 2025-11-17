# 🎨 Prompt: Build Mock Interface for Automation Platform

**Context:** You're working on the Claude Code Automation Platform - a visual desktop application for managing AI-assisted development across multiple projects.

---

## 📋 Your Task

Build a **visual mock/prototype** of the platform interface using React + TypeScript. This is a non-functional UI mockup to validate the design before building the full Electron app.

---

## 📚 Reference Documentation

**Start by reading these (in order):**
1. `/home/user/automation/docs/VISION.md` - See the ASCII UI mockup and feature descriptions
2. `/home/user/automation/docs/ARCHITECTURE.md` - Understand the data models and component structure
3. `/home/user/automation/README.md` - Overview and philosophy

---

## 🎯 What to Build

### **Phase 1: Static Mockup** (Do this first)

Create a React app with:

1. **Dashboard Layout**
   - Left sidebar: Project list (3-4 mock projects)
   - Main area: Selected project details
   - Top nav/header with app title

2. **Project Sidebar**
   - Mock projects:
     - "Clinical Toolkit" (✅ 113/113 tests)
     - "Burn Calculator" (⚠️ 8/12 tests)
     - "Automation Platform" (✅ 0/0 tests)
   - "+ Add Project" button
   - Click to select (highlight selected project)

3. **Project Detail View**
   - Project name and status banner
   - Current branch and last session info
   - Quick action buttons:
     - [🧪 Run Tests]
     - [🚀 Launch Claude Code]
     - [📝 Commit & Push]
     - [🌿 Create Branch]
   - Test results section:
     - List of test files with pass/fail status
     - Expandable test items (click to show mock error)
   - Activity feed showing recent actions

4. **Visual Design**
   - Use Tailwind CSS for styling
   - Use shadcn/ui components (install via CLI)
   - Color scheme:
     - Green for passing tests
     - Red for failing tests
     - Yellow/orange for warnings
     - Clean, modern, professional look
   - Responsive layout (works on different screen sizes)

### **Phase 2: Interactive Elements** (After Phase 1)

Add basic interactivity:
- Click projects in sidebar to switch view
- Expand/collapse test items to see mock errors
- Hover effects on buttons
- Modal for "Launch Claude Code" (show mock context)
- Modal for "Add Project" (just UI, no functionality)

---

## 🏗️ Tech Stack

```bash
# Initialize React + TypeScript + Vite
npm create vite@latest automation-platform-mock -- --template react-ts
cd automation-platform-mock
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui
npx shadcn-ui@latest init

# Add components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add scroll-area
```

---

## 📦 Mock Data

Use this TypeScript interface and mock data:

```typescript
interface Project {
  id: string;
  name: string;
  language: string;
  testFramework: string;
  tests: {
    total: number;
    passed: number;
    failed: number;
  };
  git: {
    currentBranch: string;
    uncommittedChanges: number;
  };
  lastSession?: {
    timestamp: string;
    outcome: 'success' | 'partial' | 'failed';
  };
  testFiles: TestFile[];
}

interface TestFile {
  name: string;
  path: string;
  passed: number;
  failed: number;
  tests: Test[];
}

interface Test {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: {
    message: string;
    stack?: string;
  };
}

// Mock data
const mockProjects: Project[] = [
  {
    id: 'clinical-toolkit',
    name: 'Clinical Toolkit',
    language: 'TypeScript',
    testFramework: 'Jest',
    tests: { total: 113, passed: 113, failed: 0 },
    git: {
      currentBranch: 'claude/mobile-app-conversion-v1',
      uncommittedChanges: 0,
    },
    lastSession: {
      timestamp: '12 mins ago',
      outcome: 'success',
    },
    testFiles: [
      {
        name: 'Home.test.tsx',
        path: 'tests/Home.test.tsx',
        passed: 4,
        failed: 0,
        tests: [
          { name: 'renders welcome message', status: 'passed', duration: 23 },
          { name: 'navigates to COPD page', status: 'passed', duration: 45 },
          { name: 'shows quick links', status: 'passed', duration: 18 },
          { name: 'displays app version', status: 'passed', duration: 12 },
        ],
      },
      // Add more test files...
    ],
  },
  {
    id: 'burn-calculator',
    name: 'Burn Calculator',
    language: 'TypeScript',
    testFramework: 'Jest',
    tests: { total: 12, passed: 8, failed: 4 },
    git: {
      currentBranch: 'claude/fix-calculations-v1',
      uncommittedChanges: 5,
    },
    testFiles: [
      {
        name: 'Calculator.test.tsx',
        path: 'tests/Calculator.test.tsx',
        passed: 2,
        failed: 2,
        tests: [
          { name: 'calculates BSA correctly', status: 'passed', duration: 15 },
          { name: 'calculates TBSA for adults', status: 'passed', duration: 20 },
          {
            name: 'calculates TBSA for children',
            status: 'failed',
            duration: 18,
            error: {
              message: 'Expected 18, received 22',
              stack: 'at Calculator.test.tsx:45:12',
            },
          },
          {
            name: 'validates input ranges',
            status: 'failed',
            duration: 10,
            error: {
              message: 'Validation did not trigger for negative values',
              stack: 'at Calculator.test.tsx:67:8',
            },
          },
        ],
      },
      // Add more test files...
    ],
  },
  {
    id: 'automation-platform',
    name: 'Automation Platform',
    language: 'TypeScript',
    testFramework: 'Vitest',
    tests: { total: 0, passed: 0, failed: 0 },
    git: {
      currentBranch: 'claude/automation-project-0158TCzixw1vznjgWkYd3eWa',
      uncommittedChanges: 0,
    },
    testFiles: [],
  },
];
```

---

## 🎨 Component Structure

```
src/
├── App.tsx                    # Main layout
├── components/
│   ├── Sidebar.tsx            # Project list sidebar
│   ├── ProjectCard.tsx        # Single project in sidebar
│   ├── ProjectDetail.tsx      # Main project view
│   ├── TestFileList.tsx       # List of test files
│   ├── TestFileItem.tsx       # Single test file (expandable)
│   ├── TestItem.tsx           # Individual test
│   ├── QuickActions.tsx       # Action buttons
│   ├── GitStatus.tsx          # Git info display
│   ├── ActivityFeed.tsx       # Recent activity
│   └── modals/
│       ├── LaunchClaudeModal.tsx   # Show context preview
│       └── AddProjectModal.tsx     # Add project form
├── data/
│   └── mockData.ts            # Mock projects and tests
├── types/
│   └── index.ts               # TypeScript interfaces
└── main.tsx                   # Entry point
```

---

## 🎯 Success Criteria

**Your mockup is done when:**
- ✅ Dashboard shows 3 projects in sidebar
- ✅ Clicking a project switches the main view
- ✅ Test results are displayed with color coding (green/red)
- ✅ Expandable test items show error details
- ✅ Quick action buttons are present and styled
- ✅ "Launch Claude Code" button opens modal with mock context
- ✅ Looks professional and polished
- ✅ Responsive design works on different screen sizes

**Screenshot test:** Take screenshots and compare to the vision in `docs/VISION.md`

---

## 📸 Visual Reference

From `docs/VISION.md`, your mockup should match this layout:

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
│  │   ✅ 0/0     │                                                            │
│  + Add Project  │                                                            │
│  └──────────────┘                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### **Step 1: Create React App**

```bash
cd /home/user
npm create vite@latest automation-platform-mock -- --template react-ts
cd automation-platform-mock
npm install
```

### **Step 2: Install Dependencies**

```bash
# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui
npx shadcn-ui@latest init
# Choose:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes

# Add components
npx shadcn-ui@latest add button card badge dialog scroll-area separator
```

### **Step 3: Configure Tailwind**

Edit `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### **Step 4: Create Mock Data**

Create `src/data/mockData.ts` with the mock data from above.

### **Step 5: Build Components**

Start with the main layout (`App.tsx`), then build components one by one.

### **Step 6: Run Dev Server**

```bash
npm run dev
```

Open http://localhost:5173 and iterate!

---

## 🎨 Design Guidelines

### **Colors**
- **Success/Passing:** Green (`text-green-600`, `bg-green-50`)
- **Error/Failing:** Red (`text-red-600`, `bg-red-50`)
- **Warning:** Yellow (`text-yellow-600`, `bg-yellow-50`)
- **Info:** Blue (`text-blue-600`, `bg-blue-50`)
- **Neutral:** Gray (`text-gray-600`, `bg-gray-50`)

### **Typography**
- **Headings:** `font-semibold` or `font-bold`
- **Body:** `font-normal`
- **Code/Monospace:** Use `font-mono` for file paths, error messages

### **Spacing**
- **Consistent padding:** Use `p-4` or `p-6` for cards/sections
- **Gap between elements:** Use `gap-2`, `gap-4` for flex/grid layouts

### **Shadows & Borders**
- **Cards:** `shadow-sm border border-gray-200`
- **Hover effects:** `hover:shadow-md transition-shadow`

---

## 💡 Tips

1. **Start simple:** Build the basic layout first, then add details
2. **Use shadcn/ui:** Don't build buttons/cards from scratch - use the components
3. **Mock everything:** No real functionality needed - just visual representation
4. **Iterate fast:** Get something on screen, then refine
5. **Check the vision doc:** Reference `docs/VISION.md` frequently to match the design
6. **Test responsiveness:** Resize browser to see how it looks at different sizes

---

## 📦 Deliverables

When done:
1. **Working React app** at `/home/user/automation-platform-mock`
2. **Screenshot** of the dashboard (save as `docs/mockup-screenshot.png`)
3. **README** in the mock project explaining how to run it
4. **Commit and push** to a new branch: `claude/ui-mockup-v1`

---

## 🔄 Next Steps (After Mockup)

Once the mockup is validated:
1. Get feedback on the design
2. Iterate on any changes
3. Use this as the foundation for the full Electron app
4. Start implementing real functionality (Week 3+ of roadmap)

---

## ✅ Checklist

Use this to track progress:

- [ ] React + TypeScript + Vite project initialized
- [ ] Tailwind CSS installed and configured
- [ ] shadcn/ui installed with basic components
- [ ] Mock data created in `src/data/mockData.ts`
- [ ] `Sidebar.tsx` component showing project list
- [ ] `ProjectDetail.tsx` component showing test results
- [ ] Quick action buttons rendered and styled
- [ ] Test items expandable to show errors
- [ ] "Launch Claude Code" modal working
- [ ] Color coding for pass/fail implemented
- [ ] Responsive layout tested
- [ ] Screenshot taken
- [ ] Code committed and pushed

---

**Good luck! Focus on making it look polished and professional. This mockup will validate the design before we invest time building the full Electron app.** 🎨✨
