import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import stripe from './stripe';

/**
 * Create a subscription for a user
 */
export const createSubscription = functions.https.onCall(
  async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { 
      priceId, 
      paymentMethodId, 
      isYearly,
      // Additional billing information
      name,
      email,
      companyName,
      invoiceEmail,
      taxId,
      billingAddress
    } = data;

    if (!priceId || !paymentMethodId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with priceId and paymentMethodId.'
      );
    }

    try {
      // Get the user from Firestore
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User not found.'
        );
      }

      const userData = userDoc.data();
      let customerId = userData?.stripeCustomerId;

      // Prepare customer data with additional information
      const customerData: any = {
        email: email || context.auth.token.email || undefined,
        name: name,
        metadata: {
          firebaseUID: context.auth.uid
        }
      };

      // Add company information if provided
      if (companyName) {
        customerData.metadata.company_name = companyName;
      }

      // Add tax ID if provided
      if (taxId) {
        customerData.tax_id_data = [
          {
            type: 'eu_vat', // Default to EU VAT, can be expanded based on country
            value: taxId
          }
        ];
      }

      // Add billing address if provided
      if (billingAddress) {
        customerData.address = {
          line1: billingAddress.line1,
          line2: billingAddress.line2 || undefined,
          city: billingAddress.city,
          state: billingAddress.state,
          postal_code: billingAddress.postalCode,
          country: billingAddress.country
        };
      }

      // If the user doesn't have a Stripe customer ID, create one
      if (!customerId) {
        const customer = await stripe.customers.create(customerData);
        customerId = customer.id;

        // Update the user document with the Stripe customer ID
        await admin.firestore()
          .collection('users')
          .doc(context.auth.uid)
          .update({
            stripeCustomerId: customerId
          });
      } else {
        // Update existing customer with new information
        await stripe.customers.update(customerId, customerData);
      }

      // Attach the payment method to the customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      // Set the payment method as the default
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // Set invoice email if provided
      if (invoiceEmail) {
        await stripe.customers.update(customerId, {
          email: invoiceEmail, // This will be used for invoices
          metadata: {
            ...customerData.metadata,
            account_email: email || context.auth.token.email, // Keep original email in metadata
            invoice_email: invoiceEmail
          }
        });
      }

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId
          }
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
          payment_method_types: ['card']
        },
        expand: ['latest_invoice.payment_intent']
      });

      // Store additional billing information in Firestore
      await admin.firestore()
        .collection('billingProfiles')
        .doc(context.auth.uid)
        .set({
          name,
          email: email || context.auth.token.email,
          companyName: companyName || null,
          invoiceEmail: invoiceEmail || null,
          taxId: taxId || null,
          billingAddress: billingAddress || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      // Return the subscription ID and client secret
      return {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret
      };
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      throw new functions.https.HttpsError(
        'internal',
        error.message || 'An error occurred while creating the subscription'
      );
    }
  }
);

/**
 * Create a payment intent
 */
export const createPaymentIntent = functions.https.onCall(
  async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { amount, currency = 'usd' } = data;

    if (!amount) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with an amount.'
      );
    }

    try {
      // Get the user from Firestore
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User not found.'
        );
      }

      const userData = userDoc.data();
      let customerId = userData?.stripeCustomerId;

      // If the user doesn't have a Stripe customer ID, create one
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: context.auth.token.email || undefined,
          metadata: {
            firebaseUID: context.auth.uid
          }
        });

        customerId = customer.id;

        // Update the user document with the Stripe customer ID
        await admin.firestore()
          .collection('users')
          .doc(context.auth.uid)
          .update({
            stripeCustomerId: customerId
          });
      }

      // Create the payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        payment_method_types: ['card']
      });

      // Return the client secret
      return {
        clientSecret: paymentIntent.client_secret
      };
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      throw new functions.https.HttpsError(
        'internal',
        error.message || 'An error occurred while creating the payment intent'
      );
    }
  }
);

/**
 * Cancel a subscription
 */
export const cancelSubscription = functions.https.onCall(
  async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { subscriptionId } = data;

    if (!subscriptionId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with a subscriptionId.'
      );
    }

    try {
      // Get the subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Get the user from Firestore
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User not found.'
        );
      }

      const userData = userDoc.data();
      const customerId = userData?.stripeCustomerId;

      // Check if the subscription belongs to the user
      if (subscription.customer !== customerId) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'The subscription does not belong to the authenticated user.'
        );
      }

      // Cancel the subscription at the end of the current period
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      // Update the subscription in Firestore
      await admin.firestore()
        .collection('subscriptions')
        .doc(subscriptionId)
        .update({
          cancelAtPeriodEnd: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      return { success: true };
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      throw new functions.https.HttpsError(
        'internal',
        error.message || 'An error occurred while canceling the subscription'
      );
    }
  }
);

/**
 * Update a subscription
 */
export const updateSubscription = functions.https.onCall(
  async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { subscriptionId, newPriceId } = data;

    if (!subscriptionId || !newPriceId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with subscriptionId and newPriceId.'
      );
    }

    try {
      // Get the subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Get the user from Firestore
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User not found.'
        );
      }

      const userData = userDoc.data();
      const customerId = userData?.stripeCustomerId;

      // Check if the subscription belongs to the user
      if (subscription.customer !== customerId) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'The subscription does not belong to the authenticated user.'
        );
      }

      // Update the subscription with the new price
      await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId
          }
        ]
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      throw new functions.https.HttpsError(
        'internal',
        error.message || 'An error occurred while updating the subscription'
      );
    }
  }
);

/**
 * Get payment methods for a user
 */
export const getPaymentMethods = functions.https.onCall(
  async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    try {
      // Get the user from Firestore
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User not found.'
        );
      }

      const userData = userDoc.data();
      const customerId = userData?.stripeCustomerId;

      if (!customerId) {
        return [];
      }

      // Get the payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return paymentMethods.data;
    } catch (error: any) {
      console.error('Error getting payment methods:', error);
      throw new functions.https.HttpsError(
        'internal',
        error.message || 'An error occurred while getting payment methods'
      );
    }
  }
);
