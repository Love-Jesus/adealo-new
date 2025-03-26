// Script to check if the admin user exists in Firestore
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Path to your service account key file
const SERVICE_ACCOUNT_PATH = './adealo-ce238-firebase-adminsdk-fbsvc-47871df645.json';

try {
  // Load service account key
  console.log(`Loading service account key from ${SERVICE_ACCOUNT_PATH}...`);
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.log('\nIMPORTANT: This script requires a service account key file.');
  console.log('Please follow these steps to create one:');
  console.log('1. Go to the Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project (adealo-ce238)');
  console.log('3. Go to Project Settings > Service accounts');
  console.log('4. Click "Generate new private key"');
  console.log('5. Save the JSON file as "serviceAccountKey.json" in the same directory as this script');
  console.log('6. Run this script again');
  process.exit(1);
}

const db = admin.firestore();

// Email of the admin user to check
const adminEmail = 'junior.hallberg@gmail.com';

async function checkAdminUser() {
  try {
    console.log(`Checking if admin user with email ${adminEmail} exists in Firestore...`);
    
    // Get user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', adminEmail)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.error(`User with email ${adminEmail} not found in the database.`);
      console.log('\nCreating admin user...');
      
      // Create a new user document
      const newUserRef = db.collection('users').doc();
      const userId = newUserRef.id;
      
      const userData = {
        email: adminEmail,
        displayName: 'Junior Hallberg',
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await newUserRef.set(userData);
      console.log(`Admin user created with ID: ${userId}`);
      
      // Create default team
      const defaultTeamId = 'default';
      const teamRef = db.collection('teams').doc(defaultTeamId);
      await teamRef.set({
        name: 'Default Team',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ownerId: userId
      });
      console.log(`Default team created with ID: ${defaultTeamId}`);
      
      // Create team member entry
      const teamMemberRef = db.collection('teamMembers').doc(userId);
      await teamMemberRef.set({
        teamId: defaultTeamId,
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Team member entry created for user ${userId}`);
      
      // Create user credits
      const userCreditsRef = db.collection('userCredits').doc(userId);
      await userCreditsRef.set({
        userId: userId,
        prospectingCredits: {
          total: 10000,
          used: 0,
          lastRefillDate: admin.firestore.FieldValue.serverTimestamp()
        },
        leadCredits: {
          total: 1000,
          used: 0,
          lastRefillDate: admin.firestore.FieldValue.serverTimestamp()
        },
        widgetCredits: {
          total: 100,
          used: 0
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`User credits created for user ${userId}`);
      
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`Found user: ${userId}`);
    console.log('User data:', {
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      createdAt: userData.createdAt instanceof admin.firestore.Timestamp ? userData.createdAt.toDate() : userData.createdAt
    });
    
    // Check if user has admin role
    if (userData.role !== 'admin') {
      console.log(`User ${userId} does not have admin role. Updating role to admin...`);
      await db.collection('users').doc(userId).update({
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`User ${userId} role updated to admin.`);
    } else {
      console.log(`User ${userId} already has admin role.`);
    }
    
    // Check if user has team membership
    const teamMemberDoc = await db.collection('teamMembers').doc(userId).get();
    
    if (!teamMemberDoc.exists) {
      console.log(`User ${userId} does not have team membership. Creating team membership...`);
      
      // Create default team if it doesn't exist
      const defaultTeamId = 'default';
      const teamRef = db.collection('teams').doc(defaultTeamId);
      const teamDoc = await teamRef.get();
      
      if (!teamDoc.exists) {
        console.log(`Team ${defaultTeamId} does not exist. Creating it...`);
        await teamRef.set({
          name: 'Default Team',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          ownerId: userId
        });
        console.log(`Team ${defaultTeamId} created successfully.`);
      }
      
      // Create team member entry
      const teamMemberRef = db.collection('teamMembers').doc(userId);
      await teamMemberRef.set({
        teamId: defaultTeamId,
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Team member entry created for user ${userId}`);
    } else {
      const teamMemberData = teamMemberDoc.data();
      console.log(`User ${userId} has team membership:`, {
        teamId: teamMemberData.teamId,
        role: teamMemberData.role
      });
      
      // Update team member role to admin if it's not already
      if (teamMemberData.role !== 'admin') {
        console.log(`Updating team member role to admin for user ${userId}...`);
        await db.collection('teamMembers').doc(userId).update({
          role: 'admin',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Team member role updated to admin for user ${userId}.`);
      }
    }
    
    // Check if user has credits
    const userCreditsDoc = await db.collection('userCredits').doc(userId).get();
    
    if (!userCreditsDoc.exists) {
      console.log(`User ${userId} does not have credits. Creating credits...`);
      
      // Create user credits
      const userCreditsRef = db.collection('userCredits').doc(userId);
      await userCreditsRef.set({
        userId: userId,
        prospectingCredits: {
          total: 10000,
          used: 0,
          lastRefillDate: admin.firestore.FieldValue.serverTimestamp()
        },
        leadCredits: {
          total: 1000,
          used: 0,
          lastRefillDate: admin.firestore.FieldValue.serverTimestamp()
        },
        widgetCredits: {
          total: 100,
          used: 0
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`User credits created for user ${userId}`);
    } else {
      const userCreditsData = userCreditsDoc.data();
      console.log(`User ${userId} has credits:`, {
        prospectingCredits: {
          total: userCreditsData.prospectingCredits.total,
          used: userCreditsData.prospectingCredits.used
        },
        leadCredits: {
          total: userCreditsData.leadCredits.total,
          used: userCreditsData.leadCredits.used
        },
        widgetCredits: {
          total: userCreditsData.widgetCredits.total,
          used: userCreditsData.widgetCredits.used
        }
      });
      
      // Update widget credits if they're low
      if (userCreditsData.widgetCredits.total - userCreditsData.widgetCredits.used < 10) {
        console.log(`User ${userId} has low widget credits. Adding more...`);
        await db.collection('userCredits').doc(userId).update({
          'widgetCredits.total': 100,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Widget credits updated for user ${userId}.`);
      }
    }
    
    console.log('\nAdmin user check completed successfully.');
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
}

// Run the function
checkAdminUser()
  .then(() => {
    console.log('Admin user check completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running admin user check:', error);
    process.exit(1);
  });
