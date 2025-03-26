import React, { useEffect, useRef } from 'react';
import { WidgetConfig } from '../../types/widget/config.types';
import { EnhancedWidgetConfig } from '../../types/widget/enhanced-config.types';

interface WidgetPreviewProps {
  config: WidgetConfig | EnhancedWidgetConfig;
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
