/**
 * Migration script to convert user credits to team credits
 * 
 * This script:
 * 1. Gets all users
 * 2. Groups users by team
 * 3. For each team, finds the team admin or first user
 * 4. Gets the user's credits
 * 5. Creates team credits based on the user's credits
 * 
 * Usage:
 * node migrate-to-team-credits.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateUserCreditsToTeamCredits() {
  try {
    console.log('Starting migration of user credits to team credits...');
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.docs.length} users`);
    
    // Group users by team
    const teamUsers = new Map();
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Get user's team ID
      let teamId = null;
      
      // Check if user is a member of a team
      const teamMemberDoc = await db.collection('teamMembers').doc(userDoc.id).get();
      if (teamMemberDoc.exists) {
        const teamMemberData = teamMemberDoc.data();
        teamId = teamMemberData.teamId;
      }
      
      // If no team membership found, check if user has created a team
      if (!teamId) {
        const teamsQuery = await db
          .collection('teams')
          .where('ownerId', '==', userDoc.id)
          .limit(1)
          .get();
        
        if (!teamsQuery.empty) {
          teamId = teamsQuery.docs[0].id;
        }
      }
      
      // If still no team ID, create a default team ID for the user
      if (!teamId) {
        teamId = `team-${userDoc.id}`;
      }
      
      // Add user to team group
      if (!teamUsers.has(teamId)) {
        teamUsers.set(teamId, []);
      }
      
      teamUsers.get(teamId).push({
        id: userDoc.id,
        ...userData
      });
    }
    
    console.log(`Grouped users into ${teamUsers.size} teams`);
    
    // Process each team
    let processedTeams = 0;
    let skippedTeams = 0;
    
    for (const [teamId, users] of teamUsers.entries()) {
      // Find team admin or first user
      const teamAdmin = users.find(user => user.role === 'admin') || users[0];
      
      // Get user credits for team admin
      const userCreditsDoc = await db.collection('userCredits').doc(teamAdmin.id).get();
      
      if (userCreditsDoc.exists) {
        const userCredits = userCreditsDoc.data();
        
        // Check if team credits already exist
        const teamCreditsDoc = await db.collection('teamCredits').doc(teamId).get();
        
        if (teamCreditsDoc.exists) {
          console.log(`Team credits already exist for team ${teamId}, skipping`);
          skippedTeams++;
          continue;
        }
        
        // Get subscription for this user
        const subscriptionsQuery = await db
          .collection('subscriptions')
          .where('userId', '==', teamAdmin.id)
          .where('status', 'in', ['active', 'trialing'])
          .limit(1)
          .get();
        
        let subscriptionId = null;
        if (!subscriptionsQuery.empty) {
          subscriptionId = subscriptionsQuery.docs[0].id;
        }
        
        // Create team credits based on admin's credits
        await db.collection('teamCredits').doc(teamId).set({
          teamId,
          prospectingCredits: userCredits.prospectingCredits || {
            total: 100,
            used: 0,
            lastRefillDate: admin.firestore.FieldValue.serverTimestamp()
          },
          leadCredits: userCredits.leadCredits || {
            total: 10,
            used: 0,
            lastRefillDate: admin.firestore.FieldValue.serverTimestamp()
          },
          widgetCredits: userCredits.widgetCredits || {
            total: 1,
            used: 0
          },
          subscriptionId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Migrated credits for team ${teamId} with ${users.length} users`);
        processedTeams++;
      } else {
        console.log(`No credits found for team admin ${teamAdmin.id}, creating default credits`);
        
        // Create default team credits
        await db.collection('teamCredits').doc(teamId).set({
          teamId,
          prospectingCredits: {
            total: 100,
            used: 0,
            lastRefillDate: admin.firestore.FieldValue.serverTimestamp()
          },
          leadCredits: {
            total: 10,
            used: 0,
            lastRefillDate: admin.firestore.FieldValue.serverTimestamp()
          },
          widgetCredits: {
            total: 1,
            used: 0
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Created default credits for team ${teamId} with ${users.length} users`);
        processedTeams++;
      }
    }
    
    console.log(`Migration completed successfully`);
    console.log(`Processed ${processedTeams} teams`);
    console.log(`Skipped ${skippedTeams} teams (already had team credits)`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the migration
migrateUserCreditsToTeamCredits();
