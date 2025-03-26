#!/bin/bash

# Script to update widget editor components to work with the vanilla JavaScript approach
# This script should be run from the project root directory

echo "Creating a backup directory for widget editor components..."
BACKUP_DIR="src/components/widget-editor/backup-$(date +"%Y-%m-%d_%H-%M-%S")"
mkdir -p "$BACKUP_DIR"

echo "Backing up widget editor components..."

# Backup widget editor components
cp src/components/widget-editor/design-tab.tsx "$BACKUP_DIR/" 2>/dev/null || true
cp src/components/widget-editor/behavior-tab.tsx "$BACKUP_DIR/" 2>/dev/null || true
cp src/components/widget-editor/content-tab.tsx "$BACKUP_DIR/" 2>/dev/null || true
cp src/components/widget-editor/integration-tab.tsx "$BACKUP_DIR/" 2>/dev/null || true
cp src/components/widget-editor/widget-preview.tsx "$BACKUP_DIR/" 2>/dev/null || true

echo "Components have been backed up to $BACKUP_DIR"

echo "Creating a README file in the backup directory..."
cat > "$BACKUP_DIR/README.md" << 'EOF'
# Backup of Widget Editor Components

These widget editor components were backed up before updating them to work with the vanilla JavaScript widget approach.

They are kept here for reference in case they need to be consulted or restored.

## Components

- **design-tab.tsx**: Design tab component
- **behavior-tab.tsx**: Behavior tab component
- **content-tab.tsx**: Content tab component
- **integration-tab.tsx**: Integration tab component
- **widget-preview.tsx**: Widget preview component

## Restoration

If you need to restore these components, you can copy them back to their original locations.
EOF

echo "Creating a new widget-preview.tsx file that works with the vanilla JavaScript approach..."

# Create a new widget-preview.tsx file
cat > src/components/widget-editor/widget-preview.tsx << 'EOF'
import React, { useEffect, useRef } from 'react';
import { WidgetConfig } from '../../types/widget/config.types';

interface WidgetPreviewProps {
  config: WidgetConfig;
  scale?: number;
}

export function WidgetPreview({ config, scale = 1 }: WidgetPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!containerRef.current || !iframeRef.current) return;

    // Set up the iframe
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Write the basic HTML structure
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Widget Preview</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              overflow: hidden;
              height: 100vh;
              width: 100vw;
              background-color: #f5f5f5;
            }
            .preview-container {
              transform: scale(${scale});
              transform-origin: bottom right;
              position: absolute;
              bottom: 20px;
              right: 20px;
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <div class="preview-container" id="preview-container"></div>
          <script>
            // Store the widget config
            window.widgetConfig = ${JSON.stringify(config)};
          </script>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Add the widget script
    const script = iframeDoc.createElement('script');
    script.src = '/widget.js';
    script.async = true;
    iframeDoc.body.appendChild(script);

    // Clean up
    return () => {
      if (iframeDoc) {
        const widgetContainer = iframeDoc.getElementById('adealo-widget-container');
        if (widgetContainer) {
          widgetContainer.remove();
        }
      }
    };
  }, [config, scale]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '500px', 
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5'
      }}
    >
      <iframe 
        ref={iframeRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none' 
        }}
        title="Widget Preview"
      />
    </div>
  );
}
EOF

echo "Creating a README file with instructions for updating the other widget editor components..."

# Create a README file with instructions
cat > src/components/widget-editor/UPDATE-INSTRUCTIONS.md << 'EOF'
# Widget Editor Update Instructions

The widget editor components need to be updated to work with the vanilla JavaScript widget approach. This file provides instructions for updating each component.

## General Changes

1. Remove any imports from the React widget components that were moved to the backup directory.
2. Update any references to those components to use the new vanilla JavaScript approach.
3. Update any widget configuration handling to match the new configuration format.

## Specific Components

### design-tab.tsx

- Update to use the new widget configuration format
- Remove any references to React widget components
- Ensure all design changes are properly reflected in the preview

### behavior-tab.tsx

- Update to use the new widget configuration format
- Remove any references to React widget components
- Ensure all behavior changes are properly reflected in the preview

### content-tab.tsx

- Update to use the new widget configuration format
- Remove any references to React widget components
- Ensure all content changes are properly reflected in the preview

### integration-tab.tsx

- Update to use the new widget configuration format
- Remove any references to React widget components
- Ensure all integration changes are properly reflected in the preview

## Testing

After updating each component, test it thoroughly to ensure it works correctly with the vanilla JavaScript widget approach.

1. Make changes in the widget editor
2. Verify that the changes are reflected in the preview
3. Test the generated widget configuration with the vanilla JavaScript widget
EOF

echo "Done! The widget-preview.tsx file has been updated to work with the vanilla JavaScript approach."
echo "Please follow the instructions in src/components/widget-editor/UPDATE-INSTRUCTIONS.md to update the other widget editor components."
