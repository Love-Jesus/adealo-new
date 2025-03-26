/**
 * Adealo Widget Local Loader - Enhanced Debug Version
 * This script loads the Adealo widget from the local development server with improved error handling.
 */

(function() {
  // Create debug console for widget loader
  const createDebugConsole = function() {
    // Only create if it doesn't exist
    if (!window.adealoDebugConsole) {
      console.log('Creating Adealo debug console');
      
      // Create debug console element
      const debugConsole = document.createElement('div');
      debugConsole.id = 'adealo-debug-console';
      debugConsole.style.position = 'fixed';
      debugConsole.style.bottom = '10px';
      debugConsole.style.left = '10px';
      debugConsole.style.width = '400px';
      debugConsole.style.height = '200px';
      debugConsole.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      debugConsole.style.color = '#00ff00';
      debugConsole.style.fontFamily = 'monospace';
      debugConsole.style.fontSize = '12px';
      debugConsole.style.padding = '10px';
      debugConsole.style.overflowY = 'auto';
      debugConsole.style.zIndex = '10000';
      debugConsole.style.borderRadius = '5px';
      debugConsole.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
      
      // Add title bar
      const titleBar = document.createElement('div');
      titleBar.style.borderBottom = '1px solid #444';
      titleBar.style.paddingBottom = '5px';
      titleBar.style.marginBottom = '5px';
      titleBar.style.display = 'flex';
      titleBar.style.justifyContent = 'space-between';
      titleBar.style.alignItems = 'center';
      
      const title = document.createElement('span');
      title.textContent = 'Adealo Widget Debug Console';
      title.style.fontWeight = 'bold';
      
      const closeButton = document.createElement('button');
      closeButton.textContent = 'X';
      closeButton.style.backgroundColor = 'transparent';
      closeButton.style.border = 'none';
      closeButton.style.color = '#ff5555';
      closeButton.style.cursor = 'pointer';
      closeButton.style.fontWeight = 'bold';
      
      closeButton.addEventListener('click', function() {
        debugConsole.style.display = 'none';
      });
      
      titleBar.appendChild(title);
      titleBar.appendChild(closeButton);
      debugConsole.appendChild(titleBar);
      
      // Create log container
      const logContainer = document.createElement('div');
      logContainer.id = 'adealo-debug-log';
      debugConsole.appendChild(logContainer);
      
      // Add to document
      document.body.appendChild(debugConsole);
      
      // Create log function
      window.adealoDebugConsole = {
        log: function(message, type = 'info') {
          const logEntry = document.createElement('div');
          logEntry.style.marginBottom = '3px';
          
          // Set color based on type
          if (type === 'error') {
            logEntry.style.color = '#ff5555';
          } else if (type === 'warn') {
            logEntry.style.color = '#ffff55';
          } else if (type === 'success') {
            logEntry.style.color = '#55ff55';
          }
          
          const timestamp = new Date().toLocaleTimeString();
          logEntry.textContent = `[${timestamp}] ${message}`;
          
          const logContainer = document.getElementById('adealo-debug-log');
          logContainer.appendChild(logEntry);
          
          // Auto-scroll to bottom
          logContainer.scrollTop = logContainer.scrollHeight;
          
          // Also log to console
          if (type === 'error') {
            console.error(message);
          } else if (type === 'warn') {
            console.warn(message);
          } else {
            console.log(message);
          }
        },
        
        clear: function() {
          const logContainer = document.getElementById('adealo-debug-log');
          logContainer.innerHTML = '';
        }
      };
    }
    
    return window.adealoDebugConsole;
  };
  
  // Initialize debug console if body exists, otherwise wait for it
  if (document.body) {
    createDebugConsole();
  } else {
    document.addEventListener('DOMContentLoaded', createDebugConsole);
  }
  
  // Helper function to log messages
  const debugLog = function(message, type = 'info') {
    if (window.adealoDebugConsole) {
      window.adealoDebugConsole.log(message, type);
    } else {
      console.log(message);
    }
  };
  
  // Store the queue of commands to be executed once the widget is loaded
  window
/**
 * Adealo Widget Local Loader
 * This script loads the Adealo widget from the local development server.
 */

(function() {
  // Store the queue of commands to be executed once the widget is loaded
  window.adealo = window.adealo || function() {
    (window.adealo.q = window.adealo.q || []).push(arguments);
  };
  
  // Initialize widget when called with 'init' command
  window.adealo.init = function(widgetId) {
    if (!widgetId) {
      console.error('Adealo Widget: Widget ID is required for initialization');
      return;
    }
    
    console.log('Adealo Widget: Initializing widget with ID', widgetId);
    
    // Use the local API endpoint instead of Firebase Functions
    const localApiUrl = `/api/getWidgetScript?widgetId=${widgetId}`;
    
    console.log('Adealo Widget: Fetching widget script from local API:', localApiUrl);
    
    // Create a request to the local API
    fetch(localApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/javascript, application/json'
      }
    })
    .then(response => {
      console.log('Adealo Widget: Received response', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('Adealo Widget: HTTP error', response.status, response.statusText);
        throw new Error(`HTTP error! Status: ${response.status}, Text: ${response.statusText}`);
      }
      
      // Handle different response formats
      const contentType = response.headers.get('content-type');
      console.log('Adealo Widget: Response content type', contentType);
      
      if (contentType && contentType.includes('application/javascript')) {
        // Direct script response
        return response.text().then(script => {
          console.log('Adealo Widget: Received direct script response');
          return script;
        });
      } else {
        // JSON response
        return response.json().then(data => {
          console.log('Adealo Widget: Received JSON response', data);
          if (data && data.script) {
            return data.script;
          } else {
            throw new Error('Invalid response format: missing script property');
          }
        });
      }
    })
    .then(script => {
      // Execute the widget script
      console.log('Adealo Widget: Executing widget script');
      const scriptElement = document.createElement('script');
      scriptElement.textContent = script;
      document.head.appendChild(scriptElement);
      
      console.log('Adealo Widget: Widget script loaded successfully');
      
      // Process any queued commands
      if (window.adealo.q && window.adealo.q.length) {
        console.log('Adealo Widget: Processing queued commands');
        window.adealo.q.forEach(args => {
          if (args[0] !== 'init') { // Skip init commands as we've already initialized
            window.adealo.apply(null, args);
          }
        });
        // Clear the queue
        window.adealo.q = [];
      }
    })
    .catch(error => {
      console.error('Adealo Widget: Error loading widget script', error);
      
      // Display error in the debug panel if it exists
      if (window.debugOutput) {
        window.debugOutput.innerHTML += `ERROR: Adealo Widget: ${error.message}\n`;
      }
      
      // Fall back to the default widget script
      console.log('Adealo Widget: Falling back to default widget script');
      
      // Create a simple chat widget UI
      const widgetScript = `
        console.log('Adealo Widget: Creating default chat widget for widget ID: ${widgetId}');
        
        // Create the chat widget UI
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
      
      // Execute the default widget script
      const scriptElement = document.createElement('script');
      scriptElement.textContent = widgetScript;
      document.head.appendChild(scriptElement);
    });
  };
  
  // NOTE: Auto-initialization is disabled
  // To initialize the widget, call window.adealo.init('WnwIUWLRHxM09A6EYJPY') manually
})();
