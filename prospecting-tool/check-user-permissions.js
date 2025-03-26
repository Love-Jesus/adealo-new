// Script to check user permissions and team membership

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';

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

// Email to check (replace with the email you want to check)
const userEmail = 'junior.hallberg@gmail.com';

// Function to check user permissions
async function checkUserPermissions() {
  try {
    // Get user credentials (this is just for testing, in production you should use a more secure method)
    console.log(`Checking permissions for user: ${userEmail}`);
    
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
    console.log('User data:', userData);
    
    // Check team membership
    const teamMemberDoc = await getDoc(doc(db, 'teamMembers', userId));
    
    if (!teamMemberDoc.exists()) {
      console.log(`User ${userId} is not a member of any team.`);
    } else {
      const teamMemberData = teamMemberDoc.data();
      console.log('Team membership:', teamMemberData);
      
      // Check if the team exists
      const teamDoc = await getDoc(doc(db, 'teams', teamMemberData.teamId));
      
      if (!teamDoc.exists()) {
        console.log(`Team ${teamMemberData.teamId} does not exist.`);
      } else {
        console.log('Team data:', teamDoc.data());
      }
    }
    
    // Check widgets owned by the user
    const widgetsQuery = query(collection(db, 'widgets'), where('userId', '==', userId), limit(10));
    const widgetsSnapshot = await getDocs(widgetsQuery);
    
    console.log(`Found ${widgetsSnapshot.docs.length} widgets owned by the user.`);
    
    widgetsSnapshot.docs.forEach((doc, index) => {
      console.log(`Widget ${index + 1}:`, doc.id, doc.data());
    });
    
    // Check widgets owned by the user's team
    if (teamMemberDoc.exists()) {
      const teamMemberData = teamMemberDoc.data();
      const teamWidgetsQuery = query(collection(db, 'widgets'), where('teamId', '==', teamMemberData.teamId), limit(10));
      const teamWidgetsSnapshot = await getDocs(teamWidgetsQuery);
      
      console.log(`Found ${teamWidgetsSnapshot.docs.length} widgets owned by the user's team.`);
      
      teamWidgetsSnapshot.docs.forEach((doc, index) => {
        console.log(`Team Widget ${index + 1}:`, doc.id, doc.data());
      });
    }
    
  } catch (error) {
    console.error('Error checking user permissions:', error);
  }
}

// Run the check
checkUserPermissions()
  .then(() => {
    console.log('Permission check completed.');
  })
  .catch((error) => {
    console.error('Error running permission check:', error);
  });
