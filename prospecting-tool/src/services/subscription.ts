import { auth, db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { 
  Subscription, 
  UserCredits, 
  PlanId, 
  SubscriptionStatus,
  getPlanById
} from '@/types/subscription';

// Collection references
const subscriptionsRef = collection(db, 'subscriptions');
const userCreditsRef = collection(db, 'userCredits');

/**
 * Get the current user's subscription
 * @returns Promise with subscription data or null if no subscription
 */
export const getCurrentSubscription = async (): Promise<Subscription | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Query subscriptions for the current user
    const q = query(subscriptionsRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Get the most recent subscription
    let latestSubscription: Subscription | null = null;
    let latestTimestamp = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Subscription;
      if (data.createdAt > latestTimestamp) {
        latestSubscription = {
          ...data,
          id: doc.id
        };
        latestTimestamp = data.createdAt;
      }
    });

    return latestSubscription;
  } catch (error) {
    console.error('Error getting current subscription:', error);
    throw error;
  }
};

/**
 * Listen to changes in the current user's subscription
 * @param callback Function to call when subscription changes
 * @returns Unsubscribe function
 */
export const subscribeToCurrentSubscription = (
  callback: (subscription: Subscription | null) => void
): Unsubscribe => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Query subscriptions for the current user
  const q = query(subscriptionsRef, where('userId', '==', user.uid));
  
  return onSnapshot(q, (querySnapshot) => {
    if (querySnapshot.empty) {
      callback(null);
      return;
    }

    // Get the most recent subscription
    let latestSubscription: Subscription | null = null;
    let latestTimestamp = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Subscription;
      if (data.createdAt > latestTimestamp) {
        latestSubscription = {
          ...data,
          id: doc.id
        };
        latestTimestamp = data.createdAt;
      }
    });

    callback(latestSubscription);
  });
};

/**
 * Get the current user's credits
 * @returns Promise with user credits or null if no credits
 */
export const getUserCredits = async (): Promise<UserCredits | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userCreditsDoc = await getDoc(doc(userCreditsRef, user.uid));
    
    if (!userCreditsDoc.exists()) {
      return null;
    }

    return userCreditsDoc.data() as UserCredits;
  } catch (error) {
    console.error('Error getting user credits:', error);
    throw error;
  }
};

/**
 * Listen to changes in the current user's credits
 * @param callback Function to call when credits change
 * @returns Unsubscribe function
 */
export const subscribeToUserCredits = (
  callback: (credits: UserCredits | null) => void
): Unsubscribe => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  return onSnapshot(doc(userCreditsRef, user.uid), (doc) => {
    if (!doc.exists()) {
      callback(null);
      return;
    }

    callback(doc.data() as UserCredits);
  });
};

/**
 * Check if the user has enough credits for an operation
 * @param creditType Type of credit to check (prospecting, leads, widgets)
 * @param amount Amount of credits needed
 * @returns Promise with boolean indicating if user has enough credits
 */
export const hasEnoughCredits = async (
  creditType: 'prospecting' | 'leads' | 'widgets',
  amount: number = 1
): Promise<boolean> => {
  try {
    const credits = await getUserCredits();
    
    if (!credits) {
      return false;
    }

    switch (creditType) {
      case 'prospecting':
        return (credits.prospectingCredits.total - credits.prospectingCredits.used) >= amount;
      case 'leads':
        return (credits.leadCredits.total - credits.leadCredits.used) >= amount;
      case 'widgets':
        return (credits.widgetCredits.total - credits.widgetCredits.used) >= amount;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking credits:', error);
    return false;
  }
};

/**
 * Use credits for an operation
 * @param creditType Type of credit to use (prospecting, leads, widgets)
 * @param amount Amount of credits to use
 * @returns Promise that resolves when credits are used
 */
export const useCredits = async (
  creditType: 'prospecting' | 'leads' | 'widgets',
  amount: number = 1
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const credits = await getUserCredits();
    
    if (!credits) {
      throw new Error('No credits found for user');
    }

    // Check if user has enough credits
    if (!await hasEnoughCredits(creditType, amount)) {
      throw new Error(`Not enough ${creditType} credits`);
    }

    // Update the credits
    const userCreditsDocRef = doc(userCreditsRef, user.uid);
    
    switch (creditType) {
      case 'prospecting':
        await updateDoc(userCreditsDocRef, {
          'prospectingCredits.used': credits.prospectingCredits.used + amount,
          updatedAt: serverTimestamp()
        });
        break;
      case 'leads':
        await updateDoc(userCreditsDocRef, {
          'leadCredits.used': credits.leadCredits.used + amount,
          updatedAt: serverTimestamp()
        });
        break;
      case 'widgets':
        await updateDoc(userCreditsDocRef, {
          'widgetCredits.used': credits.widgetCredits.used + amount,
          updatedAt: serverTimestamp()
        });
        break;
    }
  } catch (error) {
    console.error('Error using credits:', error);
    throw error;
  }
};

/**
 * Get the remaining credits for a specific type
 * @param creditType Type of credit to check (prospecting, leads, widgets)
 * @returns Promise with number of remaining credits
 */
export const getRemainingCredits = async (
  creditType: 'prospecting' | 'leads' | 'widgets'
): Promise<number> => {
  try {
    const credits = await getUserCredits();
    
    if (!credits) {
      return 0;
    }

    switch (creditType) {
      case 'prospecting':
        return credits.prospectingCredits.total - credits.prospectingCredits.used;
      case 'leads':
        return credits.leadCredits.total - credits.leadCredits.used;
      case 'widgets':
        return credits.widgetCredits.total - credits.widgetCredits.used;
      default:
        return 0;
    }
  } catch (error) {
    console.error('Error getting remaining credits:', error);
    return 0;
  }
};

/**
 * Get the current user's plan
 * @returns Promise with plan ID or 'free_tier' if no subscription
 */
export const getCurrentPlan = async (): Promise<PlanId> => {
  try {
    const subscription = await getCurrentSubscription();
    
    if (!subscription || subscription.status !== 'active') {
      return 'free_tier';
    }

    return subscription.planId;
  } catch (error) {
    console.error('Error getting current plan:', error);
    return 'free_tier';
  }
};

/**
 * Check if the current user's subscription is active
 * @returns Promise with boolean indicating if subscription is active
 */
export const isSubscriptionActive = async (): Promise<boolean> => {
  try {
    const subscription = await getCurrentSubscription();
    
    if (!subscription) {
      return false;
    }

    return ['active', 'trialing'].includes(subscription.status);
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

/**
 * Get the current user's subscription status
 * @returns Promise with subscription status or null if no subscription
 */
export const getSubscriptionStatus = async (): Promise<SubscriptionStatus | null> => {
  try {
    const subscription = await getCurrentSubscription();
    
    if (!subscription) {
      return null;
    }

    return subscription.status;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
};

/**
 * Check if the current user's subscription is in trial period
 * @returns Promise with boolean indicating if subscription is in trial
 */
export const isInTrialPeriod = async (): Promise<boolean> => {
  try {
    const subscription = await getCurrentSubscription();
    
    if (!subscription) {
      return false;
    }

    return subscription.status === 'trialing';
  } catch (error) {
    console.error('Error checking trial status:', error);
    return false;
  }
};

/**
 * Get the trial end date for the current user's subscription
 * @returns Promise with trial end date or null if no trial
 */
export const getTrialEndDate = async (): Promise<Date | null> => {
  try {
    const subscription = await getCurrentSubscription();
    
    if (!subscription || !subscription.trialEnd) {
      return null;
    }

    return new Date(subscription.trialEnd * 1000);
  } catch (error) {
    console.error('Error getting trial end date:', error);
    return null;
  }
};

/**
 * Get the days remaining in the trial period
 * @returns Promise with number of days remaining or 0 if no trial
 */
export const getTrialDaysRemaining = async (): Promise<number> => {
  try {
    const trialEndDate = await getTrialEndDate();
    
    if (!trialEndDate) {
      return 0;
    }

    const now = new Date();
    const diffTime = trialEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  } catch (error) {
    console.error('Error getting trial days remaining:', error);
    return 0;
  }
};

/**
 * Check if the current user can use a specific feature
 * @param featureName Name of the feature to check
 * @returns Promise with boolean indicating if user can use the feature
 */
export const canUseFeature = async (featureName: string): Promise<boolean> => {
  try {
    const planId = await getCurrentPlan();
    const plan = getPlanById(planId);
    
    if (!plan) {
      return false;
    }

    const feature = plan.features.find(f => f.name === featureName);
    
    if (!feature) {
      return false;
    }

    return feature.included;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
};

/**
 * Get the current user's subscription renewal date
 * @returns Promise with renewal date or null if no subscription
 */
export const getSubscriptionRenewalDate = async (): Promise<Date | null> => {
  try {
    const subscription = await getCurrentSubscription();
    
    if (!subscription) {
      return null;
    }

    return new Date(subscription.currentPeriodEnd * 1000);
  } catch (error) {
    console.error('Error getting subscription renewal date:', error);
    return null;
  }
};

/**
 * Check if the current user's subscription is set to cancel at period end
 * @returns Promise with boolean indicating if subscription will cancel
 */
export const willCancelAtPeriodEnd = async (): Promise<boolean> => {
  try {
    const subscription = await getCurrentSubscription();
    
    if (!subscription) {
      return false;
    }

    return subscription.cancelAtPeriodEnd;
  } catch (error) {
    console.error('Error checking cancellation status:', error);
    return false;
  }
};
