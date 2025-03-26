#!/bin/bash

# Script to create a backup of the project before making changes
# This script should be run from the project root directory

# Get current date and time for the backup folder name
BACKUP_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="../prospecting-tool-backup-$BACKUP_DATE"

echo "Creating backup of the project in $BACKUP_DIR..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Copy all files and directories to the backup directory
cp -R * "$BACKUP_DIR/"

# Copy hidden files as well (except .git)
find . -name ".*" -type f -not -path "*.git*" -exec cp {} "$BACKUP_DIR/" \;

echo "Backup completed successfully!"
echo "Backup location: $BACKUP_DIR"
