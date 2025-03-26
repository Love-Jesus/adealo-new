/**
 * Create Enhanced Widget Configuration for Emulator
 * 
 * This script creates an enhanced widget configuration in the Firebase Emulator's Firestore.
 * It uses the Firebase Admin SDK with the emulator configuration.
 */
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin with emulator configuration
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Initialize without service account for emulator
admin.initializeApp({
  projectId: 'adealo-ce238'
});

// Get Firestore instance
const db = admin.firestore();

// Widget ID to use - this is the ID that will be used in the test page
const widgetId = 'pjxZqkQ9fAZaqIoOOJJx';

// Create the enhanced widget configuration
async function createEnhancedWidgetConfig() {
  try {
    console.log(`Creating enhanced widget configuration with ID: ${widgetId}`);
    
    // Create the enhanced widget configuration
    const enhancedWidgetConfig = {
      base: {
        widgetId,
        teamId: 'team123',
        name: 'Enhanced Demo Widget',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      design: {
        colors: {
          primary: '#6e8efb',
          secondary: '#4a6cf7',
          text: '#333333',
          background: '#ffffff',
          accent: '#ff5733',
          gradient: {
            type: 'linear',
            direction: '135deg',
            colors: ['#6e8efb', '#4a6cf7', '#ff5733']
          }
        },
        position: 'bottom-right',
        theme: 'light',
        borderRadius: 16,
        shadow: {
          type: 'custom',
          x: 0,
          y: 4,
          blur: 12,
          spread: 0,
          color: 'rgba(0, 0, 0, 0.2)'
        },
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        animation: {
          type: 'slide-up',
          duration: 250,
          easing: 'ease-out'
        },
        launcher: {
          size: 60,
          shape: 'circle',
          useGradient: true,
          pulseAnimation: true
        }
      },
      features: {
        chat: {
          enabled: true,
          greeting: 'Hey 👋',
          teamName: 'Our Team',
          agentName: 'Support',
          agentAvatar: '',
          typingIndicator: true,
          showTimestamps: true,
          showReadReceipts: true,
          messageHistory: true,
          offlineMessage: "We're currently offline. Please leave a message and we'll get back to you soon.",
          inputPlaceholder: "Type your message..."
        },
        bookDemo: {
          enabled: true,
          calendlyUrl: 'https://calendly.com/your-company/30min',
          title: 'Book a Demo',
          description: 'Schedule a time with our team to see our product in action.',
          showTeamMembers: true,
          preQualification: false
        },
        callMe: {
          enabled: true,
          mode: 'team',
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
                avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
                status: 'online'
              },
              {
                id: 'agent2',
                name: 'Jane Smith',
                role: 'Customer Support',
                avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
                status: 'online'
              },
              {
                id: 'agent3',
                name: 'Mike Johnson',
                role: 'Product Specialist',
                avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
                status: 'away'
              },
              {
                id: 'agent4',
                name: 'Sarah Williams',
                role: 'Account Manager',
                avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
                status: 'online'
              }
            ],
            displayMode: 'grid'
          },
          messages: {
            title: 'Request a Call',
            description: 'Enter your phone number and we\'ll call you shortly.',
            asapMessage: 'We\'ll call you as soon as possible.',
            fixedTimeMessage: 'We\'ll call you within {time} minutes.',
            qualificationPrompt: 'How can we help you?',
            successMessage: 'Thanks! We\'ll call you shortly.'
          }
        }
      },
      content: {
        greeting: 'Hey 👋',
        tagline: 'How can we help?',
        labels: {
          chat: 'Chat with us',
          bookDemo: 'Book a demo',
          callMe: 'Request a call'
        },
        quickResponses: [
          'Chat with a product expert',
          'Learn more about our product',
          'I\'m a customer and need support'
        ]
      },
      stats: {
        views: 0,
        interactions: 0,
        leads: 0,
        lastUpdated: new Date()
      },
      chatConfig: {
        offlineMessage: "We're currently offline. Please leave a message and we'll get back to you soon.",
        inputPlaceholder: "Type your message...",
        useAI: true,
        aiWelcomeMessage: "Hello! I'm an AI assistant. I can help answer your questions or connect you with our team.",
        aiModel: 'claude',
        teamName: "Support Team",
        responseTime: "Usually responds in a few minutes",
        showAgentNames: true,
        showAgentAvatars: true,
        requiredVisitorFields: ["email", "name"],
        fileAttachmentsEnabled: true,
        maxFileSize: 5, // MB
        allowedFileTypes: ["image/*", "application/pdf", ".doc", ".docx", ".xls", ".xlsx"],
        typingIndicator: true,
        showTimestamps: true,
        showReadReceipts: true
      },
      type: 'MultiWidget'
    };
    
    // Save the widget configuration to Firestore
    await db.collection('widgets').doc(widgetId).set(enhancedWidgetConfig);
    
    console.log(`Enhanced widget configuration created with ID: ${widgetId}`);
    console.log('Configuration:', JSON.stringify(enhancedWidgetConfig, null, 2));
  } catch (error) {
    console.error('Error creating enhanced widget configuration:', error);
  }
}

// Run the function
createEnhancedWidgetConfig()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
