# Deployment Guide

This document provides a comprehensive guide to deploying the Adealo platform.

## Overview

The Adealo platform consists of several components that need to be deployed:

1. **Frontend Application**: React application deployed to Firebase Hosting
2. **Backend Functions**: Firebase Cloud Functions
3. **Widget Scripts**: JavaScript files deployed to Firebase Hosting
4. **Database Rules**: Firestore security rules

## Prerequisites

Before deploying, ensure you have:

1. **Firebase CLI**: Installed and configured
2. **Node.js**: Version 14 or higher
3. **Firebase Project**: Set up and configured
4. **Environment Variables**: Configured in Firebase Functions

## Deployment Process

### Pre-Deployment Checklist

Before deploying, run through this checklist:

1. All tests pass
2. Code has been reviewed
3. Environment variables are configured
4. Database rules are updated
5. Breaking changes are documented

See `PRE-DEPLOYMENT-CHECKLIST.md` for a detailed checklist.

### Frontend Deployment

To deploy the frontend application:

```bash
# Build the frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Backend Deployment

To deploy the backend functions:

```bash
# Navigate to the functions directory
cd functions

# Install dependencies
npm install

# Build the functions
npm run build

# Deploy to Firebase Functions
firebase deploy --only functions
```

### Widget Deployment

To deploy the widget scripts:

```bash
# Deploy widget-related functions
./deploy-widget-functions.sh
```

### Database Rules Deployment

To deploy the database rules:

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

## Deployment Scripts

The project includes several deployment scripts to simplify the process:

- **`deploy-functions.sh`**: Deploy all functions
- **`deploy-widget.sh`**: Deploy widget-related components
- **`deploy-widget-functions.sh`**: Deploy only widget functions
- **`deploy-stripe-functions.sh`**: Deploy Stripe-related functions
- **`deploy-firestore-rules.sh`**: Deploy Firestore security rules

## Environment-Specific Deployment

### Development Environment

For deploying to the development environment:

```bash
# Set the Firebase project to development
firebase use development

# Deploy
./deploy-functions.sh
```

### Production Environment

For deploying to the production environment:

```bash
# Set the Firebase project to production
firebase use production

# Deploy
./deploy-functions.sh
```

## Continuous Integration/Continuous Deployment (CI/CD)

The project can be set up with CI/CD using GitHub Actions or another CI/CD platform:

1. Set up a workflow file in `.github/workflows/`
2. Configure the workflow to build and deploy on push to specific branches
3. Set up environment variables in the CI/CD platform

## Rollback Procedures

If a deployment causes issues, you can roll back to a previous version:

```bash
# List previous deployments
firebase hosting:versions:list

# Roll back to a specific version
firebase hosting:clone <version> live
```

For functions, you can roll back to a previous version using the Firebase Console.

## Post-Deployment Verification

After deploying, verify that:

1. The application is accessible
2. Functions are working correctly
3. The widget is loading properly
4. Database rules are enforced correctly

## Troubleshooting

### Common Deployment Issues

1. **Function Deployment Failures**: Check function logs in Firebase Console
2. **Hosting Deployment Failures**: Verify build output and Firebase configuration
3. **Rule Deployment Failures**: Check rule syntax and validation

### Debugging

- Use Firebase CLI to check deployment status
- Check Firebase Console for logs and errors
- Verify environment variables are correctly set

## Security Considerations

- Never deploy with hardcoded secrets or API keys
- Use environment variables for sensitive information
- Regularly update dependencies to address security vulnerabilities
- Implement proper access controls in database rules

## Resources

- [Firebase Deployment Documentation](https://firebase.google.com/docs/cli)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
