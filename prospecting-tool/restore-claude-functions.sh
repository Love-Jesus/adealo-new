#!/bin/bash

echo "Restoring Claude functions..."

# Check if backup file exists
if [ ! -f "functions/src/index.ts.backup" ]; then
  echo "Error: Backup file not found at functions/src/index.ts.backup"
  echo "Cannot restore Claude functions."
  exit 1
fi

# Restore the original index.ts file
mv functions/src/index.ts.backup functions/src/index.ts

echo "Claude functions have been restored in the source code."
echo "Note: You will need to deploy the functions again for the changes to take effect."
echo "To deploy with Claude functions, run: ./fix-functions-deployment.sh"
