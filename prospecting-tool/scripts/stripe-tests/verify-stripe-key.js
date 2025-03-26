// Very simple script to verify the Stripe API key
const stripe = require('stripe')('sk_test_51R3hqb2RSvYJumwmjic8DhWeQskS5ffZXSCJZQEUSdkd0J9hiqpyIQnlMj7tlz6gFgSWwTlQL4sbkKMZ7Zv0cVK2003hgCwQ5b');

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
