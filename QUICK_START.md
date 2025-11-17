# ⚡ Quick Start for New Claude Code Web Session

**Copy and paste this into your next Claude Code Web session:**

---

## 📥 Step 1: Start Session Correctly

```bash
cd /home/user/automation
bash scripts/session-start.sh claude/automation-project-0158TCzixw1vznjgWkYd3eWa
```

This will:
- Fetch all branches from GitHub
- Checkout the correct branch
- Pull latest changes
- Verify all documentation files exist
- Show you the status

---

## 📂 Step 2: Verify Files Are There

You should see these files:

```
docs/
  ├── VISION.md                      (14.6 KB) - Product vision
  ├── ARCHITECTURE.md                (17.8 KB) - Technical architecture
  ├── IMPLEMENTATION_ROADMAP.md      (12.7 KB) - 10-week plan
  ├── CLAUDE_CODE_INTEGRATION.md     (17.8 KB) - Claude integration
  ├── CLAUDE_CODE_WEB_GIT_FIX.md     (14.5 KB) - **Git sync fix**
  ├── PROMPT_MOCK_INTERFACE.md       (14.0 KB) - UI mockup prompt
  ├── PROMPT_CONTINUE_PROJECT.md     (13.6 KB) - Continuation prompt
  ├── CLAUDE_WORKFLOW.md             (1.4 KB)  - TDD workflow
  └── BRANCH_MANAGEMENT.md           (1.0 KB)  - Branch strategy

scripts/
  ├── safe-commit-push.sh            - Commit with verification
  ├── verify-push.sh                 - Verify commits on GitHub
  └── session-start.sh               - Start sessions correctly

README.md                            - Project overview
```

**If files are missing:**
```bash
cat docs/CLAUDE_CODE_WEB_GIT_FIX.md
```
Follow the recovery instructions.

---

## 💻 Step 3: Do Your Work

Work normally on the project.

---

## ✅ Step 4: End Session Correctly (CRITICAL!)

**Before closing the session:**

```bash
bash scripts/safe-commit-push.sh "feat: description of what you did"
```

**WAIT FOR** the success message:
```
🎉 SUCCESS! Your work is safely on GitHub
```

**DO NOT close the session** until you see:
```
✅ Verified on GitHub: YES
```

---

## 🆘 If Verification Fails

If you see `❌ Commit not verified`, follow these steps:

### **Option 1: Manual Verification**

1. Go to https://github.com/pmartin1915/automation
2. Navigate to branch `claude/automation-project-0158TCzixw1vznjgWkYd3eWa`
3. Check if your commit is visible
4. If YES: You're good! (Verification was just slow)
5. If NO: Use Option 2

### **Option 2: Create Backup**

```bash
# Create tarball of all work
tar -czf ~/automation-backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# Show where it's saved
ls -lh ~/automation-backup-*.tar.gz
```

In next session:
```bash
cd /home/user/automation
tar -xzf ~/automation-backup-YYYYMMDD-HHMMSS.tar.gz
git add .
bash scripts/safe-commit-push.sh "Restored work from backup"
```

### **Option 3: Create Patch**

```bash
git format-patch -1 HEAD
# This creates a .patch file
```

In next session:
```bash
cd /home/user/automation
git am < 0001-*.patch
bash scripts/safe-commit-push.sh "Applied patch from previous session"
```

---

## 📖 What to Read

### **For Continuation:**
Start with `docs/PROMPT_CONTINUE_PROJECT.md` - it has complete context.

### **For Building UI Mockup:**
Read `docs/PROMPT_MOCK_INTERFACE.md` - step-by-step instructions.

### **For Understanding Git Issue:**
Read `docs/CLAUDE_CODE_WEB_GIT_FIX.md` - complete explanation and solutions.

---

## 🎯 Current Project State

**Status:** Planning complete ✅

**Available paths:**
1. Build UI mockup (React + TypeScript + Tailwind)
2. Start Electron app (Week 1 of roadmap)
3. Create starter template
4. Implement core services

**Recommended:** Build UI mockup first to validate design.

---

## 🔍 Quick Reference Commands

```bash
# Start session
bash scripts/session-start.sh claude/automation-project-0158TCzixw1vznjgWkYd3eWa

# Check status
git status
git log --oneline -5

# End session (WITH VERIFICATION!)
bash scripts/safe-commit-push.sh "your message"

# Verify manually
bash scripts/verify-push.sh

# List all files
find docs scripts -type f
```

---

## ⚠️ Remember

1. **ALWAYS** use `scripts/safe-commit-push.sh` to end session
2. **NEVER** close session without seeing "✅ Verified on GitHub: YES"
3. **ALWAYS** start session with `scripts/session-start.sh`
4. **CHECK** GitHub web UI if in doubt

---

**This solves the git sync problem permanently. Your work will be safe!**
