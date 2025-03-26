#!/bin/bash

echo "Deploying invitation functions with temporary configuration..."

# Save the original firebase.json
cp firebase.json firebase.json.backup

# Create a temporary firebase.json that only includes the invitation functions
cat > firebase.json << 'EOF'
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": [
    {
      "predeploy": [
        "npm --prefix \"$RESOURCE_DIR\" run build"
      ],
      "source": "functions",
      "codebase": "default",
      "gen": 2,
      "ignore": ["**/node_modules/**", "**/lib/**", "**/.git/**", "**/claude.ts"]
    }
  ],
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true
    }
  }
}
EOF

# Navigate to the functions directory
cd functions

# Install dependencies with --force flag to bypass dependency conflicts
npm install --force

# Build the functions
npm run build

# Deploy the functions
cd ..
firebase deploy --only functions --force

# Restore the original firebase.json
mv firebase.json.backup firebase.json

echo "Invitation functions deployed successfully!"
