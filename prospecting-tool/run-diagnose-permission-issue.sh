#!/bin/bash

# Run the permission issue diagnosis script

if [ -z "$1" ]; then
  echo "Usage: $0 <password>"
  echo "Please provide your Firebase password as an argument."
  exit 1
fi

echo "Running permission issue diagnosis script..."
echo "This script will attempt to sign in as junior.hallberg@gmail.com and diagnose permission issues."
echo ""

node diagnose-permission-issue.js "$1"

echo "Diagnosis completed. See the output above for results."
