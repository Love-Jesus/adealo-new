/**
 * Adealo Widget Loader
 * This script loads the Adealo widget and initializes it with the provided widget ID.
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
    
    // Direct URL to the Firebase Function
    const functionUrl = `https://us-central1-adealo-ce238.cloudfunctions.net/getWidgetScriptHttp?widgetId=${widgetId}`;
    
    console.log('Adealo Widget: Fetching widget script from', functionUrl);
    
    // Create a request to the Firebase Function with standard CORS
    fetch(functionUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/javascript, application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
      credentials: 'omit'
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
        // Direct script response from HTTP function
        return response.text().then(script => {
          console.log('Adealo Widget: Received direct script response');
          return { directScript: script };
        });
      } else {
        // JSON response from callable function
        return response.json().then(data => {
          console.log('Adealo Widget: Received JSON response', data);
          return data;
        });
      }
    })
    .then(data => {
      let script;
      
      if (data.directScript) {
        // Direct script from HTTP function
        script = data.directScript;
      } else if (data && data.result && data.result.script) {
        // Script from callable function
        script = data.result.script;
      } else {
        throw new Error('Invalid response format');
      }
      
      // Execute the widget script
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
      
      // Try alternative endpoint as fallback
      console.log('Adealo Widget: Trying alternative endpoint');
      const altFunctionUrl = `https://us-central1-adealo-ce238.cloudfunctions.net/getWidgetScript`;
      
      // Use callable function as fallback
      fetch(altFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({ data: { widgetId: widgetId } }),
        mode: 'cors'
      })
      .then(response => {
        console.log('Adealo Widget: Alternative endpoint response', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Adealo Widget: Alternative endpoint data', data);
        if (data && data.result && data.result.script) {
          console.log('Adealo Widget: Alternative endpoint succeeded');
          const scriptElement = document.createElement('script');
          scriptElement.textContent = data.result.script;
          document.head.appendChild(scriptElement);
        } else {
          throw new Error('Invalid response format from alternative endpoint');
        }
      })
      .catch(altError => {
        console.error('Adealo Widget: Alternative endpoint also failed', altError);
      });
    });
  };
  
  // NOTE: Auto-initialization is disabled
  // To initialize the widget, call window.adealo.init('WnwIUWLRHxM09A6EYJPY') manually
})();
