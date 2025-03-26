# Claude Functions Temporary Removal

This document explains the temporary removal of Claude AI functions to fix deployment issues.

## The Issue

The error message "Cannot set CPU on the functions processClaudeMessage,updateClaudeApiKey because they are GCF gen 1" indicates that:

1. The Claude functions are causing deployment issues due to CPU settings
2. These settings are not compatible with Gen 1 functions
3. Direct migration to Gen 2 is not currently supported by Firebase

## The Solution

We've implemented a temporary solution by:

1. Creating a backup of the original `functions/src/index.ts` file
2. Commenting out the Claude function exports in `functions/src/index.ts`
3. Creating scripts to deploy without Claude functions and restore them when needed

## Impact

- **AI Chat Functionality**: The AI chat functionality that uses Claude will be temporarily unavailable
- **Other Functions**: All other functions will continue to work normally

## How to Use

### Fix Package-Lock.json Issues and Deploy Without Claude Functions

To fix package-lock.json sync issues and deploy your functions without the Claude functions:

```bash
./fix-and-deploy.sh
```

This script will:
1. Fix package-lock.json sync issues by running npm install
2. Build the functions
3. Deploy the functions without the Claude functions
4. When prompted about deleting functions, select 'y' to proceed with deletion

### Individual Scripts

If you prefer to run the steps individually:

1. **Fix package-lock.json sync issues**:
   ```bash
   ./fix-package-lock.sh
   ```

2. **Deploy without Claude functions**:
   ```bash
   ./deploy-without-claude.sh
   ```

3. **Restore Claude functions** (when you want to restore them in your codebase):
   ```bash
   ./restore-claude-functions.sh
   ```
   Note that this only restores the functions in your codebase - you would still need to deploy them for the changes to take effect.

## Long-term Solution

For a long-term solution, you have several options:

1. **Wait for Firebase to support direct migration** from Gen 1 to Gen 2
2. **Create separate Gen 2 functions** for Claude functionality with different names
3. **Modify the Claude functions** to work without CPU settings

## Files Modified

- `functions/src/index.ts` - Claude function exports commented out
- `functions/src/index.ts.backup` - Backup of the original file

## Scripts Created

- `fix-and-deploy.sh` - Comprehensive script that fixes package-lock.json and deploys without Claude functions
- `fix-package-lock.sh` - Fixes package-lock.json sync issues
- `deploy-without-claude.sh` - Deploys functions without Claude functions
- `restore-claude-functions.sh` - Restores Claude functions in the codebase
- `fix-functions-deployment.sh` - Original script to fix deployment issues (updated to use npm install)
