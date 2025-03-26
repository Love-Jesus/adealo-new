// Script to fix user permissions by creating a user document with the correct ID
// Modified from admin-add-team-member.js

// Import Firebase Admin SDK
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
  console.log('5. Save the JSON file as "adealo-ce238-firebase-adminsdk-fbsvc-47871df645.json" in the same directory as this script');
  console.log('6. Run this script again');
  process.exit(1);
}

const db = admin.firestore();

// User information
const userEmail = 'junior.hallberg@gmail.com';
const displayName = 'Junior Hallberg';

// IMPORTANT: Use the actual Firebase Auth user ID instead of looking up by email
const correctUserId = 'pW91rLLc3MUVfuDtM8moZocGZHi2';

// Default team ID
const defaultTeamId = 'default';

async function fixUserPermissions() {
  try {
    console.log(`Fixing permissions for user: ${userEmail} (ID: ${correctUserId})`);
    
    // Create or update user document with the correct ID
    const userRef = db.collection('users').doc(correctUserId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log(`Creating new user document with ID: ${correctUserId}`);
      
      await userRef.set({
        email: userEmail,
        displayName: displayName,
        role: 'admin', // Set role to admin
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`User document created successfully.`);
    } else {
      console.log(`User document already exists. Updating...`);
      
      await userRef.update({
        email: userEmail,
        displayName: displayName,
        role: 'admin', // Ensure role is admin
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`User document updated successfully.`);
    }
    
    // Check if team exists, if not create it
    const teamRef = db.collection('teams').doc(defaultTeamId);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      console.log(`Team ${defaultTeamId} does not exist. Creating it...`);
      
      // Create team
      await teamRef.set({
        name: 'Default Team',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ownerId: correctUserId
      });
      
      console.log(`Team ${defaultTeamId} created successfully.`);
    } else {
      console.log(`Team ${defaultTeamId} already exists.`);
    }
    
    // Create or update team member entry
    const teamMemberRef = db.collection('teamMembers').doc(correctUserId);
    const teamMemberDoc = await teamMemberRef.get();
    
    if (!teamMemberDoc.exists) {
      console.log(`Creating team member entry for user ${correctUserId}...`);
      
      await teamMemberRef.set({
        teamId: defaultTeamId,
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Team member entry created successfully.`);
    } else {
      console.log(`Team member entry already exists. Updating...`);
      
      await teamMemberRef.update({
        teamId: defaultTeamId,
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Team member entry updated successfully.`);
    }
    
    // Create or update user credits
    const userCreditsRef = db.collection('userCredits').doc(correctUserId);
    const userCreditsDoc = await userCreditsRef.get();
    
    if (!userCreditsDoc.exists) {
      console.log(`Creating user credits for user ${correctUserId}...`);
      
      await userCreditsRef.set({
        prospectingCredits: {
          total: 1000,
          used: 0
        },
        leadCredits: {
          total: 1000,
          used: 0
        },
        widgetCredits: {
          total: 10,
          used: 0
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`User credits created successfully.`);
    } else {
      console.log(`User credits already exist. Updating...`);
      
      await userCreditsRef.update({
        'prospectingCredits.total': admin.firestore.FieldValue.increment(1000),
        'leadCredits.total': admin.firestore.FieldValue.increment(1000),
        'widgetCredits.total': admin.firestore.FieldValue.increment(10),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`User credits updated successfully.`);
    }
    
    console.log('User permissions fixed successfully.');
  } catch (error) {
    console.error('Error fixing user permissions:', error);
  }
}

// Run the function
fixUserPermissions()
  .then(() => {
    console.log('Permission fix completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running permission fix:', error);
    process.exit(1);
  });
