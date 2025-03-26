import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin if not already initialized
try {
  admin.initializeApp();
} catch (e) {
  console.log('Firebase admin already initialized');
}

/**
 * This function serves as a redirect for the widget adapter script.
 * It allows the script to be accessed from both:
 * - https://adealo-ce238.web.app/intercom-style-widget-adapter.js (Firebase Hosting)
 * - https://us-central1-adealo-ce238.web.app/intercom-style-widget-adapter.js (Cloud Functions)
 */
// @ts-expect-error: TypeScript may show an error for onRequest, but it exists at runtime
export const intercomStyleWidgetAdapter = functions.https.onRequest((request, response) => {
  // Set CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  // Only allow GET requests
  if (request.method !== 'GET') {
    response.status(405).send('Method Not Allowed');
    return;
  }
  
  // Redirect to the actual script on Firebase Hosting
  response.redirect('https://adealo-ce238.web.app/intercom-style-widget-adapter.js');
});

/**
 * This function serves as a redirect for the new widget script.
 * It allows the script to be accessed from both:
 * - https://adealo-ce238.web.app/widget.js (Firebase Hosting)
 * - https://us-central1-adealo-ce238.web.app/widget.js (Cloud Functions)
 */
// @ts-expect-error: TypeScript may show an error for onRequest, but it exists at runtime
export const widgetScript = functions.https.onRequest((request, response) => {
  // Set CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  // Only allow GET requests
  if (request.method !== 'GET') {
    response.status(405).send('Method Not Allowed');
    return;
  }
  
  // Redirect to the actual script on Firebase Hosting
  response.redirect('https://adealo-ce238.web.app/widget.js');
});
