import { auth } from '@/lib/firebase';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

// Publishable key for Stripe.js
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51R3hqb2RSvYJumwmdR4hgY0xF53vBs8Dr589hZfm2truzLssgwl9uNAzdqQY4fI9gy0a5ydVDq7REeUA9nDOUVDS00tPD0lkZn';

/**
 * Create a subscription for the current user
 */
export const createSubscription = async (
  priceId: string,
  paymentMethodId: string,
  isYearly: boolean = false
): Promise<{ subscriptionId: string; clientSecret: string }> => {
  try {
    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to create a subscription');
    }

    // Call the Firebase function to create a subscription
    const createSubscriptionFn = httpsCallable(
      functions,
      'createSubscription'
    );

    const result = await createSubscriptionFn({
      priceId,
      paymentMethodId,
      isYearly,
    });

    // Cast the result data to the expected type
    const data = result.data as {
      subscriptionId: string;
      clientSecret: string;
    };

    return data;
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    throw new Error(
      error.message || 'An error occurred while creating the subscription'
    );
  }
};

/**
 * Create a payment intent for a one-time payment
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd'
): Promise<{ clientSecret: string }> => {
  try {
    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to create a payment intent');
    }

    // Call the Firebase function to create a payment intent
    const createPaymentIntentFn = httpsCallable(
      functions,
      'createPaymentIntent'
    );

    const result = await createPaymentIntentFn({
      amount,
      currency,
    });

    // Cast the result data to the expected type
    const data = result.data as { clientSecret: string };

    return data;
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    throw new Error(
      error.message || 'An error occurred while creating the payment intent'
    );
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (
  subscriptionId: string
): Promise<{ success: boolean }> => {
  try {
    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to cancel a subscription');
    }

    // Call the Firebase function to cancel a subscription
    const cancelSubscriptionFn = httpsCallable(
      functions,
      'cancelSubscription'
    );

    const result = await cancelSubscriptionFn({
      subscriptionId,
    });

    // Cast the result data to the expected type
    const data = result.data as { success: boolean };

    return data;
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    throw new Error(
      error.message || 'An error occurred while canceling the subscription'
    );
  }
};

/**
 * Update a subscription
 */
export const updateSubscription = async (
  subscriptionId: string,
  newPriceId: string
): Promise<{ success: boolean }> => {
  try {
    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to update a subscription');
    }

    // Call the Firebase function to update a subscription
    const updateSubscriptionFn = httpsCallable(
      functions,
      'updateSubscription'
    );

    const result = await updateSubscriptionFn({
      subscriptionId,
      newPriceId,
    });

    // Cast the result data to the expected type
    const data = result.data as { success: boolean };

    return data;
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    throw new Error(
      error.message || 'An error occurred while updating the subscription'
    );
  }
};

/**
 * Get payment methods for the current user
 */
export const getPaymentMethods = async (): Promise<any[]> => {
  try {
    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to get payment methods');
    }

    // Call the Firebase function to get payment methods
    const getPaymentMethodsFn = httpsCallable(
      functions,
      'getPaymentMethods'
    );

    const result = await getPaymentMethodsFn();

    // Cast the result data to the expected type
    const data = result.data as any[];

    return data;
  } catch (error: any) {
    console.error('Error getting payment methods:', error);
    throw new Error(
      error.message || 'An error occurred while getting payment methods'
    );
  }
};
