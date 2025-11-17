#!/bin/bash

# verify-push.sh - Verify commits actually reached GitHub
# Usage: ./verify-push.sh [branch-name]

set -e

BRANCH=${1:-$(git rev-parse --abbrev-ref HEAD)}
LATEST_LOCAL=$(git rev-parse HEAD)
SHORT_SHA=${LATEST_LOCAL:0:7}

echo "🔍 Verifying push to GitHub..."
echo "Branch: $BRANCH"
echo "Local commit: $SHORT_SHA"
echo ""

# Wait a few seconds for proxy to sync
echo "⏳ Waiting 5 seconds for sync..."
sleep 5

# Try to get repo info via gh CLI
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI available"
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")

    if [ -n "$REPO" ]; then
        echo "📦 Repository: $REPO"

        # Check if commit exists on GitHub
        LATEST_REMOTE=$(gh api repos/$REPO/commits/$BRANCH --jq .sha 2>/dev/null || echo "")

        if [ "$LATEST_LOCAL" = "$LATEST_REMOTE" ]; then
            echo ""
            echo "✅ ✅ ✅ SUCCESS! Commit verified on GitHub!"
            echo ""
            echo "Your work is safe and visible to other sessions."
            echo "Commit: $SHORT_SHA"
            exit 0
        else
            echo ""
            echo "❌ FAILED: Commit not found on GitHub!"
            echo "Expected: $SHORT_SHA"
            echo "Got: ${LATEST_REMOTE:0:7}"
            echo ""
            echo "🔄 Attempting alternative push method..."

            # Try pushing again
            git push -u origin $BRANCH --force-with-lease
            sleep 5

            # Check again
            LATEST_REMOTE=$(gh api repos/$REPO/commits/$BRANCH --jq .sha 2>/dev/null || echo "")
            if [ "$LATEST_LOCAL" = "$LATEST_REMOTE" ]; then
                echo "✅ SUCCESS after retry!"
                exit 0
            else
                echo "❌ STILL FAILED: Manual intervention needed"
                echo ""
                echo "📋 RECOVERY OPTIONS:"
                echo "1. Check GitHub web UI: https://github.com/$REPO/tree/$BRANCH"
                echo "2. Create patch: git format-patch -1 HEAD"
                echo "3. Export files: tar -czf backup.tar.gz docs/ src/ *.md"
                exit 1
            fi
        fi
    else
        echo "⚠️  Could not determine repository name"
        echo "Falling back to git fetch verification..."
    fi
else
    echo "⚠️  GitHub CLI not available, using git fetch..."
fi

# Fallback: Use git fetch
echo ""
echo "🔄 Fetching from remote..."
git fetch origin $BRANCH

REMOTE_SHA=$(git rev-parse origin/$BRANCH 2>/dev/null || echo "")

if [ "$LATEST_LOCAL" = "$REMOTE_SHA" ]; then
    echo "✅ Commit verified via git fetch!"
    echo "Commit: $SHORT_SHA"
    exit 0
else
    echo "❌ Commit not synced"
    echo "Local:  $SHORT_SHA"
    echo "Remote: ${REMOTE_SHA:0:7}"
    echo ""
    echo "📋 Try running:"
    echo "  git push -u origin $BRANCH --force-with-lease"
    exit 1
fi
