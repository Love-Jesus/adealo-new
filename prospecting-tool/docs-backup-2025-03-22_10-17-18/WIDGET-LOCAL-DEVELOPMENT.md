# Widget Local Development Guide

This document explains how to set up and test the Adealo widget in a local development environment.

## Overview

The Adealo widget can be tested in two ways:
1. Using the production Firebase Functions (widget.adealo.com/loader.js)
2. Using the local Firebase Functions emulator (localhost:5001)

## Prerequisites

- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project configured

## Testing with Local Firebase Functions Emulator

### Step 1: Start the Firebase Functions Emulator

```bash
cd prospecting-tool
firebase emulators:start --only functions
```

This will start the Firebase Functions emulator on port 5001, which is the default port used by the loader.js file when running on localhost.

### Step 2: Run the Local Test Script

```bash
./prospecting-tool/run-user-widget-local-test.sh
```

This script will:
1. Start the development server
2. Open the test page in your browser
3. Load the widget using the local loader.js file

The test page will display the widget and show any console logs in the debug panel.

## Widget Code

The widget code for local development:

```html
<!-- Adealo Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AdealoWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;fjs.parentNode.insertBefore(js,fjs);
  })(window,document,'script','adealo','http://localhost:5173/loader.js');
  adealo('init', 'aTHwvPFrdIziL0DEYUOr');
</script>
<!-- End Adealo Widget -->
```

The widget code for production:

```html
<!-- Adealo Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AdealoWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;fjs.parentNode.insertBefore(js,fjs);
  })(window,document,'script','adealo','https://widget.adealo.com/loader.js');
  adealo('init', 'aTHwvPFrdIziL0DEYUOr');
</script>
<!-- End Adealo Widget -->
```

## How It Works

1. The loader.js file detects if it's running on localhost and uses the Firebase Functions emulator if it is.
2. The Firebase Functions emulator serves the widget script based on the widget ID.
3. The widget script is loaded and executed on the page.

## Troubleshooting

### Widget Not Loading

If the widget is not loading, check the following:

1. Make sure the Firebase Functions emulator is running.
2. Check the browser console for any errors.
3. Verify that the widget ID is correct. The current widget ID is `WnwIUWLRHxM09A6EYJPY`.
4. Make sure the widget exists in the Firestore database and is active.

### Connection Refused Error

If you see a "Connection Refused" error, it means the Firebase Functions emulator is not running or is not accessible. Start the emulator with:

```bash
cd prospecting-tool
firebase emulators:start --only functions
```

## Deploying to Firebase

When you're ready to deploy your changes to Firebase, run:

```bash
./prospecting-tool/deploy-widget-functions.sh
```

This will deploy the widget functions to Firebase, making them available at `https://us-central1-adealo-ce238.cloudfunctions.net/getWidgetScript`.

## Test Files

The following test files are available:

- `public/test-user-widget.html`: Tests the widget with the production loader.js
- `public/test-user-widget-local.html`: Tests the widget with the local loader.js
- `public/test-chat-widget.html`: Tests the chat widget with the production loader.js
- `public/local-test-chat-widget.html`: Tests the chat widget with the local loader.js

## Test Scripts

The following test scripts are available:

- `run-user-widget-test.sh`: Runs the test with the production loader.js
- `run-user-widget-local-test.sh`: Runs the test with the local loader.js
- `run-chat-widget-test.sh`: Runs the chat widget test with the production loader.js
- `run-local-chat-widget-test.sh`: Runs the chat widget test with the local loader.js
