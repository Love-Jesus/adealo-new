/**
 * Test script to verify that the chat widget is working correctly
 * Run this script in the browser console to test the chat widget functionality
 */

(function() {
  console.log('Testing chat widget functionality...');
  
  // Check if the widget container exists
  const widgetContainer = document.getElementById('adealo-chat-widget-container');
  if (!widgetContainer) {
    console.error('Widget container not found. The widget may not have loaded correctly.');
    return;
  }
  
  console.log('Widget container found:', widgetContainer);
  
  // Check if the chat button exists
  const chatButton = document.getElementById('adealo-chat-button');
  if (!chatButton) {
    console.error('Chat button not found. The widget may not have loaded correctly.');
    return;
  }
  
  console.log('Chat button found:', chatButton);
  
  // Check if the chat panel exists
  const chatPanel = document.getElementById('adealo-chat-panel');
  if (!chatPanel) {
    console.error('Chat panel not found. The widget may not have loaded correctly.');
    return;
  }
  
  console.log('Chat panel found:', chatPanel);
  
  // Test opening the chat panel
  console.log('Testing opening the chat panel...');
  chatButton.click();
  
  // Check if the chat panel is visible
  setTimeout(() => {
    if (chatPanel.style.display === 'flex') {
      console.log('Chat panel opened successfully.');
    } else {
      console.error('Failed to open chat panel.');
    }
    
    // Test sending a message
    console.log('Testing sending a message...');
    const chatInput = document.querySelector('#adealo-chat-panel input');
    const sendButton = document.querySelector('#adealo-chat-panel button:last-child');
    
    if (!chatInput || !sendButton) {
      console.error('Chat input or send button not found.');
      return;
    }
    
    // Type a test message
    chatInput.value = 'Hello, this is a test message!';
    
    // Click the send button
    sendButton.click();
    
    // Check if the message was sent
    setTimeout(() => {
      const messages = document.querySelectorAll('#adealo-chat-messages > div');
      if (messages.length > 1) {
        console.log('Message sent successfully.');
        console.log('Chat widget is working correctly!');
      } else {
        console.error('Failed to send message.');
      }
    }, 500);
  }, 500);
})();
