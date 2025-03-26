import Stripe from 'stripe';

// Use the updated Stripe API key
const stripeSecretKey = 'sk_test_51R3hqb2RSvYJumwmjic8DhWeQskS5ffZXSCJZQEUSdkd0J9hiqpyIQnlMj7tlz6gFgSWwTlQL4sbkKMZ7Zv0cVK2003hgCwQ5b';

// Create a new Stripe instance
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia', // Use the latest API version
});

// Test the Stripe API by listing customers
async function testStripeAPI() {
  try {
    console.log('Testing Stripe API with the updated key...');
    
    // List customers (this will verify if the API key is working)
    const customers = await stripe.customers.list({
      limit: 3,
    });
    
    console.log('Stripe API test successful!');
    console.log(`Found ${customers.data.length} customers.`);
    
    // Print customer details (if any)
    if (customers.data.length > 0) {
      console.log('Customer details:');
      customers.data.forEach((customer, index) => {
        console.log(`Customer ${index + 1}:`);
        console.log(`  ID: ${customer.id}`);
        console.log(`  Email: ${customer.email || 'No email'}`);
        console.log(`  Created: ${new Date(customer.created * 1000).toISOString()}`);
        console.log('---');
      });
    } else {
      console.log('No customers found, but the API key is working correctly.');
    }
    
    // Test creating a customer
    console.log('\nTesting customer creation...');
    const newCustomer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer',
      description: 'Created for API key testing'
    });
    console.log('Customer created successfully:');
    console.log(`  ID: ${newCustomer.id}`);
    console.log(`  Email: ${newCustomer.email}`);
    console.log(`  Name: ${newCustomer.name}`);
    
  } catch (error) {
    console.log('Stripe API test failed:');
    console.log(error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('The API key is invalid or has been revoked.');
    } else if (error.type === 'StripeConnectionError') {
      console.log('Could not connect to the Stripe API.');
    }
    
    // Log the full error for debugging
    console.log('\nFull error:');
    console.log(JSON.stringify(error, null, 2));
  }
}

// Run the test
testStripeAPI();
