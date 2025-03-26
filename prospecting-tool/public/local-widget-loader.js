/**
 * Widget Loader Script (Local Development Version)
 * This script loads the widget configuration from the local server and initializes the widget.
 */
(function() {
  // Get the widget ID from the script URL
  const scriptUrl = document.currentScript.src;
  const urlParams = new URLSearchParams(scriptUrl.split('?')[1]);
  const widgetId = urlParams.get('widgetId');
  
  if (!widgetId) {
    console.error('Widget ID is required. Please add a widgetId parameter to the script URL.');
    return;
  }
  
  // Constants
  const API_URL = 'http://localhost:5001/adealo-ce238/us-central1'; // Local Firebase Functions emulator
  const CACHE_KEY = `widget_config_${widgetId}`;
  const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds
  
  // Check if the widget configuration is cached
  function getCachedConfig() {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      
      if (cachedData) {
        const { config, timestamp } = JSON.parse(cachedData);
        
        // Check if the cache is still valid
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return config;
        }
      }
    } catch (error) {
      console.error('Error reading cached widget configuration:', error);
    }
    
    return null;
  }
  
  // Cache the widget configuration
  function cacheConfig(config) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        config,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error caching widget configuration:', error);
    }
  }
  
  // Fetch the widget configuration from the server
  async function fetchConfig() {
    try {
      console.log(`Fetching widget configuration from: ${API_URL}/getWidgetConfigHttp?widgetId=${widgetId}`);
      const response = await fetch(`${API_URL}/getWidgetConfigHttp?widgetId=${widgetId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }
      
      const config = await response.json();
      console.log('Widget configuration:', config);
      cacheConfig(config);
      return config;
    } catch (error) {
      console.error('Error fetching widget configuration:', error);
      throw error;
    }
  }
  
  // Track widget interaction
  function trackInteraction(eventType, data = {}) {
    try {
      fetch(`${API_URL}/trackWidgetInteractionHttp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          widgetId,
          eventType,
          data,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Error tracking widget interaction:', error);
    }
  }
  
  // Create the widget styles
  function createStyles(config) {
    const style = document.createElement('style');
    style.textContent = `
      .widget-container {
        position: fixed;
        z-index: 9999;
        font-family: ${config.design.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'};
      }
      
      .widget-container.bottom-right {
        bottom: 20px;
        right: 20px;
      }
      
      .widget-container.bottom-left {
        bottom: 20px;
        left: 20px;
      }
      
      .widget-launcher {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${config.design.colors.primary};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.3s ease;
      }
      
      .widget-launcher:hover {
        transform: scale(1.05);
      }
      
      .widget-launcher svg {
        width: 24px;
        height: 24px;
      }
      
      .widget-content {
        position: absolute;
        bottom: 80px;
        width: 320px;
        height: 400px;
        background-color: ${config.design.colors.background};
        border-radius: ${config.design.borderRadius || 8}px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        display: none;
      }
      
      .widget-container.bottom-right .widget-content {
        right: 0;
      }
      
      .widget-container.bottom-left .widget-content {
        left: 0;
      }
      
      .widget-header {
        background: linear-gradient(135deg, ${config.design.colors.primary}, ${config.design.colors.secondary});
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .widget-title {
        font-size: 16px;
        font-weight: 600;
      }
      
      .widget-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
        padding: 0;
      }
      
      .widget-body {
        padding: 16px;
        color: ${config.design.colors.text};
      }
      
      .widget-greeting {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .widget-tagline {
        font-size: 14px;
        margin-bottom: 16px;
        opacity: 0.8;
      }
      
      .widget-button {
        display: block;
        width: 100%;
        padding: 12px 16px;
        margin-bottom: 12px;
        background-color: ${config.design.colors.primary};
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.2s ease;
      }
      
      .widget-button:hover {
        background-color: ${config.design.colors.secondary};
      }
      
      .widget-footer {
        padding: 8px 16px;
        text-align: center;
        font-size: 11px;
        opacity: 0.5;
      }
    `;
    return style;
  }
  
  // Create the widget HTML
  function createWidget(config) {
    // Create container
    const container = document.createElement('div');
    container.className = `widget-container ${config.design.position || 'bottom-right'}`;
    
    // Create launcher button
    const launcher = document.createElement('div');
    launcher.className = 'widget-launcher';
    launcher.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    launcher.addEventListener('click', () => {
      content.style.display = content.style.display === 'block' ? 'none' : 'block';
      trackInteraction(content.style.display === 'block' ? 'widget_open' : 'widget_close');
    });
    
    // Create content
    const content = document.createElement('div');
    content.className = 'widget-content';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'widget-header';
    
    const title = document.createElement('div');
    title.className = 'widget-title';
    title.textContent = config.base.name;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'widget-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      content.style.display = 'none';
      trackInteraction('widget_close');
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create body
    const body = document.createElement('div');
    body.className = 'widget-body';
    
    const greeting = document.createElement('div');
    greeting.className = 'widget-greeting';
    greeting.textContent = config.content.greeting;
    
    const tagline = document.createElement('div');
    tagline.className = 'widget-tagline';
    tagline.textContent = config.content.tagline;
    
    body.appendChild(greeting);
    body.appendChild(tagline);
    
    // Add feature buttons
    if (config.features.chat.enabled) {
      const chatButton = document.createElement('button');
      chatButton.className = 'widget-button';
      chatButton.textContent = config.content.labels.chat;
      chatButton.addEventListener('click', () => {
        trackInteraction('chat_open');
        window.open(`${API_URL}/widget?widgetId=${widgetId}&feature=chat`, 'widget_chat', 'width=400,height=600');
      });
      body.appendChild(chatButton);
    }
    
    if (config.features.bookDemo.enabled) {
      const bookDemoButton = document.createElement('button');
      bookDemoButton.className = 'widget-button';
      bookDemoButton.textContent = config.content.labels.bookDemo;
      bookDemoButton.addEventListener('click', () => {
        trackInteraction('book_demo_open');
        window.open(config.features.bookDemo.calendlyUrl, '_blank');
      });
      body.appendChild(bookDemoButton);
    }
    
    if (config.features.callMe.enabled) {
      const callMeButton = document.createElement('button');
      callMeButton.className = 'widget-button';
      callMeButton.textContent = config.content.labels.callMe;
      callMeButton.addEventListener('click', () => {
        trackInteraction('call_me_open');
        window.open(`${API_URL}/widget?widgetId=${widgetId}&feature=callMe`, 'widget_call_me', 'width=400,height=600');
      });
      body.appendChild(callMeButton);
    }
    
    // Create footer
    const footer = document.createElement('div');
    footer.className = 'widget-footer';
    footer.textContent = 'Powered by Adealo';
    
    // Assemble the widget
    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(footer);
    
    container.appendChild(launcher);
    container.appendChild(content);
    
    return container;
  }
  
  // Initialize the widget
  async function initWidget() {
    try {
      console.log('Initializing widget...');
      
      // Try to get the cached configuration
      let config = getCachedConfig();
      
      // If not cached, fetch from the server
      if (!config) {
        console.log('No cached configuration found, fetching from server...');
        config = await fetchConfig();
      } else {
        console.log('Using cached configuration:', config);
      }
      
      // Create the widget
      const styles = createStyles(config);
      const widget = createWidget(config);
      
      // Add the widget to the page
      document.head.appendChild(styles);
      document.body.appendChild(widget);
      
      // Track widget load
      trackInteraction('widget_load');
      
      console.log('Widget initialized successfully!');
    } catch (error) {
      console.error('Error initializing widget:', error);
    }
  }
  
  // Define the custom element
  class ChatWidget extends HTMLElement {
    connectedCallback() {
      // Initialize the widget when the element is added to the page
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
      } else {
        initWidget();
      }
    }
  }
  
  // Register the custom element
  customElements.define('chat-widget', ChatWidget);
})();
