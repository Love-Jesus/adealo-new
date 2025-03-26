# Testing and Deployment Guide

This guide explains how to test and deploy your prospecting tool application. It includes information on running tests, fixing common issues, and preparing for deployment.

## Testing Files

We've created several files to help you test and deploy your application:

1. **DEVELOPMENT-TESTING-NOTES.md**
   - Contains detailed notes on the tests we ran
   - Lists all issues found during testing
   - Provides recommendations for addressing each issue

2. **run-dev-tests.sh**
   - Executable script that runs all tests in sequence
   - Checks build, linting, dependencies, and deployment readiness
   - Provides a summary of test results

3. **PRE-DEPLOYMENT-CHECKLIST.md**
   - Comprehensive checklist to complete before deployment
   - Covers code quality, dependencies, configuration, and more
   - Includes deployment commands and post-deployment verification steps

## Running Tests

### Regular Development Testing

During development, you can run individual tests as needed:

```bash
# Build test
npm run build

# Linting test
npm run lint

# Dependency check
npm outdated

# Firebase emulators
firebase emulators:start
```

### Comprehensive Testing

For a comprehensive test of your application, use the provided script:

```bash
# Make sure the script is executable
chmod +x run-dev-tests.sh

# Run all tests
./run-dev-tests.sh
```

This script will:
1. Run a production build
2. Check for linting issues
3. Check for outdated dependencies
4. Check Firebase Functions logs
5. Run a deployment dry run
6. Provide a summary of all test results

## Addressing Common Issues

### TypeScript Errors

Most TypeScript errors found during testing are related to unused imports and variables. To fix these:

1. Remove unused imports at the top of files
2. Remove unused variables
3. Replace `any` types with more specific types

### Accessibility Issues

The main accessibility issues found were:

1. Missing DialogTitle components
2. Missing aria attributes
3. Form fields without id or name attributes

### Firebase Functions

The Firebase Functions SDK is outdated. To update it:

```bash
cd functions
npm install firebase-functions@latest
```

Note that this may introduce breaking changes, so test thoroughly after updating.

## Deployment Process

When you're ready to deploy, follow these steps:

1. Complete all items in the PRE-DEPLOYMENT-CHECKLIST.md file
2. Run the run-dev-tests.sh script one final time
3. Fix any remaining issues
4. Deploy to Firebase:

```bash
# Full deployment
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
```

5. Verify the deployment by checking the live site
6. Monitor Firebase Functions logs for any issues

## Continuous Improvement

To maintain code quality over time:

1. Run the test script weekly
2. Address issues as they arise
3. Keep dependencies up to date
4. Regularly check Firebase Functions logs
5. Update the checklist as new requirements emerge

By following this testing and deployment process, you'll ensure your application remains stable, secure, and ready for production use.
