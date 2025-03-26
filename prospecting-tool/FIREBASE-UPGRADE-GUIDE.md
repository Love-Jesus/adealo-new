# Firebase Functions Upgrade Guide

This guide explains the comprehensive upgrade process for Firebase Functions in this project, including the migration from Gen 1 to Gen 2 and updating the Firebase Functions SDK.

## What's Included in the Upgrade

1. **Node.js Version Upgrade**: From Node.js 18 to Node.js 20
2. **Firebase Functions SDK Upgrade**: From version 4.9.0 to the latest version
3. **Firebase Admin SDK Upgrade**: From version 12.7.0 to the latest version
4. **Cloud Functions Generation Upgrade**: From Gen 1 to Gen 2

## Upgrade Process

We've created two scripts to handle the upgrade process:

### `upgrade-firebase-functions.sh`

This script performs the following actions:
- Updates the Firebase Functions SDK and Admin SDK to the latest versions
- Updates the firebase.json configuration to use Gen 2
- Migrates the Claude functions (processClaudeMessage and updateClaudeApiKey) to Gen 2 using the gcloud CLI
- Deploys all functions with the new configuration

To run the upgrade:
```bash
./upgrade-firebase-functions.sh
```

### `revert-firebase-upgrade.sh`

This script reverts all changes made by the upgrade script:
- Reverts to the previous SDK versions (Firebase Functions 4.9.0 and Admin 12.7.0)
- Reverts Node.js version to 18
- Reverts firebase.json to use Gen 1

To revert the upgrade:
```bash
./revert-firebase-upgrade.sh
```

## Potential Breaking Changes

When upgrading from Firebase Functions SDK v4 to v5+, be aware of these potential breaking changes:

### 1. HTTP Function Response Handling

In v4:
```javascript
return { data: "Hello World" };
```

In v5+:
```javascript
return { data: "Hello World" };  // Still works
// OR
return new Response(JSON.stringify({ data: "Hello World" }), {
  headers: { "Content-Type": "application/json" }
});  // New approach
```

### 2. Error Handling

In v4:
```javascript
throw new functions.https.HttpsError('invalid-argument', 'Message');
```

In v5+:
```javascript
throw new functions.https.HttpsError('invalid-argument', 'Message');  // Still works
// OR
return new Response(JSON.stringify({ error: "Message" }), {
  status: 400,
  headers: { "Content-Type": "application/json" }
});  // New approach
```

### 3. Region Configuration

In v4:
```javascript
export const myFunction = functions.region('us-central1').https.onCall(...)
```

In v5+:
```javascript
export const myFunction = functions.region('us-central1').https.onCall(...)  // Still works
// OR
export const myFunction = functions.https.onCall({ region: 'us-central1' }, ...)  // New approach
```

## Gen 2 Functions Benefits

Cloud Functions Gen 2 offers several advantages over Gen 1:

1. **Better Performance**: Faster cold starts and improved execution times
2. **More Configuration Options**: Including CPU allocation, concurrency, and min/max instances
3. **Longer Execution Times**: Up to 60 minutes (compared to 9 minutes in Gen 1)
4. **Direct VPC Access**: Connect to VPC resources without additional configuration
5. **Improved Scalability**: Better handling of high-traffic scenarios

## Troubleshooting

If you encounter issues after the upgrade:

1. Check the Firebase Functions logs:
   ```bash
   firebase functions:log
   ```

2. Verify the deployment status:
   ```bash
   firebase deploy --only functions --dry-run
   ```

3. If specific functions are failing, try deploying them individually:
   ```bash
   firebase deploy --only functions:functionName
   ```

4. If all else fails, use the revert script to go back to the previous configuration.
