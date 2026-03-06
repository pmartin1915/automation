# 🤖 Claude Code Self-Testing Workflow Guide

## 🎯 The Self-Testing Loop

Write Test → Run Test → Pass? → Yes → Done
                ↓ No
         Read Error → Fix Code
                ↓
        (back to Run Test)

## 📊 Real Example: Clinical Toolkit

- Started: 97/113 tests passing (86%)  
- Result: 113/113 tests passing (100%)
- Time: ~30 minutes, autonomous

### How It Worked:

1. Run tests → See error: "Unable to find element: Take Assessment"
2. Analyze → Component shows all questions at once (not wizard-style)  
3. Fix tests → Update to match actual behavior
4. Re-test → 6/7 passing
5. Iterate → Fix button text issue
6. Result → 7/7 passing ✅

Applied pattern to COPD tests → 9/9 passing on first try!

## ✅ Best Practices

**DO:**
- ✅ Write tests BEFORE implementation
- ✅ Run tests after EVERY code change
- ✅ Read error messages completely
- ✅ Fix based on specific errors
- ✅ Re-test after every fix

**DON'T:**
- ❌ Skip writing tests
- ❌ Move on with failing tests
- ❌ Guess at fixes without reading errors

## 📝 Session Checklist

- □ Create todo list
- □ Write tests FIRST
- □ Run tests after changes
- □ Read errors completely  
- □ Fix based on specific errors
- □ Re-test after every fix
- □ 100% pass before committing

**Key:** Tests provide unambiguous feedback. Claude Code can see exactly what's wrong and fix it autonomously.
