import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions/v2';

/**
 * Provision credits for a team based on the subscription plan
 * @param teamId The team ID to provision credits for
 * @param planId The subscription plan ID
 * @param subscriptionId The subscription ID
 */
export async function provisionTeamCredits(
  teamId: string,
  planId: string,
  subscriptionId: string
): Promise<void> {
  try {
    // Define credit limits for each plan
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
    
    // Get the team credits document
    const teamCreditsRef = admin.firestore().collection('teamCredits').doc(teamId);
    const teamCreditsDoc = await teamCreditsRef.get();
    
    if (teamCreditsDoc.exists) {
      // Update existing team credits
      await teamCreditsRef.update({
        'prospectingCredits.total': limits.prospecting,
        'leadCredits.total': limits.leads,
        'widgetCredits.total': limits.widgets,
        'prospectingCredits.lastRefillDate': admin.firestore.FieldValue.serverTimestamp(),
        'leadCredits.lastRefillDate': admin.firestore.FieldValue.serverTimestamp(),
        subscriptionId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Create new team credits
      await teamCreditsRef.set({
        teamId,
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
        subscriptionId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    logger.info(`Provisioned credits for team ${teamId} with plan ${planId}`);
  } catch (error) {
    logger.error('Error provisioning team credits:', error);
    throw error;
  }
}

/**
 * Get the team ID for a user
 * @param userId The user ID
 * @returns The team ID or null if not found
 */
export async function getUserTeamId(userId: string): Promise<string | null> {
  try {
    // Check if the user is a member of a team
    const teamMemberDoc = await admin.firestore().collection('teamMembers').doc(userId).get();
    
    if (teamMemberDoc.exists) {
      const teamMemberData = teamMemberDoc.data();
      return teamMemberData?.teamId || null;
    }
    
    // If no team membership found, check if the user has created a team
    const teamsQuery = await admin.firestore()
      .collection('teams')
      .where('ownerId', '==', userId)
      .limit(1)
      .get();
    
    if (!teamsQuery.empty) {
      return teamsQuery.docs[0].id;
    }
    
    // No team found, return null
    return null;
  } catch (error) {
    logger.error('Error getting user team ID:', error);
    return null;
  }
}
