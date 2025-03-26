import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Define the TeamMember interface
export interface TeamMember {
  userId: string;
  teamId: string;
  role: 'admin' | 'member';
  status: 'active' | 'invited' | 'removed';
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

// Collection reference
const teamMembersRef = collection(db, 'teamMembers');

/**
 * Add a user to a team
 */
export const addTeamMember = async (
  userId: string,
  teamId: string,
  role: 'admin' | 'member' = 'member'
): Promise<void> => {
  const docRef = doc(db, 'teamMembers', userId);
  
  // Check if the user is already a member of any team
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    // Update existing team membership
    await updateDoc(docRef, {
      teamId,
      role,
      status: 'active',
      updatedAt: serverTimestamp()
    });
  } else {
    // Create new team membership
    await setDoc(docRef, {
      userId,
      teamId,
      role,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};

/**
 * Get a team member by user ID
 */
export const getTeamMemberByUserId = async (userId: string): Promise<TeamMember | null> => {
  const docRef = doc(db, 'teamMembers', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as TeamMember;
  }
  
  return null;
};

/**
 * Get all members of a team
 */
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  const q = query(teamMembersRef, where('teamId', '==', teamId), where('status', '==', 'active'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as TeamMember);
};

/**
 * Get team admins
 */
export const getTeamAdmins = async (teamId: string): Promise<TeamMember[]> => {
  const q = query(
    teamMembersRef, 
    where('teamId', '==', teamId), 
    where('role', '==', 'admin'),
    where('status', '==', 'active')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as TeamMember);
};

/**
 * Check if user is a team admin
 */
export const isTeamAdmin = async (userId: string, teamId: string): Promise<boolean> => {
  const teamMember = await getTeamMemberByUserId(userId);
  
  return (
    teamMember !== null && 
    teamMember.teamId === teamId && 
    teamMember.role === 'admin' &&
    teamMember.status === 'active'
  );
};

/**
 * Update team member role
 */
export const updateTeamMemberRole = async (
  userId: string,
  role: 'admin' | 'member'
): Promise<void> => {
  const docRef = doc(db, 'teamMembers', userId);
  
  await updateDoc(docRef, {
    role,
    updatedAt: serverTimestamp()
  });
};

/**
 * Remove a user from a team
 */
export const removeTeamMember = async (userId: string): Promise<void> => {
  const docRef = doc(db, 'teamMembers', userId);
  
  await updateDoc(docRef, {
    status: 'removed',
    updatedAt: serverTimestamp()
  });
};

/**
 * Delete a team member (complete removal)
 */
export const deleteTeamMember = async (userId: string): Promise<void> => {
  const docRef = doc(db, 'teamMembers', userId);
  await deleteDoc(docRef);
};
