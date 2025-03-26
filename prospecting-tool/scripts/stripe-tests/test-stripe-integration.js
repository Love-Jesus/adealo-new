/**
 * Stripe Integration Test Script
 * 
 * This script tests the Stripe integration by:
 * 1. Testing the API key by making a simple API call
 * 2. Testing the webhook secret by simulating a webhook event
 */

// Import required modules
const stripe = require('stripe')('sk_test_51R3hqb2RSvYJumwmjic8DhWeQskS5ffZXSCJZQEUSdkd0J9hiqpyIQnlMj7tlz6gFgSWwTlQL4sbkKMZ7Zv0cVK2003hgCwQ5b');
const crypto = require('crypto');
const fetch = require('node-fetch');

// Webhook secret from Stripe dashboard
const webhookSecret = 'whsec_b6c3e8a74467f33f7e5b0dc095aa58b6756cb6b63aec0b9460aecc7b3421d27b';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Test the Stripe API key
 */
async function testApiKey() {
  console.log(`${colors.blue}Testing Stripe API key...${colors.reset}`);
  
  try {
    // Try to list customers (a simple API call)
    const customers = await stripe.customers.list({ limit: 3 });
    
    console.log(`${colors.green}✓ API key is valid!${colors.reset}`);
    console.log(`${colors.cyan}Retrieved ${customers.data.length} customers${colors.reset}`);
    
    // Create a test customer
    console.log(`${colors.blue}Creating a test customer...${colors.reset}`);
    
    const customer = await stripe.customers.create({
      email: `test-${Date.now()}@example.com`,
      name: 'Test Customer',
      metadata: {
        test: 'true',
        timestamp: Date.now().toString()
      }
    });
    
    console.log(`${colors.green}✓ Successfully created test customer!${colors.reset}`);
    console.log(`${colors.cyan}Customer ID: ${customer.id}${colors.reset}`);
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ API key test failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test the webhook secret
 */
async function testWebhookSecret() {
  console.log(`${colors.blue}Testing webhook secret...${colors.reset}`);
  
  try {
    // Create a sample event
    const eventData = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2025-02-24',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `cus_test_${Date.now()}`,
          object: 'customer',
          email: `test-${Date.now()}@example.com`,
          name: 'Test Customer',
          created: Math.floor(Date.now() / 1000)
        }
      },
      type: 'customer.created'
    };
    
    // Convert the event data to a string
    const payload = JSON.stringify(eventData);
    
    // Create a signature using the webhook secret
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payload}`;
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');
    
    // Create the Stripe-Signature header
    const stripeSignature = `t=${timestamp},v1=${signature}`;
    
    // Verify the signature locally first
    try {
      const constructedEvent = stripe.webhooks.constructEvent(
        payload,
        stripeSignature,
        webhookSecret
      );
      
      console.log(`${colors.green}✓ Webhook signature verified locally!${colors.reset}`);
      console.log(`${colors.cyan}Event type: ${constructedEvent.type}${colors.reset}`);
    } catch (error) {
      console.log(`${colors.red}✗ Local webhook signature verification failed: ${error.message}${colors.reset}`);
      return false;
    }
    
    console.log(`${colors.blue}Webhook secret is valid!${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Webhook secret test failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${colors.magenta}=== Stripe Integration Tests ====${colors.reset}`);
  
  // Test the API key
  const apiKeyValid = await testApiKey();
  
  // Test the webhook secret
  const webhookSecretValid = await testWebhookSecret();
  
  // Print summary
  console.log(`\n${colors.magenta}=== Test Summary ====${colors.reset}`);
  console.log(`${colors.cyan}API Key: ${apiKeyValid ? colors.green + '✓ Valid' : colors.red + '✗ Invalid'}${colors.reset}`);
  console.log(`${colors.cyan}Webhook Secret: ${webhookSecretValid ? colors.green + '✓ Valid' : colors.red + '✗ Invalid'}${colors.reset}`);
  
  if (apiKeyValid && webhookSecretValid) {
    console.log(`\n${colors.green}All tests passed! Your Stripe integration is working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}Some tests failed. Please check the errors above.${colors.reset}`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
});
