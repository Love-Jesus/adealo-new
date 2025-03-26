import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';

// Initialize Firebase Admin
try {
  admin.initializeApp();
} catch (error) {
  console.log('Firebase admin already initialized');
}

// Initialize Firestore
const db = admin.firestore();

// Configure CORS with more permissive settings
const corsHandler = cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true, // Allow cookies to be sent with requests
  maxAge: 86400, // 24 hours
  preflightContinue: false
});

/**
 * HTTP endpoint for getting widget script with CORS support
 * This function is called by the widget loader to get the widget script
 */
// @ts-expect-error: TypeScript may show an error for onRequest, but it exists at runtime
export const getWidgetScriptHttp = functions.https.onRequest((req, res) => {
  // Apply CORS middleware
  return corsHandler(req, res, async () => {
    try {
      // Extract data from request
      const data = req.method === 'POST' ? req.body : req.query;
      
      // Get widget ID from data
      const widgetId = data.widgetId;
      
      console.log(`Generating widget script for widget ID: ${widgetId}`);
      
      if (!widgetId) {
        console.error('Widget ID is missing in the request');
        res.status(400).json({ 
          error: {
            code: 'invalid-argument',
            message: 'Widget ID is required'
          }
        });
        return;
      }
      
      // Get widget data from Firestore
      try {
        const widgetDoc = await db.collection('widgets').doc(widgetId).get();
        
        if (!widgetDoc.exists) {
          console.error(`Widget with ID ${widgetId} not found in Firestore`);
          res.status(404).json({
            error: {
              code: 'not-found',
              message: `Widget with ID ${widgetId} not found`
            }
          });
          return;
        }
        
        const widget = widgetDoc.data();
        console.log(`Widget data retrieved:`, JSON.stringify(widget, null, 2));
        
        if (!widget) {
          console.error(`Widget data is null or undefined for ID ${widgetId}`);
          res.status(400).json({
            error: {
              code: 'failed-precondition',
              message: 'Widget data is missing'
            }
          });
          return;
        }
        
        if (widget.status !== 'active') {
          console.error(`Widget with ID ${widgetId} is not active. Status: ${widget.status}`);
          res.status(400).json({
            error: {
              code: 'failed-precondition',
              message: `Widget is not active. Current status: ${widget.status}`
            }
          });
          return;
        }
        
        // Generate the widget script
        try {
          const script = generateWidgetScript(widgetId, widget);
          
          // Increment widget views
          try {
            const widgetRef = db.collection('widgets').doc(widgetId);
            const doc = await widgetRef.get();
            const data = doc.data() || {};
            const stats = data.stats || { views: 0, interactions: 0, leads: 0 };
            
            await widgetRef.update({
              'stats.views': (stats.views || 0) + 1
            });
          } catch (error) {
            console.error(`Error incrementing views for widget ${widgetId}:`, error);
            // Don't throw here, just log the error
          }
          
          // Return the script
          res.set('Content-Type', 'application/javascript');
          res.send(script);
        } catch (error) {
          console.error(`Error generating script for widget ${widgetId}:`, error);
          res.status(500).json({
            error: {
              code: 'internal',
              message: 'Error generating widget script: Script generation failed'
            }
          });
        }
      } catch (error) {
        console.error(`Error retrieving widget ${widgetId} from Firestore:`, error);
        res.status(500).json({
          error: {
            code: 'internal',
            message: 'Error retrieving widget data from database'
          }
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Unhandled error in getWidgetScript:', err);
      res.status(500).json({
        error: {
          code: 'internal',
          message: `Error generating widget script: ${err.message || 'Unknown error'}`
        }
      });
    }
  });
});

/**
 * Generates the widget embed script for a specific widget
 * This function is called by the client to get the widget script
 */
export const getWidgetScript = functions.https.onCall(async (data, context) => {
  try {
    // Get widget ID from data
    const widgetId = data.widgetId;
    
    console.log(`Generating widget script for widget ID: ${widgetId}`);
    
    if (!widgetId) {
      console.error('Widget ID is missing in the request');
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Widget ID is required'
      );
    }
    
    // Get widget data from Firestore
    try {
      const widgetDoc = await db.collection('widgets').doc(widgetId).get();
      
      if (!widgetDoc.exists) {
        console.error(`Widget with ID ${widgetId} not found in Firestore`);
        throw new functions.https.HttpsError(
          'not-found',
          `Widget with ID ${widgetId} not found`
        );
      }
      
      const widget = widgetDoc.data();
      console.log(`Widget data retrieved:`, JSON.stringify(widget, null, 2));
      
      if (!widget) {
        console.error(`Widget data is null or undefined for ID ${widgetId}`);
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Widget data is missing'
        );
      }
      
      if (widget.status !== 'active') {
        console.error(`Widget with ID ${widgetId} is not active. Status: ${widget.status}`);
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Widget is not active. Current status: ${widget.status}`
        );
      }
      
      // Generate the widget script
      try {
        const script = generateWidgetScript(widgetId, widget);
        
        // Increment widget views
        try {
          const widgetRef = db.collection('widgets').doc(widgetId);
          const doc = await widgetRef.get();
          const data = doc.data() || {};
          const stats = data.stats || { views: 0, interactions: 0, leads: 0 };
          
          await widgetRef.update({
            'stats.views': (stats.views || 0) + 1
          });
        } catch (error) {
          console.error(`Error incrementing views for widget ${widgetId}:`, error);
          // Don't throw here, just log the error
        }
        
        return { script };
      } catch (error) {
        console.error(`Error generating script for widget ${widgetId}:`, error);
        throw new functions.https.HttpsError(
          'internal',
          'Error generating widget script: Script generation failed'
        );
      }
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error; // Re-throw HttpsError
      }
      console.error(`Error retrieving widget ${widgetId} from Firestore:`, error);
      throw new functions.https.HttpsError(
        'internal',
        'Error retrieving widget data from database'
      );
    }
  } catch (error: unknown) {
    if (error instanceof functions.https.HttpsError) {
      throw error; // Re-throw HttpsError with specific details
    }
    
    const err = error as Error;
    console.error('Unhandled error in getWidgetScript:', err);
    throw new functions.https.HttpsError(
      'internal',
      `Error generating widget script: ${err.message || 'Unknown error'}`
    );
  }
});

// For backward compatibility, also export as callable function
export const getWidgetScriptCallable = functions.https.onCall(async (data, context) => {
  try {
    // Get widget ID from data
    const widgetId = data.widgetId;
    
    console.log(`Generating widget script for widget ID: ${widgetId}`);
    
    if (!widgetId) {
      console.error('Widget ID is missing in the request');
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Widget ID is required'
      );
    }
    
    // Get widget data from Firestore
    try {
      const widgetDoc = await db.collection('widgets').doc(widgetId).get();
      
      if (!widgetDoc.exists) {
        console.error(`Widget with ID ${widgetId} not found in Firestore`);
        throw new functions.https.HttpsError(
          'not-found',
          `Widget with ID ${widgetId} not found`
        );
      }
      
      const widget = widgetDoc.data();
      console.log(`Widget data retrieved:`, JSON.stringify(widget, null, 2));
      
      if (!widget) {
        console.error(`Widget data is null or undefined for ID ${widgetId}`);
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Widget data is missing'
        );
      }
      
      if (widget.status !== 'active') {
        console.error(`Widget with ID ${widgetId} is not active. Status: ${widget.status}`);
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Widget is not active. Current status: ${widget.status}`
        );
      }
      
      // Generate the widget script
      try {
        const script = generateWidgetScript(widgetId, widget);
        
        // Increment widget views
        try {
          const widgetRef = db.collection('widgets').doc(widgetId);
          const doc = await widgetRef.get();
          const data = doc.data() || {};
          const stats = data.stats || { views: 0, interactions: 0, leads: 0 };
          
          await widgetRef.update({
            'stats.views': (stats.views || 0) + 1
          });
        } catch (error) {
          console.error(`Error incrementing views for widget ${widgetId}:`, error);
          // Don't throw here, just log the error
        }
        
        return { script };
      } catch (error) {
        console.error(`Error generating script for widget ${widgetId}:`, error);
        throw new functions.https.HttpsError(
          'internal',
          'Error generating widget script: Script generation failed'
        );
      }
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error; // Re-throw HttpsError
      }
      console.error(`Error retrieving widget ${widgetId} from Firestore:`, error);
      throw new functions.https.HttpsError(
        'internal',
        'Error retrieving widget data from database'
      );
    }
  } catch (error: unknown) {
    if (error instanceof functions.https.HttpsError) {
      throw error; // Re-throw HttpsError with specific details
    }
    
    const err = error as Error;
    console.error('Unhandled error in getWidgetScript:', err);
    throw new functions.https.HttpsError(
      'internal',
      `Error generating widget script: ${err.message || 'Unknown error'}`
    );
  }
});

/**
 * HTTP endpoint for tracking widget interactions with CORS support
 * This function is called by the widget script when a user interacts with the widget
 */
// @ts-expect-error: TypeScript may show an error for onRequest, but it exists at runtime
export const trackWidgetInteractionHttp = functions.https.onRequest((req, res) => {
  // Apply CORS middleware
  return corsHandler(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      
      // Extract data from request body
      const { widgetId, type, leadData } = req.body;
      
      console.log(`Tracking widget interaction for widget ID: ${widgetId}, type: ${type}`);
      
      if (!widgetId || !type) {
        console.error('Missing required parameters:', { widgetId, type });
        res.status(400).json({ 
          error: {
            code: 'invalid-argument',
            message: 'Widget ID and interaction type are required'
          }
        });
        return;
      }
      
      // Update widget stats based on interaction type
      const widgetRef = db.collection('widgets').doc(widgetId);
      
      try {
        // First check if the widget exists
        const widgetDoc = await widgetRef.get();
        
        if (!widgetDoc.exists) {
          console.error(`Widget with ID ${widgetId} not found in Firestore`);
          res.status(404).json({
            error: {
              code: 'not-found',
              message: `Widget with ID ${widgetId} not found`
            }
          });
          return;
        }
        
        const widgetData = widgetDoc.data();
        if (!widgetData) {
          console.error(`Widget data is null or undefined for ID ${widgetId}`);
          res.status(400).json({
            error: {
              code: 'failed-precondition',
              message: 'Widget data is missing'
            }
          });
          return;
        }
        
        const stats = widgetData.stats || { views: 0, interactions: 0, leads: 0 };
        
        if (type === 'interaction') {
          console.log(`Incrementing interactions for widget ${widgetId}`);
          await widgetRef.update({
            'stats.interactions': (stats.interactions || 0) + 1
          });
          res.status(200).json({ success: true });
        } else if (type === 'lead') {
          console.log(`Incrementing leads for widget ${widgetId}`);
          
          // If lead data is provided, store it
          if (leadData) {
            console.log(`Storing lead data for widget ${widgetId}:`, leadData);
            
            // Create a new lead document in the leads collection
            await db.collection('leads').add({
              widgetId,
              data: leadData,
              timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          
          await widgetRef.update({
            'stats.leads': (stats.leads || 0) + 1
          });
          res.status(200).json({ success: true });
        } else {
          console.error(`Invalid interaction type: ${type}`);
          res.status(400).json({
            error: {
              code: 'invalid-argument',
              message: `Invalid interaction type: ${type}`
            }
          });
        }
      } catch (error) {
        console.error(`Error updating widget ${widgetId} stats:`, error);
        res.status(500).json({
          error: {
            code: 'internal',
            message: 'Error updating widget statistics'
          }
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Unhandled error in trackWidgetInteraction:', err);
      res.status(500).json({
        error: {
          code: 'internal',
          message: `Error tracking widget interaction: ${err.message || 'Unknown error'}`
        }
      });
    }
  });
});

/**
 * Tracks widget interactions
 * This function is called by the widget script when a user interacts with the widget
 */
export const trackWidgetInteraction = functions.https.onCall(async (data, context) => {
  try {
    // Get widget ID and interaction type from data
    const { widgetId, type, leadData } = data;
    
    console.log(`Tracking widget interaction for widget ID: ${widgetId}, type: ${type}`);
    
    if (!widgetId || !type) {
      console.error('Missing required parameters:', { widgetId, type });
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Widget ID and interaction type are required'
      );
    }
    
    // Update widget stats based on interaction type
    const widgetRef = db.collection('widgets').doc(widgetId);
    
    try {
      // First check if the widget exists
      const widgetDoc = await widgetRef.get();
      
      if (!widgetDoc.exists) {
        console.error(`Widget with ID ${widgetId} not found in Firestore`);
        throw new functions.https.HttpsError(
          'not-found',
          `Widget with ID ${widgetId} not found`
        );
      }
      
      const widgetData = widgetDoc.data();
      if (!widgetData) {
        console.error(`Widget data is null or undefined for ID ${widgetId}`);
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Widget data is missing'
        );
      }
      
      const stats = widgetData.stats || { views: 0, interactions: 0, leads: 0 };
      
      if (type === 'interaction') {
        console.log(`Incrementing interactions for widget ${widgetId}`);
        await widgetRef.update({
          'stats.interactions': (stats.interactions || 0) + 1
        });
        return { success: true };
      } else if (type === 'lead') {
        console.log(`Incrementing leads for widget ${widgetId}`);
        
        // If lead data is provided, store it
        if (leadData) {
          console.log(`Storing lead data for widget ${widgetId}:`, leadData);
          
          // Create a new lead document in the leads collection
          await db.collection('leads').add({
            widgetId,
            data: leadData,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        await widgetRef.update({
          'stats.leads': (stats.leads || 0) + 1
        });
        return { success: true };
      } else {
        console.error(`Invalid interaction type: ${type}`);
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Invalid interaction type: ${type}`
        );
      }
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error; // Re-throw HttpsError
      }
      console.error(`Error updating widget ${widgetId} stats:`, error);
      throw new functions.https.HttpsError(
        'internal',
        'Error updating widget statistics'
      );
    }
  } catch (error: unknown) {
    if (error instanceof functions.https.HttpsError) {
      throw error; // Re-throw HttpsError with specific details
    }
    
    const err = error as Error;
    console.error('Unhandled error in trackWidgetInteraction:', err);
    throw new functions.https.HttpsError(
      'internal',
      `Error tracking widget interaction: ${err.message || 'Unknown error'}`
    );
  }
});

// Widget interface
interface Widget {
  type: string;
  status: string;
  design: {
    position: string;
    primaryColor: string;
    secondaryColor: string;
    theme: string;
    borderRadius: number;
    fontFamily: string;
    media?: {
      type: string;
      url: string;
    };
  };
  content: {
    title: string;
    description: string;
    hostName?: string;
    hostTitle?: string;
    ctaText: string;
    thankYouMessage: string;
    // Support chat specific fields
    welcomeMessage?: string;
    quickResponses?: string[];
  };
  behavior: {
    displayOnMobile: boolean;
    trigger: string;
    delay?: number;
    scrollPercentage?: number;
  };
  integration: {
    calendlyUrl: string;
    collectLeadData: boolean;
    requiredFields: string[];
    // Support chat specific fields
    supportTeamId?: string;
    collectVisitorInfo?: boolean;
  };
}

/**
 * Generates the JavaScript code for the widget
 */
function generateWidgetScript(widgetId: string, widget: Widget): string {
  // Determine which widget script to generate based on widget type
  // Support both 'Support Chat' and 'Chat Support' for backward compatibility
  if (widget.type === 'Support Chat' || widget.type === 'Chat Support') {
    console.log(`Generating chat widget script for widget ID: ${widgetId}, type: ${widget.type}`);
    return generateChatWidgetScript(widgetId, widget);
  } else {
    console.log(`Generating booking widget script for widget ID: ${widgetId}, type: ${widget.type}`);
    return generateBookingWidgetScript(widgetId, widget);
  }
}

/**
 * Generates the JavaScript code for the booking widget
 */
function generateBookingWidgetScript(widgetId: string, widget: Widget): string {
  return `
    (function() {
      // Widget configuration
      const widgetConfig = ${JSON.stringify({
        id: widgetId,
        type: widget.type || 'Book Demo',
        design: widget.design,
        content: widget.content,
        behavior: widget.behavior,
        integration: {
          calendlyUrl: widget.integration.calendlyUrl,
          collectLeadData: widget.integration.collectLeadData,
          requiredFields: widget.integration.requiredFields
        }
      })};
      
      // Initialize widget function
      function initWidget() {
        console.log('Initializing booking widget with ID:', widgetConfig.id);
        
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
        
        // Create widget button
        const button = document.createElement('button');
        button.id = 'adealo-widget-button-' + widgetConfig.id;
        button.style.width = '60px';
        button.style.height = '60px';
        button.style.borderRadius = '50%';
        button.style.backgroundColor = widgetConfig.design.primaryColor;
        button.style.color = widgetConfig.design.secondaryColor;
        button.style.border = 'none';
        button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
        
        container.appendChild(button);
        
        console.log('Booking widget initialized successfully');
      }
      
      // Check if document is already loaded
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initWidget();
      } else {
        // Otherwise wait for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', initWidget);
      }
    })();
  `;
}

/**
 * Generates the JavaScript code for the chat widget
 */
function generateChatWidgetScript(widgetId: string, widget: Widget): string {
  return `
    (function() {
      // Widget configuration
      const widgetConfig = ${JSON.stringify({
        id: widgetId,
        type: 'Support Chat',
        design: widget.design,
        content: widget.content,
        behavior: widget.behavior,
        integration: {
          supportTeamId: widget.integration.supportTeamId || '',
          collectVisitorInfo: widget.integration.collectVisitorInfo || false
        }
      })};
      
      // Create widget container
      function createWidgetContainer() {
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
        return container;
      }
      
      // Create widget button
      function createWidgetButton(container) {
        const button = document.createElement('button');
        button.id = 'adealo-widget-button-' + widgetConfig.id;
        button.style.width = '60px';
        button.style.height = '60px';
        button.style.borderRadius = '50%';
        button.style.backgroundColor = widgetConfig.design.primaryColor;
        button.style.color = widgetConfig.design.secondaryColor;
        button.style.border = 'none';
        button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
        
        button.addEventListener('click', function() {
          trackInteraction('interaction');
          showWidgetContent(container);
        });
        
        container.appendChild(button);
        return button;
      }
      
      // Create chat widget content
      function createWidgetContent(container) {
        const content = document.createElement('div');
        content.id = 'adealo-widget-content-' + widgetConfig.id;
        content.style.display = 'none';
        content.style.width = '320px';
        content.style.height = '400px';
        content.style.backgroundColor = widgetConfig.design.theme === 'dark' ? '#1a1a1a' : '#ffffff';
        content.style.color = widgetConfig.design.theme === 'dark' ? '#ffffff' : '#1a1a1a';
        content.style.borderRadius = widgetConfig.design.borderRadius + 'px';
        content.style.overflow = 'hidden';
        content.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        content.style.fontFamily = widgetConfig.design.fontFamily + ', system-ui, sans-serif';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        
        // Create header
        const header = document.createElement('div');
        header.style.backgroundColor = widgetConfig.design.primaryColor;
        header.style.color = widgetConfig.design.secondaryColor;
        header.style.padding = '16px';
        header.style.position = 'relative';
        header.style.flexShrink = '0';
        
        const title = document.createElement('h3');
        title.style.margin = '0 0 8px 0';
        title.style.fontSize = '18px';
        title.style.fontWeight = '600';
        title.textContent = widgetConfig.content.title;
        
        const description = document.createElement('p');
        description.style.margin = '0';
        description.style.fontSize = '14px';
        description.style.opacity = '0.9';
        description.textContent = widgetConfig.content.description;
        
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
        closeButton.addEventListener('click', function() {
          hideWidgetContent(container);
        });
        
        header.appendChild(title);
        header.appendChild(description);
        header.appendChild(closeButton);
        
        // Create body
        const body = document.createElement('div');
        body.style.padding = '16px';
        
        // Add host info if available
        if (widgetConfig.content.hostName) {
          const hostInfo = document.createElement('div');
          hostInfo.style.display = 'flex';
          hostInfo.style.alignItems = 'center';
          hostInfo.style.marginBottom = '16px';
          
          // Add host image if available
          if (widgetConfig.design.media && widgetConfig.design.media.type === 'image') {
            const hostImage = document.createElement('div');
            hostImage.style.width = '48px';
            hostImage.style.height = '48px';
            hostImage.style.borderRadius = '50%';
            hostImage.style.marginRight = '12px';
            hostImage.style.overflow = 'hidden';
            hostImage.style.flexShrink = '0';
            
            const img = document.createElement('img');
            img.src = widgetConfig.design.media.url;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            hostImage.appendChild(img);
            hostInfo.appendChild(hostImage);
          }
          
          const hostDetails = document.createElement('div');
          
          const hostName = document.createElement('div');
          hostName.style.fontWeight = '500';
          hostName.textContent = widgetConfig.content.hostName;
          
          hostDetails.appendChild(hostName);
          
          if (widgetConfig.content.hostTitle) {
            const hostTitle = document.createElement('div');
            hostTitle.style.fontSize = '12px';
            hostTitle.style.opacity = '0.7';
            hostTitle.textContent = widgetConfig.content.hostTitle;
            hostDetails.appendChild(hostTitle);
          }
          
          hostInfo.appendChild(hostDetails);
          body.appendChild(hostInfo);
        }
        
        // Create CTA button
        const ctaButton = document.createElement('button');
        ctaButton.style.width = '100%';
        ctaButton.style.padding = '10px 16px';
        ctaButton.style.backgroundColor = widgetConfig.design.primaryColor;
        ctaButton.style.color = widgetConfig.design.secondaryColor;
        ctaButton.style.border = 'none';
        ctaButton.style.borderRadius = '4px';
        ctaButton.style.fontSize = '14px';
        ctaButton.style.fontWeight = '500';
        ctaButton.style.cursor = 'pointer';
        ctaButton.style.display = 'flex';
        ctaButton.style.alignItems = 'center';
        ctaButton.style.justifyContent = 'space-between';
        ctaButton.textContent = widgetConfig.content.ctaText;
        
        const arrowIcon = document.createElement('span');
        arrowIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        ctaButton.appendChild(arrowIcon);
        
        ctaButton.addEventListener('click', function() {
          trackInteraction('lead');
          
          // If lead data collection is enabled, show form
          if (widgetConfig.integration.collectLeadData) {
            showLeadForm(body);
          } else {
            // Otherwise, open Calendly directly
            openCalendly();
          }
        });
        
        body.appendChild(ctaButton);
        
        // Add powered by
        const poweredBy = document.createElement('div');
        poweredBy.style.textAlign = 'center';
        poweredBy.style.fontSize = '11px';
        poweredBy.style.opacity = '0.5';
        poweredBy.style.marginTop = '12px';
        poweredBy.textContent = 'Powered by Adealo';
        
        body.appendChild(poweredBy);
        
        content.appendChild(header);
        content.appendChild(body);
        container.appendChild(content);
        
        return content;
      }
      
      // Show lead form
      function showLeadForm(parentElement) {
        // Clear existing content
        parentElement.innerHTML = '';
        
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '12px';
        
        // Create form fields based on required fields
        widgetConfig.integration.requiredFields.forEach(field => {
          const fieldContainer = document.createElement('div');
          
          const label = document.createElement('label');
          label.style.display = 'block';
          label.style.marginBottom = '4px';
          label.style.fontSize = '13px';
          label.textContent = field.charAt(0).toUpperCase() + field.slice(1);
          
          const input = document.createElement('input');
          input.type = field === 'email' ? 'email' : 'text';
          input.name = field;
          input.required = true;
          input.style.width = '100%';
          input.style.padding = '8px 12px';
          input.style.borderRadius = '4px';
          input.style.border = '1px solid rgba(0, 0, 0, 0.1)';
          input.style.fontSize = '14px';
          
          fieldContainer.appendChild(label);
          fieldContainer.appendChild(input);
          form.appendChild(fieldContainer);
        });
        
        // Submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.style.width = '100%';
        submitButton.style.padding = '10px 16px';
        submitButton.style.backgroundColor = widgetConfig.design.primaryColor;
        submitButton.style.color = widgetConfig.design.secondaryColor;
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '4px';
        submitButton.style.fontSize = '14px';
        submitButton.style.fontWeight = '500';
        submitButton.style.cursor = 'pointer';
        submitButton.style.marginTop = '8px';
        submitButton.textContent = 'Continue to Booking';
        
        form.appendChild(submitButton);
        
        // Form submission
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          // Collect form data
          const formData = new FormData(form);
          const leadData = {};
          
          for (const [key, value] of formData.entries()) {
            leadData[key] = value;
          }
          
          // Store lead data and open Calendly
          storeLead(leadData);
          openCalendly(leadData);
        });
        
        parentElement.appendChild(form);
      }
      
      // Show confirmation message
      function showConfirmation(container) {
        const content = document.getElementById('adealo-widget-content-' + widgetConfig.id);
        
        // Clear existing content
        content.innerHTML = '';
        
        // Create header
        const header = document.createElement('div');
        header.style.backgroundColor = widgetConfig.design.primaryColor;
        header.style.color = widgetConfig.design.secondaryColor;
        header.style.padding = '16px';
        header.style.position = 'relative';
        
        const title = document.createElement('h3');
        title.style.margin = '0';
        title.style.fontSize = '18px';
        title.style.fontWeight = '600';
        title.textContent = 'Thank You!';
        
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
        closeButton.addEventListener('click', function() {
          hideWidgetContent(container);
        });
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Create body
        const body = document.createElement('div');
        body.style.padding = '16px';
        body.style.textAlign = 'center';
        
        const icon = document.createElement('div');
        icon.style.margin = '12px auto';
        icon.style.width = '48px';
        icon.style.height = '48px';
        icon.style.borderRadius = '50%';
        icon.style.backgroundColor = 'rgba(0, 200, 83, 0.1)';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
        
        const message = document.createElement('p');
        message.style.margin = '12px 0';
        message.textContent = widgetConfig.content.thankYouMessage;
        
        // Add powered by
        const poweredBy = document.createElement('div');
        poweredBy.style.textAlign = 'center';
        poweredBy.style.fontSize = '11px';
        poweredBy.style.opacity = '0.5';
        poweredBy.style.marginTop = '12px';
        poweredBy.textContent = 'Powered by Adealo';
        
        body.appendChild(icon);
        body.appendChild(message);
        body.appendChild(poweredBy);
        
        content.appendChild(header);
        content.appendChild(body);
      }
      
      // Open Calendly
      function openCalendly(prefill = {}) {
        const url = new URL(widgetConfig.integration.calendlyUrl);
        
        // Add prefill parameters if available
        if (prefill.name) {
          url.searchParams.append('name', prefill.name);
        }
        if (prefill.email) {
          url.searchParams.append('email', prefill.email);
        }
        
        // Open Calendly in a new tab
        window.open(url.toString(), '_blank');
        
        // Show confirmation message
        const container = document.getElementById('adealo-widget-' + widgetConfig.id);
        showConfirmation(container);
      }
      
      // Store lead data
      function storeLead(leadData) {
        // Send lead data to server
        fetch('https://us-central1-adealo-ce238.cloudfunctions.net/trackWidgetInteractionHttp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          body: JSON.stringify({
            widgetId: widgetConfig.id,
            type: 'lead',
            leadData: leadData
          }),
          credentials: 'include',
          mode: 'cors'
        }).catch(error => console.error('Error storing lead:', error));
      }
      
      // Track widget interaction
      function trackInteraction(type) {
        fetch('https://us-central1-adealo-ce238.cloudfunctions.net/trackWidgetInteractionHttp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          body: JSON.stringify({
            widgetId: widgetConfig.id,
            type: type
          }),
          credentials: 'include',
          mode: 'cors'
        }).catch(error => console.error('Error tracking interaction:', error));
      }
      
      // Show widget content
      function showWidgetContent(container) {
        const button = document.getElementById('adealo-widget-button-' + widgetConfig.id);
        const content = document.getElementById('adealo-widget-content-' + widgetConfig.id);
        
        button.style.display = 'none';
        content.style.display = 'block';
      }
      
      // Hide widget content
      function hideWidgetContent(container) {
        const button = document.getElementById('adealo-widget-button-' + widgetConfig.id);
        const content = document.getElementById('adealo-widget-content-' + widgetConfig.id);
        
        content.style.display = 'none';
        button.style.display = 'flex';
      }
      
      // Initialize widget
      function initWidget() {
        // Check if widget should be displayed on mobile
        if (!widgetConfig.behavior.displayOnMobile && window.innerWidth < 768) {
          return;
        }
        
        const container = createWidgetContainer();
        const button = createWidgetButton(container);
        const content = createWidgetContent(container);
        
        // Handle widget trigger
        switch (widgetConfig.behavior.trigger) {
          case 'time':
            // Show widget after delay
            setTimeout(() => {
              showWidgetContent(container);
            }, widgetConfig.behavior.delay * 1000);
            break;
            
          case 'scroll':
            // Show widget after scrolling to percentage
            window.addEventListener('scroll', function() {
              const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
              
              if (scrollPercentage >= (widgetConfig.behavior.scrollPercentage || 50)) {
                showWidgetContent(container);
                // Remove event listener after showing
                window.removeEventListener('scroll', this);
              }
            });
            break;
            
          case 'exit':
            // Show widget on exit intent
            document.addEventListener('mouseleave', function(e) {
              if (e.clientY < 0) {
                showWidgetContent(container);
                // Remove event listener after showing
                document.removeEventListener('mouseleave', this);
              }
            });
            break;
        }
      }
      
      // Check if document is already loaded
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initWidget();
      } else {
        // Otherwise wait for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', initWidget);
      }
    })();
  `;
}
