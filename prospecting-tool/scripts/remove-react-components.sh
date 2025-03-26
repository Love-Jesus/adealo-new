#!/bin/bash

# Script to remove React components that are no longer needed
# This script should be run from the project root directory

echo "Creating a backup directory for removed components..."
BACKUP_DIR="src/components/widget/backup-$(date +"%Y-%m-%d_%H-%M-%S")"
mkdir -p "$BACKUP_DIR"

echo "Moving React components to backup directory..."

# Move components to backup directory
mv src/components/widget/components/HomeScreen.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv src/components/widget/components/LauncherButton.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv src/components/widget/components/ChatScreen.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv src/components/widget/components/BookDemoScreen.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv src/components/widget/components/CallMeScreen/index.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv src/components/widget/components/CallMeScreen/QualificationStep.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv src/components/widget/components/CallMeScreen/TeamSelection.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv src/components/widget/components/CallMeScreen/PhoneInput.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv src/components/widget/components/CallMeScreen.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv src/components/widget/styles/styled-components.ts "$BACKUP_DIR/" 2>/dev/null || true
mv src/components/widget/Widget.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv src/components/widget/hooks/useWidgetConfig.tsx "$BACKUP_DIR/" 2>/dev/null || true

echo "Components have been moved to $BACKUP_DIR"
echo "If you need to restore them, you can find them in the backup directory."

echo "Creating a README file in the backup directory..."
cat > "$BACKUP_DIR/README.md" << 'EOF'
# Backup of React Components

These React components were removed as part of the migration to the vanilla JavaScript widget approach.

They are kept here for reference in case they need to be consulted or restored.

## Components

- **HomeScreen.tsx**: Home screen component
- **LauncherButton.tsx**: Launcher button component
- **ChatScreen.tsx**: Chat screen component
- **BookDemoScreen.tsx**: Book demo screen component
- **CallMeScreen/**: Call me screen components
- **styled-components.ts**: Styled components
- **Widget.tsx**: Main widget component
- **useWidgetConfig.tsx**: Widget configuration hook

## Restoration

If you need to restore these components, you can move them back to their original locations.
EOF

echo "Done! React components have been moved to the backup directory."
