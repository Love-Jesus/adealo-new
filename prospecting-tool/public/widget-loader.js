/**
 * Intercom-Style Widget Adapter
 * 
 * This script adapts the Intercom-style widget to work with the existing widget loader system.
 * It acts as a bridge between the widget-loader.js and the intercom-style-widget.js.
 */

(function() {
  console.log('DEBUG: Adapter script starting execution');
  
  // Try to get widget ID from URL parameters first
  const getUrlParameter = function(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };
  
  // Try to get widget ID from script tag URL
  const getScriptUrlParameter = function(name) {
    if (!document.currentScript || !document.currentScript.src) return '';
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(document.currentScript.src);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };
  
  // Get the widget configuration from all possible sources
  const widgetConfig = window.widgetConfig || {};
  const urlWidgetId = getUrlParameter('widgetId');
  const scriptUrlWidgetId = getScriptUrlParameter('widgetId');
  const dataWidgetId = document.currentScript ? document.currentScript.getAttribute('data-widget-id') : null;
  const configWidgetId = widgetConfig.id || null;
  
  // Log all possible widget ID sources
  console.log('DEBUG: Adapter - URL widgetId =', urlWidgetId);
  console.log('DEBUG: Adapter - Script URL widgetId =', scriptUrlWidgetId);
  console.log('DEBUG: Adapter - data-widget-id attribute =', dataWidgetId);
  console.log('DEBUG: Adapter - window.widgetConfig.id =', configWidgetId);
  console.log('DEBUG: Adapter - window.widgetConfig =', JSON.stringify(widgetConfig));
  
  // Use the first available widget ID
  const widgetId = configWidgetId || dataWidgetId || scriptUrlWidgetId || urlWidgetId;
  
  console.log('DEBUG: Adapter - Final widgetId =', widgetId);
  
  // Set a global variable for the widget ID for debugging
  window.__ADEALO_DEBUG_WIDGET_ID = widgetId;
  
  if (!widgetId) {
    console.error('Widget Error: Missing widgetId parameter');
    console.error('DEBUG: Adapter - All widget ID sources failed');
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
    console.log('DEBUG: Adapter - Loading Intercom-style widget with ID:', widgetId);
    
    // Set the widget ID in the window.widgetConfig object
    // Make sure to create a new object to avoid reference issues
    window.widgetConfig = {
      ...widgetConfig,
      id: widgetId
    };
    
    console.log('DEBUG: Adapter - Set window.widgetConfig =', JSON.stringify(window.widgetConfig));
    
    // Create a global variable to ensure the widget ID is available
    window.ADEALO_WIDGET_ID = widgetId;
    
    // Create the script element
    const script = document.createElement('script');
    script.id = 'intercom-style-widget-script';
    script.src = '/intercom-style-widget.js?widgetId=' + encodeURIComponent(widgetId);
    script.setAttribute('data-widget-id', widgetId);
    
    script.onload = function() {
      console.log('DEBUG: Adapter - Intercom-style widget loaded successfully');
    };
    
    script.onerror = function(error) {
      console.error('DEBUG: Adapter - Error loading Intercom-style widget:', error);
    };
    
    // Add the script to the document
    document.head.appendChild(script);
  }
  
  // Initialize the widget
  function initWidget() {
    console.log('DEBUG: Adapter - Initializing widget');
    
    // Load the Intercom-style widget with a slight delay to ensure DOM is ready
    setTimeout(function() {
      loadIntercomStyleWidget();
    }, 100);
  }
  
  // Initialize the widget when the DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DEBUG: Adapter - Document already ready, initializing widget');
    initWidget();
  } else {
    console.log('DEBUG: Adapter - Document not ready, adding DOMContentLoaded listener');
    window.addEventListener('DOMContentLoaded', initWidget);
  }
  
  // Define global API
  window.__ADEALO_WIDGET_INSTANCE = {
    open: function() {
      console.log('DEBUG: Adapter - API call: open()');
      const button = document.getElementById('adealo-widget-button-' + widgetId);
      if (button) {
        button.click();
      } else {
        console.error('DEBUG: Adapter - Button not found for widget ID:', widgetId);
      }
    },
    close: function() {
      console.log('DEBUG: Adapter - API call: close()');
      const content = document.getElementById('adealo-widget-content-' + widgetId);
      if (content) {
        content.style.display = 'none';
      } else {
        console.error('DEBUG: Adapter - Content not found for widget ID:', widgetId);
      }
    },
    showScreen: function(screenName) {
      console.log('DEBUG: Adapter - API call: showScreen()', screenName);
      const navItem = document.querySelector(`[data-nav="${screenName}"]`);
      if (navItem) {
        navItem.click();
      } else {
        console.error('DEBUG: Adapter - Nav item not found for screen:', screenName);
      }
    }
  };
})();
