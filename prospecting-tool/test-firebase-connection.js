// Test script to check Firebase authentication and database connection

// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

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

// Test authentication
console.log('Testing authentication...');
signInAnonymously(auth)
  .then(() => {
    console.log('Anonymous authentication successful');
  })
  .catch((error) => {
    console.error('Authentication error:', error);
  });

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
    
    // Test Firestore connection
    console.log('Testing Firestore connection...');
    
    // Try to read widgets collection
    const widgetsQuery = query(collection(db, 'widgets'), limit(5));
    getDocs(widgetsQuery)
      .then((snapshot) => {
        console.log(`Successfully connected to Firestore. Found ${snapshot.docs.length} widgets.`);
        snapshot.docs.forEach((doc, index) => {
          console.log(`Widget ${index + 1}:`, doc.id, doc.data());
        });
      })
      .catch((error) => {
        console.error('Firestore error:', error);
      });
    
    // Try to read users collection
    const usersQuery = query(collection(db, 'users'), limit(5));
    getDocs(usersQuery)
      .then((snapshot) => {
        console.log(`Successfully connected to users collection. Found ${snapshot.docs.length} users.`);
      })
      .catch((error) => {
        console.error('Error reading users collection:', error);
      });
    
  } else {
    console.log('User is signed out');
  }
});

// Log Firebase configuration (without sensitive data)
console.log('Firebase configuration:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  databaseURL: firebaseConfig.databaseURL,
  storageBucket: firebaseConfig.storageBucket
});

console.log('Test script running. Check the console for results...');
