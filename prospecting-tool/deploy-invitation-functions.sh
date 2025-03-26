#!/bin/bash

echo "Deploying invitation functions..."

# Navigate to the functions directory
cd functions

# Install dependencies with --force flag to bypass dependency conflicts
npm install --force

# Build the functions
npm run build

# Deploy only the invitation functions
firebase deploy --only functions:sendInvitationEmail,functions:checkExpiredInvitations --force

echo "Invitation functions deployed successfully!"
