# Stripe API Key Update

This document outlines the changes made to update the Stripe API keys in the prospecting tool.

## Changes Made

1. **Updated Server-Side Secret Key**
   - Updated the Stripe secret key in `functions/src/services/stripe/stripe.ts`
   - The new secret key is now being used for all server-side Stripe API calls

2. **Updated Client-Side Publishable Key**
   - Updated the Stripe publishable key in `src/services/stripe.ts`
   - The new publishable key is now being used for all client-side Stripe.js interactions

3. **Added Team Credits Support**
   - Updated the subscription details component to use team credits
   - Added a migration script to convert user credits to team credits

4. **Created Test Scripts**
   - Created `test-stripe-key-updated.js` to verify the secret key
   - Created `test-stripe-publishable-key.html` to verify the publishable key

## Testing the Integration

### Testing the Secret Key

To test that the server-side Stripe integration is working correctly:

1. Run the test script:
   ```
   cd prospecting-tool
   node test-stripe-key-updated.js
   ```

2. The script will attempt to:
   - List customers from your Stripe account
   - List subscription plans
   - Display basic information about these resources

3. If successful, you should see output confirming the key is valid.

### Testing the Publishable Key

To test that the client-side Stripe integration is working correctly:

1. Open the test HTML file in a browser:
   ```
   cd prospecting-tool
   open test-stripe-publishable-key.html
   ```

2. The page will:
   - Load the Stripe.js library
   - Initialize Stripe with the publishable key
   - Create a card element
   - Display a success message if everything works correctly

3. You should see a Stripe card input field and a success message if the key is valid.

## Migrating User Credits to Team Credits

To migrate existing user credits to the new team-based credit system:

1. Run the migration script:
   ```
   cd prospecting-tool
   node scripts/migrate-to-team-credits.js
   ```

2. The script will:
   - Get all users
   - Group users by team
   - For each team, find the team admin or first user
   - Get the user's credits
   - Create team credits based on the user's credits

3. The script will log the progress and results of the migration.

## Troubleshooting

If you encounter issues with the Stripe integration:

1. **Secret Key Issues**
   - Check that the secret key is correctly formatted and not expired
   - Verify that the key has the necessary permissions in the Stripe dashboard
   - Run the test script to see specific error messages

2. **Publishable Key Issues**
   - Check that the publishable key is correctly formatted
   - Ensure it's from the same Stripe account as the secret key
   - Open the test HTML file to see specific error messages

3. **Team Credits Migration Issues**
   - Check the Firestore database for any errors in the team credits collection
   - Verify that the team structure is correctly set up
   - Run the migration script with additional logging if needed
