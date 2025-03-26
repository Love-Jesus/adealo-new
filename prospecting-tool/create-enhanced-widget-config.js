/**
 * Create Enhanced Widget Config
 * 
 * This script creates an enhanced widget configuration in Firestore.
 * It can be used to test the enhanced widget functionality.
 */
const admin = require('firebase-admin');
const serviceAccount = require('./adealo-ce238-firebase-adminsdk-fbsvc-47871df645.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get Firestore instance
const db = admin.firestore();

/**
 * Create an enhanced widget configuration
 */
async function createEnhancedWidgetConfig() {
  try {
    // Create a new document reference with auto-generated ID
    const widgetRef = db.collection('widgets').doc();
    const widgetId = widgetRef.id;
    const teamId = process.argv[2] || 'test-team';
    
    console.log(`Creating enhanced widget configuration with ID: ${widgetId} for team: ${teamId}`);
    
    // Create the enhanced widget configuration
    const enhancedConfig = {
      base: {
        widgetId,
        teamId,
        name: 'Enhanced Test Widget',
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
            colors: ['#6e8efb', '#4a6cf7']
          }
        },
        position: 'bottom-right',
        theme: 'light',
        borderRadius: 16,
        shadow: {
          type: 'md',
          x: 0,
          y: 4,
          blur: 12,
          spread: 0,
          color: 'rgba(0, 0, 0, 0.2)'
        },
        fontFamily: 'Inter',
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
          greeting: 'Hi there! 👋',
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
                avatar: '',
                status: 'online'
              },
              {
                id: 'agent2',
                name: 'Jane Smith',
                role: 'Customer Support',
                avatar: '',
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
        greeting: 'Hello!',
        tagline: 'How can we help?',
        labels: {
          chat: 'Chat with us',
          bookDemo: 'Book a demo',
          callMe: 'Request a call'
        },
        quickResponses: [
          'Book a demo',
          'Chat with an expert',
          'Get support'
        ]
      },
      stats: {
        views: 0,
        interactions: 0,
        leads: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
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
        maxFileSize: 5,
        allowedFileTypes: ["image/*", "application/pdf", ".doc", ".docx", ".xls", ".xlsx"],
        typingIndicator: true,
        showTimestamps: true,
        showReadReceipts: true
      },
      type: 'MultiWidget'
    };
    
    // Save the configuration to Firestore
    await widgetRef.set(enhancedConfig);
    
    console.log(`Enhanced widget configuration created successfully with ID: ${widgetId}`);
    console.log(`To test the widget, run:`);
    console.log(`  ./run-test-widget.sh`);
    console.log(`  Enter the widget ID: ${widgetId}`);
    
    return widgetId;
  } catch (error) {
    console.error('Error creating enhanced widget configuration:', error);
    throw error;
  }
}

// Run the function
createEnhancedWidgetConfig()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
