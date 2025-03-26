import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTeamMemberByUserId } from './teamMembers';

// Define the Team interface
export interface Team {
  id: string;
  name: string;
  ownerId: string;
  subscriptionTier?: 'free' | 'basic' | 'pro' | 'enterprise';
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

// Collection reference
const teamsRef = collection(db, 'teams');

/**
 * Create a new team
 */
export const createTeam = async (
  name: string,
  ownerId: string,
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise' = 'free'
): Promise<string> => {
  // Generate a unique ID for the team
  const teamId = doc(teamsRef).id;
  
  // Create the team document
  await setDoc(doc(db, 'teams', teamId), {
    name,
    ownerId,
    subscriptionTier,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return teamId;
};

/**
 * Get a team by ID
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  const docRef = doc(db, 'teams', teamId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Team;
  }
  
  return null;
};

/**
 * Get a team by owner ID
 */
export const getTeamByOwnerId = async (ownerId: string): Promise<Team | null> => {
  const q = query(teamsRef, where('ownerId', '==', ownerId), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Team;
  }
  
  return null;
};

/**
 * Get the current user's team
 */
export const getCurrentUserTeam = async (userId: string): Promise<Team | null> => {
  // First, check if the user is a team member
  const teamMember = await getTeamMemberByUserId(userId);
  
  if (teamMember) {
    return getTeamById(teamMember.teamId);
  }
  
  // If not a team member, check if they own a team
  return getTeamByOwnerId(userId);
};

/**
 * Update a team
 */
export const updateTeam = async (
  teamId: string,
  data: Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const docRef = doc(db, 'teams', teamId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

/**
 * Check if a user has access to a team
 */
export const hasTeamAccess = async (userId: string, teamId: string): Promise<boolean> => {
  // Check if user is a team member
  const teamMember = await getTeamMemberByUserId(userId);
  
  if (teamMember && teamMember.teamId === teamId && teamMember.status === 'active') {
    return true;
  }
  
  // Check if user is the team owner
  const team = await getTeamById(teamId);
  
  return team !== null && team.ownerId === userId;
};
