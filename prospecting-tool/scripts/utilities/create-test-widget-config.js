/**
 * Create Test Widget Configuration
 * 
 * This script creates a test widget configuration in Firestore.
 */
const admin = require('firebase-admin');
const serviceAccount = require('./adealo-ce238-firebase-adminsdk-fbsvc-47871df645.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get Firestore instance
const db = admin.firestore();

// Widget ID to use
const widgetId = '1337';

// Create the widget configuration
async function createWidgetConfig() {
  try {
    // Create the widget configuration
    const widgetConfig = {
      base: {
        widgetId,
        teamId: 'team123',
        name: 'Demo Widget',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      design: {
        colors: {
          primary: '#6e8efb',
          secondary: '#4a6cf7',
          text: '#333333',
          background: '#ffffff'
        },
        position: 'bottom-right',
        theme: 'light',
        borderRadius: 16,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      },
      features: {
        chat: {
          enabled: true,
          greeting: 'Hi there! 👋',
          teamName: 'Our Team',
          agentName: 'Support',
          agentAvatar: ''
        },
        bookDemo: {
          enabled: true,
          calendlyUrl: 'https://calendly.com/your-company/30min',
          title: 'Book a Demo',
          description: 'Schedule a time with our team to see our product in action.'
        },
        callMe: {
          enabled: true,
          mode: 'single',
          responseType: 'asap',
          responseTime: 5,
          qualificationEnabled: true,
          qualificationOptions: [
            {
              id: 'sales',
              label: 'Sales Inquiry',
              description: 'I want to learn more about your product',
              icon: '💼'
            },
            {
              id: 'support',
              label: 'Technical Support',
              description: 'I need help with a technical issue',
              icon: '🔧'
            },
            {
              id: 'billing',
              label: 'Billing Question',
              description: 'I have a question about my bill',
              icon: '💰'
            }
          ],
          team: {
            members: [
              {
                id: 'agent1',
                name: 'John Doe',
                role: 'Sales Representative',
                avatar: ''
              },
              {
                id: 'agent2',
                name: 'Jane Smith',
                role: 'Customer Support',
                avatar: ''
              }
            ],
            displayMode: 'grid'
          },
          messages: {
            title: 'Request a Call',
            description: 'Enter your phone number and we\'ll call you shortly.',
            asapMessage: 'We\'ll call you as soon as possible.',
            fixedTimeMessage: 'We\'ll call you within {time} minutes.',
            qualificationPrompt: 'How can we help you?'
          }
        }
      },
      content: {
        greeting: 'Hello!',
        tagline: 'How can we help?',
        labels: {
          chat: 'Chat with us',
          bookDemo: 'Book a demo',
          callMe: 'Request a call'
        }
      },
      stats: {
        views: 0,
        interactions: 0,
        leads: 0,
        lastUpdated: new Date()
      },
      chatConfig: {
        offlineMessage: "We're currently offline. Please leave a message and we'll get back to you as soon as possible.",
        inputPlaceholder: "Type your message...",
        useAI: false,
        aiWelcomeMessage: "Hello! I'm an AI assistant. I can help answer your questions or connect you with our team.",
        aiModel: 'claude',
        teamName: "Support Team",
        responseTime: "Usually responds in a few minutes",
        showAgentNames: true,
        showAgentAvatars: true,
        requiredVisitorFields: ["email", "name"],
        fileAttachmentsEnabled: false,
        maxFileSize: 5,
        allowedFileTypes: ["image/*", "application/pdf", ".doc", ".docx", ".xls", ".xlsx"]
      },
      type: "MultiWidget"
    };
    
    // Save the widget configuration to Firestore
    await db.collection('widgets').doc(widgetId).set(widgetConfig);
    
    console.log(`Widget configuration created with ID: ${widgetId}`);
  } catch (error) {
    console.error('Error creating widget configuration:', error);
  }
}

// Run the function
createWidgetConfig()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
