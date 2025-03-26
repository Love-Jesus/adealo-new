#!/bin/bash

echo "Deploying only invitation functions..."

# Navigate to the functions directory
cd functions

# Install dependencies with --force flag to bypass dependency conflicts
npm install --force

# Build the functions
npm run build

# Deploy only the invitation functions using a more specific approach
firebase deploy --only functions:sendInvitationEmail --force
firebase deploy --only functions:checkExpiredInvitations --force

echo "Invitation functions deployed successfully!"
