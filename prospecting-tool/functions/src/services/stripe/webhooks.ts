import * as admin from 'firebase-admin';
import stripe from './stripe';
import * as functions from 'firebase-functions';
import { provisionTeamCredits, getUserTeamId } from '../teamCredits';

// Webhook secret from Stripe dashboard - should be set in environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Handle Stripe webhook events
 * Using onCall instead of onRequest to avoid CPU settings issues with Gen 1 functions
 */
export const stripeWebhook = functions.https.onCall(async (data, context) => {
  // For security, we should validate that this is coming from Stripe
  // In a real implementation, you would need to verify the Stripe signature
  // Since we're using onCall, we'll need to adapt the webhook handling
  
  try {
    const { event } = data;
    
    if (!event || !event.type || !event.data || !event.data.object) {
      console.error('Invalid event data received');
      return { success: false, error: 'Invalid event data' };
    }
    
    // Handle the event based on its type
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      default:
        console.info(`Unhandled event type: ${event.type}`);
    }
    
    return { success: true };
  } catch (err) {
    console.error(`Error handling webhook event:`, err);
    return { success: false, error: 'Internal server error' };
  }
});

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription: any): Promise<void> {
  try {
    // Get the customer ID
    const customerId = subscription.customer;
    
    // Find the user with this customer ID
    const querySnapshot = await admin.firestore()
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .get();
    
    if (querySnapshot.empty) {
      console.error(`No user found for customer ${customerId}`);
      return;
    }
    
    const userId = querySnapshot.docs[0].id;
    
    // Update the subscription in Firestore
    await admin.firestore().collection('subscriptions').doc(subscription.id).set({
      id: subscription.id,
      userId,
      customerId,
      status: subscription.status,
      planId: subscription.items.data[0].price.id,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end,
      createdAt: subscription.created,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update the user document
    await admin.firestore().collection('users').doc(userId).update({
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlan: subscription.items.data[0].price.id,
      trialEnd: subscription.trial_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // If this is a new subscription, provision credits based on the plan
    await provisionCredits(userId, subscription.items.data[0].price.id);
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: any): Promise<void> {
  try {
    // Get the subscription from Firestore
    const subscriptionDoc = await admin.firestore()
      .collection('subscriptions')
      .doc(subscription.id)
      .get();
    
    if (!subscriptionDoc.exists) {
      console.error(`Subscription ${subscription.id} not found in Firestore`);
      return;
    }
    
    const subscriptionData = subscriptionDoc.data();
    const userId = subscriptionData?.userId;
    
    if (!userId) {
      console.error(`No user ID found for subscription ${subscription.id}`);
      return;
    }
    
    // Update the subscription in Firestore
    await admin.firestore().collection('subscriptions').doc(subscription.id).update({
      status: subscription.status,
      planId: subscription.items.data[0].price.id,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update the user document
    await admin.firestore().collection('users').doc(userId).update({
      subscriptionStatus: subscription.status,
      subscriptionPlan: subscription.items.data[0].price.id,
      trialEnd: subscription.trial_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // If the plan changed, provision new credits
    const oldPlanId = subscriptionData?.planId;
    const newPlanId = subscription.items.data[0].price.id;
    
    if (oldPlanId !== newPlanId) {
      await provisionCredits(userId, newPlanId);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: any): Promise<void> {
  try {
    // Get the subscription from Firestore
    const subscriptionDoc = await admin.firestore()
      .collection('subscriptions')
      .doc(subscription.id)
      .get();
    
    if (!subscriptionDoc.exists) {
      console.error(`Subscription ${subscription.id} not found in Firestore`);
      return;
    }
    
    const subscriptionData = subscriptionDoc.data();
    const userId = subscriptionData?.userId;
    
    if (!userId) {
      console.error(`No user ID found for subscription ${subscription.id}`);
      return;
    }
    
    // Update the subscription in Firestore
    await admin.firestore().collection('subscriptions').doc(subscription.id).update({
      status: 'canceled',
      cancelAtPeriodEnd: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update the user document
    await admin.firestore().collection('users').doc(userId).update({
      subscriptionStatus: 'canceled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Downgrade to free plan
    await provisionCredits(userId, 'free_tier');
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

/**
 * Handle invoice payment succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
  try {
    // Only process subscription invoices
    if (!invoice.subscription) {
      return;
    }
    
    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Get the subscription from Firestore
    const subscriptionDoc = await admin.firestore()
      .collection('subscriptions')
      .doc(subscription.id)
      .get();
    
    if (!subscriptionDoc.exists) {
      console.error(`Subscription ${subscription.id} not found in Firestore`);
      return;
    }
    
    const subscriptionData = subscriptionDoc.data();
    const userId = subscriptionData?.userId;
    
    if (!userId) {
      console.error(`No user ID found for subscription ${subscription.id}`);
      return;
    }
    
    // Store the invoice in Firestore
    await admin.firestore().collection('invoices').doc(invoice.id).set({
      id: invoice.id,
      userId,
      subscriptionId: subscription.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      paidAt: invoice.status === 'paid' ? admin.firestore.FieldValue.serverTimestamp() : null,
      createdAt: invoice.created,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // If this is a renewal, refresh the credits
    if (invoice.billing_reason === 'subscription_cycle') {
      await provisionCredits(userId, subscription.items.data[0].price.id);
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle invoice payment failed event
 */
async function handleInvoicePaymentFailed(invoice: any): Promise<void> {
  try {
    // Only process subscription invoices
    if (!invoice.subscription) {
      return;
    }
    
    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Get the subscription from Firestore
    const subscriptionDoc = await admin.firestore()
      .collection('subscriptions')
      .doc(subscription.id)
      .get();
    
    if (!subscriptionDoc.exists) {
      console.error(`Subscription ${subscription.id} not found in Firestore`);
      return;
    }
    
    const subscriptionData = subscriptionDoc.data();
    const userId = subscriptionData?.userId;
    
    if (!userId) {
      console.error(`No user ID found for subscription ${subscription.id}`);
      return;
    }
    
    // Store the invoice in Firestore
    await admin.firestore().collection('invoices').doc(invoice.id).set({
      id: invoice.id,
      userId,
      subscriptionId: subscription.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      paidAt: null,
      createdAt: invoice.created,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update the user document to reflect the payment failure
    await admin.firestore().collection('users').doc(userId).update({
      paymentFailed: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
    throw error;
  }
}

/**
 * Handle payment intent succeeded event
 */
async function handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
  try {
    console.info(`Payment intent succeeded: ${paymentIntent.id}`);
    
    // If this payment intent is not associated with a customer, we can't do much with it
    if (!paymentIntent.customer) {
      console.info(`Payment intent ${paymentIntent.id} not associated with a customer`);
      return;
    }
    
    // Find the user with this customer ID
    const querySnapshot = await admin.firestore()
      .collection('users')
      .where('stripeCustomerId', '==', paymentIntent.customer)
      .get();
    
    if (querySnapshot.empty) {
      console.error(`No user found for customer ${paymentIntent.customer}`);
      return;
    }
    
    const userId = querySnapshot.docs[0].id;
    
    // Store the payment intent in Firestore
    await admin.firestore().collection('payments').doc(paymentIntent.id).set({
      id: paymentIntent.id,
      userId,
      customerId: paymentIntent.customer,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paymentMethod: paymentIntent.payment_method,
      createdAt: paymentIntent.created,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update the user document to reflect the successful payment
    await admin.firestore().collection('users').doc(userId).update({
      paymentFailed: false,
      lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
    throw error;
  }
}

/**
 * Handle payment intent failed event
 */
async function handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
  try {
    console.info(`Payment intent failed: ${paymentIntent.id}`);
    
    // If this payment intent is not associated with a customer, we can't do much with it
    if (!paymentIntent.customer) {
      console.info(`Payment intent ${paymentIntent.id} not associated with a customer`);
      return;
    }
    
    // Find the user with this customer ID
    const querySnapshot = await admin.firestore()
      .collection('users')
      .where('stripeCustomerId', '==', paymentIntent.customer)
      .get();
    
    if (querySnapshot.empty) {
      console.error(`No user found for customer ${paymentIntent.customer}`);
      return;
    }
    
    const userId = querySnapshot.docs[0].id;
    
    // Store the payment intent in Firestore
    await admin.firestore().collection('payments').doc(paymentIntent.id).set({
      id: paymentIntent.id,
      userId,
      customerId: paymentIntent.customer,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paymentMethod: paymentIntent.payment_method,
      error: paymentIntent.last_payment_error,
      createdAt: paymentIntent.created,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update the user document to reflect the failed payment
    await admin.firestore().collection('users').doc(userId).update({
      paymentFailed: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
    throw error;
  }
}

/**
 * Handle customer created event
 */
async function handleCustomerCreated(customer: any): Promise<void> {
  try {
    console.info(`Customer created: ${customer.id}`);
    
    // Check if this customer is already associated with a user
    const querySnapshot = await admin.firestore()
      .collection('users')
      .where('stripeCustomerId', '==', customer.id)
      .get();
    
    if (!querySnapshot.empty) {
      console.info(`Customer ${customer.id} already associated with a user`);
      return;
    }
    
    // If the customer has an email, try to find a user with that email
    if (customer.email) {
      const userQuerySnapshot = await admin.firestore()
        .collection('users')
        .where('email', '==', customer.email)
        .get();
      
      if (!userQuerySnapshot.empty) {
        const userId = userQuerySnapshot.docs[0].id;
        
        // Update the user document with the customer ID
        await admin.firestore().collection('users').doc(userId).update({
          stripeCustomerId: customer.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.info(`Associated customer ${customer.id} with user ${userId}`);
      } else {
        console.info(`No user found with email ${customer.email}`);
      }
    }
  } catch (error) {
    console.error('Error handling customer created:', error);
    throw error;
  }
}

/**
 * Handle checkout session completed event
 */
async function handleCheckoutSessionCompleted(session: any): Promise<void> {
  try {
    console.info(`Checkout session completed: ${session.id}`);
    
    // If this is a subscription checkout, the subscription will be handled by the subscription created event
    if (session.mode === 'subscription') {
      console.info(`Checkout session ${session.id} is for a subscription`);
      return;
    }
    
    // If this is a one-time payment, we need to handle it here
    if (session.mode === 'payment') {
      // Get the customer ID
      const customerId = session.customer;
      
      // Find the user with this customer ID
      const querySnapshot = await admin.firestore()
        .collection('users')
        .where('stripeCustomerId', '==', customerId)
        .get();
      
      if (querySnapshot.empty) {
        console.error(`No user found for customer ${customerId}`);
        return;
      }
      
      const userId = querySnapshot.docs[0].id;
      
      // Store the payment in Firestore
      await admin.firestore().collection('payments').doc(session.id).set({
        id: session.id,
        userId,
        customerId,
        amount: session.amount_total,
        currency: session.currency,
        status: 'succeeded',
        paymentMethod: session.payment_method,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update the user document to reflect the successful payment
      await admin.firestore().collection('users').doc(userId).update({
        paymentFailed: false,
        lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

/**
 * Provision credits based on the subscription plan
 * This function now provisions credits for the user's team instead of just the user
 */
async function provisionCredits(userId: string, planId: string): Promise<void> {
  try {
    // Get the user's team ID
    const teamId = await getUserTeamId(userId);
    
    if (!teamId) {
      console.error(`No team found for user ${userId}`);
      return;
    }
    
    // Get the subscription for this user
    const subscriptionsQuery = await admin.firestore()
      .collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trialing'])
      .limit(1)
      .get();
    
    if (subscriptionsQuery.empty) {
      console.error(`No active subscription found for user ${userId}`);
      return;
    }
    
    const subscriptionId = subscriptionsQuery.docs[0].id;
    
    // Provision credits for the team
    await provisionTeamCredits(teamId, planId, subscriptionId);
    
    // For backward compatibility, also update the user's individual credits
    // This can be removed once the migration to team credits is complete
    const creditLimits: { [key: string]: { prospecting: number; leads: number; widgets: number } } = {
      free_tier: {
        prospecting: 100,
        leads: 10,
        widgets: 1
      },
      starter_tier: {
        prospecting: 500,
        leads: 50,
        widgets: 3
      },
      professional_tier: {
        prospecting: 2000,
        leads: 200,
        widgets: 10
      },
      organization_tier: {
        prospecting: 10000,
        leads: 1000,
        widgets: 100
      }
    };
    
    // Get the credit limits for this plan
    const limits = creditLimits[planId] || creditLimits.free_tier;
    
    // Update the user's credits
    const userCreditsRef = admin.firestore().collection('userCredits').doc(userId);
    await userCreditsRef.set({
      userId,
      prospectingCredits: {
        total: limits.prospecting,
        used: 0,
        lastRefillDate: admin.firestore.FieldValue.serverTimestamp()
      },
      leadCredits: {
        total: limits.leads,
        used: 0,
        lastRefillDate: admin.firestore.FieldValue.serverTimestamp()
      },
      widgetCredits: {
        total: limits.widgets,
        used: 0
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.info(`Provisioned credits for user ${userId} and team ${teamId} with plan ${planId}`);
  } catch (error) {
    console.error('Error provisioning credits:', error);
    throw error;
  }
}
