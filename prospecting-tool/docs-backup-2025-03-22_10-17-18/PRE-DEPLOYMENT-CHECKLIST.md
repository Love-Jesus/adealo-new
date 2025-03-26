# Pre-Deployment Checklist

Use this checklist before deploying your prospecting tool to production. Check off each item as you complete it to ensure a smooth deployment.

## Code Quality

- [ ] Run `npm run build` and fix all TypeScript errors
- [ ] Run `npm run lint` and address critical linting issues
- [ ] Remove unused imports and variables
- [ ] Replace `any` types with specific types
- [ ] Fix React Hook dependency warnings

## Dependencies

- [ ] Run `npm outdated` to check for outdated dependencies
- [ ] Update dependencies to latest stable versions
- [ ] Update firebase-functions SDK to latest version
- [ ] Test thoroughly after updating dependencies

## Firebase Configuration

- [ ] Verify Firebase project settings
- [ ] Check Firestore security rules
- [ ] Verify Storage security rules
- [ ] Test all Firebase Functions
- [ ] Run `firebase deploy --only hosting --dry-run` to check for deployment issues

## Accessibility

- [ ] Add DialogTitle to DialogContent components
- [ ] Add aria attributes to DialogContent
- [ ] Add id or name attributes to form fields
- [ ] Test with screen readers if possible

## Security

- [ ] Ensure Stripe.js integration uses HTTPS
- [ ] Verify authentication flows
- [ ] Check authorization rules
- [ ] Ensure sensitive data is properly protected

## Performance

- [ ] Run Lighthouse tests
- [ ] Optimize large components
- [ ] Implement code splitting where appropriate
- [ ] Optimize images and assets

## Testing

- [ ] Test all core functionality
- [ ] Test on different browsers
- [ ] Test on different devices
- [ ] Test with real user scenarios

## Final Steps

- [ ] Create a backup of the current production environment
- [ ] Plan for rollback if needed
- [ ] Schedule deployment during low-traffic periods
- [ ] Monitor the application after deployment

## Deployment Commands

```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy

# Deploy only specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Post-Deployment

- [ ] Verify the application is working in production
- [ ] Check for any console errors
- [ ] Monitor Firebase Functions logs
- [ ] Test critical user flows

Remember to run the `run-dev-tests.sh` script before starting the deployment process to catch any last-minute issues.
