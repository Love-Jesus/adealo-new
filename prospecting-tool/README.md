# Adealo Prospecting Tool

A comprehensive platform for lead generation, customer engagement, and team management.

## Overview

The Adealo Prospecting Tool is a web application that helps businesses generate leads, engage with customers, and manage teams. It includes a customizable widget system that can be embedded in any website to capture leads and provide customer support.

## Key Features

- **Widget System**: Customizable chat widget for customer engagement
- **Lead Generation**: Tools for generating and managing leads
- **Team Management**: Create and manage teams with different roles and permissions
- **Subscription Management**: Stripe integration for handling subscriptions
- **Analytics**: Track customer interactions and team performance

## Architecture

The application is built on the following technologies:

- **Frontend**: React, TypeScript
- **Backend**: Firebase Cloud Functions
- **Database**: Firestore
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting
- **Storage**: Firebase Storage

## Documentation

The project documentation is organized into several key files:

- [**WIDGET-SYSTEM.md**](./WIDGET-SYSTEM.md): Documentation for the widget system
- [**TEAM-SYSTEM.md**](./TEAM-SYSTEM.md): Documentation for the team management system
- [**STRIPE-INTEGRATION.md**](./STRIPE-INTEGRATION.md): Documentation for the Stripe integration
- [**DEPLOYMENT.md**](./DEPLOYMENT.md): Guide to deploying the application
- [**PROJECT-MAP.md**](./PROJECT-MAP.md): Overview of the project structure
- [**WIDGET-CLEANUP.md**](./WIDGET-CLEANUP.md): List of files to clean up

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase CLI
- Firebase project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Firebase:
   ```bash
   firebase login
   firebase use <project-id>
   ```
4. Install function dependencies:
   ```bash
   cd functions
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

To run the Firebase emulators:

```bash
firebase emulators:start
```

## Widget System

The widget system uses a vanilla JavaScript approach that generates all HTML, CSS, and JavaScript dynamically based on a configuration object. This approach offers significant advantages over traditional component-based frameworks:

- **Zero Dependencies**: No React, ReactDOM, or other external libraries required
- **Faster Loading**: Smaller file size means quicker initialization
- **Reduced Memory Usage**: Minimal JavaScript footprint
- **Single Script Tag**: Users only need to include one script tag in their HTML

For more details, see [WIDGET-SYSTEM.md](./WIDGET-SYSTEM.md).

## Deployment

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
