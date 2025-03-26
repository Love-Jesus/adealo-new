/**
 * Test script to verify that the Stripe API key is working correctly
 * 
 * This script:
 * 1. Initializes Stripe with the provided API key
 * 2. Attempts to list customers to verify the key is valid
 * 3. Logs the result
 * 
 * Usage:
 * node test-stripe-key-updated.js
 */

const stripe = require('stripe')('sk_test_51R3hqb2RSvYJumwmjic8DhWeQskS5ffZXSCJZQEUSdkd0J9hiqpyIQnlMj7tlz6gFgSWwTlQL4sbkKMZ7Zv0cVK2003hgCwQ5b');

async function testStripeKey() {
  try {
    console.log('Testing Stripe API key...');
    
    // Attempt to list customers (limit to 1 to minimize data transfer)
    const customers = await stripe.customers.list({ limit: 1 });
    
    console.log('✅ Stripe API key is valid!');
    console.log(`Successfully retrieved ${customers.data.length} customer(s)`);
    
    // If we have customers, show some basic info about the first one
    if (customers.data.length > 0) {
      const customer = customers.data[0];
      console.log('\nSample customer info:');
      console.log(`- ID: ${customer.id}`);
      console.log(`- Email: ${customer.email || 'N/A'}`);
      console.log(`- Created: ${new Date(customer.created * 1000).toISOString()}`);
    }
    
    // Test retrieving subscription plans
    const plans = await stripe.plans.list({ limit: 3 });
    console.log(`\nSuccessfully retrieved ${plans.data.length} plan(s)`);
    
    // If we have plans, show some basic info
    if (plans.data.length > 0) {
      console.log('\nSample plan info:');
      plans.data.forEach((plan, index) => {
        console.log(`\nPlan ${index + 1}:`);
        console.log(`- ID: ${plan.id}`);
        console.log(`- Product: ${plan.product}`);
        console.log(`- Amount: ${(plan.amount / 100).toFixed(2)} ${plan.currency.toUpperCase()}`);
        console.log(`- Interval: ${plan.interval_count} ${plan.interval}(s)`);
      });
    }
    
    console.log('\nStripe API key test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing Stripe API key:');
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('Authentication failed. The API key is invalid or revoked.');
    } else if (error.type === 'StripePermissionError') {
      console.error('Permission denied. The API key does not have the necessary permissions.');
    } else {
      console.error(error.message);
    }
    
    console.error('\nFull error details:');
    console.error(error);
  }
}

// Run the test
testStripeKey();
