# Stripe Integration

This document provides a comprehensive guide to the Stripe integration in the Adealo platform.

## Overview

The Stripe integration allows users to subscribe to paid plans, manage their subscriptions, and process payments. It consists of both frontend and backend components that work together to provide a seamless payment experience.

## Architecture

The Stripe integration is built on the following components:

1. **Stripe API**: External payment processing service
2. **Firebase Functions**: Backend endpoints for Stripe operations
3. **React Components**: Frontend UI for payment and subscription management
4. **Webhook Handlers**: Process Stripe events (payments, subscription changes, etc.)

## Key Components

### Backend (Firebase Functions)

- **`functions/src/services/stripe/stripe.ts`**: Core Stripe service
- **`functions/src/services/stripe/customers.ts`**: Customer management
- **`functions/src/services/stripe/subscriptions.ts`**: Subscription management
- **`functions/src/services/stripe/webhooks.ts`**: Webhook handlers
- **`functions/src/services/stripe/functions.ts`**: HTTP endpoints

### Frontend (React)

- **`src/services/subscription.ts`**: Frontend subscription service
- **`src/components/checkout/StripePaymentForm.tsx`**: Payment form component
- **`src/pages/PricingPage.tsx`**: Pricing page
- **`src/pages/CheckoutPage.tsx`**: Checkout page
- **`src/pages/AccountSubscriptionPage.tsx`**: Subscription management page

## Configuration

### Environment Variables

The Stripe integration requires the following environment variables:

- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe API publishable key
- `STRIPE_WEBHOOK_SECRET`: Secret for verifying webhook signatures

### Stripe Dashboard Configuration

The following items need to be configured in the Stripe Dashboard:

1. **Products and Prices**: Define subscription plans
2. **Webhooks**: Configure webhook endpoints
3. **Payment Methods**: Enable desired payment methods

## Subscription Flow

1. User selects a plan on the pricing page
2. User is redirected to the checkout page
3. User enters payment information
4. Payment is processed by Stripe
5. Webhook handler updates the user's subscription status
6. User is redirected to the success page

## Webhook Events

The following Stripe webhook events are handled:

- `customer.subscription.created`: New subscription created
- `customer.subscription.updated`: Subscription updated
- `customer.subscription.deleted`: Subscription cancelled
- `invoice.payment_succeeded`: Payment successful
- `invoice.payment_failed`: Payment failed

## Team Credits System

The team credits system is integrated with Stripe subscriptions:

- Each subscription plan includes a certain number of team credits
- Team credits are allocated to the team when a subscription is created or updated
- Team credits are used to pay for various features and services

## Testing

### Test Cards

For testing payments, use the following test cards:

- **Success**: `4242 4242 4242 4242`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 0002`

### Test Webhooks

For testing webhooks locally:

1. Install the Stripe CLI
2. Run `stripe listen --forward-to http://localhost:5001/your-project/us-central1/stripeWebhook`

## Troubleshooting

### Common Issues

1. **Webhook Verification Failures**: Ensure the webhook secret is correctly configured
2. **Payment Processing Errors**: Check Stripe Dashboard for detailed error messages
3. **Subscription Status Discrepancies**: Verify webhook handlers are processing events correctly

### Debugging

- Check Firebase Function logs for backend errors
- Use Stripe Dashboard logs for payment processing issues
- Test webhook delivery using the Stripe CLI

## Deployment

When deploying Stripe-related changes:

1. Test thoroughly in a development environment
2. Deploy functions using `deploy-stripe-functions.sh`
3. Verify webhook endpoints are correctly configured

## Security Considerations

- Never log full card details or sensitive customer information
- Always verify webhook signatures
- Use Stripe's client-side libraries to avoid handling card data directly
- Implement proper access controls for subscription management

## Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Stripe React Components](https://stripe.com/docs/stripe-js/react)
