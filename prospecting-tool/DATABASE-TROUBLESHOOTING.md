# Database Connection Troubleshooting Guide

This guide provides steps to diagnose and fix issues with the Firebase database connection in the Adealo application.

## Current Issues

1. **Widget Loading Error**: The application is showing the error message: "Failed to load widgets. Please try again or create a new widget." This indicates a problem with the database connection or authentication.

2. **Permission Error**: Some users are seeing the error message: "You do not have permission to access these widgets. Please check your account permissions." This is due to an issue with the Firestore security rules.

## Diagnosis Steps

1. **Check Authentication State**
   - We've added logging to verify if the user is properly authenticated
   - The error could be due to the user not being logged in or the authentication token being invalid

2. **Check Firestore Connection**
   - We've added a test script (`test-firebase-connection.js`) to verify the connection to Firestore
   - This will help determine if there's an issue with the Firestore database itself

3. **Check Security Rules**
   - The Firestore security rules might be preventing access to the widgets collection
   - We've reviewed the rules and they require authentication and proper team membership

## Potential Issues and Solutions

### 1. Authentication Issues

**Symptoms:**
- "User not authenticated" error in the console
- Unable to access any data from Firestore

**Solutions:**
- Ensure the user is properly logged in before trying to access Firestore
- Check if the authentication token is expired or invalid
- Implement a re-authentication flow if the token is expired

### 2. Firestore Connection Issues

**Symptoms:**
- Timeout errors when trying to connect to Firestore
- Network-related errors in the console

**Solutions:**
- Check internet connectivity
- Verify that the Firebase project is properly set up
- Ensure the Firebase configuration is correct

### 3. Security Rules Issues

**Symptoms:**
- "Permission denied" errors in the console
- Able to authenticate but not access specific collections

**Solutions:**
- Review and update the Firestore security rules
- Ensure the user has the correct permissions
- Check if the team ID is properly set in localStorage

### 4. Data Structure Issues

**Symptoms:**
- No errors, but empty data returned
- Unexpected data format

**Solutions:**
- Check if the data structure matches the expected format
- Verify that the collections and documents exist in Firestore
- Ensure the queries are correctly formatted

## Implemented Fixes

1. **Enhanced Error Handling**
   - Added more detailed error messages to help diagnose issues
   - Implemented better logging to track the authentication and database connection process

2. **Authentication Verification**
   - Added checks to verify the user is authenticated before trying to access Firestore
   - Improved error messages when authentication fails

3. **Fallback Mechanism**
   - Added a fallback mechanism for widget embed code generation
   - Created a standalone widget script that works without requiring Firebase functions

4. **Fixed Security Rules**
   - Fixed a critical issue in the Firestore security rules for widgets
   - The previous rules had an incorrect check for team membership using `request.resource.data.teamId` which is not available during read operations
   - Updated the rules to properly check team membership using the teamMembers collection
   - Added a fallback to allow access to widgets without a teamId for backward compatibility

## Testing the Database Connection

We've created a test script to verify the Firebase connection:

1. Run the test script:
   ```bash
   ./run-firebase-test.sh
   ```

2. Check the output for:
   - Successful authentication
   - Successful connection to Firestore
   - Any error messages

## Security Rules Review

The current Firestore security rules for widgets require:

1. The user to be authenticated
2. The widget to belong to the user's team
3. The user to have the correct permissions

If you're having issues accessing widgets, check:

1. That you're properly authenticated
2. That your user account is associated with the correct team
3. That the team ID in localStorage matches the team ID in Firestore

## Next Steps

If you're still experiencing issues after following these troubleshooting steps:

1. Check the Firebase console for any errors or warnings
2. Verify that the Firebase project is properly configured
3. Check if there are any quota limits or restrictions on your Firebase project
4. Consider upgrading to a paid Firebase plan if you're hitting limits

## Firebase Configuration

The Firebase configuration is stored in `src/lib/firebase.ts`. Make sure it matches the configuration in the Firebase console.

## Firestore Rules

The Firestore security rules are stored in `firestore.rules`. Make sure they're properly configured to allow access to the widgets collection.

## Contact Support

If you're still experiencing issues, please contact support at support@adealo.com with:

1. A description of the issue
2. Any error messages from the console
3. The output of the test script
4. Your Firebase project ID
