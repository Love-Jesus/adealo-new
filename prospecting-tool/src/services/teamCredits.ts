import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Team credits interface
export interface TeamCredits {
  teamId: string;
  prospectingCredits: {
    total: number;
    used: number;
    lastRefillDate: Date;
  };
  leadCredits: {
    total: number;
    used: number;
    lastRefillDate: Date;
  };
  widgetCredits: {
    total: number;
    used: number;
  };
  updatedAt: Date;
  subscriptionId?: string; // Reference to the team's subscription
}

// Collection reference
const teamCreditsRef = collection(db, 'teamCredits');

/**
 * Get the current team's credits
 * @param teamId Optional team ID, defaults to current team from localStorage
 * @returns Promise with team credits or null if no credits
 */
export const getTeamCredits = async (teamId?: string): Promise<TeamCredits | null> => {
  try {
    if (!teamId) {
      teamId = localStorage.getItem('currentTeamId') || 'default';
    }
    
    const teamCreditsDoc = await getDoc(doc(teamCreditsRef, teamId));
    
    if (!teamCreditsDoc.exists()) {
      return null;
    }

    return teamCreditsDoc.data() as TeamCredits;
  } catch (error) {
    console.error('Error getting team credits:', error);
    throw error;
  }
};

/**
 * Listen to changes in the current team's credits
 * @param callback Function to call when credits change
 * @param teamId Optional team ID, defaults to current team from localStorage
 * @returns Unsubscribe function
 */
export const subscribeToTeamCredits = (
  callback: (credits: TeamCredits | null) => void,
  teamId?: string
): Unsubscribe => {
  if (!teamId) {
    teamId = localStorage.getItem('currentTeamId') || 'default';
  }

  return onSnapshot(doc(teamCreditsRef, teamId), (doc) => {
    if (!doc.exists()) {
      callback(null);
      return;
    }

    callback(doc.data() as TeamCredits);
  });
};

/**
 * Check if the team has enough credits for an operation
 * @param creditType Type of credit to check (prospecting, leads, widgets)
 * @param amount Amount of credits needed
 * @param teamId Optional team ID, defaults to current team from localStorage
 * @returns Promise with boolean indicating if team has enough credits
 */
export const hasEnoughTeamCredits = async (
  creditType: 'prospecting' | 'leads' | 'widgets',
  amount: number = 1,
  teamId?: string
): Promise<boolean> => {
  try {
    if (!teamId) {
      teamId = localStorage.getItem('currentTeamId') || 'default';
    }
    
    const credits = await getTeamCredits(teamId);
    
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
    console.error('Error checking team credits:', error);
    return false;
  }
};

/**
 * Use team credits for an operation
 * @param creditType Type of credit to use (prospecting, leads, widgets)
 * @param amount Amount of credits to use
 * @param teamId Optional team ID, defaults to current team from localStorage
 * @returns Promise that resolves when credits are used
 */
export const useTeamCredits = async (
  creditType: 'prospecting' | 'leads' | 'widgets',
  amount: number = 1,
  teamId?: string
): Promise<void> => {
  try {
    if (!teamId) {
      teamId = localStorage.getItem('currentTeamId') || 'default';
    }

    const credits = await getTeamCredits(teamId);
    
    if (!credits) {
      throw new Error('No credits found for team');
    }

    // Check if team has enough credits
    if (!await hasEnoughTeamCredits(creditType, amount, teamId)) {
      throw new Error(`Not enough ${creditType} credits`);
    }

    // Update the credits
    const teamCreditsDocRef = doc(teamCreditsRef, teamId);
    
    switch (creditType) {
      case 'prospecting':
        await updateDoc(teamCreditsDocRef, {
          'prospectingCredits.used': credits.prospectingCredits.used + amount,
          updatedAt: serverTimestamp()
        });
        break;
      case 'leads':
        await updateDoc(teamCreditsDocRef, {
          'leadCredits.used': credits.leadCredits.used + amount,
          updatedAt: serverTimestamp()
        });
        break;
      case 'widgets':
        await updateDoc(teamCreditsDocRef, {
          'widgetCredits.used': credits.widgetCredits.used + amount,
          updatedAt: serverTimestamp()
        });
        break;
    }
  } catch (error) {
    console.error('Error using team credits:', error);
    throw error;
  }
};

/**
 * Get the remaining credits for a specific type
 * @param creditType Type of credit to check (prospecting, leads, widgets)
 * @param teamId Optional team ID, defaults to current team from localStorage
 * @returns Promise with number of remaining credits
 */
export const getRemainingTeamCredits = async (
  creditType: 'prospecting' | 'leads' | 'widgets',
  teamId?: string
): Promise<number> => {
  try {
    if (!teamId) {
      teamId = localStorage.getItem('currentTeamId') || 'default';
    }
    
    const credits = await getTeamCredits(teamId);
    
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
    console.error('Error getting remaining team credits:', error);
    return 0;
  }
};

/**
 * Initialize team credits for a new team
 * @param teamId Team ID
 * @param subscriptionId Optional subscription ID
 * @returns Promise that resolves when credits are initialized
 */
export const initializeTeamCredits = async (
  teamId: string,
  subscriptionId?: string
): Promise<void> => {
  try {
    const teamCreditsDocRef = doc(teamCreditsRef, teamId);
    const teamCreditsDoc = await getDoc(teamCreditsDocRef);
    
    // Only initialize if team credits don't exist
    if (!teamCreditsDoc.exists()) {
      await setDoc(teamCreditsDocRef, {
        teamId,
        prospectingCredits: {
          total: 100, // Free tier default
          used: 0,
          lastRefillDate: serverTimestamp()
        },
        leadCredits: {
          total: 10, // Free tier default
          used: 0,
          lastRefillDate: serverTimestamp()
        },
        widgetCredits: {
          total: 1, // Free tier default
          used: 0
        },
        subscriptionId,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error initializing team credits:', error);
    throw error;
  }
};

/**
 * Update team credits based on subscription plan
 * @param teamId Team ID
 * @param planCredits Credit limits from the plan
 * @param subscriptionId Subscription ID
 * @returns Promise that resolves when credits are updated
 */
export const updateTeamCreditsFromPlan = async (
  teamId: string,
  planCredits: {
    prospecting: number;
    leads: number;
    widgets: number;
  },
  subscriptionId: string
): Promise<void> => {
  try {
    const teamCreditsDocRef = doc(teamCreditsRef, teamId);
    const teamCreditsDoc = await getDoc(teamCreditsDocRef);
    
    if (teamCreditsDoc.exists()) {
      // Update existing team credits
      await updateDoc(teamCreditsDocRef, {
        'prospectingCredits.total': planCredits.prospecting,
        'leadCredits.total': planCredits.leads,
        'widgetCredits.total': planCredits.widgets,
        'prospectingCredits.lastRefillDate': serverTimestamp(),
        'leadCredits.lastRefillDate': serverTimestamp(),
        subscriptionId,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new team credits
      await setDoc(teamCreditsDocRef, {
        teamId,
        prospectingCredits: {
          total: planCredits.prospecting,
          used: 0,
          lastRefillDate: serverTimestamp()
        },
        leadCredits: {
          total: planCredits.leads,
          used: 0,
          lastRefillDate: serverTimestamp()
        },
        widgetCredits: {
          total: planCredits.widgets,
          used: 0
        },
        subscriptionId,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating team credits from plan:', error);
    throw error;
  }
};
