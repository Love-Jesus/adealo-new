# Team System

This document provides a comprehensive guide to the Team System in the Adealo platform.

## Overview

The Team System allows users to create and manage teams, invite team members, and allocate resources. It's designed to support collaborative work and resource sharing within organizations.

## Key Concepts

### Teams

A team is a group of users who collaborate on the same projects and share resources. Each team has:

- A unique identifier
- A name
- An owner
- Members
- Credits allocation
- Widgets and other resources

### Team Credits

Team credits are the currency used within the platform to pay for various features and services:

- Credits are allocated based on subscription plans
- Credits can be used for widget activations, API calls, and other features
- Credit usage is tracked and reported

### Team Members

Team members are users who have been invited to join a team:

- Members can have different roles and permissions
- Roles determine what actions a member can perform
- Members can be added, removed, or have their roles changed by team administrators

## Architecture

The Team System is built on the following components:

1. **Firebase Authentication**: User authentication and identity management
2. **Firestore Database**: Team and member data storage
3. **Firebase Functions**: Backend logic for team operations
4. **React Components**: Frontend UI for team management

## Key Components

### Backend (Firebase Functions)

- **`functions/src/services/teamCredits.ts`**: Team credits management
- **`functions/src/services/stripe/webhooks.ts`**: Webhook handlers for subscription events that affect team credits

### Frontend (React)

- **`src/services/teamCredits.ts`**: Frontend team credits service
- **`src/components/team-switcher.tsx`**: UI for switching between teams
- **`src/components/subscription/subscription-details.tsx`**: Subscription details component

## Team Management

### Creating a Team

1. User navigates to the team management page
2. User clicks "Create Team" button
3. User enters team name and other details
4. System creates a new team with the user as owner
5. System allocates initial credits based on the user's subscription

### Inviting Team Members

1. Team owner navigates to the team management page
2. Owner clicks "Invite Member" button
3. Owner enters member's email and selects a role
4. System sends an invitation email to the member
5. Member accepts the invitation and is added to the team

### Managing Team Resources

1. Team owner or administrator navigates to the resource management page
2. Administrator allocates credits to different resources
3. System updates the credit allocation
4. Team members can use the allocated resources

## Team Credits System

The team credits system is integrated with Stripe subscriptions:

- Each subscription plan includes a certain number of team credits
- Team credits are allocated to the team when a subscription is created or updated
- Team credits are used to pay for various features and services
- Credit usage is tracked and reported in the dashboard

### Credit Allocation

Credits can be allocated to different resources:

- Widget activations
- API calls
- Data enrichment
- Other features

### Credit Usage Tracking

Credit usage is tracked and reported:

- Usage is tracked in real-time
- Reports are available in the dashboard
- Alerts can be configured for low credit situations

## Security

### Access Control

The Team System implements role-based access control:

- **Owner**: Full access to all team settings and resources
- **Administrator**: Can manage team members and resources
- **Member**: Can use team resources but cannot change settings
- **Viewer**: Can view team resources but cannot use or change them

### Data Isolation

Team data is isolated to ensure security:

- Each team's data is stored separately
- Access controls are enforced at the database level
- Cross-team access is prevented

## Troubleshooting

### Common Issues

1. **Invitation Emails Not Received**: Check spam folders or resend the invitation
2. **Credit Allocation Issues**: Verify subscription status and credit balance
3. **Permission Errors**: Check user roles and permissions

### Debugging

- Check Firebase Function logs for backend errors
- Use browser developer tools for frontend issues
- Verify Firestore database state for data inconsistencies

## Future Enhancements

Planned enhancements for the Team System:

1. **Advanced Role Management**: More granular control over permissions
2. **Team Activity Logs**: Detailed logs of team member actions
3. **Resource Usage Analytics**: Advanced analytics for resource usage
4. **Team Collaboration Tools**: Built-in tools for team collaboration

## Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
