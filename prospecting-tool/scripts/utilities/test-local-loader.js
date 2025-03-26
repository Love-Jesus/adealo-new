/**
 * Test script for the local-loader.js file
 * This script will test the local-loader.js file by loading it and initializing the widget
 */

// Log the test start
console.log('Testing local-loader.js...');

// Create a script element to load the local-loader.js file
const script = document.createElement('script');
script.src = 'http://localhost:5173/local-loader.js';
script.async = true;
script.onload = function() {
  console.log('Local loader script loaded successfully');
  
  // Initialize the widget with the test widget ID
  window.adealo('init', 'WnwIUWLRHxM09A6EYJPY');
  
  console.log('Widget initialization called');
};
script.onerror = function() {
  console.error('Failed to load local loader script');
};

// Add the script to the document
document.head.appendChild(script);

// Log that the script has been added
console.log('Local loader script added to the document');
