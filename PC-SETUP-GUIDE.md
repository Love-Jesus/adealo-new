# PC Setup Guide for Adealo Prospecting Tool

This guide will help you set up the Adealo Prospecting Tool development environment on your PC after cloning it from GitHub.

## Prerequisites

Before you begin, make sure you have the following installed on your PC:

1. **Git for Windows**: Download and install from [git-scm.com](https://git-scm.com/download/win)

2. **Node.js v18**: Install version 18 (as specified in the functions package.json)
   - Download from [nodejs.org](https://nodejs.org/)
   - This will also install npm

3. **Visual Studio Code**: You mentioned you already have this installed

4. **Firebase CLI**: After installing Node.js, open Command Prompt and run:
   ```
   npm install -g firebase-tools
   ```

## Cloning and Setting Up the Project

1. **Clone the repository**:
   - Open Command Prompt
   - Navigate to where you want to store the project
   - Run:
     ```
     git clone https://github.com/Love-Jesus/adealo-new.git
     cd adealo-new
     ```

2. **Install dependencies**:
   ```
   npm install
   cd prospecting-tool
   npm install
   cd functions
   npm install
   cd ../..
   ```

3. **Log in to Firebase**:
   ```
   firebase login
   ```

4. **Select your Firebase project**:
   ```
   firebase use YOUR_PROJECT_ID
   ```
   (Replace YOUR_PROJECT_ID with your actual Firebase project ID)

## Environment Variables

The project uses several environment variables for API keys and secrets. You'll need to set these up on your PC:

### For Frontend (React/Vite)

Create a `.env` file in the `prospecting-tool` directory with the following variables:

```
VITE_IPINFO_ACCESS_TOKEN=your_ipinfo_token
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### For Firebase Functions

Set environment variables for Firebase Functions:

```
firebase functions:config:set ipinfo.access_token="your_ipinfo_token" sendgrid.api_key="your_sendgrid_api_key" stripe.secret_key="your_stripe_secret_key" stripe.webhook_secret="your_stripe_webhook_secret"
```

## Testing Your Setup

1. **Run the development server**:
   ```
   cd prospecting-tool
   npm run dev
   ```

2. **Run Firebase emulators** (if needed):
   ```
   firebase emulators:start
   ```

## Workflow for Switching Between Machines

When switching between your macOS and PC:

1. **Before switching**, always commit and push your changes:
   ```
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. **When starting work on the other machine**, always pull the latest changes:
   ```
   git pull
   ```

3. **If you've installed new dependencies**, you'll need to run `npm install` again on the other machine.

## Troubleshooting

### Git Authentication Issues

If you encounter authentication issues with Git:

1. Use a Personal Access Token (PAT) instead of a password
2. Configure Git to store credentials:
   ```
   git config --global credential.helper store
   ```

### Node.js Version Issues

If you encounter issues with Node.js versions:

1. Install Node Version Manager (nvm) for Windows
2. Use nvm to install and switch to Node.js v18:
   ```
   nvm install 18
   nvm use 18
   ```

### Firebase CLI Issues

If you encounter issues with the Firebase CLI:

1. Make sure you're logged in with the correct account
2. Try reinstalling the Firebase CLI:
   ```
   npm uninstall -g firebase-tools
   npm install -g firebase-tools
   firebase login
   ```

## Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
