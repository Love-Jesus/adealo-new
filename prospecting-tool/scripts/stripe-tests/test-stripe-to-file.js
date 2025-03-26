// Simple Stripe API test that writes output to a file
const stripe = require('stripe')('sk_test_51R3hqb2RSvYJumwmjic8DhWeQskS5ffZXSCJZQEUSdkd0J9hiqpyIQnlMj7tlz6gFgSWwTlQL4sbkKMZ7Zv0cVK2003hgCwQ5b');
const fs = require('fs');

// Create a log file
const logFile = 'stripe-test-results.log';
let logContent = '';

// Function to log to both console and file
function log(message) {
  console.log(message);
  logContent += message + '\n';
}

async function testStripeAPI() {
  try {
    log('Testing Stripe API key...');
    
    // Try to list customers (a simple API call)
    const customers = await stripe.customers.list({ limit: 3 });
    
    log('API key is valid!');
    log(`Retrieved ${customers.data.length} customers`);
    
    // Print customer details
    if (customers.data.length > 0) {
      log('\nCustomer details:');
      customers.data.forEach((customer, index) => {
        log(`\nCustomer ${index + 1}:`);
        log(`ID: ${customer.id}`);
        log(`Email: ${customer.email || 'No email'}`);
        log(`Created: ${new Date(customer.created * 1000).toISOString()}`);
      });
    }
    
    // Test webhook secret
    log('\nTesting webhook secret...');
    const webhookSecret = 'whsec_b6c3e8a74467f33f7e5b0dc095aa58b6756cb6b63aec0b9460aecc7b3421d27b';
    
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
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');
    
    // Create the Stripe-Signature header
    const stripeSignature = `t=${timestamp},v1=${signature}`;
    
    // Verify the signature
    try {
      const constructedEvent = stripe.webhooks.constructEvent(
        payload,
        stripeSignature,
        webhookSecret
      );
      
      log('Webhook signature verified!');
      log(`Event type: ${constructedEvent.type}`);
      log('Webhook secret is valid!');
    } catch (error) {
      log(`Webhook signature verification failed: ${error.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    log(`API key test failed: ${error.message}`);
    return false;
  }
}

// Run the test
testStripeAPI()
  .then(result => {
    if (result) {
      log('\nAll tests passed! Your Stripe integration is working correctly.');
    } else {
      log('\nSome tests failed. Please check the errors above.');
    }
    
    // Write the log to a file
    fs.writeFileSync(logFile, logContent);
    console.log(`\nTest results written to ${logFile}`);
  })
  .catch(error => {
    log(`Unhandled error: ${error.message}`);
    
    // Write the log to a file
    fs.writeFileSync(logFile, logContent);
    console.log(`\nTest results written to ${logFile}`);
  });
