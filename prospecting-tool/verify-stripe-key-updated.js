// Simple script to verify the Stripe API key
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51R3hqb2RSvYJumwmjic8DhWeQskS5ffZXSCJZQEUSdkd0J9hiqpyIQnlMj7tlz6gFgSWwTlQL4sbkKMZ7Zv0cVK2003hgCwQ5b');

console.log('Testing Stripe API key...');

// Wrap in an async function
const testStripeKey = async () => {
  try {
    const account = await stripe.accounts.retrieve();
    console.log('✅ API key is valid!');
    console.log('Account ID:', account.id);
    
    // Safely display account details
    try {
      if (account.created) {
        console.log('Account created:', new Date(account.created * 1000).toISOString());
      }
      if (account.country) {
        console.log('Account country:', account.country);
      }
      if (account.business_type) {
        console.log('Account business type:', account.business_type);
      }
    } catch (detailsError) {
      console.log('Note: Some account details could not be displayed');
    }
    
    console.log('\nThe Stripe API key is valid and working correctly.');
  } catch (error) {
    console.error('❌ API key is invalid!');
    console.error('Error:', error.message);
  }
};

// Execute the function
testStripeKey();
