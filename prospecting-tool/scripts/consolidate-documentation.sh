#!/bin/bash

# Script to consolidate documentation files
# This script should be run from the project root directory

echo "Creating a backup directory for documentation files..."
BACKUP_DIR="docs-backup-$(date +"%Y-%m-%d_%H-%M-%S")"
mkdir -p "$BACKUP_DIR"

echo "Moving documentation files to backup directory..."

# Move documentation files to backup directory
mv CHAT-WIDGET-SOLUTION.md "$BACKUP_DIR/" 2>/dev/null || true
mv CHAT-WIDGET-IMPLEMENTATION-STATUS.md "$BACKUP_DIR/" 2>/dev/null || true
mv CHAT-WIDGET-UPDATES.md "$BACKUP_DIR/" 2>/dev/null || true
mv CHAT-WIDGET-FILE-UPLOAD.md "$BACKUP_DIR/" 2>/dev/null || true
mv PRODUCTION-CHAT-WIDGET-TESTING.md "$BACKUP_DIR/" 2>/dev/null || true
mv WIDGET-VERIFICATION-PLAN.md "$BACKUP_DIR/" 2>/dev/null || true
mv WIDGET-VERIFICATION-README.md "$BACKUP_DIR/" 2>/dev/null || true
mv WIDGET-CONFIG-EMULATOR.md "$BACKUP_DIR/" 2>/dev/null || true
mv WIDGET-CONFIG-SYSTEM.md "$BACKUP_DIR/" 2>/dev/null || true
mv WIDGET-CUSTOM-DOMAIN.md "$BACKUP_DIR/" 2>/dev/null || true
mv WIDGET-LOCAL-DEVELOPMENT.md "$BACKUP_DIR/" 2>/dev/null || true
mv WIDGET-SYSTEM-README.md "$BACKUP_DIR/" 2>/dev/null || true
mv REAL-CHAT-WIDGET-TESTING.md "$BACKUP_DIR/" 2>/dev/null || true
mv SIMPLE-CHAT-TEST.md "$BACKUP_DIR/" 2>/dev/null || true
mv STRIPE-WEBHOOK-TESTING.md "$BACKUP_DIR/" 2>/dev/null || true
mv DEVELOPMENT-TESTING-NOTES.md "$BACKUP_DIR/" 2>/dev/null || true
mv PRE-DEPLOYMENT-CHECKLIST.md "$BACKUP_DIR/" 2>/dev/null || true
mv TESTING-AND-DEPLOYMENT.md "$BACKUP_DIR/" 2>/dev/null || true

echo "Documentation files have been moved to $BACKUP_DIR"

echo "Creating a README file in the backup directory..."
cat > "$BACKUP_DIR/README.md" << 'EOF'
# Backup of Documentation Files

These documentation files were consolidated into the new documentation files:

- WIDGET-SYSTEM.md
- TEAM-SYSTEM.md
- STRIPE-INTEGRATION.md
- DEPLOYMENT.md
- PROJECT-MAP.md
- WIDGET-CLEANUP.md
- README.md

They are kept here for reference in case they contain information that was not captured in the new documentation.

## Restoration

If you need to restore these files, you can copy them back to the project root directory.
EOF

echo "Done! Documentation files have been moved to the backup directory."
echo "The information from these files has been consolidated into the new documentation files."
