/**
 * Intercom-Style Widget Adapter
 * 
 * This script adapts the Intercom-style widget to work with the existing widget loader system.
 * It acts as a bridge between the widget-loader.js and the intercom-style-widget.js.
 */

(function() {
  // Get the widget configuration from the window object
  const widgetConfig = window.widgetConfig || {};
  const widgetId = widgetConfig.id || document.currentScript.getAttribute('data-widget-id');
  
  if (!widgetId) {
    console.error('Widget Error: Missing widgetId parameter');
    return;
  }
  
  console.log('Initializing Intercom-style widget adapter with ID:', widgetId);
  
  // Create widget container if it doesn't exist
  let container = document.getElementById('adealo-widget-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adealo-widget-container';
    document.body.appendChild(container);
  }
  
  // Function to load the Intercom-style widget
  function loadIntercomStyleWidget() {
    // Set the widget ID in the window.widgetConfig object
    window.widgetConfig = {
      ...widgetConfig,
      id: widgetId
    };
    
    // Create the script element
    const script = document.createElement('script');
    script.id = 'intercom-style-widget-script';
    script.src = '/intercom-style-widget.js';
    script.setAttribute('data-widget-id', widgetId);
    script.onload = function() {
      console.log('Intercom-style widget loaded successfully');
    };
    script.onerror = function(error) {
      console.error('Error loading Intercom-style widget:', error);
    };
    document.head.appendChild(script);
  }
  
  // Initialize the widget
  function initWidget() {
    // Load the Intercom-style widget
    loadIntercomStyleWidget();
  }
  
  // Initialize the widget when the DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initWidget();
  } else {
    window.addEventListener('DOMContentLoaded', initWidget);
  }
  
  // Define global API
  window.__ADEALO_WIDGET_INSTANCE = {
    open: function() {
      const button = document.getElementById('adealo-widget-button-' + widgetId);
      if (button) {
        button.click();
      }
    },
    close: function() {
      const content = document.getElementById('adealo-widget-content-' + widgetId);
      if (content) {
        content.style.display = 'none';
      }
    },
    showScreen: function(screenName) {
      const navItem = document.querySelector(`[data-nav="${screenName}"]`);
      if (navItem) {
        navItem.click();
      }
    }
  };
})();
