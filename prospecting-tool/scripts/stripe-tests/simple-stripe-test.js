// Simple Stripe API test
const stripe = require('stripe')('sk_test_51R3hqb2RSvYJumwmjic8DhWeQskS5ffZXSCJZQEUSdkd0J9hiqpyIQnlMj7tlz6gFgSWwTlQL4sbkKMZ7Zv0cVK2003hgCwQ5b');

async function testStripeAPI() {
  try {
    console.log('Testing Stripe API key...');
    
    // Try to list customers (a simple API call)
    const customers = await stripe.customers.list({ limit: 3 });
    
    console.log('API key is valid!');
    console.log(`Retrieved ${customers.data.length} customers`);
    
    // Print customer details
    if (customers.data.length > 0) {
      console.log('\nCustomer details:');
      customers.data.forEach((customer, index) => {
        console.log(`\nCustomer ${index + 1}:`);
        console.log(`ID: ${customer.id}`);
        console.log(`Email: ${customer.email}`);
        console.log(`Created: ${new Date(customer.created * 1000).toISOString()}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('API key test failed:', error.message);
    return false;
  }
}

// Run the test
testStripeAPI()
  .then(result => {
    if (result) {
      console.log('\nTest passed! Your Stripe API key is working correctly.');
    } else {
      console.log('\nTest failed. Please check the error above.');
    }
  })
  .catch(error => {
    console.error('Unhandled error:', error);
  });
