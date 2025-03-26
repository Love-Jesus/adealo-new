# Administrator Guide for Database Access Management

This guide provides detailed instructions for administrators to manage database access and resolve permission issues in the Adealo application.

## Using Firebase Admin SDK

To resolve permission issues and manage team memberships, you'll need to use the Firebase Admin SDK with service account credentials.

### Step 1: Create a Service Account

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (adealo-ce238)
3. Go to Project Settings > Service accounts
4. Click "Generate new private key"
5. Save the JSON file securely (do not commit it to version control)

### Step 2: Create an Admin Script

Create a new file called `admin-add-team-member.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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
    
    if (usersSnapshot.empty) {
      console.error(`User with email ${userEmail} not found in the database.`);
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    
    console.log(`Found user: ${userId}`);
    
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
    }
    
    // Create or update team member entry
    const teamMemberRef = db.collection('teamMembers').doc(userId);
    await teamMemberRef.set({
      teamId: defaultTeamId,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Team member entry for user ${userId} created/updated successfully.`);
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
```

### Step 3: Run the Admin Script

1. Install the Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

2. Run the script:
   ```bash
   node admin-add-team-member.js
   ```

## User Interface Improvements

To provide a better user experience and prevent permission issues in the future, implement the following UI improvements:

### Team Management Interface

Create a team management interface that allows administrators to:

1. View all teams
2. Create new teams
3. Add/remove team members
4. Assign roles to team members

#### Implementation Steps:

1. Create a new page component:
   ```tsx
   // src/pages/TeamManagementPage.tsx
   import { useState, useEffect } from "react";
   import { Button } from "@/components/ui/button";
   import { getTeams, getTeamMembers, addTeamMember, removeTeamMember, updateTeamMemberRole } from "@/services/teams";
   
   export default function TeamManagementPage() {
     const [teams, setTeams] = useState([]);
     const [selectedTeam, setSelectedTeam] = useState(null);
     const [teamMembers, setTeamMembers] = useState([]);
     const [isLoading, setIsLoading] = useState(true);
     
     // Load teams
     useEffect(() => {
       const loadTeams = async () => {
         try {
           setIsLoading(true);
           const teamsData = await getTeams();
           setTeams(teamsData);
           if (teamsData.length > 0) {
             setSelectedTeam(teamsData[0]);
           }
         } catch (error) {
           console.error("Error loading teams:", error);
         } finally {
           setIsLoading(false);
         }
       };
       
       loadTeams();
     }, []);
     
     // Load team members when selected team changes
     useEffect(() => {
       const loadTeamMembers = async () => {
         if (!selectedTeam) return;
         
         try {
           setIsLoading(true);
           const membersData = await getTeamMembers(selectedTeam.id);
           setTeamMembers(membersData);
         } catch (error) {
           console.error("Error loading team members:", error);
         } finally {
           setIsLoading(false);
         }
       };
       
       loadTeamMembers();
     }, [selectedTeam]);
     
     // Add team member
     const handleAddTeamMember = async (email, role) => {
       try {
         await addTeamMember(selectedTeam.id, email, role);
         // Reload team members
         const membersData = await getTeamMembers(selectedTeam.id);
         setTeamMembers(membersData);
       } catch (error) {
         console.error("Error adding team member:", error);
       }
     };
     
     // Remove team member
     const handleRemoveTeamMember = async (userId) => {
       try {
         await removeTeamMember(selectedTeam.id, userId);
         // Reload team members
         const membersData = await getTeamMembers(selectedTeam.id);
         setTeamMembers(membersData);
       } catch (error) {
         console.error("Error removing team member:", error);
       }
     };
     
     // Update team member role
     const handleUpdateTeamMemberRole = async (userId, role) => {
       try {
         await updateTeamMemberRole(selectedTeam.id, userId, role);
         // Reload team members
         const membersData = await getTeamMembers(selectedTeam.id);
         setTeamMembers(membersData);
       } catch (error) {
         console.error("Error updating team member role:", error);
       }
     };
     
     // Render UI
     return (
       <div className="container mx-auto py-8">
         <h1 className="text-2xl font-bold mb-4">Team Management</h1>
         
         {/* Team selection */}
         <div className="mb-6">
           <h2 className="text-lg font-semibold mb-2">Select Team</h2>
           <div className="flex gap-2">
             {teams.map(team => (
               <Button
                 key={team.id}
                 variant={selectedTeam?.id === team.id ? "default" : "outline"}
                 onClick={() => setSelectedTeam(team)}
               >
                 {team.name}
               </Button>
             ))}
           </div>
         </div>
         
         {/* Team members */}
         {selectedTeam && (
           <div>
             <h2 className="text-lg font-semibold mb-2">Team Members</h2>
             
             {/* Add member form */}
             <div className="mb-4 p-4 border rounded-md">
               <h3 className="text-md font-medium mb-2">Add Team Member</h3>
               {/* Form implementation */}
             </div>
             
             {/* Members list */}
             <div className="border rounded-md overflow-hidden">
               <table className="w-full">
                 <thead className="bg-muted">
                   <tr>
                     <th className="p-2 text-left">User</th>
                     <th className="p-2 text-left">Email</th>
                     <th className="p-2 text-left">Role</th>
                     <th className="p-2 text-left">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {teamMembers.map(member => (
                     <tr key={member.userId} className="border-t">
                       <td className="p-2">{member.displayName}</td>
                       <td className="p-2">{member.email}</td>
                       <td className="p-2">{member.role}</td>
                       <td className="p-2">
                         {/* Role selector and remove button */}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
         )}
       </div>
     );
   }
   ```

2. Create team services:
   ```typescript
   // src/services/teams.ts
   import { 
     collection, 
     addDoc, 
     updateDoc, 
     deleteDoc, 
     doc, 
     getDocs, 
     query, 
     where, 
     orderBy, 
     Timestamp,
     getDoc,
     setDoc
   } from 'firebase/firestore';
   import { db, auth } from '@/lib/firebase';
   
   // Get all teams
   export const getTeams = async () => {
     try {
       const teamsQuery = query(collection(db, 'teams'), orderBy('name'));
       const snapshot = await getDocs(teamsQuery);
       return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
     } catch (error) {
       console.error('Error getting teams:', error);
       throw error;
     }
   };
   
   // Get team members
   export const getTeamMembers = async (teamId) => {
     try {
       const membersQuery = query(collection(db, 'teamMembers'), where('teamId', '==', teamId));
       const snapshot = await getDocs(membersQuery);
       
       // Get user details for each member
       const members = [];
       for (const doc of snapshot.docs) {
         const memberData = doc.data();
         const userId = doc.id;
         
         // Get user details
         const userDoc = await getDoc(doc(db, 'users', userId));
         if (userDoc.exists()) {
           const userData = userDoc.data();
           members.push({
             userId,
             email: userData.email,
             displayName: userData.displayName,
             role: memberData.role,
             ...memberData
           });
         }
       }
       
       return members;
     } catch (error) {
       console.error('Error getting team members:', error);
       throw error;
     }
   };
   
   // Add team member
   export const addTeamMember = async (teamId, email, role) => {
     try {
       // Find user by email
       const usersQuery = query(collection(db, 'users'), where('email', '==', email), limit(1));
       const usersSnapshot = await getDocs(usersQuery);
       
       if (usersSnapshot.empty) {
         throw new Error(`User with email ${email} not found`);
       }
       
       const userDoc = usersSnapshot.docs[0];
       const userId = userDoc.id;
       
       // Create team member entry
       await setDoc(doc(db, 'teamMembers', userId), {
         teamId,
         role,
         createdAt: Timestamp.now(),
         updatedAt: Timestamp.now()
       });
       
       return userId;
     } catch (error) {
       console.error('Error adding team member:', error);
       throw error;
     }
   };
   
   // Remove team member
   export const removeTeamMember = async (teamId, userId) => {
     try {
       await deleteDoc(doc(db, 'teamMembers', userId));
     } catch (error) {
       console.error('Error removing team member:', error);
       throw error;
     }
   };
   
   // Update team member role
   export const updateTeamMemberRole = async (teamId, userId, role) => {
     try {
       await updateDoc(doc(db, 'teamMembers', userId), {
         role,
         updatedAt: Timestamp.now()
       });
     } catch (error) {
       console.error('Error updating team member role:', error);
       throw error;
     }
   };
   ```

3. Add the page to your router

### User Onboarding Flow

Implement an onboarding flow that automatically assigns users to teams when they sign up:

1. Update the user registration process to create a team member entry
2. Add a team selection step during onboarding for new users
3. Implement a default team assignment for users who don't select a team

## Security Rules Verification

To verify that the updated security rules are working correctly:

1. Create test users with different roles and team memberships
2. Test accessing widgets with different user accounts
3. Verify that users can only access widgets that belong to their team
4. Check that team admins can manage team members

## Documentation Updates

Update the documentation with the latest findings and solutions:

1. Add a section on team management to the user guide
2. Document the security rules and their implications
3. Provide troubleshooting steps for common permission issues
4. Create an administrator guide for managing teams and users

## Conclusion

By implementing these improvements, you'll ensure that:

1. Users have the correct permissions to access widgets
2. Administrators can easily manage team memberships
3. The application provides a better user experience
4. Permission issues are prevented in the future

Remember to regularly review the security rules and user permissions to ensure they meet your security requirements.
