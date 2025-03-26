# Enhanced Widget Configuration

This document provides information about the enhanced widget configuration system.

## Overview

The enhanced widget configuration system extends the standard widget configuration with additional features and customization options. It supports:

- Gradient colors
- Custom shadows
- Animation effects
- Multiple launcher shapes
- Pulse animation
- Media (image/video) support
- Advanced theming options

## Configuration Structure

The enhanced widget configuration follows this structure:

```typescript
interface EnhancedWidgetConfig {
  base: EnhancedWidgetBaseConfig;
  design: EnhancedWidgetDesignConfig;
  features: EnhancedWidgetFeaturesConfig;
  content: EnhancedWidgetContentConfig;
  stats: EnhancedWidgetStats;
  chatConfig: EnhancedChatConfig;
  type: 'MultiWidget';
}
```

### Design Configuration

The design configuration includes:

- Colors (primary, secondary, text, background, accent, gradient)
- Position (bottom-right, bottom-left, top-right, top-left)
- Theme (light, dark, custom)
- Border radius
- Shadow (predefined or custom)
- Font family
- Animation (type, duration, easing)
- Launcher (size, shape, gradient, pulse animation)
- Media (optional image or video)

### Features Configuration

The features configuration includes:

- Chat (enabled, greeting, team name, agent name, etc.)
- Book Demo (enabled, calendly URL, title, description, etc.)
- Call Me (enabled, mode, response type, qualification options, etc.)

## Firebase Functions

The Firebase Functions are set up to handle the enhanced widget configuration:

- `getWidgetConfig`: Gets a widget configuration via Firebase Functions
- `getWidgetConfigHttp`: Gets a widget configuration via HTTP
- `trackWidgetInteractionHttp`: Tracks widget interactions
- `widget`: Serves the widget script based on the configuration

## Testing

To test the enhanced widget configuration:

1. Create an enhanced widget configuration:
   ```
   ./run-enhanced-widget-config.sh
   ```

2. Test the widget:
   ```
   ./run-enhanced-widget-test.sh
   ```

3. Enter the widget ID in the test page.

## Updating Firebase Functions

To update the Firebase Functions to ensure they fully support the enhanced widget configuration:

```
./update-widget-functions.sh
```

This will deploy the widget configuration functions to Firebase.

## Implementation Details

The enhanced widget configuration is implemented in the following files:

- `src/types/widget/enhanced-config.types.ts`: Defines the structure of the enhanced widget configuration
- `functions/src/widget-config.ts`: Contains the Firebase Functions for the widget configuration system
- `functions/src/services/widget/configManager.ts`: Manages the widget configuration in Firestore
- `public/widget.js`: Vanilla JavaScript implementation of the widget
- `public/widget-loader.js`: Loads the widget based on the configuration
