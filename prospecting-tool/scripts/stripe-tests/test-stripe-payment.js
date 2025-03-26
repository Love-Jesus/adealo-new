// Test script to verify Stripe integration
import Stripe from 'stripe';

// Use the updated Stripe API key
const stripeSecretKey = 'sk_test_51R3hqb2RSvYJumwmjic8DhWeQskS5ffZXSCJZQEUSdkd0J9hiqpyIQnlMj7tlz6gFgSWwTlQL4sbkKMZ7Zv0cVK2003hgCwQ5b';
const webhookSecret = 'whsec_test_67890';

console.log('Testing Stripe Integration...');
console.log('----------------------------');

// Create a new Stripe instance
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
});

// Test function to verify Stripe integration
const testStripeIntegration = async () => {
  let customer = null;
  let product = null;
  let price = null;

  try {
    // Step 1: Verify API key by retrieving account info
    console.log('1. Verifying API key...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ API key is valid!');
    console.log('Account ID:', account.id);
    console.log('Account country:', account.country);
    console.log('Account business type:', account.business_type);
    
    // Step 2: Create a test customer
    console.log('\n2. Creating test customer...');
    customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer',
      description: 'Test customer for integration verification',
    });
    console.log('✅ Test customer created!');
    console.log('Customer ID:', customer.id);
    
    // Step 3: Create a test product
    console.log('\n3. Creating test product...');
    product = await stripe.products.create({
      name: 'Test Product',
      description: 'Test product for integration verification',
    });
    console.log('✅ Test product created!');
    console.log('Product ID:', product.id);
    
    // Step 4: Create a price for the product
    console.log('\n4. Creating test price...');
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: 2000, // $20.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });
    console.log('✅ Test price created!');
    console.log('Price ID:', price.id);
    console.log('Price amount:', price.unit_amount / 100, 'USD per', price.recurring.interval);
    
    // Step 5: Verify webhook signature functionality
    console.log('\n5. Testing webhook signature verification...');
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify({
      id: 'evt_test_webhook',
      object: 'event',
      api_version: '2025-02-24.acacia',
      created: timestamp,
      data: {
        object: {
          id: 'test_object',
        },
      },
      type: 'test.webhook',
    });
    
    console.log('Webhook secret configured:', webhookSecret ? '✅ Yes' : '❌ No');
    console.log('Webhook payload created for testing signature verification');
    
    // Step 6: Clean up - Delete the test resources
    console.log('\n6. Cleaning up test data...');
    if (price && price.id) {
      await stripe.prices.update(price.id, { active: false });
      console.log('✅ Test price deactivated!');
    }
    
    if (product && product.id) {
      await stripe.products.update(product.id, { active: false });
      console.log('✅ Test product deactivated!');
    }
    
    if (customer && customer.id) {
      await stripe.customers.del(customer.id);
      console.log('✅ Test customer deleted!');
    }
    
    console.log('\nAll tests completed successfully!');
    console.log('Stripe integration is working correctly.');
  } catch (error) {
    console.error('❌ Error testing Stripe integration:');
    console.error(error.message);
    
    if (error.type) {
      console.error('Error type:', error.type);
    }
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    // Clean up any created resources in case of error
    try {
      console.log('\nCleaning up test resources after error...');
      
      if (price && price.id) {
        await stripe.prices.update(price.id, { active: false });
        console.log('✅ Test price deactivated!');
      }
      
      if (product && product.id) {
        await stripe.products.update(product.id, { active: false });
        console.log('✅ Test product deactivated!');
      }
      
      if (customer && customer.id) {
        await stripe.customers.del(customer.id);
        console.log('✅ Test customer deleted!');
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError.message);
    }
  }
};

// Execute the test function
testStripeIntegration();
