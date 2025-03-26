// Simple Stripe API test
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

console.log('Starting Stripe API test...');

// Just try to get the account info
stripe.accounts.retrieve()
  .then(account => {
    console.log('Stripe API key is valid!');
    console.log('Account ID:', account.id);
    console.log('Account Email:', account.email);
    console.log('Account Created:', new Date(account.created * 1000).toISOString());
  })
  .catch(error => {
    console.error('Stripe API key is invalid!');
    console.error('Error:', error.message);
  });
