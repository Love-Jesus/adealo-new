/**
 * Multi Widget Adapter
 * 
 * This script adapts the Multi Widget to work with the existing widget loader system.
 * It acts as a bridge between the widget-loader.js and the multi-widget.js.
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
  
  console.log('Initializing Multi Widget adapter with ID:', widgetId);
  
  // Create widget container if it doesn't exist
  let container = document.getElementById('adealo-widget-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adealo-widget-container';
    document.body.appendChild(container);
  }
  
  // Function to get the base URL for script loading
  function getBaseUrl() {
    try {
      // Try to get the current script's URL to determine the base URL
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src && src.includes('multi-widget-adapter.js') || src.includes('widget-loader.js')) {
          const url = new URL(src);
          return url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
        }
      }
      
      // Fallback to current page's origin
      return window.location.origin + '/';
    } catch (error) {
      console.error('DEBUG: Adapter - Error determining base URL:', error);
      // Default fallback
      return '/';
    }
  }

  // Function to load the Multi Widget
  function loadMultiWidget() {
    console.log('DEBUG: Adapter - Loading Multi Widget with ID:', widgetId);
    
    try {
      // Set the widget ID in the window.widgetConfig object
      // Make sure to create a new object to avoid reference issues
      window.widgetConfig = {
        ...widgetConfig,
        id: widgetId
      };
      
      console.log('DEBUG: Adapter - Set window.widgetConfig =', JSON.stringify(window.widgetConfig));
      
      // Create a global variable to ensure the widget ID is available
      window.ADEALO_WIDGET_ID = widgetId;
      
      // Get the base URL for loading the widget script
      const baseUrl = getBaseUrl();
      
      // Create the script element
      const script = document.createElement('script');
      script.id = 'multi-widget-script';
      
      // Add cache busting parameter to ensure latest version is loaded
      const cacheBuster = new Date().getTime();
      script.src = baseUrl + 'multi-widget.js?v=' + cacheBuster + '&widgetId=' + encodeURIComponent(widgetId);
      script.setAttribute('data-widget-id', widgetId);
      
      script.onload = function() {
        console.log('DEBUG: Adapter - Multi Widget loaded successfully');
      };
      
      script.onerror = function(error) {
        console.error('DEBUG: Adapter - Error loading Multi Widget:', error);
        console.error('DEBUG: Adapter - Failed to load from URL:', script.src);
        // Try alternative loading method as fallback
        tryAlternativeLoading();
      };
      
      // Add the script to the document
      document.head.appendChild(script);
    } catch (error) {
      console.error('DEBUG: Adapter - Error in loadMultiWidget:', error);
      tryAlternativeLoading();
    }
  }
  
  // Fallback loading method
  function tryAlternativeLoading() {
    try {
      console.log('DEBUG: Adapter - Trying alternative loading method');
      
      // Try with a relative path
      const script = document.createElement('script');
      script.id = 'multi-widget-script-fallback';
      
      // Add cache busting parameter to ensure latest version is loaded
      const fallbackCacheBuster = new Date().getTime();
      script.src = 'multi-widget.js?v=' + fallbackCacheBuster + '&widgetId=' + encodeURIComponent(widgetId);
      script.setAttribute('data-widget-id', widgetId);
      
      script.onload = function() {
        console.log('DEBUG: Adapter - Fallback loading successful');
      };
      
      script.onerror = function() {
        console.error('DEBUG: Adapter - Fallback loading also failed');
        alert('Widget loading failed. Please check the console for more information.');
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('DEBUG: Adapter - Error in alternative loading:', error);
    }
  }
  
  // Initialize the widget
  function initWidget() {
    console.log('DEBUG: Adapter - Initializing widget');
    
    // Load the Multi Widget with a slight delay to ensure DOM is ready
    setTimeout(function() {
      loadMultiWidget();
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
