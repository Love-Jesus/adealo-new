// Enhanced API endpoint to serve widget scripts locally
// This file should be placed in the src/api directory to be served by Vite
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  const widgetId = req.query.widgetId;
  
  console.log(`API: getWidgetScript called with widgetId: ${widgetId}`);
  
  if (!widgetId) {
    console.error('API: getWidgetScript - Widget ID is missing');
    return res.status(400).json({ error: 'Widget ID is required' });
  }
  
  try {
    console.log(`API: Attempting to fetch widget data for ID: ${widgetId}`);
    
    // Always generate a default widget script regardless of whether the widget exists
    // This ensures we always return something that works for testing
    const widgetScript = generateDefaultWidgetScript(widgetId);
    
    // Set the appropriate content type and send the script
    res.setHeader('Content-Type', 'application/javascript');
    res.send(widgetScript);
    
    console.log(`API: Successfully sent widget script for ID: ${widgetId}`);
    
    // Try to fetch the widget data from Firestore in the background
    // This is just for logging purposes and doesn't affect the response
    try {
      const widgetRef = doc(db, 'widgets', widgetId);
      const widgetDoc = await getDoc(widgetRef);
      
      if (!widgetDoc.exists()) {
        console.log(`API: Widget with ID ${widgetId} not found in Firestore, using default script`);
      } else {
        console.log(`API: Widget with ID ${widgetId} found in Firestore`);
      }
    } catch (dbError) {
      console.error(`API: Error checking widget in Firestore:`, dbError);
    }
    
  } catch (error) {
    console.error(`API: Error in getWidgetScript:`, error);
    
    // Even if there's an error, still return a working script
    const widgetScript = generateDefaultWidgetScript(widgetId);
    res.setHeader('Content-Type', 'application/javascript');
    res.send(widgetScript);
  }
}

// Function to generate a default widget script
function generateDefaultWidgetScript(widgetId) {
  console.log(`API: Generating default widget script for ID: ${widgetId}`);
  
  return `
    console.log('Enhanced Chat Widget Script loaded for widget ID: ${widgetId}');
    
    // Create the chat widget UI with improved design
    function createChatWidget() {
      // Add custom styles to the document
      const styleElement = document.createElement('style');
      styleElement.textContent = \`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        #adealo-chat-widget-container * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
        }
        
        #adealo-chat-button {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        #adealo-chat-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
        }
        
        #adealo-chat-panel {
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
          pointer-events: none;
        }
        
        #adealo-chat-panel.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }
        
        .adealo-user-message {
          animation: slideInRight 0.3s ease;
        }
        
        .adealo-bot-message {
          animation: slideInLeft 0.3s ease;
        }
        
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .adealo-typing-indicator {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .adealo-typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #bbb;
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
          animation: pulse 1.5s infinite ease-in-out;
        }
        
        .adealo-typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .adealo-typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      \`;
      document.head.appendChild(styleElement);
      
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.id = 'adealo-chat-widget-container';
      widgetContainer.style.position = 'fixed';
      widgetContainer.style.bottom = '20px';
      widgetContainer.style.right = '20px';
      widgetContainer.style.zIndex = '9999';
      document.body.appendChild(widgetContainer);
      
      // Create the chat button with a modern design
      const chatButton = document.createElement('button');
      chatButton.id = 'adealo-chat-button';
      chatButton.innerHTML = \`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      \`;
      chatButton.style.width = '60px';
      chatButton.style.height = '60px';
      chatButton.style.borderRadius = '50%';
      chatButton.style.backgroundColor = '#3A36DB';
      chatButton.style.color = 'white';
      chatButton.style.border = 'none';
      chatButton.style.cursor = 'pointer';
      chatButton.style.display = 'flex';
      chatButton.style.alignItems = 'center';
      chatButton.style.justifyContent = 'center';
      chatButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
      widgetContainer.appendChild(chatButton);
      
      // Create the chat panel with improved design
      const chatPanel = document.createElement('div');
      chatPanel.id = 'adealo-chat-panel';
      chatPanel.style.position = 'absolute';
      chatPanel.style.bottom = '70px';
      chatPanel.style.right = '0';
      chatPanel.style.width = '350px';
      chatPanel.style.height = '450px';
      chatPanel.style.backgroundColor = 'white';
      chatPanel.style.borderRadius = '12px';
      chatPanel.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
      chatPanel.style.display = 'flex';
      chatPanel.style.flexDirection = 'column';
      chatPanel.style.overflow = 'hidden';
      widgetContainer.appendChild(chatPanel);
      
      // Chat panel header with gradient background
      const chatHeader = document.createElement('div');
      chatHeader.style.background = 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)';
      chatHeader.style.color = 'white';
      chatHeader.style.padding = '15px';
      chatHeader.style.display = 'flex';
      chatHeader.style.justifyContent = 'space-between';
      chatHeader.style.alignItems = 'center';
      chatHeader.style.borderTopLeftRadius = '12px';
      chatHeader.style.borderTopRightRadius = '12px';
      chatPanel.appendChild(chatHeader);
      
      // Add company logo and name
      const headerLeft = document.createElement('div');
      headerLeft.style.display = 'flex';
      headerLeft.style.alignItems = 'center';
      
      const logo = document.createElement('div');
      logo.innerHTML = \`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="12" fill="white"/>
          <path d="M7 14.5l5-5 5 5" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      \`;
      logo.style.marginRight = '8px';
      
      const chatTitle = document.createElement('h3');
      chatTitle.textContent = 'Adealo Support';
      chatTitle.style.margin = '0';
      chatTitle.style.fontSize = '16px';
      chatTitle.style.fontWeight = '600';
      
      headerLeft.appendChild(logo);
      headerLeft.appendChild(chatTitle);
      chatHeader.appendChild(headerLeft);
      
      // Close button with improved design
      const closeButton = document.createElement('button');
      closeButton.innerHTML = \`
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      \`;
      closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
      closeButton.style.border = 'none';
      closeButton.style.color = 'white';
      closeButton.style.width = '28px';
      closeButton.style.height = '28px';
      closeButton.style.borderRadius = '50%';
      closeButton.style.display = 'flex';
      closeButton.style.alignItems = 'center';
      closeButton.style.justifyContent = 'center';
      closeButton.style.cursor = 'pointer';
      closeButton.style.transition = 'background 0.2s ease';
      chatHeader.appendChild(closeButton);
      
      // Chat messages container with subtle background
      const messagesContainer = document.createElement('div');
      messagesContainer.id = 'adealo-chat-messages';
      messagesContainer.style.flex = '1';
      messagesContainer.style.padding = '15px';
      messagesContainer.style.overflowY = 'auto';
      messagesContainer.style.background = '#f9f9fb';
      chatPanel.appendChild(messagesContainer);
      
      // Welcome message with agent avatar
      const welcomeMessageContainer = document.createElement('div');
      welcomeMessageContainer.style.display = 'flex';
      welcomeMessageContainer.style.alignItems = 'flex-start';
      welcomeMessageContainer.style.marginBottom = '15px';
      
      const agentAvatar = document.createElement('div');
      agentAvatar.innerHTML = \`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="16" fill="#4F46E5"/>
          <path d="M16 16C18.21 16 20 14.21 20 12C20 9.79 18.21 8 16 8C13.79 8 12 9.79 12 12C12 14.21 13.79 16 16 16ZM16 18C13.33 18 8 19.34 8 22V24H24V22C24 19.34 18.67 18 16 18Z" fill="white"/>
        </svg>
      \`;
      agentAvatar.style.marginRight = '8px';
      agentAvatar.style.flexShrink = '0';
      
      const welcomeMessage = document.createElement('div');
      welcomeMessage.className = 'adealo-bot-message';
      welcomeMessage.style.backgroundColor = 'white';
      welcomeMessage.style.borderRadius = '12px';
      welcomeMessage.style.padding = '12px 16px';
      welcomeMessage.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
      welcomeMessage.style.maxWidth = 'calc(100% - 40px)';
      welcomeMessage.innerHTML = \`
        <p style="margin: 0 0 8px 0; font-weight: 600;">Sarah from Adealo</p>
        <p style="margin: 0; color: #4B5563;">Hi there! 👋 How can I help you today?</p>
      \`;
      
      welcomeMessageContainer.appendChild(agentAvatar);
      welcomeMessageContainer.appendChild(welcomeMessage);
      messagesContainer.appendChild(welcomeMessageContainer);
      
      // Chat input area with modern design
      const inputArea = document.createElement('div');
      inputArea.style.borderTop = '1px solid #eee';
      inputArea.style.padding = '15px';
      inputArea.style.display = 'flex';
      inputArea.style.backgroundColor = 'white';
      chatPanel.appendChild(inputArea);
      
      // Improved input field
      const chatInput = document.createElement('input');
      chatInput.type = 'text';
      chatInput.placeholder = 'Type your message...';
      chatInput.style.flex = '1';
      chatInput.style.padding = '12px 16px';
      chatInput.style.border = '1px solid #e5e7eb';
      chatInput.style.borderRadius = '8px';
      chatInput.style.marginRight = '10px';
      chatInput.style.fontSize = '14px';
      chatInput.style.outline = 'none';
      chatInput.style.transition = 'border-color 0.2s ease';
      inputArea.appendChild(chatInput);
      
      // Focus effect for input
      chatInput.addEventListener('focus', function() {
        this.style.borderColor = '#4F46E5';
        this.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.1)';
      });
      
      chatInput.addEventListener('blur', function() {
        this.style.borderColor = '#e5e7eb';
        this.style.boxShadow = 'none';
      });
      
      // Modern send button
      const sendButton = document.createElement('button');
      sendButton.innerHTML = \`
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      \`;
      sendButton.style.backgroundColor = '#4F46E5';
      sendButton.style.color = 'white';
      sendButton.style.border = 'none';
      sendButton.style.borderRadius = '8px';
      sendButton.style.width = '40px';
      sendButton.style.height = '40px';
      sendButton.style.display = 'flex';
      sendButton.style.alignItems = 'center';
      sendButton.style.justifyContent = 'center';
      sendButton.style.cursor = 'pointer';
      sendButton.style.transition = 'background-color 0.2s ease';
      inputArea.appendChild(sendButton);
      
      // Hover effect for send button
      sendButton.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#4338CA';
      });
      
      sendButton.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#4F46E5';
      });
      
      // Initially hide the chat panel with animation support
      chatPanel.style.display = 'none';
      
      // Toggle chat panel when button is clicked
      chatButton.addEventListener('click', function() {
        if (chatPanel.style.display === 'none') {
          chatPanel.style.display = 'flex';
          // Trigger animation after display change
          setTimeout(() => {
            chatPanel.classList.add('visible');
          }, 10);
        } else {
          chatPanel.classList.remove('visible');
          // Hide after animation completes
          setTimeout(() => {
            chatPanel.style.display = 'none';
          }, 300);
        }
      });
      
      // Close chat panel when close button is clicked
      closeButton.addEventListener('click', function() {
        chatPanel.classList.remove('visible');
        // Hide after animation completes
        setTimeout(() => {
          chatPanel.style.display = 'none';
        }, 300);
      });
      
      // Send message when send button is clicked
      sendButton.addEventListener('click', sendMessage);
      
      // Send message when Enter key is pressed
      chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
      
      // Create typing indicator
      function createTypingIndicator() {
        const typingContainer = document.createElement('div');
        typingContainer.className = 'adealo-typing-indicator';
        typingContainer.style.display = 'flex';
        typingContainer.style.alignItems = 'flex-start';
        typingContainer.style.marginBottom = '15px';
        
        const agentAvatar = document.createElement('div');
        agentAvatar.innerHTML = \`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="16" fill="#4F46E5"/>
            <path d="M16 16C18.21 16 20 14.21 20 12C20 9.79 18.21 8 16 8C13.79 8 12 9.79 12 12C12 14.21 13.79 16 16 16ZM16 18C13.33 18 8 19.34 8 22V24H24V22C24 19.34 18.67 18 16 18Z" fill="white"/>
          </svg>
        \`;
        agentAvatar.style.marginRight = '8px';
        agentAvatar.style.flexShrink = '0';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'adealo-typing-indicator';
        typingIndicator.style.backgroundColor = 'white';
        typingIndicator.style.borderRadius = '12px';
        typingIndicator.style.padding = '12px 16px';
        typingIndicator.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
        
        for (let i = 0; i < 3; i++) {
          const dot = document.createElement('span');
          typingIndicator.appendChild(dot);
        }
        
        typingContainer.appendChild(agentAvatar);
        typingContainer.appendChild(typingIndicator);
        return typingContainer;
      }
      
      function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
          // Create user message with modern design
          const userMessageContainer = document.createElement('div');
          userMessageContainer.style.display = 'flex';
          userMessageContainer.style.justifyContent = 'flex-end';
          userMessageContainer.style.marginBottom = '15px';
          
          const userMessage = document.createElement('div');
          userMessage.className = 'adealo-user-message';
          userMessage.style.backgroundColor = '#4F46E5';
          userMessage.style.color = 'white';
          userMessage.style.borderRadius = '12px';
          userMessage.style.padding = '12px 16px';
          userMessage.style.maxWidth = '80%';
          userMessage.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          userMessage.textContent = message;
          
          userMessageContainer.appendChild(userMessage);
          messagesContainer.appendChild(userMessageContainer);
          
          // Clear input
          chatInput.value = '';
          
          // Scroll to bottom
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
          
          // Show typing indicator
          const typingIndicator = createTypingIndicator();
          messagesContainer.appendChild(typingIndicator);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
          
          // Simulate response after a short delay
          setTimeout(function() {
            // Remove typing indicator
            messagesContainer.removeChild(typingIndicator);
            
            // Create agent response with avatar
            const responseContainer = document.createElement('div');
            responseContainer.style.display = 'flex';
            responseContainer.style.alignItems = 'flex-start';
            responseContainer.style.marginBottom = '15px';
            
            const agentAvatar = document.createElement('div');
            agentAvatar.innerHTML = \`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="16" fill="#4F46E5"/>
                <path d="M16 16C18.21 16 20 14.21 20 12C20 9.79 18.21 8 16 8C13.79 8 12 9.79 12 12C12 14.21 13.79 16 16 16ZM16 18C13.33 18 8 19.34 8 22V24H24V22C24 19.34 18.67 18 16 18Z" fill="white"/>
              </svg>
            \`;
            agentAvatar.style.marginRight = '8px';
            agentAvatar.style.flexShrink = '0';
            
            const responseMessage = document.createElement('div');
            responseMessage.className = 'adealo-bot-message';
            responseMessage.style.backgroundColor = 'white';
            responseMessage.style.borderRadius = '12px';
            responseMessage.style.padding = '12px 16px';
            responseMessage.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            responseMessage.style.maxWidth = 'calc(100% - 40px)';
            responseMessage.innerHTML = \`
              <p style="margin: 0 0 8px 0; font-weight: 600;">Sarah from Adealo</p>
              <p style="margin: 0; color: #4B5563;">Thanks for reaching out! I'll help you with that right away. Is there anything specific you'd like to know about our services?</p>
            \`;
            
            responseContainer.appendChild(agentAvatar);
            responseContainer.appendChild(responseMessage);
            messagesContainer.appendChild(responseContainer);
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }, 1500);
        }
      }
    }
    
    // Initialize the chat widget
    createChatWidget();
  `;
}
