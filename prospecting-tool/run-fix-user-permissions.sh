#!/bin/bash

# Run the script to fix user permissions

echo "Running script to fix user permissions..."
echo "Note: This script requires a service account key file (adealo-ce238-firebase-adminsdk-fbsvc-47871df645.json) to run."
echo "If you don't have one, the script will provide instructions on how to create it."
echo ""

node fix-user-permissions.js

echo "Permission fix script completed. See the output above for results."
