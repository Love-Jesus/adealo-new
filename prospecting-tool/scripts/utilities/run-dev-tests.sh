#!/bin/bash
# Development Testing Script
# Run this script periodically to check for issues in your codebase

echo "===== PROSPECTING TOOL DEVELOPMENT TESTS ====="
echo "Running tests on: $(date)"
echo ""

# Change to the project directory
cd "$(dirname "$0")"

echo "===== 1. PRODUCTION BUILD TEST ====="
echo "Running: npm run build"
npm run build
BUILD_STATUS=$?
echo ""

echo "===== 2. LINTING TEST ====="
echo "Running: npm run lint"
npm run lint
LINT_STATUS=$?
echo ""

echo "===== 3. DEPENDENCY CHECK ====="
echo "Running: npm outdated"
npm outdated
echo ""

echo "===== 4. FIREBASE FUNCTIONS LOG CHECK ====="
echo "Running: firebase functions:log"
firebase functions:log --limit=20
echo ""

echo "===== 5. DEPLOYMENT DRY RUN ====="
echo "Running: firebase deploy --only hosting --dry-run"
firebase deploy --only hosting --dry-run
DEPLOY_STATUS=$?
echo ""

echo "===== TEST SUMMARY ====="
echo "Build status: $([ $BUILD_STATUS -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
echo "Lint status: $([ $LINT_STATUS -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
echo "Deploy dry run: $([ $DEPLOY_STATUS -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
echo ""
echo "See DEVELOPMENT-TESTING-NOTES.md for details on addressing any issues found."
echo "===== TESTS COMPLETED ====="
