# Project Map

This document provides a high-level overview of the project structure and key components to help you navigate the codebase.

## Core Directories

- **`/src`**: Main application source code
  - **`/components`**: React components for the dashboard
  - **`/pages`**: Page components for the dashboard
  - **`/services`**: Service modules for API interactions
  - **`/types`**: TypeScript type definitions
  - **`/utils`**: Utility functions
  - **`/lib`**: Library integrations (Firebase, etc.)

- **`/functions`**: Firebase Cloud Functions
  - **`/src`**: Function source code
    - **`/services`**: Service modules for functions
    - **`/types`**: TypeScript type definitions
    - **`/utils`**: Utility functions

- **`/public`**: Static assets and public files
  - Contains widget scripts and test HTML files

## Key Components

### Dashboard Application

The dashboard application is a React application that allows users to manage their widgets, teams, and other settings.

Key components:
- **`App.tsx`**: Main application component
- **`src/pages/*`**: Page components for different sections of the dashboard
- **`src/components/widget-editor/*`**: Components for editing widget configurations

### Widget System

The widget system is a vanilla JavaScript implementation that generates a chat widget based on a configuration object.

Key components:
- **`functions/src/widget-config.ts`**: Generates the widget script based on configuration
- **`functions/src/services/widget/configManager.ts`**: Manages widget configurations
- **`functions/src/services/widget/cacheManager.ts`**: Caches widget configurations
- **`src/types/widget/enhanced-config.types.ts`**: TypeScript types for widget configuration

### Firebase Functions

Firebase Cloud Functions provide the backend API for the application.

Key functions:
- **`functions/src/widget-config.ts`**: Widget configuration endpoints
- **`functions/src/tracking.ts`**: Tracking and analytics endpoints
- **`functions/src/enrichment.ts`**: Data enrichment endpoints

## Key Files

### Configuration Files

- **`firebase.json`**: Firebase configuration
- **`firestore.rules`**: Firestore security rules
- **`storage.rules`**: Firebase Storage security rules
- **`tsconfig.json`**: TypeScript configuration

### Documentation Files

- **`WIDGET-SYSTEM.md`**: Documentation for the widget system
- **`WIDGET-CLEANUP.md`**: List of files to clean up
- **`PROJECT-MAP.md`**: This file

## Feature Areas

### Widget System

The widget system allows users to add a chat widget to their website. It's implemented using vanilla JavaScript for optimal performance.

Key files:
- **`functions/src/widget-config.ts`**: Main widget implementation
- **`src/types/widget/enhanced-config.types.ts`**: Widget configuration types

### Team Management

The team management system allows users to create and manage teams.

Key files:
- **`src/services/teamCredits.ts`**: Team credits service
- **`functions/src/services/teamCredits.ts`**: Team credits functions

### Subscription Management

The subscription management system handles user subscriptions via Stripe.

Key files:
- **`functions/src/services/stripe/*`**: Stripe integration
- **`src/services/subscription.ts`**: Subscription service
- **`src/pages/PricingPage.tsx`**: Pricing page

### Analytics

The analytics system tracks user interactions with the widget.

Key files:
- **`functions/src/tracking.ts`**: Tracking endpoints
- **`src/services/analytics.ts`**: Analytics service

## Development Workflow

1. Make changes to the codebase
2. Test changes locally using the emulator
3. Deploy changes to Firebase

## Deployment

Deployment is handled via Firebase CLI:

- **`deploy-widget.sh`**: Deploy widget-related functions
- **`deploy-functions.sh`**: Deploy all functions
