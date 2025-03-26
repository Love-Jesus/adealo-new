import * as admin from 'firebase-admin';
import stripe from './stripe';
import { logger } from 'firebase-functions/v2';
import { getCustomerByUserId } from './customers';

// Subscription plan IDs - these would be created in the Stripe dashboard
export const SUBSCRIPTION_PLANS = {
  FREE: 'free_tier',
  STARTER: 'starter_tier',
  PROFESSIONAL: 'professional_tier',
  ORGANIZATION: 'organization_tier'
};

// Subscription status types
export type SubscriptionStatus = 
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'unpaid'
  | 'paused';

// Subscription data interface
export interface SubscriptionData {
  id: string;
  customerId: string;
  status: SubscriptionStatus;
  planId: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd: number | null;
  createdAt: number;
}

/**
 * Create a subscription for a user
 * @param userId Firebase user ID
 * @param planId Stripe price ID for the plan
 * @param trialDays Number of trial days (default: 14)
 * @returns Subscription ID
 */
export async function createSubscription(
  userId: string,
  planId: string,
  trialDays: number = 14
): Promise<string> {
  try {
    // Get the customer ID for this user
    const customerId = await getCustomerByUserId(userId);
    
    if (!customerId) {
      throw new Error(`No Stripe customer found for user ${userId}`);
    }
    
    // Calculate trial end date
    const trialEnd = Math.floor(Date.now() / 1000) + (trialDays * 24 * 60 * 60);
    
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planId }],
      trial_end: trialEnd,
      expand: ['latest_invoice.payment_intent']
    });
    
    // Store subscription data in Firestore
    await admin.firestore().collection('subscriptions').doc(subscription.id).set({
      id: subscription.id,
      userId,
      customerId,
      status: subscription.status,
      planId,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end,
      createdAt: subscription.created,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update user document with subscription info
    await admin.firestore().collection('users').doc(userId).update({
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlan: planId,
      trialEnd: subscription.trial_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return subscription.id;
  } catch (error) {
    logger.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

/**
 * Get a user's active subscription
 * @param userId Firebase user ID
 * @returns Subscription data or null if no active subscription
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionData | null> {
  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData = userDoc.data();
    const subscriptionId = userData?.subscriptionId;
    
    if (!subscriptionId) {
      return null;
    }
    
    const subscriptionDoc = await admin.firestore().collection('subscriptions').doc(subscriptionId).get();
    
    if (!subscriptionDoc.exists) {
      return null;
    }
    
    return subscriptionDoc.data() as SubscriptionData;
  } catch (error) {
    logger.error('Error getting user subscription:', error);
    throw new Error('Failed to get subscription');
  }
}

/**
 * Cancel a subscription at the end of the current billing period
 * @param subscriptionId Stripe subscription ID
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    // Cancel the subscription at period end
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
    
    // Update subscription in Firestore
    await admin.firestore().collection('subscriptions').doc(subscriptionId).update({
      cancelAtPeriodEnd: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Find the user with this subscription and update their document
    const querySnapshot = await admin.firestore()
      .collection('users')
      .where('subscriptionId', '==', subscriptionId)
      .get();
    
    if (!querySnapshot.empty) {
      const userId = querySnapshot.docs[0].id;
      await admin.firestore().collection('users').doc(userId).update({
        subscriptionStatus: 'canceled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    logger.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Immediately cancel a subscription
 * @param subscriptionId Stripe subscription ID
 */
export async function cancelSubscriptionImmediately(subscriptionId: string): Promise<void> {
  try {
    // Cancel the subscription immediately
    await stripe.subscriptions.cancel(subscriptionId);
    
    // Update subscription in Firestore
    await admin.firestore().collection('subscriptions').doc(subscriptionId).update({
      status: 'canceled',
      cancelAtPeriodEnd: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Find the user with this subscription and update their document
    const querySnapshot = await admin.firestore()
      .collection('users')
      .where('subscriptionId', '==', subscriptionId)
      .get();
    
    if (!querySnapshot.empty) {
      const userId = querySnapshot.docs[0].id;
      await admin.firestore().collection('users').doc(userId).update({
        subscriptionStatus: 'canceled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    logger.error('Error canceling subscription immediately:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Change a subscription's plan
 * @param subscriptionId Stripe subscription ID
 * @param newPlanId New Stripe price ID
 */
export async function changePlan(subscriptionId: string, newPlanId: string): Promise<void> {
  try {
    // Get the subscription to find the subscription item ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    if (!subscription.items.data.length) {
      throw new Error('Subscription has no items');
    }
    
    const subscriptionItemId = subscription.items.data[0].id;
    
    // Update the subscription with the new plan
    await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscriptionItemId,
        price: newPlanId
      }],
      proration_behavior: 'create_prorations'
    });
    
    // Update subscription in Firestore
    await admin.firestore().collection('subscriptions').doc(subscriptionId).update({
      planId: newPlanId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Find the user with this subscription and update their document
    const querySnapshot = await admin.firestore()
      .collection('users')
      .where('subscriptionId', '==', subscriptionId)
      .get();
    
    if (!querySnapshot.empty) {
      const userId = querySnapshot.docs[0].id;
      await admin.firestore().collection('users').doc(userId).update({
        subscriptionPlan: newPlanId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    logger.error('Error changing subscription plan:', error);
    throw new Error('Failed to change subscription plan');
  }
}

/**
 * Get all available subscription plans
 * @returns Array of Stripe price objects
 */
export async function getSubscriptionPlans(): Promise<any[]> {
  try {
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      expand: ['data.product']
    });
    
    return prices.data;
  } catch (error) {
    logger.error('Error getting subscription plans:', error);
    throw new Error('Failed to get subscription plans');
  }
}
