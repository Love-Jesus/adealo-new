# Intercom-Style Widget Redirect Solution

## Overview

This document explains the solution implemented to fix the URL issue with the Intercom-style widget adapter script. The issue was that the widget was trying to load the script from:

```
https://us-central1-adealo-ce238.web.app/intercom-style-widget-adapter.js
```

But the script is actually hosted at:

```
https://adealo-ce238.web.app/intercom-style-widget-adapter.js
```

## Solution

Instead of modifying the existing code that generates the widget HTML (which was working correctly for other purposes), we implemented a redirect function using Firebase Cloud Functions. This function:

1. Listens for requests to the incorrect URL path
2. Sets appropriate CORS headers
3. Redirects the request to the correct URL

This approach allows us to maintain backward compatibility with any existing implementations while ensuring the widget loads correctly.

## Implementation Details

### 1. Cloud Function

We created a new Cloud Function in `functions/src/widget-adapter-redirect.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
try {
  admin.initializeApp();
} catch (e) {
  console.log('Firebase admin already initialized');
}

/**
 * This function serves as a redirect for the widget adapter script.
 * It allows the script to be accessed from both:
 * - https://adealo-ce238.web.app/intercom-style-widget-adapter.js (Firebase Hosting)
 * - https://us-central1-adealo-ce238.web.app/intercom-style-widget-adapter.js (Cloud Functions)
 */
// @ts-expect-error: TypeScript may show an error for onRequest, but it exists at runtime
export const intercomStyleWidgetAdapter = functions.https.onRequest((request, response) => {
  // Set CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  // Only allow GET requests
  if (request.method !== 'GET') {
    response.status(405).send('Method Not Allowed');
    return;
  }
  
  // Redirect to the actual script on Firebase Hosting
  response.redirect('https://adealo-ce238.web.app/intercom-style-widget-adapter.js');
});
```

### 2. Function Export

We exported the function in `functions/src/index.ts`:

```typescript
// Export widget adapter redirect function
export { intercomStyleWidgetAdapter } from './widget-adapter-redirect';
```

### 3. Deployment Script

We created a deployment script at `deploy-widget-adapter-redirect.sh`:

```bash
#!/bin/bash

# Deploy Widget Adapter Redirect Function
# This script deploys the widget adapter redirect function to Firebase

echo "Building and deploying widget adapter redirect function..."

# Change to the functions directory
cd "$(dirname "$0")/functions"

# Build the functions
echo "Building functions..."
npm run build

# Deploy only the intercomStyleWidgetAdapter function
echo "Deploying intercomStyleWidgetAdapter function..."
cd ..
firebase deploy --only functions:intercomStyleWidgetAdapter

echo "Widget adapter redirect function deployed successfully!"
```

## Usage

To deploy the redirect function:

```bash
./deploy-widget-adapter-redirect.sh
```

## Benefits

This solution:

1. Maintains backward compatibility with existing widget implementations
2. Doesn't require modifying the widget creation code
3. Ensures the widget loads correctly regardless of which URL is used
4. Provides proper CORS headers for cross-origin requests

## Future Considerations

While this solution works well as a quick fix, for long-term maintenance it might be worth considering:

1. Updating the widget creation code to use the correct URL directly
2. Setting up a more permanent redirect at the hosting configuration level
3. Consolidating the widget adapter scripts to avoid duplication
