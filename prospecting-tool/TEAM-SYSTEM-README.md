# Team System Documentation

This document provides an overview of the authentication and team system implementation for the application.

## Overview

The team system allows users to collaborate within a shared workspace. Each company has one team, and users can be invited to join a team with different roles (admin or member).

## Data Model

### Users

Users are stored in the `users` collection in Firestore. Each user document contains:

- `email`: The user's email address
- `displayName`: The user's display name
- `role`: The user's system role (admin or regular user)
- `createdAt`: Timestamp when the user was created
- `updatedAt`: Timestamp when the user was last updated

### Teams

Teams are stored in the `teams` collection in Firestore. Each team document contains:

- `name`: The team's name
- `ownerId`: The ID of the user who owns the team
- `subscriptionTier`: The team's subscription tier (free, basic, pro, enterprise)
- `createdAt`: Timestamp when the team was created
- `updatedAt`: Timestamp when the team was last updated

### Team Members

Team memberships are stored in the `teamMembers` collection in Firestore. The document ID is the user's ID, and each document contains:

- `userId`: The ID of the user
- `teamId`: The ID of the team
- `role`: The user's role within the team (admin or member)
- `status`: The user's status within the team (active, invited, removed)
- `createdAt`: Timestamp when the team membership was created
- `updatedAt`: Timestamp when the team membership was last updated

### Invitations

Invitations are stored in the `invitations` collection in Firestore. Each invitation document contains:

- `email`: The email address of the invited user
- `teamId`: The ID of the team the user is invited to
- `token`: A unique token for the invitation
- `status`: The status of the invitation (pending, accepted, expired)
- `role`: The role the user will have when they accept the invitation
- `createdBy`: The ID of the user who created the invitation
- `createdAt`: Timestamp when the invitation was created
- `expiresAt`: Timestamp when the invitation expires
- `updatedAt`: Timestamp when the invitation was last updated

## Permissions System

The permissions system is role-based, with different permissions for different roles:

### System Admin

- Has full access to all resources
- Can manage all teams
- Can access the admin panel

### Team Owner

- Has full access to their team
- Can manage team members
- Can manage team settings
- Can manage billing

### Team Admin

- Can invite team members
- Can remove team members
- Can change team member roles
- Can manage team settings

### Team Member

- Can use team resources
- Cannot manage team members or settings

## Invitation Flow

1. A team admin or owner creates an invitation for a user by email
2. The system generates a unique token and stores the invitation in Firestore
3. A Firebase function sends an email to the invited user with a link to accept the invitation
4. When the user clicks the link, they are taken to the invitation acceptance page
5. If the user is not logged in, they are prompted to log in or create an account
6. Once logged in, the user can accept or decline the invitation
7. If accepted, the user is added to the team with the specified role

## Security Rules

Firestore security rules enforce the permission system:

- System admins have full access to all resources
- Team owners and admins can manage their team's resources
- Team members can access their team's resources but cannot manage them
- Users can only access resources that belong to their team

## Implementation Details

### Services

- `invitations.ts`: Service for managing invitations
- `teamMembers.ts`: Service for managing team memberships
- `teams.ts`: Service for managing teams
- `permissions.ts`: Service for checking permissions

### Components

- `invite-member-dialog.tsx`: Dialog for inviting team members
- `team-members-list.tsx`: Component for displaying and managing team members
- `accept-invitation.tsx`: Component for accepting invitations

### Pages

- `TeamPage.tsx`: Page for managing team settings and members
- `InvitationPage.tsx`: Page for accepting invitations

### Firebase Functions

- `sendInvitationEmail`: Function that sends an email when a new invitation is created
- `checkExpiredInvitations`: Function that runs daily to check for expired invitations

## Usage

### Inviting a Team Member

1. Navigate to the Team page
2. Click the "Invite Member" button
3. Enter the email address of the user you want to invite
4. Select the role for the user (admin or member)
5. Click "Send Invitation"

### Accepting an Invitation

1. Click the link in the invitation email
2. Log in or create an account if not already logged in
3. Review the invitation details
4. Click "Accept Invitation" to join the team

### Managing Team Members

1. Navigate to the Team page
2. View the list of team members
3. Use the actions menu to change a member's role or remove them from the team

## Future Enhancements

- Support for multiple teams per user
- More granular permission controls
- Team-specific settings and preferences
- Team activity logs
- Team billing and subscription management
