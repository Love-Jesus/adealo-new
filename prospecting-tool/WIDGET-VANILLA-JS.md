# Vanilla JavaScript Widget Implementation

This document describes the new vanilla JavaScript implementation of the Adealo widget system. The new implementation replaces the React-based approach with a pure JavaScript solution, making it more lightweight and easier to integrate.

## Overview

The widget system consists of the following components:

1. **Widget Script (`widget.js`)**: The main script that creates and renders the widget based on the configuration.
2. **Widget Loader Script (`widget-loader.js`)**: A script that loads the widget configuration from the server and initializes the widget.
3. **Widget Configuration API**: A Firebase Function that serves the widget configuration.
4. **Widget Preview Component**: A React component used in the widget editor to preview the widget.

## Widget Script (`widget.js`)

The widget script is responsible for creating and rendering the widget based on the configuration. It uses vanilla JavaScript to create DOM elements and apply styles.

Key features:
- Creates a container for the widget
- Creates a launcher button with customizable appearance
- Creates the widget content with multiple features (chat, book demo, call me)
- Handles interactions and tracks them

## Widget Loader Script (`widget-loader.js`)

The widget loader script is responsible for loading the widget configuration from the server and initializing the widget. It can be included in any HTML page to add the widget.

Key features:
- Gets the widget ID from the script URL
- Fetches the widget configuration from the server
- Caches the configuration for better performance
- Loads the widget script and initializes it with the configuration

## Widget Configuration API

The widget configuration API is a Firebase Function that serves the widget configuration. It is used by the widget loader script to get the configuration for a specific widget.

Key features:
- Serves the widget configuration for a specific widget ID
- Tracks widget views and interactions
- Generates the widget script based on the configuration

## Widget Preview Component

The widget preview component is a React component used in the widget editor to preview the widget. It creates an iframe and loads the widget script with the current configuration.

Key features:
- Creates an iframe to isolate the widget from the editor
- Loads the widget script with the current configuration
- Updates the preview when the configuration changes

## How to Use

### Adding the Widget to a Website

To add the widget to a website, include the widget loader script with the widget ID:

```html
<script src="https://adealo-ce238.web.app/widget-loader.js?widgetId=YOUR_WIDGET_ID"></script>
```

Replace `YOUR_WIDGET_ID` with the actual widget ID.

### Testing the Widget

You can test the widget using the provided test pages:

1. **Test Widget Page**: A page that allows you to test the widget with a specific widget ID.
   ```
   ./run-test-widget.sh
   ```

2. **Enhanced Widget Test Page**: A page that tests the enhanced widget functionality with a direct configuration.
   ```
   ./run-enhanced-widget-test.sh
   ```

### Customizing the Widget

The widget can be customized using the widget editor in the Adealo dashboard. The editor allows you to customize the appearance, content, and behavior of the widget.

## Implementation Details

### Vanilla JavaScript Approach

The new implementation uses vanilla JavaScript to create and manipulate DOM elements. This approach has several advantages:

1. **Lightweight**: The widget script is smaller and loads faster.
2. **No Dependencies**: The widget doesn't depend on external libraries like React.
3. **Better Performance**: The widget renders faster and uses less memory.
4. **Easier Integration**: The widget can be easily integrated into any website.

### Enhanced Widget Configuration

The enhanced widget configuration provides more customization options:

1. **Gradient Colors**: The widget can use gradient colors for the launcher and header.
2. **Custom Shadows**: The widget can have custom shadows with configurable offset, blur, and color.
3. **Animation Effects**: The widget can have animation effects when opening and closing.
4. **Multiple Features**: The widget can have multiple features (chat, book demo, call me).

## Testing

To test the widget, you can use the provided test pages:

1. **Test Widget Page**: A page that allows you to test the widget with a specific widget ID.
   ```
   ./run-test-widget.sh
   ```

2. **Enhanced Widget Test Page**: A page that tests the enhanced widget functionality with a direct configuration.
   ```
   ./run-enhanced-widget-test.sh
   ```

## Deployment

To deploy the widget, you need to deploy the Firebase Functions and hosting:

```
./deploy-widget.sh
```

This will deploy the widget script, loader script, and configuration API to Firebase.
