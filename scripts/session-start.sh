#!/bin/bash

# session-start.sh - Start a Claude Code Web session correctly
# Usage: ./session-start.sh [branch-name]

echo "🚀 Claude Code Web Session Starter"
echo "====================================="
echo ""

# Step 1: Fetch all branches
echo "📥 Fetching all branches from GitHub..."
git fetch --all --prune

if [ $? -ne 0 ]; then
    echo "⚠️  Fetch failed. Retrying with exponential backoff..."

    for i in 2 4 8; do
        echo "Waiting ${i}s before retry..."
        sleep $i
        git fetch --all --prune && break
    done
fi

echo ""

# Step 2: Show available branches
echo "📋 Available branches:"
git branch -r | grep -v HEAD | sed 's/origin\//  - /'
echo ""

# Step 3: Checkout branch
if [ -n "$1" ]; then
    BRANCH="$1"
else
    echo "Enter branch name (or press Enter for current branch):"
    read BRANCH

    if [ -z "$BRANCH" ]; then
        BRANCH=$(git rev-parse --abbrev-ref HEAD)
    fi
fi

echo ""
echo "🌿 Checking out branch: $BRANCH"

# Check if branch exists locally
if git show-ref --verify --quiet refs/heads/$BRANCH; then
    git checkout $BRANCH
else
    # Try to checkout from remote
    git checkout -b $BRANCH origin/$BRANCH 2>/dev/null || git checkout -b $BRANCH
fi

# Step 4: Pull latest
echo ""
echo "⬇️  Pulling latest changes..."
git pull origin $BRANCH || echo "⚠️  No remote tracking branch (new branch?)"

# Step 5: Show status
echo ""
echo "📊 Repository Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "Latest commit: $(git log -1 --oneline)"
echo "Uncommitted changes: $(git status --short | wc -l) files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 6: Verify key files exist
echo ""
echo "📂 Verifying project files..."

EXPECTED_FILES=(
    "README.md"
    "docs/VISION.md"
    "docs/ARCHITECTURE.md"
    "docs/IMPLEMENTATION_ROADMAP.md"
)

ALL_GOOD=true
for file in "${EXPECTED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (MISSING!)"
        ALL_GOOD=false
    fi
done

echo ""
if [ "$ALL_GOOD" = true ]; then
    echo "✅ All expected files present"
    echo "🎉 Session ready! You can start working."
else
    echo "⚠️  Some files are missing!"
    echo ""
    echo "This might mean:"
    echo "1. You're on the wrong branch"
    echo "2. Previous session's commits didn't sync"
    echo "3. Files were never created"
    echo ""
    echo "📋 Next steps:"
    echo "1. Check GitHub web UI for your branch"
    echo "2. Try: git fetch --all && git pull origin $BRANCH"
    echo "3. If files still missing, check docs/CLAUDE_CODE_WEB_GIT_FIX.md"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Remember: Before ending this session, run:"
echo "  ./scripts/safe-commit-push.sh \"your message\""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
