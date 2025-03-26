# Firebase Functions Gen 1 Fix

This document explains the issue with CPU settings on Gen 1 Firebase Functions and how we fixed it.

## The Issue

The error message "Cannot set CPU on the functions processClaudeMessageupdateClaudeApiKey because they are GCF gen 1" indicates that:

1. The functions are deployed as Gen 1 functions
2. There's an attempt to apply CPU settings to these functions
3. CPU settings are only supported in Gen 2 functions

Additionally, the error "[getImportStatus(us-central1)] Upgrading from 1st Gen to 2nd Gen is not yet supported" indicates that direct migration from Gen 1 to Gen 2 is not currently supported by Firebase.

## The Solution

Since direct migration to Gen 2 is not supported, and we need to keep using Gen 1 functions, we've implemented the following solution:

1. **Reverted firebase.json to use Gen 1**:
   ```json
   "functions": [
     {
       "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"],
       "source": "functions",
       "codebase": "default",
       "gen": 1
     }
   ]
   ```

2. **Reverted Node.js version to 18** in functions/package.json:
   ```json
   "engines": {
     "node": "18"
   }
   ```

3. **Reverted Firebase Functions SDK to v4.9.0**:
   ```json
   "firebase-admin": "^12.7.0",
   "firebase-functions": "^4.9.0",
   ```

4. **Updated deployment scripts** to use standard Firebase CLI commands:
   ```bash
   firebase deploy --only functions
   ```

## How to Use the Fix

Run the `fix-functions-deployment.sh` script:

```bash
./fix-functions-deployment.sh
```

This script will:
1. Install the correct dependencies
2. Build the functions
3. Deploy the functions with Gen 1 configuration

## Future Considerations

When Firebase officially supports migration from Gen 1 to Gen 2, you may want to revisit upgrading to Gen 2 functions to take advantage of:

1. Better performance
2. More configuration options (including CPU settings)
3. Longer execution times
4. Improved scalability

For now, this fix ensures your Gen 1 functions will deploy and run correctly without CPU settings.
