/**
 * Widget Configuration Functions
 * 
 * This module provides Firebase Functions for the widget configuration system.
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors = require('cors');
import { configManager } from './services/widget/configManager';
import { createLogger } from './utils/logger';

// Create a logger for this module
const logger = createLogger('WidgetConfig');

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

/**
 * Get a widget configuration
 * 
 * This function returns the configuration for a specific widget.
 * 
 * @param widgetId The widget ID
 * @returns The widget configuration
 */
export const getWidgetConfig = functions.https.onCall(async (data, context) => {
  try {
    const widgetId = data.widgetId;
    
    if (!widgetId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with a widgetId.'
      );
    }
    
    const config = await configManager.getConfig(widgetId);
    
    if (!config) {
      throw new functions.https.HttpsError(
        'not-found',
        'Widget configuration not found.'
      );
    }
    
    return config;
  } catch (error: any) {
    logger.error('Error getting widget configuration:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error retrieving widget configuration.'
    );
  }
});

/**
 * Get a widget configuration via HTTP
 * 
 * This function returns the configuration for a specific widget via HTTP.
 * 
 * @param widgetId The widget ID (query parameter)
 * @returns The widget configuration
 */
// @ts-expect-error: TypeScript may show an error for onRequest, but it exists at runtime
export const getWidgetConfigHttp = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      logger.info('getWidgetConfigHttp called with request:', {
        method: req.method,
        url: req.url,
        query: req.query,
        headers: req.headers,
        emulator: process.env.FUNCTIONS_EMULATOR ? 'true' : 'false'
      });
      
      const widgetId = req.query.widgetId as string;
      
      if (!widgetId) {
        logger.warn('getWidgetConfigHttp called without widgetId');
        res.status(400).json({ error: 'widgetId is required' });
        return;
      }
      
      logger.info(`Getting widget configuration for widgetId: ${widgetId}`);
      
      // Check if Firestore is initialized
      try {
        admin.firestore();
      } catch (initError) {
        logger.error('Firebase Admin SDK not initialized', initError);
        res.status(500).json({ error: 'Firebase Admin SDK not initialized' });
        return;
      }
      
      const config = await configManager.getConfig(widgetId);
      
      if (!config) {
        logger.warn(`Widget configuration not found for widgetId: ${widgetId}`);
        res.status(404).json({ error: 'Widget configuration not found' });
        return;
      }
      
      logger.info(`Widget configuration found for widgetId: ${widgetId}`);
      
      // Track the widget view
      try {
        await admin.firestore().collection('widgets').doc(widgetId).update({
          // @ts-expect-error: TypeScript may show an error for increment, but it exists at runtime
          'stats.views': admin.firestore.FieldValue.increment(1),
          'stats.lastUpdated': admin.firestore.FieldValue.serverTimestamp()
        });
        logger.debug(`Widget stats updated for widgetId: ${widgetId}`);
      } catch (error) {
        logger.error('Error updating widget stats:', error);
      }
      
      // Set CORS headers
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      
      res.status(200).json(config);
      logger.info(`Widget configuration sent for widgetId: ${widgetId}`);
    } catch (error: any) {
      logger.error('Error getting widget configuration:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message || 'Unknown error' 
      });
    }
  });
});

/**
 * Track widget interaction
 * 
 * This function tracks interactions with the widget.
 * 
 * @param widgetId The widget ID
 * @param eventType The type of event
 * @param data Additional data about the event
 * @param timestamp The timestamp of the event
 * @param url The URL of the page where the event occurred
 * @param referrer The referrer URL
 * @param userAgent The user agent of the browser
 */
// @ts-expect-error: TypeScript may show an error for onRequest, but it exists at runtime
export const trackWidgetInteractionHttp = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { widgetId, eventType, data, timestamp, url, referrer, userAgent } = req.body;
      
      if (!widgetId || !eventType) {
        res.status(400).json({ error: 'widgetId and eventType are required' });
        return;
      }
      
      // Create a new interaction document
      await admin.firestore().collection('widget-interactions').add({
        widgetId,
        eventType,
        data: data || {},
        timestamp: timestamp ? new Date(timestamp) : admin.firestore.FieldValue.serverTimestamp(),
        url: url || '',
        referrer: referrer || '',
        userAgent: userAgent || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update the widget stats
      try {
        await admin.firestore().collection('widgets').doc(widgetId).update({
          // @ts-expect-error: TypeScript may show an error for increment, but it exists at runtime
          'stats.interactions': admin.firestore.FieldValue.increment(1),
          'stats.lastUpdated': admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        logger.error('Error updating widget stats:', error);
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error tracking widget interaction:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

/**
 * Enhanced Widget Script
 * 
 * This function serves the widget script that initializes the widget based on the configuration.
 * It automatically determines what features to show based on the configuration.
 * 
 * @param widgetId The widget ID (query parameter)
 */
// @ts-expect-error: TypeScript may show an error for onRequest, but it exists at runtime
export const widget = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const widgetId = req.query.widgetId as string;
      
      if (!widgetId) {
        res.status(400).send('widgetId is required');
        return;
      }
      
      const config = await configManager.getConfig(widgetId);
      
      if (!config) {
        res.status(404).send('Widget configuration not found');
        return;
      }
      
      logger.info(`Generating enhanced widget script for widget ID: ${widgetId}`);
      
      // Generate the widget script based on the configuration
      const script = generateEnhancedWidgetScript(widgetId, config);
      
      // Set content type to JavaScript
      res.set('Content-Type', 'application/javascript');
      res.status(200).send(script);
    } catch (error) {
      logger.error('Error serving widget script:', error);
      res.status(500).send('Internal server error');
    }
  });
});

/**
 * Generates the enhanced widget script based on the configuration
 * 
 * @param widgetId The widget ID
 * @param config The widget configuration
 * @returns The widget script
 */
function generateEnhancedWidgetScript(widgetId: string, config: any): string {
  // Create a simplified version of the widget configuration to pass to the client
  const clientConfig = {
    id: widgetId,
    type: "MultiWidget",
    base: config.base,
    design: config.design,
    features: config.features,
    content: config.content,
    chatConfig: config.chatConfig
  };

  // Return a complete widget script that handles all features
  return `
    (function() {
      // Widget configuration
      const widgetConfig = ${JSON.stringify(clientConfig)};
      
      console.log('Initializing enhanced widget with ID:', widgetConfig.id);
      
      // Create widget container
      const container = document.createElement('div');
      container.id = 'adealo-widget-' + widgetConfig.id;
      container.style.position = 'fixed';
      
      // Set position based on configuration
      switch (widgetConfig.design.position) {
        case 'bottom-right':
          container.style.bottom = '20px';
          container.style.right = '20px';
          break;
        case 'bottom-left':
          container.style.bottom = '20px';
          container.style.left = '20px';
          break;
        case 'top-right':
          container.style.top = '20px';
          container.style.right = '20px';
          break;
        case 'top-left':
          container.style.top = '20px';
          container.style.left = '20px';
          break;
        default:
          container.style.bottom = '20px';
          container.style.right = '20px';
      }
      
      container.style.zIndex = '9999';
      document.body.appendChild(container);
      
      // Create launcher button
      const button = document.createElement('button');
      button.id = 'adealo-widget-button-' + widgetConfig.id;
      
      // Apply launcher configuration
      const launcherSize = widgetConfig.design.launcher?.size || 60;
      button.style.width = launcherSize + 'px';
      button.style.height = launcherSize + 'px';
      
      // Apply shape configuration
      if (widgetConfig.design.launcher?.shape === 'rounded-square') {
        button.style.borderRadius = (widgetConfig.design.borderRadius || 8) + 'px';
      } else {
        button.style.borderRadius = '50%';
      }
      
      // Apply color configuration
      if (widgetConfig.design.launcher?.useGradient && widgetConfig.design.colors.gradient) {
        const gradient = widgetConfig.design.colors.gradient;
        if (gradient.type === 'linear') {
          button.style.background = 'linear-gradient(' + (gradient.direction || '135deg') + ', ' + gradient.colors.join(', ') + ')';
        } else {
          button.style.background = 'radial-gradient(circle, ' + gradient.colors.join(', ') + ')';
        }
      } else {
        button.style.backgroundColor = widgetConfig.design.colors.primary;
      }
      
      button.style.color = '#ffffff';
      button.style.border = 'none';
      
      // Apply shadow configuration
      if (typeof widgetConfig.design.shadow === 'object') {
        const shadow = widgetConfig.design.shadow;
        button.style.boxShadow = \`\${shadow.x}px \${shadow.y}px \${shadow.blur}px \${shadow.spread}px \${shadow.color}\`;
      } else if (widgetConfig.design.shadow === 'sm') {
        button.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
      } else if (widgetConfig.design.shadow === 'md') {
        button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      } else if (widgetConfig.design.shadow === 'lg') {
        button.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
      } else if (widgetConfig.design.shadow === 'xl') {
        button.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.15)';
      } else {
        button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      }
      
      button.style.cursor = 'pointer';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.transition = 'all 0.3s ease';
      
      // Add chat icon
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      
      // Add pulse animation if enabled
      if (widgetConfig.design.launcher?.pulseAnimation) {
        const keyframes = \`
          @keyframes pulse-animation-\${widgetConfig.id} {
            0% {
              box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(var(--pulse-color), 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0);
            }
          }
        \`;
        
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        
        // Extract RGB values from primary color for pulse animation
        let primaryColor = widgetConfig.design.colors.primary;
        if (primaryColor.startsWith('#')) {
          const r = parseInt(primaryColor.slice(1, 3), 16);
          const g = parseInt(primaryColor.slice(3, 5), 16);
          const b = parseInt(primaryColor.slice(5, 7), 16);
          button.style.setProperty('--pulse-color', \`\${r}, \${g}, \${b}\`);
        } else {
          button.style.setProperty('--pulse-color', '110, 142, 251'); // Default blue color
        }
        
        button.style.animation = \`pulse-animation-\${widgetConfig.id} 2s infinite\`;
      }
      
      // Create widget content
      const content = document.createElement('div');
      content.id = 'adealo-widget-content-' + widgetConfig.id;
      content.style.display = 'none';
      content.style.width = '320px';
      content.style.height = '400px';
      content.style.backgroundColor = widgetConfig.design.theme === 'dark' ? '#1a1a1a' : '#ffffff';
      content.style.color = widgetConfig.design.theme === 'dark' ? '#ffffff' : '#1a1a1a';
      content.style.borderRadius = (widgetConfig.design.borderRadius || 8) + 'px';
      content.style.overflow = 'hidden';
      content.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      content.style.fontFamily = widgetConfig.design.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      content.style.display = 'none';
      content.style.flexDirection = 'column';
      content.style.position = 'absolute';
      
      // Position the content based on the launcher position
      switch (widgetConfig.design.position) {
        case 'bottom-right':
          content.style.bottom = launcherSize + 10 + 'px';
          content.style.right = '0';
          break;
        case 'bottom-left':
          content.style.bottom = launcherSize + 10 + 'px';
          content.style.left = '0';
          break;
        case 'top-right':
          content.style.top = launcherSize + 10 + 'px';
          content.style.right = '0';
          break;
        case 'top-left':
          content.style.top = launcherSize + 10 + 'px';
          content.style.left = '0';
          break;
        default:
          content.style.bottom = launcherSize + 10 + 'px';
          content.style.right = '0';
      }
      
      // Create header
      const header = document.createElement('div');
      header.style.background = widgetConfig.design.launcher?.useGradient && widgetConfig.design.colors.gradient
        ? (widgetConfig.design.colors.gradient.type === 'linear'
            ? \`linear-gradient(\${widgetConfig.design.colors.gradient.direction || '135deg'}, \${widgetConfig.design.colors.gradient.colors.join(', ')})\`
            : \`radial-gradient(circle, \${widgetConfig.design.colors.gradient.colors.join(', ')})\`)
        : widgetConfig.design.colors.primary;
      header.style.color = '#ffffff';
      header.style.padding = '16px';
      header.style.position = 'relative';
      header.style.flexShrink = '0';
      
      const title = document.createElement('h3');
      title.style.margin = '0 0 8px 0';
      title.style.fontSize = '18px';
      title.style.fontWeight = '600';
      title.textContent = widgetConfig.content.greeting || 'Hello!';
      
      const description = document.createElement('p');
      description.style.margin = '0';
      description.style.fontSize = '14px';
      description.style.opacity = '0.9';
      description.textContent = widgetConfig.content.tagline || 'How can we help?';
      
      const closeButton = document.createElement('button');
      closeButton.style.position = 'absolute';
      closeButton.style.top = '12px';
      closeButton.style.right = '12px';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.color = 'inherit';
      closeButton.style.cursor = 'pointer';
      closeButton.style.opacity = '0.7';
      closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      
      header.appendChild(title);
      header.appendChild(description);
      header.appendChild(closeButton);
      
      // Create body
      const body = document.createElement('div');
      body.style.padding = '16px';
      body.style.flex = '1';
      body.style.overflowY = 'auto';
      
      // Create feature buttons
      const featuresContainer = document.createElement('div');
      featuresContainer.style.display = 'flex';
      featuresContainer.style.flexDirection = 'column';
      featuresContainer.style.gap = '12px';
      
      // Helper function to create feature buttons
      function createFeatureButton(text, icon, onClick) {
        const button = document.createElement('button');
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'space-between';
        button.style.width = '100%';
        button.style.padding = '12px 16px';
        button.style.backgroundColor = widgetConfig.design.theme === 'dark' ? '#333333' : '#f5f5f5';
        button.style.color = widgetConfig.design.theme === 'dark' ? '#ffffff' : '#333333';
        button.style.border = 'none';
        button.style.borderRadius = '8px';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.2s ease';
        button.style.fontFamily = 'inherit';
        button.style.fontSize = '14px';
        button.style.fontWeight = '500';
        button.style.textAlign = 'left';
        
        button.innerHTML = \`
          <span style="display: flex; align-items: center; gap: 8px;">
            <span style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background-color: \${widgetConfig.design.colors.primary}; color: white;">
              \${icon}
            </span>
            \${text}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        \`;
        
        button.addEventListener('mouseover', function() {
          this.style.backgroundColor = widgetConfig.design.theme === 'dark' ? '#444444' : '#e5e5e5';
        });
        
        button.addEventListener('mouseout', function() {
          this.style.backgroundColor = widgetConfig.design.theme === 'dark' ? '#333333' : '#f5f5f5';
        });
        
        button.addEventListener('click', onClick);
        
        return button;
      }
      
      // Chat feature
      if (widgetConfig.features.chat && widgetConfig.features.chat.enabled) {
        const chatButton = createFeatureButton(
          widgetConfig.content.labels?.chat || 'Chat with us',
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
          function() {
            showChatInterface(body);
            trackInteraction('chat_open');
          }
        );
        featuresContainer.appendChild(chatButton);
      }
      
      // Book demo feature
      if (widgetConfig.features.bookDemo && widgetConfig.features.bookDemo.enabled) {
        const bookDemoButton = createFeatureButton(
          widgetConfig.content.labels?.bookDemo || 'Book a demo',
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
          function() {
            showBookDemoInterface(body);
            trackInteraction('book_demo_open');
          }
        );
        featuresContainer.appendChild(bookDemoButton);
      }
      
      // Call me feature
      if (widgetConfig.features.callMe && widgetConfig.features.callMe.enabled) {
        const callMeButton = createFeatureButton(
          widgetConfig.content.labels?.callMe || 'Request a call',
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
          function() {
            showCallMeInterface(body);
            trackInteraction('call_me_open');
          }
        );
        featuresContainer.appendChild(callMeButton);
      }
      
      body.appendChild(featuresContainer);
      
      // Add powered by
      const poweredBy = document.createElement('div');
      poweredBy.style.textAlign = 'center';
      poweredBy.style.fontSize = '11px';
      poweredBy.style.opacity = '0.5';
      poweredBy.style.padding = '8px 16px';
      poweredBy.textContent = 'Powered by Adealo';
      
      content.appendChild(header);
      content.appendChild(body);
      content.appendChild(poweredBy);
      container.appendChild(content);
      
      // Show chat interface
      function showChatInterface(container) {
        // Clear container
        container.innerHTML = '';
        
        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.style.display = 'flex';
        chatContainer.style.flexDirection = 'column';
        chatContainer.style.height = '100%';
        
        // Create chat messages container
        const messagesContainer = document.createElement('div');
        messagesContainer.style.flex = '1';
        messagesContainer.style.overflowY = 'auto';
        messagesContainer.style.padding = '8px 0';
        
        // Add welcome message
        const welcomeMessage = document.createElement('div');
        welcomeMessage.style.display = 'flex';
        welcomeMessage.style.marginBottom = '12px';
        
        const agentAvatar = document.createElement('div');
        agentAvatar.style.width = '32px';
        agentAvatar.style.height = '32px';
        agentAvatar.style.borderRadius = '50%';
        agentAvatar.style.backgroundColor = widgetConfig.design.colors.primary;
        agentAvatar.style.color = '#ffffff';
        agentAvatar.style.display = 'flex';
        agentAvatar.style.alignItems = 'center';
        agentAvatar.style.justifyContent = 'center';
        agentAvatar.style.marginRight = '8px';
        agentAvatar.style.flexShrink = '0';
        agentAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
        
        const messageContent = document.createElement('div');
        
        const agentName = document.createElement('div');
        agentName.style.fontWeight = '600';
        agentName.style.fontSize = '13px';
        agentName.style.marginBottom = '4px';
        agentName.textContent = widgetConfig.features.chat?.agentName || 'Support';
        
        const messageText = document.createElement('div');
        messageText.style.padding = '8px 12px';
        messageText.style.backgroundColor = widgetConfig.design.theme === 'dark' ? '#333333' : '#f0f0f0';
        messageText.style.borderRadius = '0 8px 8px 8px';
        messageText.style.fontSize = '14px';
        messageText.textContent = widgetConfig.features.chat?.greeting || 'Hi there! 👋 How can I help you today?';
        
        messageContent.appendChild(agentName);
        messageContent.appendChild(messageText);
        
        welcomeMessage.appendChild(agentAvatar);
        welcomeMessage.appendChild(messageContent);
        
        messagesContainer.appendChild(welcomeMessage);
        
        // Create chat input
        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex';
        inputContainer.style.alignItems = 'center';
        inputContainer.style.padding = '8px 0';
        inputContainer.style.borderTop = widgetConfig.design.theme === 'dark' ? '1px solid #333333' : '1px solid #e0e0e0';
        
        const chatInput = document.createElement('input');
        chatInput.type = 'text';
        chatInput.placeholder = widgetConfig.chatConfig?.inputPlaceholder || 'Type your message...';
        chatInput.style.flex = '1';
        chatInput.style.padding = '10px 12px';
        chatInput.style.border = 'none';
        chatInput.style.borderRadius = '4px';
        chatInput.style.backgroundColor = widgetConfig.design.theme === 'dark' ? '#333333' : '#f5f5f5';
        chatInput.style.color = widgetConfig.design.theme === 'dark' ? '#ffffff' : '#333333';
        chatInput.style.fontSize = '14px';
        chatInput.style.outline = 'none';
        
        const sendButton = document.createElement('button');
        sendButton.style.display = 'flex';
        sendButton.style.alignItems = 'center';
        sendButton.style.justifyContent = 'center';
        sendButton.style.width = '36px';
        sendButton.style.height = '36px';
        sendButton.style.marginLeft = '8px';
        sendButton.style.backgroundColor = widgetConfig.design.colors.primary;
        sendButton.style.color = '#ffffff';
        sendButton.style.border = 'none';
        sendButton.style.borderRadius = '4px';
        sendButton.style.cursor = 'pointer';
        sendButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
        
        // Add send message functionality
        function sendMessage() {
          const message = chatInput.value.trim();
          if (message) {
            // Create user message
            const userMessageElement = document.createElement('div');
            userMessageElement.style.display = 'flex';
            userMessageElement.style.flexDirection = 'row-reverse';
            userMessageElement.style.marginBottom = '12px';
            
            const userMessageContent = document.createElement('div');
            userMessageContent.style.maxWidth = '80%';
            
            const userMessageText = document.createElement('div');
            userMessageText.style.padding = '8px 12px';
            userMessageText.style.backgroundColor = widgetConfig.design.colors.primary;
            userMessageText.style.color = '#ffffff';
            userMessageText.style.borderRadius = '8px 0 8px 8px';
            userMessageText.style.fontSize = '14px';
            userMessageText.textContent = message;
            
            userMessageContent.appendChild(userMessageText);
            userMessageElement.appendChild(userMessageContent);
            messagesContainer.appendChild(userMessageElement);
            
            // Clear input
            chatInput.value = '';
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Track interaction
            trackInteraction('chat_message_sent', { message });
          }
        }
        
        // Add event listeners
        chatInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            sendMessage();
          }
        });
        
        sendButton.addEventListener('click', sendMessage);
        
        inputContainer.appendChild(chatInput);
        inputContainer.appendChild(sendButton);
        
        chatContainer.appendChild(messagesContainer);
        chatContainer.appendChild(inputContainer);
        
        container.appendChild(chatContainer);
      }
      
      // Show book demo interface
      function showBookDemoInterface(container) {
        // Clear container
        container.innerHTML = '';
        
        // Create form
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '12px';
        
        // Add name field
        const nameField = document.createElement('input');
        nameField.type = 'text';
        nameField.placeholder = 'Your name';
        nameField.style.padding = '10px 12px';
        nameField.style.border = '1px solid #e0e0e0';
        nameField.style.borderRadius = '4px';
        nameField.style.fontSize = '14px';
        nameField.style.outline = 'none';
        
        // Add email field
        const emailField = document.createElement('input');
        emailField.type = 'email';
        emailField.placeholder = 'Your email';
        emailField.style.padding = '10px 12px';
        emailField.style.border = '1px solid #e0e0e0';
        emailField.style.borderRadius = '4px';
        emailField.style.fontSize = '14px';
        emailField.style.outline = 'none';
        
        // Add date field
        const dateField = document.createElement('input');
        dateField.type = 'date';
        dateField.style.padding = '10px 12px';
        dateField.style.border = '1px solid #e0e0e0';
        dateField.style.borderRadius = '4px';
        dateField.style.fontSize = '14px';
        dateField.style.outline = 'none';
        
        // Add submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Book Demo';
        submitButton.style.padding = '12px 16px';
        submitButton.style.backgroundColor = widgetConfig.design.colors.primary;
        submitButton.style.color = '#ffffff';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '4px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.fontSize = '14px';
        submitButton.style.fontWeight = '500';
        
        // Add form submission handler
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const name = nameField.value.trim();
          const email = emailField.value.trim();
          const date = dateField.value;
          
          if (name && email && date) {
            // Track interaction
            trackInteraction('book_demo_submitted', { name, email, date });
            
            // Show success message
            container.innerHTML = '';
            const successMessage = document.createElement('div');
            successMessage.style.display = 'flex';
            successMessage.style.flexDirection = 'column';
            successMessage.style.alignItems = 'center';
            successMessage.style.justifyContent = 'center';
            successMessage.style.height = '100%';
            successMessage.style.textAlign = 'center';
            
            const successIcon = document.createElement('div');
            successIcon.style.width = '48px';
            successIcon.style.height = '48px';
            successIcon.style.borderRadius = '50%';
            successIcon.style.backgroundColor = widgetConfig.design.colors.primary;
            successIcon.style.color = '#ffffff';
            successIcon.style.display = 'flex';
            successIcon.style.alignItems = 'center';
            successIcon.style.justifyContent = 'center';
            successIcon.style.marginBottom = '16px';
            successIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            
            const successText = document.createElement('div');
            successText.style.fontSize = '16px';
            successText.style.fontWeight = '500';
            successText.textContent = 'Demo booked successfully!';
            
            successMessage.appendChild(successIcon);
            successMessage.appendChild(successText);
            container.appendChild(successMessage);
          }
        });
        
        form.appendChild(nameField);
        form.appendChild(emailField);
        form.appendChild(dateField);
        form.appendChild(submitButton);
        
        container.appendChild(form);
      }
      
      // Show call me interface
      function showCallMeInterface(container) {
        // Clear container
        container.innerHTML = '';
        
        // Create form
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '12px';
        
        // Add name field
        const nameField = document.createElement('input');
        nameField.type = 'text';
        nameField.placeholder = 'Your name';
        nameField.style.padding = '10px 12px';
        nameField.style.border = '1px solid #e0e0e0';
        nameField.style.borderRadius = '4px';
        nameField.style.fontSize = '14px';
        nameField.style.outline = 'none';
        
        // Add phone field
        const phoneField = document.createElement('input');
        phoneField.type = 'tel';
        phoneField.placeholder = 'Your phone number';
        phoneField.style.padding = '10px 12px';
        phoneField.style.border = '1px solid #e0e0e0';
        phoneField.style.borderRadius = '4px';
        phoneField.style.fontSize = '14px';
        phoneField.style.outline = 'none';
        
        // Add submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Request Call';
        submitButton.style.padding = '12px 16px';
        submitButton.style.backgroundColor = widgetConfig.design.colors.primary;
        submitButton.style.color = '#ffffff';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '4px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.fontSize = '14px';
        submitButton.style.fontWeight = '500';
        
        // Add form submission handler
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const name = nameField.value.trim();
          const phone = phoneField.value.trim();
          
          if (name && phone) {
            // Track interaction
            trackInteraction('call_me_submitted', { name, phone });
            
            // Show success message
            container.innerHTML = '';
            const successMessage = document.createElement('div');
            successMessage.style.display = 'flex';
            successMessage.style.flexDirection = 'column';
            successMessage.style.alignItems = 'center';
            successMessage.style.justifyContent = 'center';
            successMessage.style.height = '100%';
            successMessage.style.textAlign = 'center';
            
            const successIcon = document.createElement('div');
            successIcon.style.width = '48px';
            successIcon.style.height = '48px';
            successIcon.style.borderRadius = '50%';
            successIcon.style.backgroundColor = widgetConfig.design.colors.primary;
            successIcon.style.color = '#ffffff';
            successIcon.style.display = 'flex';
            successIcon.style.alignItems = 'center';
            successIcon.style.justifyContent = 'center';
            successIcon.style.marginBottom = '16px';
            successIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            
            const successText = document.createElement('div');
            successText.style.fontSize = '16px';
            successText.style.fontWeight = '500';
            successText.textContent = 'Call request submitted!';
            
            successMessage.appendChild(successIcon);
            successMessage.appendChild(successText);
            container.appendChild(successMessage);
          }
        });
        
        form.appendChild(nameField);
        form.appendChild(phoneField);
        form.appendChild(submitButton);
        
        container.appendChild(form);
      }
      
      // Track interaction
      function trackInteraction(eventType, data = {}) {
        const trackEndpoint = '${process.env.FUNCTIONS_EMULATOR ? 'http://localhost:5001/adealo-ce238/us-central1/trackWidgetInteractionHttp' : 'https://us-central1-adealo-ce238.cloudfunctions.net/trackWidgetInteractionHttp'}';
        
        fetch(trackEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            widgetId: widgetConfig.id,
            eventType,
            data,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent
          })
        }).catch(error => console.error('Error tracking interaction:', error));
      }
      
      // Toggle widget content visibility
      button.addEventListener('click', function() {
        if (content.style.display === 'none') {
          content.style.display = 'flex';
          trackInteraction('widget_opened');
        } else {
          content.style.display = 'none';
          trackInteraction('widget_closed');
        }
      });
      
      // Close widget content
      closeButton.addEventListener('click', function() {
        content.style.display = 'none';
        trackInteraction('widget_closed');
      });
    })();
  `;
}