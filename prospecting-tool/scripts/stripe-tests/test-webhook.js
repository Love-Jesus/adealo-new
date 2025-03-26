import crypto from 'crypto';
import fetch from 'node-fetch';

// Webhook secret from Stripe dashboard
const webhookSecret = 'whsec_b6c3e8a74467f33f7e5b0dc095aa58b6756cb6b63aec0b9460aecc7b3421d27b';

// Sample event data (this simulates a checkout.session.completed event)
const eventData = {
  id: 'evt_' + Math.random().toString(36).substring(2, 15),
  object: 'event',
  api_version: '2025-02-24.acacia',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'cs_' + Math.random().toString(36).substring(2, 15),
      object: 'checkout.session',
      mode: 'subscription',
      customer: 'cus_RxdhzehzTR3rBM', // Use the customer ID from your test
      subscription: 'sub_' + Math.random().toString(36).substring(2, 15),
      payment_status: 'paid',
      amount_total: 7900,
      currency: 'usd',
      status: 'complete',
      payment_method: 'pm_' + Math.random().toString(36).substring(2, 15),
      created: Math.floor(Date.now() / 1000)
    }
  },
  type: 'checkout.session.completed'
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

// Function to send the webhook event
async function sendWebhookEvent() {
  try {
    console.log('Sending webhook event...');
    console.log(`Event type: ${eventData.type}`);
    console.log(`Event ID: ${eventData.id}`);
    
    // URL of your webhook endpoint (adjust for your environment)
    // For local testing with Firebase emulator
    const webhookUrl = 'http://localhost:5001/adealo-ce238/us-central1/stripeWebhook';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': stripeSignature
      },
      body: payload
    });
    
    if (response.ok) {
      const responseData = await response.json();
      console.log('Webhook event sent successfully!');
      console.log('Response:', responseData);
    } else {
      console.error('Failed to send webhook event');
      console.error(`Status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error: ${errorText}`);
    }
  } catch (error) {
    console.error('Error sending webhook event:', error);
  }
}

// Send the webhook event
sendWebhookEvent();
