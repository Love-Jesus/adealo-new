#!/bin/bash

# This script starts the Firebase Emulator with permissive security rules for testing.

echo "Starting Firebase Emulator with permissive security rules..."

# Change to the project root directory
cd "$(dirname "$0")"

# Copy the permissive rules to the main rules file temporarily
cp firestore.rules firestore.rules.backup
cp firestore.emulator.rules firestore.rules

# Start the Firebase Emulator
firebase emulators:start

# Restore the original rules when the emulator is stopped
echo "Restoring original security rules..."
mv firestore.rules.backup firestore.rules

echo "Firebase Emulator stopped."
