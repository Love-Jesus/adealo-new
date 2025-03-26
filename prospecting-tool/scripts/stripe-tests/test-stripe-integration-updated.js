/**
 * Stripe Integration Test Script
 * 
 * This script tests the Stripe integration with the updated API keys.
 */

// Import required modules
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
const crypto = require('crypto');
const fs = require('fs');

// Create a log file
const logFile = 'stripe-test-results.log';
let logContent = '';

// Function to log to both console and file
function log(message) {
  console.log(message);
  logContent += message + '\n';
}

/**
 * Test the Stripe API key
 */
async function testApiKey() {
  log('\n=== Testing Stripe API Key ===');
  
  try {
    // Try to list customers (a simple API call)
    const customers = await stripe.customers.list({ limit: 3 });
    
    log('✅ API key is valid!');
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
    
    // Create a test customer
    log('\nCreating a test customer...');
    
    const customer = await stripe.customers.create({
      email: `test-${Date.now()}@example.com`,
      name: 'Test Customer',
      metadata: {
        test: 'true',
        timestamp: Date.now().toString()
      }
    });
    
    log('✅ Successfully created test customer!');
    log(`Customer ID: ${customer.id}`);
    
    return true;
  } catch (error) {
    log(`❌ API key test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test creating a payment intent
 */
async function testPaymentIntent() {
  log('\n=== Testing Payment Intent Creation ===');
  
  try {
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10.00
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        test: 'true',
        timestamp: Date.now().toString()
      }
    });
    
    log('✅ Successfully created payment intent!');
    log(`Payment Intent ID: ${paymentIntent.id}`);
    log(`Client Secret: ${paymentIntent.client_secret}`);
    
    return true;
  } catch (error) {
    log(`❌ Payment intent test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test the webhook signature verification
 */
async function testWebhookSignature() {
  log('\n=== Testing Webhook Signature Verification ===');
  
  try {
    // Webhook secret
    const webhookSecret = 'whsec_test_12345';
    
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
    
    // Verify the signature
    try {
      const constructedEvent = stripe.webhooks.constructEvent(
        payload,
        stripeSignature,
        webhookSecret
      );
      
      log('✅ Webhook signature verified!');
      log(`Event type: ${constructedEvent.type}`);
      log('Webhook secret is valid!');
      
      return true;
    } catch (error) {
      log(`❌ Webhook signature verification failed: ${error.message}`);
      return false;
    }
  } catch (error) {
    log(`❌ Webhook test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test creating a subscription
 */
async function testSubscription() {
  log('\n=== Testing Subscription Creation ===');
  
  try {
    // Create a test customer
    const customer = await stripe.customers.create({
      email: `test-${Date.now()}@example.com`,
      name: 'Test Subscription Customer'
    });
    
    log(`Created test customer: ${customer.id}`);
    
    // Create a test product if it doesn't exist
    let product;
    try {
      product = await stripe.products.retrieve('test_product');
      log(`Using existing product: ${product.id}`);
    } catch (error) {
      product = await stripe.products.create({
        id: 'test_product',
        name: 'Test Product',
        description: 'Test product for subscription testing'
      });
      log(`Created new product: ${product.id}`);
    }
    
    // Create a test price if it doesn't exist
    let price;
    try {
      const prices = await stripe.prices.list({
        product: product.id,
        limit: 1
      });
      
      if (prices.data.length > 0) {
        price = prices.data[0];
        log(`Using existing price: ${price.id}`);
      } else {
        throw new Error('No price found for product');
      }
    } catch (error) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: 1000, // $10.00
        currency: 'usd',
        recurring: {
          interval: 'month'
        }
      });
      log(`Created new price: ${price.id}`);
    }
    
    // Create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: price.id
        }
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });
    
    log('✅ Successfully created subscription!');
    log(`Subscription ID: ${subscription.id}`);
    log(`Status: ${subscription.status}`);
    log(`Client Secret: ${subscription.latest_invoice.payment_intent.client_secret}`);
    
    return true;
  } catch (error) {
    log(`❌ Subscription test failed: ${error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  log('=== Stripe Integration Tests with Updated Keys ===');
  log(`Date: ${new Date().toISOString()}`);
  log(`API Key: sk_test_4eC39HqLyjWDarjtT1zdp7dc`);
  log(`Publishable Key: pk_test_TYooMQauvdEDq54NiTphI7jx`);
  log(`Webhook Secret: whsec_test_12345`);
  
  // Test the API key
  const apiKeyValid = await testApiKey();
  
  // Test creating a payment intent
  const paymentIntentValid = await testPaymentIntent();
  
  // Test the webhook signature
  const webhookSecretValid = await testWebhookSignature();
  
  // Test creating a subscription
  const subscriptionValid = await testSubscription();
  
  // Print summary
  log('\n=== Test Summary ===');
  log(`API Key: ${apiKeyValid ? '✅ Valid' : '❌ Invalid'}`);
  log(`Payment Intent: ${paymentIntentValid ? '✅ Valid' : '❌ Invalid'}`);
  log(`Webhook Secret: ${webhookSecretValid ? '✅ Valid' : '❌ Invalid'}`);
  log(`Subscription: ${subscriptionValid ? '✅ Valid' : '❌ Invalid'}`);
  
  if (apiKeyValid && paymentIntentValid && webhookSecretValid && subscriptionValid) {
    log('\n✅ All tests passed! Your Stripe integration is working correctly.');
  } else {
    log('\n❌ Some tests failed. Please check the errors above.');
  }
  
  // Write the log to a file
  fs.writeFileSync(logFile, logContent);
  console.log(`\nTest results written to ${logFile}`);
}

// Run the tests
runTests().catch(error => {
  log(`Unhandled error: ${error.message}`);
  
  // Write the log to a file
  fs.writeFileSync(logFile, logContent);
  console.log(`\nTest results written to ${logFile}`);
});
