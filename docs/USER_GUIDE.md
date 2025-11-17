# Automation Station - User Guide

**Version 1.0.0**

Welcome to the Automation Station! This guide will help you get started and make the most of all features.

---

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Adding Projects](#adding-projects)
5. [Running Tests](#running-tests)
6. [Git Integration](#git-integration)
7. [Session Management](#session-management)
8. [Claude Code Integration](#claude-code-integration)
9. [Settings](#settings)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## Installation

### macOS

1. Download `AutomationPlatform-1.0.0.dmg`
2. Open the DMG file
3. Drag the app icon to your Applications folder
4. Launch from Applications or Spotlight (Cmd+Space, type "Automation")

**First launch:** You may see a security warning. Go to System Preferences → Security & Privacy → General, and click "Open Anyway."

### Windows

1. Download `AutomationPlatform Setup 1.0.0.exe`
2. Run the installer
3. Follow the installation wizard
4. Choose installation directory (default: `C:\Program Files\Automation Station`)
5. Launch from Start Menu or Desktop shortcut

**Note:** Windows may show SmartScreen warning. Click "More info" → "Run anyway" (app is not yet code-signed).

### Linux

#### AppImage (Recommended)
```bash
# Download
wget https://github.com/pmartin1915/automation/releases/download/v1.0.0/AutomationPlatform-1.0.0.AppImage

# Make executable
chmod +x AutomationPlatform-1.0.0.AppImage

# Run
./AutomationPlatform-1.0.0.AppImage
```

#### Debian/Ubuntu (.deb)
```bash
# Download and install
sudo dpkg -i AutomationPlatform-1.0.0.deb

# Fix dependencies if needed
sudo apt-get install -f

# Run
automation-platform
```

#### Fedora/RHEL (.rpm)
```bash
# Install
sudo rpm -i AutomationPlatform-1.0.0.rpm

# Run
automation-platform
```

---

## Getting Started

### First Launch

When you first launch the Automation Station, you'll see an empty dashboard with a welcome message.

**Quick Start:**
1. Click "+ Add Project" or drag a project folder onto the window
2. Configure project settings (test command, language)
3. Click "Add Project"
4. Start running tests!

### Requirements

**Each project needs:**
- A test framework (Jest, Vitest, Pytest, Go test, etc.)
- Git repository (optional, but recommended for full features)
- Package manager (npm, yarn, pip, go mod, etc.)

---

## Dashboard Overview

The Dashboard is your command center for all projects.

### Project Cards

Each project shows:
- **Name & Path** - Project identifier and location
- **Test Status** - Pass/fail count with percentage
- **Git Branch** - Current branch name
- **Last Activity** - When tests were last run
- **Actions** - Quick buttons for common tasks

### Metrics Widget

The top-right widget shows:
- **Total Tests** - Across all projects
- **Pass Rate** - Overall success percentage
- **Active Sessions** - Claude Code sessions in progress
- **Recent Activity** - Last 5 test runs or git operations

### Empty State

If no projects are added:
- Click "+ Add Project" button
- Or drag a folder from your file explorer
- Or use keyboard shortcut: Cmd/Ctrl+N

---

## Adding Projects

There are two ways to add projects:

### Method 1: Click to Add

1. Click "+ Add Project" button
2. Enter project details:
   - **Name** - Display name (auto-detected from folder)
   - **Path** - Full path to project folder
   - **Test Command** - Command to run tests (e.g., `npm test`)
   - **Language** - JavaScript, TypeScript, Python, Go, etc.
   - **Test Framework** - Jest, Vitest, Pytest, etc.
3. Click "Add Project"

**Tips:**
- Path must be absolute (e.g., `/Users/you/projects/my-app`)
- Test command runs from project root
- Use `Browse` button to select folder visually

### Method 2: Drag & Drop

1. Open your file explorer (Finder, Windows Explorer, Nautilus)
2. Find your project folder
3. Drag it onto the Dashboard
4. Drop when you see "Drop folder here" overlay
5. Review auto-detected settings
6. Click "Add Project"

**Auto-Detection:**

The platform automatically detects:
- **Language** - Based on `package.json`, `requirements.txt`, `go.mod`, etc.
- **Test Framework** - Looks for Jest, Vitest, Pytest configs
- **Test Command** - Suggests standard commands (`npm test`, `pytest`, etc.)

You can edit any auto-detected value before adding.

### Removing Projects

1. Find project card on Dashboard
2. Click three-dot menu (⋮)
3. Select "Remove Project"
4. Confirm deletion

**Note:** This only removes the project from the platform. Your actual files are not deleted.

---

## Running Tests

### Run All Tests

1. Click "Run All Tests" button on project card
2. Watch real-time output stream
3. See results update live

### Run Failed Tests Only

1. After a test run with failures
2. Click "Run Failed Only" button
3. Only failed tests re-run (faster iteration)

### Test Output

Test output appears in a modal with:
- **Live streaming** - See output as it happens
- **Syntax highlighting** - Errors in red, passes in green
- **Auto-scroll** - Follows latest output
- **Copy button** - Copy output to clipboard

### Test Results

After tests complete:
- **Pass count** - Green checkmark with number
- **Fail count** - Red X with number
- **Duration** - How long tests took
- **Failed tests** - Expandable list with error messages

### Stopping Tests

- Click "Stop Tests" button while running
- Or press Escape key
- Tests will terminate gracefully

---

## Git Integration

### Git Status

Project cards show:
- **Current branch** - Name of active branch
- **Uncommitted changes** - File count
- **Sync status** - Ahead/behind remote

### Creating Branches

1. Click "New Branch" button
2. Enter branch name
3. Choose base branch (current, main, etc.)
4. Click "Create"

**Branch naming:**
- Customize pattern in Settings
- Default: `feature/name`, `fix/name`, `claude/name`

### Committing Changes

1. Click "Commit" button
2. Review changed files
3. Write commit message
4. Click "Commit"

**Tips:**
- Use conventional commits (feat:, fix:, docs:)
- Keep messages concise (50 chars max for title)
- Describe "why" not "what"

### Pushing to Remote

1. After committing
2. Click "Push" button
3. Wait for confirmation
4. See sync status update

**Authentication:**
- Uses your system's git credentials
- SSH keys work automatically
- HTTPS may prompt for password

### Switching Branches

1. Click branch name dropdown
2. Select target branch
3. Confirm if uncommitted changes exist

---

## Session Management

Sessions track your work with Claude Code.

### Creating a Session

1. Go to Sessions page (Cmd/Ctrl+2)
2. Click "Create Session"
3. Fill in details:
   - **Title** - What you're working on
   - **Project** - Which project
   - **Goals** - What needs to be done
4. Click "Create"

### Session Timeline

The timeline shows:
- **Created** - When session started
- **Tests Run** - Each test execution
- **Git Operations** - Commits, pushes, branches
- **Context Generated** - When context was created for Claude
- **Completed** - When session finished

### Auto-Linking

If enabled in Settings, sessions automatically link to:
- Git branches - Session ID in branch name
- Test runs - Tracked within session
- Git commits - Associated with session

### Auto-Pause

If enabled, sessions automatically pause after:
- Configurable idle time (default: 30 minutes)
- No test runs or git operations
- Can resume anytime

### Session Metrics

Each session tracks:
- **Duration** - Total time active
- **Tests Run** - How many test executions
- **Pass Rate** - Test success percentage
- **Git Activity** - Commits, pushes
- **Success** - Whether goals were achieved

---

## Claude Code Integration

The platform generates rich context for Claude Code Web.

### Generating Context

1. Run tests and see failures
2. Click "Launch Claude Code" button
3. Context is automatically generated and copied
4. Claude Code Web opens in browser
5. Paste context into Claude Code
6. Claude starts working with full context!

### What's Included in Context

**Project Info:**
- Name, language, test framework
- Current git branch
- File structure

**Current State:**
- Test pass/fail counts
- Git status (uncommitted changes)
- Active session (if any)

**Failing Tests:**
- Test file names
- Test names
- Exact error messages
- Stack traces
- Affected files

**Suggested Tasks:**
- Fix failing tests
- Run tests after each fix
- Commit when all pass

### Context Preview

Before copying:
- Click "Preview Context" to see what Claude will receive
- Edit if needed (remove sensitive data)
- Customize task list
- Then copy to clipboard

### Integration Settings

Configure in Settings → Claude Code:
- **Auto-launch** - Open browser automatically
- **Auto-copy** - Copy to clipboard without asking
- **Context template** - Customize format
- **Include files** - Add file contents to context

---

## Settings

Access settings via Cmd/Ctrl+, or click Settings in sidebar.

### Appearance

**Theme:**
- Light - Bright, high contrast
- Dark - Easy on eyes, default
- Auto - Follows system preference

### Defaults

**Test Command Template:**
- Used for new projects
- Supports variables: `{language}`, `{framework}`
- Example: `npm test` → JavaScript/npm projects

**Branch Naming Pattern:**
- Used when creating branches
- Supports variables: `{type}`, `{name}`, `{sessionId}`
- Example: `claude/{sessionId}` → `claude/01ABC123`

### Automation

**Git Auto-Push:**
- Automatically push after commit
- Saves manual step
- Can be dangerous (disable if unsure)

**Auto-Link Sessions:**
- Automatically link git branches to sessions
- Branch name includes session ID
- Helps track work across sessions

**Auto-Pause Sessions:**
- Pause inactive sessions after timeout
- Prevents forgotten active sessions
- Configurable timeout (default: 30 min)

**Session Idle Timeout:**
- How long before auto-pause triggers
- Range: 15 min - 2 hours
- Set to 0 to disable

### Advanced

**Config File Location:**
- Where settings are stored
- Default: `~/.automation-platform/config.json`
- Can change for portability

**Export Settings:**
- Save settings to file
- Share across machines
- Backup before reset

**Reset to Defaults:**
- Clears all settings
- Removes all projects
- Cannot be undone!

**Note:** All settings auto-save. No need to click "Save."

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl+1 | Go to Dashboard |
| Cmd/Ctrl+2 | Go to Sessions |
| Cmd/Ctrl+3 | Go to Settings |
| Cmd/Ctrl+, | Open Settings |
| Cmd/Ctrl+/ | Show Keyboard Shortcuts |

### Dashboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl+N | Add New Project |
| Cmd/Ctrl+R | Run Tests (selected project) |
| Cmd/Ctrl+F | Run Failed Tests Only |

### Modal Shortcuts

| Shortcut | Action |
|----------|--------|
| Escape | Close Modal |
| Enter | Confirm Action |
| Cmd/Ctrl+C | Copy (in context preview) |

### Platform Differences

- **Mac:** Use Cmd (⌘) key
- **Windows/Linux:** Use Ctrl key

The app shows the correct modifier for your platform.

**View all shortcuts:** Press Cmd/Ctrl+/ anytime

---

## Troubleshooting

### App Won't Launch

**macOS:**
- Check Security & Privacy settings
- Try right-click → Open instead of double-click
- Reinstall from fresh DMG

**Windows:**
- Run as Administrator
- Check antivirus isn't blocking
- Reinstall

**Linux:**
- Ensure AppImage is executable: `chmod +x AutomationPlatform.AppImage`
- Install FUSE if needed: `sudo apt install fuse libfuse2`

### Tests Won't Run

**Checklist:**
1. Is test command correct?
   - Try running it manually in terminal first
2. Are dependencies installed?
   - Run `npm install`, `pip install -r requirements.txt`, etc.
3. Is path correct?
   - Absolute path required
   - No ~ expansion
4. Permissions?
   - Can the app read the folder?

### Git Operations Fail

**Common issues:**
1. Git not installed
   - Install from https://git-scm.com
2. No remote configured
   - Add remote: `git remote add origin <url>`
3. Authentication fails
   - Set up SSH keys or credential helper
4. Merge conflicts
   - Resolve in your editor, then retry

### Performance Issues

**If app is slow:**
1. Too many projects? Remove unused ones
2. Large test suite? They'll stream slowly
3. Close other Electron apps (Slack, VS Code, etc.)
4. Restart the app

### Context Not Copying

**If clipboard doesn't work:**
1. Try manual copy (Cmd/Ctrl+C)
2. Check clipboard permissions (macOS)
3. Use context preview → copy from there

---

## FAQ

### Does this replace my terminal?

No! It's a **complement** to your terminal. Use the platform for visual overview, quick test running, and Claude integration. Use terminal for complex git operations, debugging, and custom workflows.

### Can I use this with existing projects?

Yes! Just add the folder path. No changes to your project required. The platform reads but doesn't modify your project structure.

### Does it support [my test framework]?

If it has a CLI command, yes! The platform runs whatever test command you specify. We've tested with:
- JavaScript: Jest, Vitest, Mocha
- Python: Pytest, Unittest
- Go: `go test`
- Rust: `cargo test`
- Ruby: RSpec

### Can I use this without Claude Code?

Absolutely! The platform is useful on its own for:
- Visual test running across projects
- Git operations without terminal
- Session tracking
- Activity monitoring

Claude Code integration is optional.

### Is my code sent anywhere?

No! Everything runs locally. The only network operations:
- Git push/pull (to your git remote)
- Electron updates (if enabled)
- Opening Claude Code Web browser

Your code never leaves your machine through this app.

### Can I customize the UI?

Limited customization (theme only). We prioritize usability over endless options. If you need more customization, the app is open source - fork it!

### How do I update the app?

**Auto-update** (coming soon):
- App will notify when update available
- Click "Install Update" → Restart

**Manual update:**
- Download new installer
- Install over existing version
- Settings and projects persist

### Where is my data stored?

**Projects:** Only metadata stored (path, name, settings). Your actual code is in your project folders.

**Settings:** `~/.automation-platform/config.json`

**Sessions:** `~/.automation-platform/sessions.json`

**Logs:** `~/.automation-platform/logs/`

### Can I use this on multiple machines?

Yes! Just install on each machine. Projects are local to each machine (since paths differ). Settings can be exported/imported to sync preferences.

### Does this work offline?

Yes! All core features work offline:
- Test running
- Git operations (local)
- Session tracking
- Settings

Only git push/pull and Claude Code Web require internet.

### How do I uninstall?

**macOS:**
- Drag app from Applications to Trash
- Delete `~/.automation-platform/` to remove data

**Windows:**
- Use Windows uninstaller (Settings → Apps)
- Delete `C:\Users\YourName\.automation-platform\` for data

**Linux:**
- Delete AppImage file
- Or `sudo apt remove automation-platform` (if .deb)
- Delete `~/.automation-platform/` for data

---

## Getting Help

### Documentation
- [Architecture](ARCHITECTURE.md) - Technical details
- [Vision](VISION.md) - Product vision and goals
- [Contributing](CONTRIBUTING.md) - How to contribute

### Support
- **Bug reports:** [GitHub Issues](https://github.com/pmartin1915/automation/issues)
- **Feature requests:** [GitHub Discussions](https://github.com/pmartin1915/automation/discussions)
- **Questions:** Open an issue with [question] tag

### Community
- **Discussions:** [GitHub Discussions](https://github.com/pmartin1915/automation/discussions)
- **Updates:** Watch the GitHub repo for releases

---

## What's Next?

Now that you know how to use the platform:

1. **Add your first project**
2. **Run some tests**
3. **Try Claude Code integration** if you have failing tests
4. **Explore keyboard shortcuts** for faster workflows
5. **Customize settings** to match your preferences

**Happy automating!** 🚀

---

*Automation Station v1.0.0 - User Guide*
*Last updated: November 17, 2025*
