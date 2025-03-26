import * as admin from 'firebase-admin';
import stripe from './stripe';
import { logger } from 'firebase-functions/v2';

/**
 * Create a new Stripe customer for a Firebase user
 * @param userId Firebase user ID
 * @param email User's email
 * @param name User's name (optional)
 * @returns Stripe customer ID
 */
export async function createCustomer(userId: string, email: string, name?: string): Promise<string> {
  try {
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        firebaseUserId: userId
      }
    });

    // Store the customer ID in Firestore
    const userRef = admin.firestore().collection('users').doc(userId);
    await userRef.set({
      stripeCustomerId: customer.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return customer.id;
  } catch (error) {
    logger.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
}

/**
 * Get a Stripe customer by Firebase user ID
 * @param userId Firebase user ID
 * @returns Stripe customer ID or null if not found
 */
export async function getCustomerByUserId(userId: string): Promise<string | null> {
  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData = userDoc.data();
    return userData?.stripeCustomerId || null;
  } catch (error) {
    logger.error('Error getting Stripe customer:', error);
    throw new Error('Failed to get customer');
  }
}

/**
 * Update a Stripe customer
 * @param customerId Stripe customer ID
 * @param updateData Data to update
 */
export async function updateCustomer(
  customerId: string, 
  updateData: { email?: string; name?: string; phone?: string; }
): Promise<void> {
  try {
    await stripe.customers.update(customerId, updateData);
  } catch (error) {
    logger.error('Error updating Stripe customer:', error);
    throw new Error('Failed to update customer');
  }
}

/**
 * Delete a Stripe customer
 * @param customerId Stripe customer ID
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  try {
    await stripe.customers.del(customerId);
  } catch (error) {
    logger.error('Error deleting Stripe customer:', error);
    throw new Error('Failed to delete customer');
  }
}
