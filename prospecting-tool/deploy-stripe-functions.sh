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
