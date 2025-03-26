// Script to add team membership using Firebase Admin SDK
// NOTE: This script requires a service account key file to run

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
  console.log('5. Save the JSON file as "serviceAccountKey.json" in the same directory as this script');
  console.log('6. Run this script again');
  process.exit(1);
}

const db = admin.firestore();

// Email of the user to add team membership for
const userEmail = 'junior.hallberg@gmail.com';

// Default team ID
const defaultTeamId = 'default';

async function addTeamMembership() {
  try {
    console.log(`Adding team membership for user: ${userEmail}`);
    
    // Get user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', userEmail)
      .limit(1)
      .get();
    
    let userId;
    let userData;
    
    if (usersSnapshot.empty) {
      console.log(`User with email ${userEmail} not found in the database. Creating user...`);
      
      // Create a new user document
      const newUserRef = db.collection('users').doc();
      userId = newUserRef.id;
      
      userData = {
        email: userEmail,
        displayName: 'Junior Hallberg',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await newUserRef.set(userData);
      console.log(`User created with ID: ${userId}`);
    } else {
      const userDoc = usersSnapshot.docs[0];
      userId = userDoc.id;
      userData = userDoc.data();
      console.log(`Found existing user: ${userId}`);
    }
    
    console.log(`Found user: ${userId}`);
    console.log('User data:', {
      email: userData.email,
      displayName: userData.displayName,
      createdAt: userData.createdAt instanceof admin.firestore.Timestamp ? userData.createdAt.toDate() : userData.createdAt
    });
    
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
        ownerId: userId
      });
      
      console.log(`Team ${defaultTeamId} created successfully.`);
    } else {
      console.log(`Team ${defaultTeamId} already exists.`);
      const teamData = teamDoc.data();
      console.log('Team data:', {
        name: teamData.name,
        ownerId: teamData.ownerId,
        createdAt: teamData.createdAt instanceof admin.firestore.Timestamp ? teamData.createdAt.toDate() : teamData.createdAt,
        updatedAt: teamData.updatedAt instanceof admin.firestore.Timestamp ? teamData.updatedAt.toDate() : teamData.updatedAt
      });
    }
    
    // Check if team member entry exists
    const teamMemberRef = db.collection('teamMembers').doc(userId);
    const teamMemberDoc = await teamMemberRef.get();
    
    if (!teamMemberDoc.exists) {
      console.log(`Team member entry for user ${userId} does not exist. Creating it...`);
      
      // Create team member entry
      await teamMemberRef.set({
        teamId: defaultTeamId,
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Team member entry for user ${userId} created successfully.`);
    } else {
      console.log(`Team member entry for user ${userId} already exists.`);
      const teamMemberData = teamMemberDoc.data();
      console.log('Team member data:', {
        teamId: teamMemberData.teamId,
        role: teamMemberData.role,
        createdAt: teamMemberData.createdAt instanceof admin.firestore.Timestamp ? teamMemberData.createdAt.toDate() : teamMemberData.createdAt,
        updatedAt: teamMemberData.updatedAt instanceof admin.firestore.Timestamp ? teamMemberData.updatedAt.toDate() : teamMemberData.updatedAt
      });
      
      // Update team member entry
      await teamMemberRef.update({
        teamId: defaultTeamId,
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Team member entry for user ${userId} updated successfully.`);
    }
    
    // Update user's widgets to include teamId if missing
    const widgetsSnapshot = await db.collection('widgets')
      .where('userId', '==', userId)
      .get();
    
    console.log(`Found ${widgetsSnapshot.docs.length} widgets owned by the user.`);
    
    const updatePromises = [];
    
    widgetsSnapshot.docs.forEach((doc) => {
      const widgetData = doc.data();
      
      if (!widgetData.teamId) {
        console.log(`Widget ${doc.id} does not have a teamId. Adding teamId...`);
        updatePromises.push(
          db.collection('widgets').doc(doc.id).update({
            teamId: defaultTeamId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
        );
      }
    });
    
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Updated ${updatePromises.length} widgets with teamId.`);
    }
    
    console.log('Team membership added successfully.');
  } catch (error) {
    console.error('Error adding team membership:', error);
  }
}

// Run the function
addTeamMembership()
  .then(() => {
    console.log('Team membership process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running team membership process:', error);
    process.exit(1);
  });
