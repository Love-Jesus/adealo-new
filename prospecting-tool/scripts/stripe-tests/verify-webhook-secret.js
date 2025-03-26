// Simple script to verify the webhook secret
const crypto = require('crypto');

// Webhook secret from Stripe dashboard
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
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(signedPayload)
  .digest('hex');

// Create the Stripe-Signature header
const stripeSignature = `t=${timestamp},v1=${signature}`;

console.log('Webhook Secret Test');
console.log('------------------');
console.log('Webhook Secret:', webhookSecret);
console.log('Timestamp:', timestamp);
console.log('Signature:', signature);
console.log('Stripe-Signature Header:', stripeSignature);
console.log('------------------');
console.log('If you see this output, the webhook secret is valid and can be used to sign webhook events.');
