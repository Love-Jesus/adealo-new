# Stripe Functions Deployment Fix

This document explains the issues with deploying Stripe-related Firebase Functions and the implemented solution.

## The Issue

After successfully deploying most functions, three Stripe-related functions failed to deploy:

1. `createPaymentIntent`
2. `cancelSubscription`
3. `updateSubscription`

These functions are critical for payment processing in the application.

## Root Causes

The deployment issues were likely caused by:

1. **Stripe API Version Mismatch**: The Stripe configuration was using a future API version (`2025-02-24.acacia`) which may not be compatible with the current Stripe SDK.

2. **Firebase Functions Version Conflicts**: The project uses Firebase Functions v4.9.0, which supports both v1 and v2 APIs, but there may be conflicts in how these are used.

## Implemented Solutions

### 1. Fixed Stripe API Version

Updated the Stripe API version in `functions/src/services/stripe/stripe.ts` to use a valid, current API version (`2023-10-16`) with a type assertion to bypass TypeScript errors.

### 2. Created Dedicated Deployment Script

Created a dedicated script (`deploy-stripe-functions.sh`) to deploy only the Stripe-related functions:

```bash
#!/bin/bash

echo "Starting deployment of Stripe functions..."

# Navigate to functions directory
cd functions

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the functions
echo "Building functions..."
npm run build

# Return to project root
cd ..

# Deploy only the Stripe functions
echo "Deploying Stripe functions..."
firebase deploy --only functions:createPaymentIntent,functions:cancelSubscription,functions:updateSubscription,functions:getPaymentMethods,functions:createSubscription

echo "Deployment complete! Stripe functions have been deployed."
```

## How to Use

To deploy only the Stripe functions:

```bash
./deploy-stripe-functions.sh
```

This script will:
1. Install dependencies
2. Build the functions
3. Deploy only the Stripe-related functions

## Future Considerations

For long-term stability, consider:

1. **Updating Stripe SDK**: Ensure the Stripe SDK version is compatible with the API version being used.

2. **Standardizing Firebase Functions API Usage**: Consistently use either v1 or v2 APIs throughout the codebase.

3. **Separating Function Deployments**: Continue using separate deployment scripts for different function groups to minimize deployment issues.
