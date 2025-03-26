#!/bin/bash

echo "Restoring Stripe webhook function..."

# Uncomment the Stripe webhook function in index.ts
sed -i '' 's/\/\/ export { stripeWebhook } from/export { stripeWebhook } from/g' functions/src/index.ts

echo "Stripe webhook function has been restored in the codebase."
echo "Note: You will need to deploy the functions for the changes to take effect."
echo "To deploy, run: ./deploy-functions.sh"
