#!/bin/bash

# Run the admin user check script

echo "Running admin user check script..."
echo "Note: This script requires a service account key file (adealo-ce238-firebase-adminsdk-fbsvc-47871df645.json) to run."
echo ""

node check-admin-user.js

echo "Admin user check completed. See the output above for results."
