#!/bin/bash

# safe-commit-push.sh - Commit and push with automatic verification
# Usage: ./safe-commit-push.sh "commit message"

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 \"commit message\""
    echo ""
    echo "Example:"
    echo "  $0 \"feat: add new feature\""
    exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
MESSAGE="$1"

echo "🚀 Safe Commit & Push Workflow"
echo "================================"
echo "Branch: $BRANCH"
echo "Message: $MESSAGE"
echo ""

# Step 1: Show what will be committed
echo "📝 Changes to be committed:"
echo ""
git status --short
echo ""

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
    echo "⚠️  No changes to commit!"
    exit 0
fi

# Step 2: Stage all changes
echo "📦 Staging all changes..."
git add .

# Step 3: Commit
echo ""
echo "💾 Creating commit..."
git commit -m "$MESSAGE"

if [ $? -ne 0 ]; then
    echo "❌ Commit failed!"
    exit 1
fi

COMMIT_SHA=$(git rev-parse HEAD)
SHORT_SHA=${COMMIT_SHA:0:7}
echo "✅ Commit created: $SHORT_SHA"

# Step 4: Push
echo ""
echo "⬆️  Pushing to remote..."
git push -u origin $BRANCH

if [ $? -ne 0 ]; then
    echo "❌ Push failed!"
    echo ""
    echo "You can try:"
    echo "  git push -u origin $BRANCH --force-with-lease"
    exit 1
fi

# Step 5: Verify (CRITICAL!)
echo ""
echo "🔍 Verifying push reached GitHub..."
echo "(This is the critical step that ensures your work is saved)"
echo ""

# Wait for sync
sleep 5

# Use verify-push.sh if available
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/verify-push.sh" ]; then
    bash "$SCRIPT_DIR/verify-push.sh" "$BRANCH"
    VERIFY_RESULT=$?
else
    # Inline verification
    if command -v gh &> /dev/null; then
        REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
        if [ -n "$REPO" ]; then
            REMOTE_SHA=$(gh api repos/$REPO/commits/$BRANCH --jq .sha 2>/dev/null || echo "")

            if [ "$COMMIT_SHA" = "$REMOTE_SHA" ]; then
                echo "✅ ✅ ✅ SUCCESS! Commit verified on GitHub!"
                VERIFY_RESULT=0
            else
                echo "❌ Commit not verified on GitHub"
                VERIFY_RESULT=1
            fi
        else
            echo "⚠️  Could not verify (repo name unknown)"
            VERIFY_RESULT=1
        fi
    else
        # Fallback to git fetch
        git fetch origin $BRANCH
        REMOTE_SHA=$(git rev-parse origin/$BRANCH 2>/dev/null || echo "")

        if [ "$COMMIT_SHA" = "$REMOTE_SHA" ]; then
            echo "✅ Commit verified via git fetch"
            VERIFY_RESULT=0
        else
            echo "❌ Commit not synced"
            VERIFY_RESULT=1
        fi
    fi
fi

echo ""
if [ $VERIFY_RESULT -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 SUCCESS! Your work is safely on GitHub"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 Summary:"
    echo "  ✅ Commit: $SHORT_SHA"
    echo "  ✅ Branch: $BRANCH"
    echo "  ✅ Message: $MESSAGE"
    echo "  ✅ Verified on GitHub: YES"
    echo ""
    echo "You can safely close this session."
    echo "Next session will see this commit."
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  WARNING: Commit may not be on GitHub yet"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 BEFORE CLOSING THIS SESSION:"
    echo "1. Check GitHub web UI to verify commit"
    echo "2. Or create backup: tar -czf backup.tar.gz ."
    echo "3. Or create patch: git format-patch -1 HEAD"
fi
