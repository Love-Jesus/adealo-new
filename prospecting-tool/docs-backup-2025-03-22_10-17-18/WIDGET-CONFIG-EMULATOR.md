# Widget Configuration Emulator Setup

This document explains how to set up and test widget configurations in the Firebase Emulator.

## Overview

The widget configuration system allows you to store widget configurations in Firebase Firestore and load them dynamically when the widget initializes. This approach offers several benefits:

1. **Security**: The configuration is stored on your server, not in the customer's HTML.
2. **Scalability**: You can update the configuration for all customers without requiring them to change their embed code.
3. **Privacy**: Sensitive data is not exposed in the HTML.
4. **Dynamic Updates**: You can update the configuration in real-time.

## Prerequisites

- Firebase Emulator Suite installed
- Node.js installed

## Setting Up the Firebase Emulator

1. Start the Firebase Emulator with permissive security rules:

```bash
cd prospecting-tool
./run-emulator-with-permissive-rules.sh
```

This will start the Firebase Emulator Suite with permissive security rules that allow all read and write operations for testing purposes. The Firestore emulator will be available on port 8080.

> **Note:** If you encounter "permission denied" errors when running the scripts, it's likely due to the Firestore security rules. The `run-emulator-with-permissive-rules.sh` script temporarily replaces the security rules with permissive ones for testing.

## Creating a Widget Configuration

We've provided several scripts to create a widget configuration:

1. **Direct Method** (recommended):

```bash
./run-create-widget-config-direct.sh
```

This script creates a widget configuration directly in Firestore without using the emulator. This is the simplest approach and should work in most cases.

2. **Emulator Methods** (if you prefer to use the emulator):

   * **ES Module Version** (for newer Node.js versions):

   ```bash
   ./run-create-emulator-widget-config.sh
   ```

   * **CommonJS Version** (for older Node.js versions):

   ```bash
   ./run-create-emulator-widget-config-cjs.sh
   ```

All scripts will create a widget configuration with the ID `pjxZqkQ9fAZaqIoOOJJx` in Firestore.

> **Note:** If you encounter "permission denied" errors when trying to run the JavaScript files directly, make sure to use the shell scripts (`.sh` files) instead, which have the proper permissions.

## Testing the Widget Configuration

Once you've created the widget configuration, you can test it using the simple-id-tester.html page:

1. Start the HTTP server:

```bash
./run-simple-id-tester.sh
```

2. Open http://localhost:8000/public/simple-id-tester.html in your browser.

3. Enter the widget ID (`pjxZqkQ9fAZaqIoOOJJx`) and the API URL (`http://localhost:5001/adealo-ce238/us-central1`).

4. Click "Test Widget Configuration" to fetch the widget configuration from the Firebase Emulator.

## Troubleshooting

If you encounter any issues, check the following:

1. **Firebase Emulator Not Running**: Make sure the Firebase Emulator is running on port 8080. You can check by visiting http://localhost:4000 in your browser.

2. **Widget Configuration Not Found**: Make sure you've created the widget configuration using one of the scripts above.

3. **CORS Issues**: If you encounter CORS issues, make sure the Firebase Functions emulator is properly configured to allow cross-origin requests.

4. **Node.js Version Issues**: If you encounter issues with the ES module version, try using the CommonJS version instead.

## Embed Code

Once you've verified that the widget configuration is working correctly, you can use the following embed code in your customers' websites:

```html
<script src="https://us-central1-adealo-ce238.cloudfunctions.net/widget?widgetId=YOUR_WIDGET_ID"></script>
<chat-widget></chat-widget>
```

Replace `YOUR_WIDGET_ID` with the actual widget ID.

## Conclusion

By storing the widget configuration on the server and loading it dynamically, you can provide a secure, scalable, and flexible way to manage widget configurations. This approach allows you to update the widget for all customers without requiring them to change their embed code.
