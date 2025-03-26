#!/bin/bash
# Script to stop Firebase emulators and Vite development server
# Run this script when you're done testing

echo "Stopping Firebase emulators and Vite development server..."

# Find and kill Firebase emulator processes
FIREBASE_PIDS=$(ps aux | grep "firebase" | grep -v grep | awk '{print $2}')
if [ -n "$FIREBASE_PIDS" ]; then
  echo "Stopping Firebase emulators (PIDs: $FIREBASE_PIDS)"
  kill $FIREBASE_PIDS
  echo "Firebase emulators stopped"
else
  echo "No Firebase emulators running"
fi

# Find and kill Vite development server processes
VITE_PIDS=$(ps aux | grep "vite" | grep -v grep | awk '{print $2}')
if [ -n "$VITE_PIDS" ]; then
  echo "Stopping Vite development server (PIDs: $VITE_PIDS)"
  kill $VITE_PIDS
  echo "Vite development server stopped"
else
  echo "No Vite development server running"
fi

# Check if any Java processes related to Firebase emulators are running
JAVA_PIDS=$(ps aux | grep "java.*firestore-emulator" | grep -v grep | awk '{print $2}')
if [ -n "$JAVA_PIDS" ]; then
  echo "Stopping Java processes for Firebase emulators (PIDs: $JAVA_PIDS)"
  kill $JAVA_PIDS
  echo "Java processes stopped"
else
  echo "No Java processes for Firebase emulators running"
fi

echo "All development servers stopped"
