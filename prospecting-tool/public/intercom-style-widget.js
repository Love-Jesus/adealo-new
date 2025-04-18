/**
 * Intercom-Style Enhanced Widget Script
 * 
 * This script creates a chat widget with a design inspired by Intercom,
 * featuring a bottom navigation with Home, Support, Book Demo, and Call Me options.
 * It uses vanilla JavaScript to create and manage the widget.
 */

(function() {
  // DEBUG: Log all possible sources of widget ID
  console.log('DEBUG: Starting widget initialization');
  console.log('DEBUG: window.widgetConfig =', JSON.stringify(window.widgetConfig || {}));
  console.log('DEBUG: document.currentScript =', document.currentScript);
  
  // Function to get widget ID from all possible sources
  function getWidgetId() {
    try {
      // Check for global widget ID first (set by adapter)
      if (window.ADEALO_WIDGET_ID) {
        console.log('DEBUG: Found global ADEALO_WIDGET_ID =', window.ADEALO_WIDGET_ID);
        return window.ADEALO_WIDGET_ID;
      }
      
      // Check window.widgetConfig object
      const configWidgetId = window.widgetConfig && window.widgetConfig.id ? window.widgetConfig.id : null;
      if (configWidgetId) {
        console.log('DEBUG: Found widgetConfig.id =', configWidgetId);
        return configWidgetId;
      }
      
      // Check data-widget-id attribute on script tag
      const dataWidgetId = document.currentScript ? document.currentScript.getAttribute('data-widget-id') : null;
      if (dataWidgetId) {
        console.log('DEBUG: Found data-widget-id attribute =', dataWidgetId);
        return dataWidgetId;
      }
      
      // Try to get widget ID from script tag URL
      const getScriptUrlParameter = function(name) {
        if (!document.currentScript || !document.currentScript.src) return '';
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(document.currentScript.src);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
      };
      
      const scriptUrlWidgetId = getScriptUrlParameter('widgetId');
      if (scriptUrlWidgetId) {
        console.log('DEBUG: Found script URL widgetId =', scriptUrlWidgetId);
        return scriptUrlWidgetId;
      }
      
      // Try to get widget ID from URL parameters
      const getUrlParameter = function(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
      };
      
      const urlWidgetId = getUrlParameter('widgetId');
      if (urlWidgetId) {
        console.log('DEBUG: Found URL widgetId =', urlWidgetId);
        return urlWidgetId;
      }
      
      // Check for any script tag with data-widget-id attribute
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const scriptDataWidgetId = scripts[i].getAttribute('data-widget-id');
        if (scriptDataWidgetId) {
          console.log('DEBUG: Found data-widget-id on other script =', scriptDataWidgetId);
          return scriptDataWidgetId;
        }
      }
      
      // Last resort: check for a hardcoded default (for testing only)
      const defaultWidgetId = 'WnwIUWLRHxM09A6EYJPY'; // Default for testing
      console.log('DEBUG: Using default widgetId for testing =', defaultWidgetId);
      console.log('DEBUG: WARNING - Default widget ID should only be used for testing!');
      return defaultWidgetId;
    } catch (error) {
      console.error('DEBUG: Error in getWidgetId:', error);
      return null;
    }
  }
  
  // Get the widget ID
  const widgetId = getWidgetId();
  
  // Set a global variable for the widget ID for debugging
  window.__ADEALO_DEBUG_WIDGET_ID = widgetId;
  
  if (!widgetId) {
    console.error('Widget Error: Missing widgetId parameter');
    console.error('DEBUG: All widget ID sources failed');
    
    // Show error message on the page
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.bottom = '20px';
    errorDiv.style.right = '20px';
    errorDiv.style.backgroundColor = '#f44336';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '15px';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.zIndex = '9999';
    errorDiv.innerHTML = 'Widget Error: Missing widgetId parameter. Check console for details.';
    document.body.appendChild(errorDiv);
    
    // Remove error message after 10 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 10000);
    
    return;
  }
  
  console.log('Initializing Intercom-style widget with ID:', widgetId);
  
  // Create widget container if it doesn't exist
  let container = document.getElementById('adealo-widget-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adealo-widget-container';
    document.body.appendChild(container);
  }
  
  // Function to fetch widget configuration
  async function fetchWidgetConfig() {
    try {
      const API_URL = 'https://us-central1-adealo-ce238.cloudfunctions.net';
      const response = await fetch(`${API_URL}/getWidgetConfigHttp?widgetId=${widgetId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching widget configuration:', error);
      return null;
    }
  }
  
  // Function to track widget interaction
  function trackInteraction(eventType, data = {}) {
    try {
      const API_URL = 'https://us-central1-adealo-ce238.cloudfunctions.net';
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
      }).catch(error => console.error('Error tracking interaction:', error));
    } catch (error) {
      console.error('Error tracking widget interaction:', error);
    }
  }
  
  // Initialize the widget
  async function initWidget() {
    // If we don't have the config yet, fetch it
    let config = widgetConfig;
    if (!config.design) {
      config = await fetchWidgetConfig();
      if (!config) {
        console.error('Widget Error: Failed to fetch widget configuration');
        return;
      }
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideIn {
        from { transform: translateX(20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes pulse-animation-${widgetId} {
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
      
      .fade-in {
        animation: fadeIn 0.3s ease forwards;
      }
      
      .slide-in {
        animation: slideIn 0.3s ease forwards;
      }
    `;
    document.head.appendChild(style);
    
    // Create widget container
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    
    // Set position based on configuration
    switch (config.design.position) {
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
    
    // Create launcher button
    const button = document.createElement('button');
    button.id = 'adealo-widget-button-' + widgetId;
    
    // Apply launcher configuration
    const launcherSize = config.design.launcher?.size || 60;
    button.style.width = launcherSize + 'px';
    button.style.height = launcherSize + 'px';
    
    // Apply shape configuration
    if (config.design.launcher?.shape === 'rounded-square') {
      button.style.borderRadius = (config.design.borderRadius || 8) + 'px';
    } else {
      button.style.borderRadius = '50%';
    }
    
    // Apply color configuration
    if (config.design.launcher?.useGradient && config.design.colors.gradient) {
      const gradient = config.design.colors.gradient;
      if (gradient.type === 'linear') {
        button.style.background = 'linear-gradient(' + (gradient.direction || '135deg') + ', ' + gradient.colors.join(', ') + ')';
      } else {
        button.style.background = 'radial-gradient(circle, ' + gradient.colors.join(', ') + ')';
      }
    } else {
      button.style.backgroundColor = config.design.colors.primary;
    }
    
    button.style.color = '#ffffff';
    button.style.border = 'none';
    
    // Apply shadow configuration
    if (typeof config.design.shadow === 'object') {
      const shadow = config.design.shadow;
      button.style.boxShadow = `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
    } else if (config.design.shadow === 'sm') {
      button.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
    } else if (config.design.shadow === 'md') {
      button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    } else if (config.design.shadow === 'lg') {
      button.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
    } else if (config.design.shadow === 'xl') {
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
    if (config.design.launcher?.pulseAnimation) {
      // Extract RGB values from primary color for pulse animation
      let primaryColor = config.design.colors.primary;
      if (primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        button.style.setProperty('--pulse-color', `${r}, ${g}, ${b}`);
      } else {
        button.style.setProperty('--pulse-color', '110, 142, 251'); // Default blue color
      }
      
      button.style.animation = `pulse-animation-${widgetId} 2s infinite`;
    }
    
    // Create widget content
    const content = document.createElement('div');
    content.id = 'adealo-widget-content-' + widgetId;
    content.style.display = 'none';
    content.style.width = '380px';
    content.style.height = '600px';
    content.style.maxHeight = '80vh';
    content.style.backgroundColor = config.design.theme === 'dark' ? '#1a1a1a' : '#ffffff';
    content.style.color = config.design.theme === 'dark' ? '#ffffff' : '#1a1a1a';
    content.style.borderRadius = (config.design.borderRadius || 16) + 'px';
    content.style.overflow = 'hidden';
    content.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
    content.style.fontFamily = config.design.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    content.style.display = 'none';
    content.style.flexDirection = 'column';
    content.style.position = 'absolute';
    
    // Position the content based on the launcher position
    switch (config.design.position) {
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
    header.style.background = config.design.launcher?.useGradient && config.design.colors.gradient
      ? (config.design.colors.gradient.type === 'linear'
          ? `linear-gradient(${config.design.colors.gradient.direction || '135deg'}, ${config.design.colors.gradient.colors.join(', ')})`
          : `radial-gradient(circle, ${config.design.colors.gradient.colors.join(', ')})`)
      : config.design.colors.primary;
    header.style.color = '#ffffff';
    header.style.padding = '32px 24px';
    header.style.position = 'relative';
    header.style.flexShrink = '0';
    
    const title = document.createElement('h3');
    title.style.margin = '0 0 8px 0';
    title.style.fontSize = '32px';
    title.style.fontWeight = '400';
    title.textContent = config.content.greeting || 'Hello!';
    
    const description = document.createElement('p');
    description.style.margin = '0';
    description.style.fontSize = '32px';
    description.style.fontWeight = '600';
    description.textContent = config.content.tagline || 'How can we help?';
    
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
    
    // Create content area
    const contentArea = document.createElement('div');
    contentArea.style.flex = '1';
    contentArea.style.overflowY = 'auto';
    
    // Create bottom navigation
    const bottomNav = document.createElement('div');
    bottomNav.style.display = 'flex';
    bottomNav.style.borderTop = config.design.theme === 'dark' ? '1px solid #333333' : '1px solid #eaeaea';
    bottomNav.style.padding = '8px 0';
    bottomNav.style.backgroundColor = config.design.theme === 'dark' ? '#1a1a1a' : '#ffffff';
    
    // Helper function to create navigation items
    function createNavItem(icon, label, isActive, onClick) {
      const navItem = document.createElement('div');
      navItem.style.flex = '1';
      navItem.style.display = 'flex';
      navItem.style.flexDirection = 'column';
      navItem.style.alignItems = 'center';
      navItem.style.justifyContent = 'center';
      navItem.style.padding = '8px 0';
      navItem.style.cursor = 'pointer';
      navItem.style.color = isActive ? config.design.colors.primary : '#888';
      navItem.setAttribute('data-nav', label.toLowerCase().replace(' ', '-'));
      
      navItem.innerHTML = `
        <div style="margin-bottom: 4px;">${icon}</div>
        <div style="font-size: 12px;">${label}</div>
      `;
      
      navItem.addEventListener('click', onClick);
      return navItem;
    }
    
    // Create navigation items
    const homeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
    const supportIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    const demoIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
    const callIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>';
    
    const homeNav = createNavItem(homeIcon, 'Home', true, () => showScreen('home'));
    const supportNav = createNavItem(supportIcon, 'Support', false, () => showScreen('support'));
    const demoNav = createNavItem(demoIcon, 'Book demo', false, () => showScreen('book-demo'));
    const callNav = createNavItem(callIcon, 'Call me', false, () => showScreen('call-me'));
    
    bottomNav.appendChild(homeNav);
    bottomNav.appendChild(supportNav);
    bottomNav.appendChild(demoNav);
    bottomNav.appendChild(callNav);
    
    // Add powered by
    const poweredBy = document.createElement('div');
    poweredBy.style.textAlign = 'center';
    poweredBy.style.fontSize = '11px';
    poweredBy.style.opacity = '0.5';
    poweredBy.style.padding = '8px 16px';
    poweredBy.textContent = 'Powered by Adealo';
    
    // Assemble the widget
    content.appendChild(header);
    content.appendChild(contentArea);
    content.appendChild(bottomNav);
    content.appendChild(poweredBy);
    container.appendChild(button);
    container.appendChild(content);
    
    // Function to update navigation active state
    function updateNavActiveState(screenName) {
      const navItems = bottomNav.querySelectorAll('[data-nav]');
      navItems.forEach(item => {
        const navName = item.getAttribute('data-nav');
        if (navName === screenName) {
          item.style.color = config.design.colors.primary;
        } else {
          item.style.color = '#888';
        }
      });
    }
    
    // Function to show a specific screen
    function showScreen(screenName) {
      // Update navigation active state
      updateNavActiveState(screenName);
      
      // Clear content area
      contentArea.innerHTML = '';
      
      // Show the appropriate screen
      switch(screenName) {
        case 'home':
          showHomeScreen(contentArea);
          break;
        case 'support':
          showSupportScreen(contentArea);
          break;
        case 'book-demo':
          showBookDemoScreen(contentArea);
          break;
        case 'call-me':
          showCallMeScreen(contentArea);
          break;
      }
      
      // Track screen view
      trackInteraction(`view_${screenName}_screen`);
    }
    
    // Show home screen
    function showHomeScreen(container) {
      // Create recent messages section
      const recentSection = document.createElement('div');
      recentSection.style.padding = '16px';
      
      const recentTitle = document.createElement('h3');
      recentTitle.style.fontSize = '16px';
      recentTitle.style.fontWeight = '600';
      recentTitle.style.margin = '0 0 16px 0';
      recentTitle.textContent = 'Senaste meddelande';
      
      const messagePreview = document.createElement('div');
      messagePreview.style.padding = '16px';
      messagePreview.style.backgroundColor = config.design.theme === 'dark' ? '#333333' : '#f5f5f5';
      messagePreview.style.borderRadius = '8px';
      messagePreview.style.marginBottom = '16px';
      messagePreview.style.cursor = 'pointer';
      
      messagePreview.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${config.design.colors.primary}; color: white; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <div style="font-weight: 600; font-size: 14px;">${config.features.chat?.agentName || 'Support'}</div>
            <div style="font-size: 12px; opacity: 0.7;">3 dagar sedan</div>
          </div>
        </div>
        <div style="font-size: 14px;">Hi 👋 How can I help you?</div>
      `;
      
      messagePreview.addEventListener('click', () => showScreen('support'));
      
      recentSection.appendChild(recentTitle);
      recentSection.appendChild(messagePreview);
      
      // Create action cards section
      const actionsSection = document.createElement('div');
      actionsSection.style.padding = '0 16px 16px';
      
      const actionTitle = document.createElement('h3');
      actionTitle.style.fontSize = '16px';
      actionTitle.style.fontWeight = '600';
      actionTitle.style.margin = '0 0 16px 0';
      actionTitle.textContent = 'Ställ en fråga';
      
      // Helper function to create action cards
      function createActionCard(icon, title, onClick) {
        const card = document.createElement('div');
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.justifyContent = 'space-between';
        card.style.padding = '16px';
        card.style.backgroundColor = config.design.theme === 'dark' ? '#333333' : '#f5f5f5';
        card.style.borderRadius = '8px';
        card.style.marginBottom = '12px';
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
          <div style="display: flex; align-items: center;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${config.design.colors.primary}; color: white; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              ${icon}
            </div>
            <div style="font-weight: 500;">${title}</div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        `;
        
        card.addEventListener('click', onClick);
        return card;
      }
      
      // Create action cards
      const supportCard = createActionCard(
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        'Support',
        () => showScreen('support')
      );
      
      const demoCard = createActionCard(
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
        'Book a demo',
        () => showScreen('book-demo')
      );
      
      const callCard = createActionCard(
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
        'Call me now',
        () => showScreen('call-me')
      );
      
      actionsSection.appendChild(actionTitle);
      actionsSection.appendChild(supportCard);
      actionsSection.appendChild(demoCard);
      actionsSection.appendChild(callCard);
      
      container.appendChild(recentSection);
      container.appendChild(actionsSection);
    }
    
    // Show support screen (chat)
    function showSupportScreen(container) {
      // Create chat container
      const chatContainer = document.createElement('div');
      chatContainer.style.display = 'flex';
      chatContainer.style.flexDirection = 'column';
      chatContainer.style.height = '100%';
      
      // Create chat header
      const chatHeader = document.createElement('div');
      chatHeader.style.padding = '16px';
      chatHeader.style.borderBottom = config.design.theme === 'dark' ? '1px solid #333333' : '1px solid #e0e0e0';
      chatHeader.style.display = 'flex';
      chatHeader.style.alignItems = 'center';
      chatHeader.style.justifyContent = 'space-between';
      
      const headerLeft = document.createElement('div');
      headerLeft.style.display = 'flex';
      headerLeft.style.alignItems = 'center';
      
      const agentAvatar = document.createElement('div');
      agentAvatar.style.width = '40px';
      agentAvatar.style.height = '40px';
      agentAvatar.style.borderRadius = '8px';
      agentAvatar.style.backgroundColor = '#000';
      agentAvatar.style.color = '#fff';
      agentAvatar.style.display = 'flex';
      agentAvatar.style.alignItems = 'center';
      agentAvatar.style.justifyContent = 'center';
      agentAvatar.style.marginRight = '12px';
      agentAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
      
      const headerInfo = document.createElement('div');
      
      const agentName = document.createElement('div');
      agentName.style.fontWeight = '600';
      agentName.style.fontSize = '16px';
      agentName.textContent = 'Fin';
      
      const agentSubtitle = document.createElement('div');
      agentSubtitle.style.fontSize = '14px';
      agentSubtitle.style.color = '#777';
      agentSubtitle.textContent = 'Teamet kan också hjälpa dig';
      
      headerInfo.appendChild(agentName);
      headerInfo.appendChild(agentSubtitle);
      
      headerLeft.appendChild(agentAvatar);
      headerLeft.appendChild(headerInfo);
      
      chatHeader.appendChild(headerLeft);
      
      // Create messages container
      const messagesContainer = document.createElement('div');
      messagesContainer.style.flex = '1';
      messagesContainer.style.overflowY = 'auto';
      messagesContainer.style.padding = '16px';
      
      // Add welcome message
      const welcomeMessage = document.createElement('div');
      welcomeMessage.style.display = 'flex';
      welcomeMessage.style.marginBottom = '16px';
      
      const welcomeAvatar = document.createElement('div');
      welcomeAvatar.style.width = '32px';
      welcomeAvatar.style.height = '32px';
      welcomeAvatar.style.borderRadius = '50%';
      welcomeAvatar.style.backgroundColor = config.design.colors.primary;
      welcomeAvatar.style.color = '#ffffff';
      welcomeAvatar.style.display = 'flex';
      welcomeAvatar.style.alignItems = 'center';
      welcomeAvatar.style.justifyContent = 'center';
      welcomeAvatar.style.marginRight = '8px';
      welcomeAvatar.style.flexShrink = '0';
      welcomeAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
      
      const messageContent = document.createElement('div');
      messageContent.style.maxWidth = '80%';
      
      const messageName = document.createElement('div');
      messageName.style.fontWeight = '600';
      messageName.style.fontSize = '13px';
      messageName.style.marginBottom = '4px';
      messageName.textContent = config.features.chat?.agentName || 'Support';
      
      const messageText = document.createElement('div');
      messageText.style.padding = '12px 16px';
      messageText.style.backgroundColor = config.design.theme === 'dark' ? '#333333' : '#f0f0f0';
      messageText.style.borderRadius = '0 16px 16px 16px';
      messageText.style.fontSize = '14px';
      messageText.textContent = config.features.chat?.greeting || 'Hi there! 👋 How can I help you today?';
      
      messageContent.appendChild(messageName);
      messageContent.appendChild(messageText);
      
      welcomeMessage.appendChild(welcomeAvatar);
      welcomeMessage.appendChild(messageContent);
      
      messagesContainer.appendChild(welcomeMessage);
      
      // Create input area
      const inputArea = document.createElement('div');
      inputArea.style.padding = '16px';
      inputArea.style.borderTop = config.design.theme === 'dark' ? '1px solid #333333' : '1px solid #e0e0e0';
      inputArea.style.display = 'flex';
      inputArea.style.alignItems = 'center';
      
      const chatInput = document.createElement('input');
      chatInput.type = 'text';
      chatInput.placeholder = config.chatConfig?.inputPlaceholder || 'Type your message...';
      chatInput.style.flex = '1';
      chatInput.style.padding = '12px 16px';
      chatInput.style.border = 'none';
      chatInput.style.borderRadius = '24px';
      chatInput.style.backgroundColor = config.design.theme === 'dark' ? '#333333' : '#f5f5f5';
      chatInput.style.color = config.design.theme === 'dark' ? '#ffffff' : '#333333';
      chatInput.style.fontSize = '14px';
      chatInput.style.outline = 'none';
      
      const sendButton = document.createElement('button');
      sendButton.style.display = 'flex';
      sendButton.style.alignItems = 'center';
      sendButton.style.justifyContent = 'center';
      sendButton.style.width = '40px';
      sendButton.style.height = '40px';
      sendButton.style.marginLeft = '8px';
      sendButton.style.backgroundColor = config.design.colors.primary;
      sendButton.style.color = '#ffffff';
      sendButton.style.border = 'none';
      sendButton.style.borderRadius = '50%';
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
          userMessageElement.style.marginBottom = '16px';
          
          const userMessageContent = document.createElement('div');
          userMessageContent.style.maxWidth = '80%';
          
          const userMessageText = document.createElement('div');
          userMessageText.style.padding = '12px 16px';
          userMessageText.style.backgroundColor = config.design.colors.primary;
          userMessageText.style.color = '#ffffff';
          userMessageText.style.borderRadius = '16px 0 16px 16px';
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
          
          // Simulate agent response after a delay
          setTimeout(() => {
            const agentResponse = document.createElement('div');
            agentResponse.style.display = 'flex';
            agentResponse.style.marginBottom = '16px';
            
            const responseAvatar = welcomeAvatar.cloneNode(true);
            
            const responseContent = document.createElement('div');
            responseContent.style.maxWidth = '80%';
            
            const responseName = document.createElement('div');
            responseName.style.fontWeight = '600';
            responseName.style.fontSize = '13px';
            responseName.style.marginBottom = '4px';
            responseName.textContent = config.features.chat?.agentName || 'Support';
            
            const responseText = document.createElement('div');
            responseText.style.padding = '12px 16px';
            responseText.style.backgroundColor = config.design.theme === 'dark' ? '#333333' : '#f0f0f0';
            responseText.style.borderRadius = '0 16px 16px 16px';
            responseText.style.fontSize = '14px';
            responseText.textContent = 'Thank you for your message. Our team will get back to you shortly.';
            
            responseContent.appendChild(responseName);
            responseContent.appendChild(responseText);
            
            agentResponse.appendChild(responseAvatar);
            agentResponse.appendChild(responseContent);
            
            messagesContainer.appendChild(agentResponse);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }, 1000);
        }
      }
      
      // Add event listeners
      chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
      
      sendButton.addEventListener('click', sendMessage);
      
      inputArea.appendChild(chatInput);
      inputArea.appendChild(sendButton);
      
      // Assemble chat screen
      chatContainer.appendChild(chatHeader);
      chatContainer.appendChild(messagesContainer);
      chatContainer.appendChild(inputArea);
      
      container.appendChild(chatContainer);
    }
    
    // Show book demo screen
    function showBookDemoScreen(container) {
      // Create book demo container
      const demoContainer = document.createElement('div');
      demoContainer.style.padding = '16px';
      
      // Create title
      const title = document.createElement('h2');
      title.style.fontSize = '20px';
      title.style.fontWeight = '600';
      title.style.marginBottom = '16px';
      title.textContent = config.features.bookDemo?.title || 'Book a Demo';
      
      // Create description
      const description = document.createElement('p');
      description.style.fontSize = '14px';
      description.style.marginBottom = '24px';
      description.style.color = '#666';
      description.textContent = config.features.bookDemo?.description || 'Schedule a time with our team to see our product in action.';
      
      // Create form
      const form = document.createElement('form');
      form.style.display = 'flex';
      form.style.flexDirection = 'column';
      form.style.gap = '16px';
      
      // Add name field
      const nameField = document.createElement('input');
      nameField.type = 'text';
      nameField.placeholder = 'Your name';
      nameField.style.padding = '12px 16px';
      nameField.style.border = config.design.theme === 'dark' ? '1px solid #333333' : '1px solid #e0e0e0';
      nameField.style.borderRadius = '8px';
      nameField.style.fontSize = '14px';
      nameField.style.backgroundColor = config.design.theme === 'dark' ? '#222222' : '#ffffff';
      nameField.style.color = config.design.theme === 'dark' ? '#ffffff' : '#333333';
      nameField.style.outline = 'none';
      
      // Add email field
      const emailField = document.createElement('input');
      emailField.type = 'email';
      emailField.placeholder = 'Your email';
      emailField.style.padding = '12px 16px';
      emailField.style.border = config.design.theme === 'dark' ? '1px solid #333333' : '1px solid #e0e0e0';
      emailField.style.borderRadius = '8px';
      emailField.style.fontSize = '14px';
      emailField.style.backgroundColor = config.design.theme === 'dark' ? '#222222' : '#ffffff';
      emailField.style.color = config.design.theme === 'dark' ? '#ffffff' : '#333333';
      emailField.style.outline = 'none';
      
      // Add submit button
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.textContent = 'Continue to Calendar';
      submitButton.style.padding = '12px 16px';
      submitButton.style.backgroundColor = config.design.colors.primary;
      submitButton.style.color = '#ffffff';
      submitButton.style.border = 'none';
      submitButton.style.borderRadius = '8px';
      submitButton.style.cursor = 'pointer';
      submitButton.style.fontSize = '14px';
      submitButton.style.fontWeight = '500';
      submitButton.style.marginTop = '8px';
      
      // Add form submission handler
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = nameField.value.trim();
        const email = emailField.value.trim();
        
        if (name && email) {
          // Track interaction
          trackInteraction('book_demo_form_submitted', { name, email });
          
          // Show calendly iframe
          showCalendlyIframe(container, name, email);
        }
      });
      
      form.appendChild(nameField);
      form.appendChild(emailField);
      form.appendChild(submitButton);
      
      demoContainer.appendChild(title);
      demoContainer.appendChild(description);
      demoContainer.appendChild(form);
      
      container.appendChild(demoContainer);
    }
    
    // Show calendly iframe
    function showCalendlyIframe(container, name, email) {
      // Clear container
      container.innerHTML = '';
      
      // Create iframe container
      const iframeContainer = document.createElement('div');
      iframeContainer.style.height = '100%';
      iframeContainer.style.width = '100%';
      
      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.src = `${config.features.bookDemo?.calendlyUrl || 'https://calendly.com/your-company/30min'}?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&hide_gdpr_banner=1`;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      iframeContainer.appendChild(iframe);
      container.appendChild(iframeContainer);
    }
    
    // Show call me screen
    function showCallMeScreen(container) {
      // Create call me container
      const callContainer = document.createElement('div');
      callContainer.style.padding = '16px';
      
      // Create title
      const title = document.createElement('h2');
      title.style.fontSize = '20px';
      title.style.fontWeight = '600';
      title.style.marginBottom = '16px';
      title.textContent = config.features.callMe?.messages?.title || 'Request a Call';
      
      // Create description
      const description = document.createElement('p');
      description.style.fontSize = '14px';
      description.style.marginBottom = '24px';
      description.style.color = '#666';
      description.textContent = config.features.callMe?.messages?.description || 'Enter your phone number and we\'ll call you shortly.';
      
      // Create form
      const form = document.createElement('form');
      form.style.display = 'flex';
      form.style.flexDirection = 'column';
      form.style.gap = '16px';
      
      // Add name field
      const nameField = document.createElement('input');
      nameField.type = 'text';
      nameField.placeholder = 'Your name';
      nameField.style.padding = '12px 16px';
      nameField.style.border = config.design.theme === 'dark' ? '1px solid #333333' : '1px solid #e0e0e0';
      nameField.style.borderRadius = '8px';
      nameField.style.fontSize = '14px';
      nameField.style.backgroundColor = config.design.theme === 'dark' ? '#222222' : '#ffffff';
      nameField.style.color = config.design.theme === 'dark' ? '#ffffff' : '#333333';
      nameField.style.outline = 'none';
      
      // Add phone field
      const phoneField = document.createElement('input');
      phoneField.type = 'tel';
      phoneField.placeholder = 'Your phone number';
      phoneField.style.padding = '12px 16px';
      phoneField.style.border = config.design.theme === 'dark' ? '1px solid #333333' : '1px solid #e0e0e0';
      phoneField.style.borderRadius = '8px';
      phoneField.style.fontSize = '14px';
      phoneField.style.backgroundColor = config.design.theme === 'dark' ? '#222222' : '#ffffff';
      phoneField.style.color = config.design.theme === 'dark' ? '#ffffff' : '#333333';
      phoneField.style.outline = 'none';
      
      // Add submit button
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.textContent = 'Request Call';
      submitButton.style.padding = '12px 16px';
      submitButton.style.backgroundColor = config.design.colors.primary;
      submitButton.style.color = '#ffffff';
      submitButton.style.border = 'none';
      submitButton.style.borderRadius = '8px';
      submitButton.style.cursor = 'pointer';
      submitButton.style.fontSize = '14px';
      submitButton.style.fontWeight = '500';
      submitButton.style.marginTop = '8px';
      
      // Add form submission handler
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = nameField.value.trim();
        const phone = phoneField.value.trim();
        
        if (name && phone) {
          // Track interaction
          trackInteraction('call_me_submitted', { name, phone });
          
          // Show success message
          showCallMeSuccess(container);
        }
      });
      
      form.appendChild(nameField);
      form.appendChild(phoneField);
      form.appendChild(submitButton);
      
      callContainer.appendChild(title);
      callContainer.appendChild(description);
      callContainer.appendChild(form);
      
      container.appendChild(callContainer);
    }
    
    // Show call me success
    function showCallMeSuccess(container) {
      // Clear container
      container.innerHTML = '';
      
      // Create success container
      const successContainer = document.createElement('div');
      successContainer.style.display = 'flex';
      successContainer.style.flexDirection = 'column';
      successContainer.style.alignItems = 'center';
      successContainer.style.justifyContent = 'center';
      successContainer.style.height = '100%';
      successContainer.style.padding = '24px';
      successContainer.style.textAlign = 'center';
      
      // Create success icon
      const successIcon = document.createElement('div');
      successIcon.style.width = '64px';
      successIcon.style.height = '64px';
      successIcon.style.borderRadius = '50%';
      successIcon.style.backgroundColor = config.design.colors.primary;
      successIcon.style.color = '#ffffff';
      successIcon.style.display = 'flex';
      successIcon.style.alignItems = 'center';
      successIcon.style.justifyContent = 'center';
      successIcon.style.marginBottom = '24px';
      successIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      
      // Create success title
      const successTitle = document.createElement('h2');
      successTitle.style.fontSize = '24px';
      successTitle.style.fontWeight = '600';
      successTitle.style.marginBottom = '16px';
      successTitle.textContent = 'Request Received!';
      
      // Create success message
      const successMessage = document.createElement('p');
      successMessage.style.fontSize = '16px';
      successMessage.style.marginBottom = '24px';
      successMessage.style.color = '#666';
      successMessage.textContent = 'We\'ll call you as soon as possible.';
      
      // Create back button
      const backButton = document.createElement('button');
      backButton.textContent = 'Back to Home';
      backButton.style.padding = '12px 24px';
      backButton.style.backgroundColor = config.design.colors.primary;
      backButton.style.color = '#ffffff';
      backButton.style.border = 'none';
      backButton.style.borderRadius = '8px';
      backButton.style.cursor = 'pointer';
      backButton.style.fontSize = '14px';
      backButton.style.fontWeight = '500';
      
      backButton.addEventListener('click', () => showScreen('home'));
      
      successContainer.appendChild(successIcon);
      successContainer.appendChild(successTitle);
      successContainer.appendChild(successMessage);
      successContainer.appendChild(backButton);
      
      container.appendChild(successContainer);
    }
    
    // Toggle widget content visibility
    button.addEventListener('click', function() {
      if (content.style.display === 'none') {
        content.style.display = 'flex';
        showScreen('home');
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
    
    // Show home screen by default
    showScreen('home');
  }
  
  // Initialize the widget when the DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initWidget();
  } else {
    window.addEventListener('DOMContentLoaded', initWidget);
  }
})();
