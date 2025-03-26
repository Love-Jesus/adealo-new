# Stripe Webhook Testing Guide

This guide explains how to test the Stripe webhook integration for the Prospecting Tool.

## Prerequisites

- [Stripe CLI](https://stripe.com/docs/stripe-cli) installed
- Firebase emulator running
- Node.js and npm installed

## Testing with the Stripe CLI

The Stripe CLI is the recommended way to test webhooks during development. It allows you to forward webhook events from Stripe to your local development server.

### 1. Install the Stripe CLI

Follow the [installation instructions](https://stripe.com/docs/stripe-cli#install) for your operating system.

### 2. Login to Stripe

```bash
stripe login
```

This will open a browser window where you can authorize the CLI to access your Stripe account.

### 3. Start the webhook forwarding

```bash
stripe listen --forward-to http://localhost:5001/adealo-ce238/us-central1/stripeWebhook
```

This command will start forwarding webhook events from Stripe to your local Firebase emulator. The CLI will display a webhook signing secret that you can use for testing.

### 4. Trigger webhook events

In a new terminal window, you can trigger webhook events using the Stripe CLI:

```bash
# Trigger a checkout.session.completed event
stripe trigger checkout.session.completed

# Trigger a customer.subscription.created event
stripe trigger customer.subscription.created

# Trigger a payment_intent.succeeded event
stripe trigger payment_intent.succeeded
```

### 5. Check the logs

Check the Firebase emulator logs to see if the webhook events are being received and processed correctly.

## Testing with the test-webhook.js script

We've also created a script that simulates webhook events for testing purposes.

### 1. Install dependencies

```bash
cd prospecting-tool
npm install node-fetch
```

### 2. Run the script

```bash
node test-webhook.js
```

This script will:
1. Create a sample webhook event payload (checkout.session.completed)
2. Sign the payload with the webhook secret
3. Send a POST request to the webhook endpoint

## Webhook Events Handled

The following webhook events are handled by the application:

- `customer.subscription.created`: When a customer subscribes to a plan
- `customer.subscription.updated`: When a subscription is updated (e.g., plan change)
- `customer.subscription.deleted`: When a subscription is canceled
- `invoice.payment_succeeded`: When an invoice is paid successfully
- `invoice.payment_failed`: When an invoice payment fails
- `payment_intent.succeeded`: When a payment is successful
- `payment_intent.payment_failed`: When a payment fails
- `customer.created`: When a new customer is created
- `checkout.session.completed`: When a checkout session is completed

## Webhook Secret

The webhook secret is used to verify that webhook events are actually coming from Stripe. It's stored in the `webhooks.ts` file and is also available as an environment variable.

For local development, the webhook secret is hardcoded in the `webhooks.ts` file. In production, it should be set as an environment variable.

## Troubleshooting

If you're having issues with webhook testing:

1. Make sure the Firebase emulator is running
2. Check that the webhook endpoint URL is correct
3. Verify that the webhook secret is correct
4. Check the Firebase emulator logs for any errors
5. Make sure the Stripe CLI is properly authenticated

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
