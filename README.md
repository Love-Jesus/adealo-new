# Adealo Prospecting Tool

A comprehensive platform for lead generation, customer engagement, and team management.

## Cross-Platform Development Setup

This repository has been configured for cross-platform development between macOS and PC. Follow the instructions below to set up your development environment on either platform.

### Prerequisites

Before you begin, make sure you have the following installed:

1. **Git**: Download and install from [git-scm.com](https://git-scm.com/downloads)
2. **Node.js v18**: Install version 18 (as specified in the functions package.json)
3. **Visual Studio Code**: Download and install from [code.visualstudio.com](https://code.visualstudio.com/)
4. **Firebase CLI**: Install via npm: `npm install -g firebase-tools`

### Setting Up on a New Machine

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Love-Jesus/Adealo.git
   cd Adealo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   cd prospecting-tool
   npm install
   cd functions
   npm install
   cd ../..
   ```

3. **Set up environment variables**:
   - Create `.env` files based on the provided `.env.example` templates
   - For the frontend: `prospecting-tool/.env`
   - For Firebase Functions: `prospecting-tool/functions/.env`

4. **Log in to Firebase**:
   ```bash
   firebase login
   ```

5. **Select your Firebase project**:
   ```bash
   firebase use YOUR_PROJECT_ID
   ```
   (Replace YOUR_PROJECT_ID with your actual Firebase project ID)

### Workflow for Switching Between Machines

When switching between your macOS and PC:

1. **Before switching**, always commit and push your changes:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. **When starting work on the other machine**, always pull the latest changes:
   ```bash
   git pull
   ```

3. **If you've installed new dependencies**, you'll need to run `npm install` again on the other machine.

### Security Considerations

This repository has been configured to exclude sensitive information:

- API keys and secrets are stored in environment variables, not in the code
- Service account key files are excluded from version control
- The `.gitignore` file is configured to exclude sensitive files

For more detailed instructions, see [PC-SETUP-GUIDE.md](PC-SETUP-GUIDE.md).

## Project Overview

The Adealo Prospecting Tool is a web application that helps businesses generate leads, engage with customers, and manage teams. It includes a customizable widget system that can be embedded in any website to capture leads and provide customer support.

### Key Features

- **Widget System**: Customizable chat widget for customer engagement
- **Lead Generation**: Tools for generating and managing leads
- **Team Management**: Create and manage teams with different roles and permissions
- **Subscription Management**: Stripe integration for handling subscriptions
- **Analytics**: Track customer interactions and team performance

### Architecture

The application is built on the following technologies:

- **Frontend**: React, TypeScript
- **Backend**: Firebase Cloud Functions
- **Database**: Firestore
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting
- **Storage**: Firebase Storage

## Documentation

The project documentation is organized into several key files:

- [**WIDGET-SYSTEM.md**](./prospecting-tool/WIDGET-SYSTEM.md): Documentation for the widget system
- [**TEAM-SYSTEM.md**](./prospecting-tool/TEAM-SYSTEM.md): Documentation for the team management system
- [**STRIPE-INTEGRATION.md**](./prospecting-tool/STRIPE-INTEGRATION.md): Documentation for the Stripe integration
- [**DEPLOYMENT.md**](./prospecting-tool/DEPLOYMENT.md): Guide to deploying the application
- [**PROJECT-MAP.md**](./prospecting-tool/PROJECT-MAP.md): Overview of the project structure
