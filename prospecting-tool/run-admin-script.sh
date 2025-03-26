#!/bin/bash

# Run the admin script to add team membership

echo "Running admin script to add team membership..."
echo "Note: This script requires a service account key file (serviceAccountKey.json) to run."
echo "If you don't have one, the script will provide instructions on how to create it."
echo ""

node admin-add-team-member.js

echo "Admin script completed. See the output above for results."
