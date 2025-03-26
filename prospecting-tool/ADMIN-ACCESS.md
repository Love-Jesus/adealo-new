# Admin Access Configuration

This document explains the special access privileges granted to the main admin account (junior.hallberg@gmail.com) in the Adealo application.

## Overview

The main admin account (junior.hallberg@gmail.com) has been granted full access to all collections in the Firestore database. This allows the admin to:

1. Create, read, update, and delete any document in any collection
2. Bypass subscription and credit checks when creating widgets
3. Manage team memberships and user permissions

## Implementation Details

### 1. Firestore Security Rules

The Firestore security rules have been updated to give full access to the main admin account:

```javascript
// Function to check if the user is junior.hallberg@gmail.com (main admin)
function isMainAdmin() {
  return request.auth != null && 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) && 
         (
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.email == 'junior.hallberg@gmail.com' ||
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
         );
}

// Give full access to junior.hallberg@gmail.com
match /{document=**} {
  allow read, write: if isMainAdmin();
}
```

This rule gives the main admin account full read and write access to all collections in the database, bypassing any other security rules. It also grants the same access to any user with the 'admin' role.

### 2. Widget Access and Creation

#### 2.1 Widget Access

The `getWidgets` function has been updated to give admin users access to all widgets, regardless of team membership:

```javascript
// Check if the user is an admin
let isAdmin = false;
try {
  // Get user document to check role
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    isAdmin = userData.role === 'admin' || userEmail === 'junior.hallberg@gmail.com';
    console.log('User role:', userData.role);
    console.log('Is admin:', isAdmin);
  }
} catch (error) {
  console.error('Error checking user role:', error);
  // Continue even if we can't check the role
}

let querySnapshot;

if (isAdmin) {
  // For admins, get all widgets without filtering by teamId
  console.log('Admin accessing widgets - getting all widgets');
  const q = query(
    widgetsCollection(),
    orderBy('updatedAt', 'desc')
  );
  
  // Execute query with timeout handling
  console.log('Executing Firestore query for all widgets...');
  const queryPromise = getDocs(q);
  
  // Add timeout to detect connection issues
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Firestore query timed out after 10 seconds')), 10000);
  });
  
  querySnapshot = await Promise.race([queryPromise, timeoutPromise]) as any;
} else {
  // For regular users, filter by teamId
  console.log(`Creating Firestore query for widgets with teamId: ${teamId}`);
  const q = query(
    widgetsCollection(),
    where('teamId', '==', teamId),
    orderBy('updatedAt', 'desc')
  );
  
  // Execute query with timeout handling
  console.log('Executing Firestore query for widgets...');
  const queryPromise = getDocs(q);
  
  // Add timeout to detect connection issues
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Firestore query timed out after 10 seconds')), 10000);
  });
  
  querySnapshot = await Promise.race([queryPromise, timeoutPromise]) as any;
}
```

This code checks if the current user has the 'admin' role or is junior.hallberg@gmail.com and, if so, retrieves all widgets without filtering by team ID. This ensures that admin users can see all widgets in the system, regardless of team membership.

#### 2.2 Widget Creation

The widget creation function has been updated to bypass subscription and credit checks for admin users:

```javascript
// Check if the user is an admin
let isAdmin = false;
try {
  // Get user document to check role
  const userDoc = await getDoc(doc(db, 'users', userId!));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    isAdmin = userData.role === 'admin' || userEmail === 'junior.hallberg@gmail.com';
    console.log('User role:', userData.role);
    console.log('Is admin:', isAdmin);
  }
} catch (error) {
  console.error('Error checking user role:', error);
  // Continue even if we can't check the role
}

// If the user is not an admin, check for subscription or credits
if (!isAdmin) {
  console.log('Regular user creating widget - checking subscription/credits');
  
  try {
    // Check if user has enough widget credits
    const userCreditsDoc = await getDoc(doc(db, 'userCredits', userId!));
    
    if (userCreditsDoc.exists()) {
      const userCredits = userCreditsDoc.data();
      const widgetCredits = userCredits.widgetCredits || { total: 0, used: 0 };
      const remainingCredits = widgetCredits.total - widgetCredits.used;
      
      console.log('Widget credits:', {
        total: widgetCredits.total,
        used: widgetCredits.used,
        remaining: remainingCredits
      });
      
      if (remainingCredits <= 0) {
        console.error('User has no widget credits remaining');
        // For now, we'll allow the widget creation even if the user has no credits
        // In the future, we might want to throw an error here
      }
    } else {
      console.log('User has no credits document');
      // For now, we'll allow the widget creation even if the user has no credits document
    }
  } catch (error) {
    console.error('Error checking widget credits:', error);
    // Continue even if we can't check the credits
  }
} else {
  console.log('Admin user creating widget - bypassing subscription/credits checks');
}
```

This code checks if the current user has the 'admin' role or is junior.hallberg@gmail.com and, if so, bypasses the subscription and credit checks. For regular users, it checks if they have enough widget credits, but currently allows widget creation even if they don't have enough credits.

### 3. User Setup

We've created a script to set up the admin user in the database:

```javascript
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
}
```

This script checks if the user has the 'admin' role, team membership, and credits, and creates them if they don't exist. This ensures that the admin user has all the necessary permissions and resources to use the application.

## Security Considerations

Granting full access to a single account is a powerful privilege and should be used with caution. The main admin account should:

1. Use a strong, unique password
2. Enable two-factor authentication if available
3. Be careful when making changes to the database
4. Consider using a more granular permission system for day-to-day operations

## Future Improvements

In the future, we could implement a more sophisticated admin system that:

1. Allows multiple admin accounts with different permission levels
2. Provides an audit log of admin actions
3. Requires confirmation for destructive operations
4. Implements role-based access control (RBAC) for different admin functions

## Conclusion

The main admin account (junior.hallberg@gmail.com) now has full access to all collections in the Firestore database and can bypass subscription and credit checks when creating widgets. This allows the admin to manage the application without restrictions. Additionally, any user with the 'admin' role has the same privileges.
