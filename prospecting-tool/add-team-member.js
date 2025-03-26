// Script to add a team member entry for a user

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, limit, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration from src/lib/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyARUEAaE6vCiBT9qtPZ1T7DQV63Ux4zdu8",
  authDomain: "adealo-ce238.firebaseapp.com",
  databaseURL: "https://adealo-ce238-default-rtdb.firebaseio.com",
  projectId: "adealo-ce238",
  storageBucket: "adealo-ce238.appspot.com",
  messagingSenderId: "496668539325",
  appId: "1:496668539325:web:db9a5a4e223c6b11c67ad4",
  measurementId: "G-5Z4MHSWZ8N",
};

// Initialize Firebase
console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Email to add team membership for
const userEmail = 'junior.hallberg@gmail.com';

// Default team ID (you can change this to the appropriate team ID)
const defaultTeamId = 'default';

// Function to add team membership
async function addTeamMembership() {
  try {
    console.log(`Adding team membership for user: ${userEmail}`);
    
    // Get user by email
    const usersQuery = query(collection(db, 'users'), where('email', '==', userEmail), limit(1));
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      console.error(`User with email ${userEmail} not found in the database.`);
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;
    
    console.log(`Found user: ${userId}`);
    
    // Check if team exists, if not create it
    const teamDoc = await getDoc(doc(db, 'teams', defaultTeamId));
    
    if (!teamDoc.exists()) {
      console.log(`Team ${defaultTeamId} does not exist. Creating it...`);
      
      // Create team
      await setDoc(doc(db, 'teams', defaultTeamId), {
        name: 'Default Team',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ownerId: userId
      });
      
      console.log(`Team ${defaultTeamId} created successfully.`);
    } else {
      console.log(`Team ${defaultTeamId} already exists.`);
    }
    
    // Check if team member entry exists
    const teamMemberDoc = await getDoc(doc(db, 'teamMembers', userId));
    
    if (!teamMemberDoc.exists()) {
      console.log(`Team member entry for user ${userId} does not exist. Creating it...`);
      
      // Create team member entry
      await setDoc(doc(db, 'teamMembers', userId), {
        teamId: defaultTeamId,
        role: 'admin',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log(`Team member entry for user ${userId} created successfully.`);
    } else {
      console.log(`Team member entry for user ${userId} already exists.`);
      console.log('Team member data:', teamMemberDoc.data());
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
  })
  .catch((error) => {
    console.error('Error running team membership process:', error);
  });
