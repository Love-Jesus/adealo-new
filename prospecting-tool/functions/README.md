# Prospecting Tool Cloud Functions

This directory contains Firebase Cloud Functions for the Prospecting Tool application. These functions handle data import operations, allowing users to upload JSON and CSV files to import company data into Firestore.

## Features

- **File Upload Processing**: Automatically processes files uploaded to Firebase Storage
- **JSON and CSV Support**: Handles both JSON and CSV file formats
- **Progress Tracking**: Provides real-time progress updates during import
- **Error Handling**: Robust error handling and reporting

## Functions

1. **importCompaniesFromStorage**: Triggered when a file is uploaded to the `imports/` directory in Firebase Storage. It processes the file and imports the data into Firestore.
2. **getImportStatus**: An HTTPS callable function that returns the status of an import job.

## Deployment

To deploy these functions to Firebase:

1. Install the Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in the project root (if not already done):
   ```bash
   firebase init
   ```

4. Build the functions:
   ```bash
   cd functions
   npm run build
   ```

5. Deploy the functions:
   ```bash
   firebase deploy --only functions
   ```

## Local Development

To run the functions locally for development:

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Start the Firebase emulators:
   ```bash
   npm run serve
   ```

This will start the Firebase emulators, including the Functions emulator, allowing you to test your functions locally.

## Environment Variables

The functions require the following environment variables:

- None required for basic functionality, as Firebase Admin SDK is initialized automatically.

## Security Rules

Make sure your Firebase Security Rules allow the functions to access Firestore and Storage. The rules are defined in the project root in `firestore.rules` and `storage.rules`.
