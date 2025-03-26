// Test script to verify Stripe configuration
import Stripe from 'stripe';

// Use the updated Stripe API key
const stripeSecretKey = 'sk_test_51R3hqb2RSvYJumwmjic8DhWeQskS5ffZXSCJZQEUSdkd0J9hiqpyIQnlMj7tlz6gFgSWwTlQL4sbkKMZ7Zv0cVK2003hgCwQ5b';
const webhookSecret = 'whsec_test_67890';

console.log('Testing Stripe configuration...');
console.log('--------------------------------');

// Create a new Stripe instance
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
});

// Test function to verify the configuration
const testStripeConfig = async () => {
  try {
    console.log('1. Testing API key...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ API key is valid!');
    console.log('Account ID:', account.id);
    console.log('Account country:', account.country);
    console.log('Account business type:', account.business_type);
    
    console.log('\n2. Testing webhook configuration...');
    console.log('Webhook secret configured:', webhookSecret ? '✅ Yes' : '❌ No');
    
    console.log('\n3. Testing Stripe API version...');
    console.log('Using API version:', stripe.getApiField('version'));
    
    console.log('\nAll tests completed successfully!');
    console.log('Stripe configuration is valid and ready to use.');
  } catch (error) {
    console.error('❌ Error testing Stripe configuration:');
    console.error(error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('\nThe API key appears to be invalid. Please check your API key and try again.');
    } else if (error.type === 'StripeConnectionError') {
      console.error('\nCould not connect to Stripe. Please check your internet connection and try again.');
    }
  }
};

// Execute the test function
testStripeConfig();
