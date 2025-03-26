// Vite plugin to handle API endpoints
// This plugin will intercept requests to /api/* and serve them from the src/api directory

import path from 'path';
import fs from 'fs';

export default function apiPlugin() {
  return {
    name: 'vite-plugin-api',
    configureServer(server) {
      // Add CORS headers to all responses
      server.middlewares.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Handle OPTIONS requests for CORS preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }
        
        next();
      });
      
      // Handle API requests
      server.middlewares.use(async (req, res, next) => {
        // Check if the request is for an API endpoint
        if (req.url && req.url.startsWith('/api/')) {
          console.log(`API request received: ${req.method} ${req.url}`);
          
          try {
            // Extract the endpoint name from the URL
            const urlParts = req.url.split('?');
            const path = urlParts[0];
            const endpoint = path.split('/api/')[1];
            
            if (!endpoint) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'API endpoint not specified' }));
              return;
            }
            
            // Parse query parameters
            const query = {};
            const queryString = urlParts[1];
            if (queryString) {
              queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                if (key && value) {
                  query[key] = decodeURIComponent(value);
                }
              });
            }
            
            console.log(`API endpoint: ${endpoint}, Query:`, query);
            
            // Create a request object with the query parameters
            const request = {
              query,
              method: req.method,
              headers: req.headers,
              url: req.url,
              body: req.body
            };
            
            // Create a response object
            const response = {
              status: (code) => {
                res.statusCode = code;
                return response;
              },
              json: (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return response;
              },
              send: (data) => {
                res.end(data);
                return response;
              },
              setHeader: (name, value) => {
                res.setHeader(name, value);
                return response;
              }
            };
            
            // Check if the API handler file exists
            const apiFilePath = path.resolve(process.cwd(), 'src', 'api', `${endpoint}.js`);
            console.log(`Looking for API handler at: ${apiFilePath}`);
            
            if (!fs.existsSync(apiFilePath)) {
              console.error(`API handler file not found: ${apiFilePath}`);
              res.statusCode = 404;
              res.end(JSON.stringify({ error: `API endpoint ${endpoint} not found` }));
              return;
            }
            
            // Import the API handler
            try {
              console.log(`Importing API handler: ${apiFilePath}`);
              // Use a direct import with the full path
              const apiModule = await import(`${apiFilePath}?t=${Date.now()}`);
              const handler = apiModule.default;
              
              if (typeof handler === 'function') {
                console.log(`Calling API handler for ${endpoint}`);
                // Call the handler with the request and response objects
                await handler(request, response);
                
                // The handler should have called response.send() or response.json()
                // If it hasn't ended the response yet, we'll do it here
                if (!res.writableEnded) {
                  console.log(`Response not ended by handler, ending now`);
                  res.end();
                }
              } else {
                // If the handler is not a function, return a 404
                console.error(`API handler for ${endpoint} is not a function`);
                res.statusCode = 404;
                res.end(JSON.stringify({ error: `API endpoint ${endpoint} not found` }));
              }
            } catch (error) {
              console.error(`Error handling API request to ${endpoint}:`, error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: `Error handling API request: ${error.message}` }));
            }
          } catch (error) {
            console.error('Error parsing API request:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: `Error parsing API request: ${error.message}` }));
          }
        } else {
          // Not an API request, continue to the next middleware
          next();
        }
      });
    }
  };
}
