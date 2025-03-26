// Script to diagnose permission issues with Firestore
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, limit, doc, getDoc, orderBy } from 'firebase/firestore';

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

// Email and password for authentication
const email = 'junior.hallberg@gmail.com';
const password = process.argv[2] || ''; // Get password from command line argument

if (!password) {
  console.error('Please provide a password as a command line argument');
  process.exit(1);
}

// Function to diagnose permission issues
async function diagnosePermissionIssues() {
  try {
    // Step 1: Sign in with email and password
    console.log(`Signing in as ${email}...`);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Sign-in successful:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    });
    
    // Step 2: Check user document
    console.log('\nChecking user document...');
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User document found:', {
          uid: user.uid,
          email: userData.email,
          role: userData.role || 'none',
          createdAt: userData.createdAt?.toDate()
        });
      } else {
        console.error('User document not found in Firestore');
      }
    } catch (error) {
      console.error('Error getting user document:', error);
    }
    
    // Step 3: Check team membership
    console.log('\nChecking team membership...');
    try {
      const teamMemberDoc = await getDoc(doc(db, 'teamMembers', user.uid));
      
      if (teamMemberDoc.exists()) {
        const teamMemberData = teamMemberDoc.data();
        console.log('Team membership found:', teamMemberData);
        
        // Check team document
        const teamDoc = await getDoc(doc(db, 'teams', teamMemberData.teamId));
        
        if (teamDoc.exists()) {
          console.log('Team document found:', teamDoc.data());
        } else {
          console.error(`Team document with ID ${teamMemberData.teamId} not found`);
        }
      } else {
        console.error('Team membership not found');
      }
    } catch (error) {
      console.error('Error checking team membership:', error);
    }
    
    // Step 4: Check user credits
    console.log('\nChecking user credits...');
    try {
      const userCreditsDoc = await getDoc(doc(db, 'userCredits', user.uid));
      
      if (userCreditsDoc.exists()) {
        const userCredits = userCreditsDoc.data();
        console.log('User credits found:', {
          prospectingCredits: {
            total: userCredits.prospectingCredits?.total || 0,
            used: userCredits.prospectingCredits?.used || 0
          },
          leadCredits: {
            total: userCredits.leadCredits?.total || 0,
            used: userCredits.leadCredits?.used || 0
          },
          widgetCredits: {
            total: userCredits.widgetCredits?.total || 0,
            used: userCredits.widgetCredits?.used || 0
          }
        });
      } else {
        console.error('User credits not found');
      }
    } catch (error) {
      console.error('Error checking user credits:', error);
    }
    
    // Step 5: Try to access widgets collection
    console.log('\nTrying to access widgets collection...');
    try {
      // Try to get all widgets
      const q = query(
        collection(db, 'widgets'),
        orderBy('updatedAt', 'desc')
      );
      
      console.log('Executing Firestore query for all widgets...');
      const querySnapshot = await getDocs(q);
      
      console.log(`Query completed. Found ${querySnapshot.docs.length} widgets.`);
      
      // Log the first few widgets
      querySnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`Widget ${index + 1}:`, {
          id: doc.id,
          name: data.name,
          type: data.type,
          status: data.status,
          userId: data.userId,
          teamId: data.teamId
        });
      });
    } catch (error) {
      console.error('Error accessing widgets collection:', error);
    }
    
    // Step 6: Try to access widgets with team filter
    console.log('\nTrying to access widgets with team filter...');
    try {
      // Get team ID from team membership
      const teamMemberDoc = await getDoc(doc(db, 'teamMembers', user.uid));
      
      if (teamMemberDoc.exists()) {
        const teamId = teamMemberDoc.data().teamId;
        
        // Try to get widgets for the team
        const q = query(
          collection(db, 'widgets'),
          where('teamId', '==', teamId),
          orderBy('updatedAt', 'desc')
        );
        
        console.log(`Executing Firestore query for widgets with teamId: ${teamId}...`);
        const querySnapshot = await getDocs(q);
        
        console.log(`Query completed. Found ${querySnapshot.docs.length} widgets for team ${teamId}.`);
        
        // Log the first few widgets
        querySnapshot.docs.slice(0, 3).forEach((doc, index) => {
          const data = doc.data();
          console.log(`Team Widget ${index + 1}:`, {
            id: doc.id,
            name: data.name,
            type: data.type,
            status: data.status,
            userId: data.userId,
            teamId: data.teamId
          });
        });
      } else {
        console.error('Cannot access team widgets: Team membership not found');
      }
    } catch (error) {
      console.error('Error accessing team widgets:', error);
    }
    
    console.log('\nDiagnosis completed.');
  } catch (error) {
    console.error('Error during diagnosis:', error);
  } finally {
    // Sign out
    await auth.signOut();
    console.log('Signed out.');
  }
}

// Run the diagnosis
diagnosePermissionIssues()
  .then(() => {
    console.log('Diagnosis completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running diagnosis:', error);
    process.exit(1);
  });
