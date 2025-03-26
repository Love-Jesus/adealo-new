/**
 * Create Intercom-Style Widget Configuration
 * 
 * This script creates a widget configuration in the production Firestore database
 * with the Intercom-style UI/UX design and functionality.
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
try {
  // Try to use the service account key file
  const serviceAccountPath = path.join(__dirname, 'adealo-ce238-firebase-adminsdk-fbsvc-47871df645.json');
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.log('Trying alternative initialization method...');
  
  // Alternative initialization method
  admin.initializeApp({
    projectId: 'adealo-ce238'
  });
}

const db = admin.firestore();

// Widget configuration
const widgetConfig = {
  name: 'Intercom-Style Widget',
  description: 'A chat widget with Intercom-style UI/UX',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  active: true,
  design: {
    theme: 'light',
    position: 'bottom-right',
    borderRadius: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    shadow: 'lg',
    colors: {
      primary: '#6366f1', // Indigo color
      secondary: '#f3f4f6',
      text: '#1f2937',
      background: '#ffffff',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['#6366f1', '#8b5cf6']
      }
    },
    launcher: {
      size: 60,
      shape: 'circle',
      pulseAnimation: true,
      useGradient: true
    }
  },
  content: {
    greeting: 'Hello!',
    tagline: 'How can we help?',
    welcomeMessage: 'Hi there! 👋 How can I help you today?'
  },
  features: {
    chat: {
      enabled: true,
      agentName: 'Support',
      greeting: 'Hi there! 👋 How can I help you today?'
    },
    bookDemo: {
      enabled: true,
      title: 'Book a Demo',
      description: 'Schedule a time with our team to see our product in action.',
      calendlyUrl: 'https://calendly.com/adealo/30min'
    },
    callMe: {
      enabled: true,
      messages: {
        title: 'Request a Call',
        description: 'Enter your phone number and we\'ll call you shortly.',
        success: 'We\'ll call you as soon as possible.'
      }
    }
  },
  chatConfig: {
    inputPlaceholder: 'Type your message...',
    sendButtonText: 'Send',
    fileUpload: {
      enabled: false
    }
  },
  tracking: {
    enabled: true,
    events: [
      'widget_opened',
      'widget_closed',
      'chat_message_sent',
      'book_demo_form_submitted',
      'call_me_submitted'
    ]
  },
  widgetType: 'intercom-style'
};

// Function to create widget configuration
async function createWidgetConfig() {
  try {
    // Check if collection exists
    const widgetConfigsRef = db.collection('widgetConfigs');
    
    // Create a new document with auto-generated ID
    const docRef = await widgetConfigsRef.add(widgetConfig);
    
    console.log(`Widget configuration created successfully with ID: ${docRef.id}`);
    
    // Save the widget ID to a file for reference
    const widgetIdFile = path.join(__dirname, 'intercom-widget-id.txt');
    fs.writeFileSync(widgetIdFile, docRef.id);
    console.log(`Widget ID saved to: ${widgetIdFile}`);
    
    // Create a test HTML file with the widget embedded
    createTestHtmlFile(docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating widget configuration:', error);
    throw error;
  }
}

// Function to create a test HTML file
function createTestHtmlFile(widgetId) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Intercom-Style Widget Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #6366f1;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 20px;
    }
    .card {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .info {
      background-color: #f0f9ff;
      border-left: 4px solid #6366f1;
      padding: 15px;
      margin-bottom: 20px;
    }
    code {
      background-color: #f1f5f9;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Intercom-Style Widget Test</h1>
    
    <div class="info">
      <p><strong>Widget ID:</strong> <code>${widgetId}</code></p>
      <p>This page demonstrates the Intercom-style chat widget with the configuration you just created.</p>
    </div>
    
    <div class="card">
      <h2>About Adealo</h2>
      <p>Adealo is a powerful prospecting tool that helps businesses find and connect with potential customers.</p>
      <p>Our platform provides advanced features for lead generation, customer engagement, and sales acceleration.</p>
    </div>
    
    <div class="card">
      <h2>Key Features</h2>
      <ul>
        <li>Intelligent lead discovery</li>
        <li>Automated outreach campaigns</li>
        <li>Advanced analytics and reporting</li>
        <li>CRM integration</li>
        <li>Team collaboration tools</li>
      </ul>
    </div>
    
    <p>Click on the chat widget in the bottom-right corner to test the different features.</p>
  </div>
  
  <!-- Widget Script -->
  <script>
    window.widgetConfig = {
      id: '${widgetId}'
    };
  </script>
  <script src="https://adealo-ce238.web.app/intercom-style-widget-adapter.js" data-widget-id="${widgetId}"></script>
</body>
</html>`;

  const testHtmlPath = path.join(__dirname, 'public', 'intercom-widget-test.html');
  fs.writeFileSync(testHtmlPath, htmlContent);
  console.log(`Test HTML file created at: ${testHtmlPath}`);
}

// Execute the function
createWidgetConfig()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
