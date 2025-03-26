import Stripe from 'stripe';
import * as functions from 'firebase-functions';

// Initialize Stripe with the secret key from environment variables
// In production, this should be set in Firebase Functions config
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51R3hqb2RSvYJumwmjic8DhWeQskS5ffZXSCJZQEUSdkd0J9hiqpyIQnlMj7tlz6gFgSWwTlQL4sbkKMZ7Zv0cVK2003hgCwQ5b';

// Create a new Stripe instance
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16' as any, // Use a valid, current API version with type assertion
});

export default stripe;
