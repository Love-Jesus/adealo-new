#!/bin/bash

# Navigate to the functions directory
cd functions

# Create a backup of the original index.ts
cp src/index.ts src/index.ts.backup

# Create a temporary index.ts that only exports the widget functions
cat > src/index.ts << 'EOL'
/**
 * Temporary index file for deploying only widget functions
 */
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export widget functions only
export { getWidgetScript, trackWidgetInteraction } from './widget-embed';
EOL

# Install dependencies with legacy peer deps to avoid version conflicts
npm install --legacy-peer-deps

# Build the functions
npm run build

# Deploy only the widget-related functions
firebase deploy --only functions:getWidgetScript,functions:trackWidgetInteraction

# Restore the original index.ts
mv src/index.ts.backup src/index.ts

echo "Widget functions deployed successfully!"
echo "Note: The original index.ts file has been restored."
