# Multi Widget System

This document provides an overview of the Multi Widget system, which offers a versatile chat widget with a bottom navigation featuring Home, Support, Book Demo, and Call Me options.

## Overview

The Multi Widget is a vanilla JavaScript implementation that provides a chat widget with a modern, user-friendly interface. It's designed to be easily integrated into any website and can be customized to match your brand's look and feel.

The widget consists of the following components:

1. **Launcher Button**: A floating button that users can click to open the widget.
2. **Widget Content**: The main widget interface that appears when the launcher is clicked.
3. **Navigation Tabs**: Bottom navigation with different sections (Home, Support, Book Demo, Call Me).
4. **Content Screens**: Different screens for each navigation tab.

## Files

The widget system consists of the following files:

- `multi-widget.js`: The main widget implementation.
- `multi-widget-adapter.js`: An adapter script that bridges the widget with the existing widget loader system.
- `create-multi-widget-config.js`: A script to create a widget configuration in the Firestore database.
- `run-create-multi-widget-config.sh`: A shell script to run the configuration script.
- `deploy-multi-widget.sh`: A shell script to deploy the widget files to Firebase hosting.

## Features

The Multi Widget includes the following features:

### 1. Home Screen

- Recent messages section
- Action cards for Support, Book Demo, and Call Me

### 2. Support Screen (Chat)

- Chat interface with agent information
- Message input and send button
- Message history display

### 3. Book Demo Screen

- Form to collect name and email
- Integration with Calendly for scheduling

### 4. Call Me Screen

- Form to collect name and phone number
- Success message after submission

## Installation

To install and use the Multi Widget, follow these steps:

### 1. Create a Widget Configuration

Run the configuration script to create a widget configuration in the Firestore database:

```bash
cd prospecting-tool
chmod +x run-create-multi-widget-config.sh
./run-create-multi-widget-config.sh
```

This will create a widget configuration in Firestore and provide you with a widget ID.

### 2. Deploy the Widget Files

Run the deployment script to deploy the widget files to Firebase hosting:

```bash
cd prospecting-tool
chmod +x deploy-multi-widget.sh
./deploy-multi-widget.sh
```

### 3. Add the Widget to Your Website

Add the following code to your website, replacing `YOUR_WIDGET_ID` with the widget ID from step 1:

```html
<script>
  window.widgetConfig = {
    id: 'YOUR_WIDGET_ID'
  };
</script>
<script src="https://adealo-ce238.web.app/multi-widget-adapter.js" data-widget-id="YOUR_WIDGET_ID"></script>
```

## Testing

To test the widget, visit the test page:

```
https://adealo-ce238.web.app/test-widget.html
```

Enter your widget ID in the input field and click "Load Widget".

## Customization

The widget can be customized through the configuration in Firestore. The configuration includes the following sections:

### Base

- Widget ID
- Team ID
- Name
- Status

### Design

- Colors (primary, secondary, text, background, accent, gradient)
- Position (bottom-right, bottom-left, top-right, top-left)
- Theme (light/dark)
- Border radius
- Shadow
- Font family
- Animation
- Launcher (size, shape, gradient, pulse animation)

### Features

- Chat (enabled, greeting, team name, agent name, etc.)
- Book Demo (enabled, title, description, Calendly URL, etc.)
- Call Me (enabled, mode, response type, qualification options, team members, messages, etc.)

### Content

- Greeting
- Tagline
- Labels
- Quick responses

### Chat Config

- Offline message
- Input placeholder
- AI settings
- Team settings
- Visitor fields
- File attachments
- UI settings

## Widget ID Resolution

The widget uses the following sources to determine the widget ID, in order of priority:

1. `window.widgetConfig.id`
2. `data-widget-id` attribute on the script tag
3. `widgetId` parameter in the script URL
4. `widgetId` parameter in the page URL

## API

The widget exposes a global API that can be used to interact with the widget programmatically:

```javascript
// Open the widget
window.__ADEALO_WIDGET_INSTANCE.open();

// Close the widget
window.__ADEALO_WIDGET_INSTANCE.close();

// Show a specific screen
window.__ADEALO_WIDGET_INSTANCE.showScreen('home'); // 'home', 'support', 'book-demo', 'call-me'
```

## Troubleshooting

### Widget Not Loading

If the widget is not loading, check the following:

1. Make sure the widget ID is correct.
2. Check the browser console for any error messages.
3. Verify that the widget files are deployed correctly.
4. Ensure that the widget configuration exists in Firestore.

### Widget Not Displaying Correctly

If the widget is not displaying correctly, check the following:

1. Make sure the widget container is not being hidden by other elements.
2. Check if there are any CSS conflicts with the widget styles.
3. Verify that the widget configuration has the correct design settings.

### Widget Not Functioning Correctly

If the widget is not functioning correctly, check the following:

1. Check the browser console for any error messages.
2. Verify that the widget configuration has the correct feature settings.
3. Ensure that the required APIs (e.g., Calendly) are properly configured.

## Conclusion

The Multi Widget provides a modern, user-friendly chat interface for your website. It's easy to install, customize, and use, and it offers a range of features to enhance user engagement and support.

For any questions or issues, please contact the development team.
