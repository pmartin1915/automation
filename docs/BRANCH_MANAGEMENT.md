# 🌿 Branch Management Guide

## 🎯 The Problem

Claude Code creates new branches every session:
- ❌ claude/session-abc123 (orphaned)
- ❌ claude/session-def456 (orphaned)  
- ❌ Scattered work, merge conflicts

## ✅ The Solution: Long-Lived Branches

Use ONE branch per feature, across MULTIPLE sessions:

main
  └── claude/mobile-conversion-v1
       ├── commit 1: Session 1 work
       ├── commit 2: Session 2 work
       └── commit 3: Session 3 work

## 📋 Branch Naming

claude/<project>-<version>

Examples:
- claude/mobile-app-conversion-v1
- claude/testing-infrastructure-v1
- claude/burn-calculator-refactor-v1

## 🔄 Workflow

### Start of EVERY Session:
git fetch origin
git checkout claude/your-branch-name
git pull origin claude/your-branch-name

### End of Session:
git add .
git commit -m "feat: description"
git push origin claude/your-branch-name

## 🎯 Key Rule

**One branch per feature - NOT one per session!**

This prevents scattered work and merge conflicts.
