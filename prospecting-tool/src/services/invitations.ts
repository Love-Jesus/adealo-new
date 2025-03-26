import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  Timestamp, 
  serverTimestamp,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Invitation } from '@/types/invitation';
import { generateToken } from '@/utils/token';

// Collection reference
const invitationsRef = collection(db, 'invitations');

/**
 * Create a new invitation
 */
export const createInvitation = async (
  email: string,
  teamId: string,
  role: 'admin' | 'member',
  createdBy: string
): Promise<string> => {
  // Check if an invitation already exists for this email and team
  const existingInvitation = await getInvitationByEmailAndTeam(email, teamId);
  
  if (existingInvitation) {
    // If it exists but is expired, delete it
    if (existingInvitation.status === 'expired') {
      await deleteDoc(doc(db, 'invitations', existingInvitation.id!));
    } else {
      // Otherwise, return the existing invitation ID
      return existingInvitation.id!;
    }
  }
  
  // Generate a unique token
  const token = generateToken();
  
  // Set expiration date (48 hours from now)
  const expiresAt = new Timestamp(
    Math.floor(Date.now() / 1000) + 48 * 60 * 60,
    0
  );
  
  // Create the invitation
  const invitation: Omit<Invitation, 'id'> = {
    email,
    teamId,
    token,
    status: 'pending',
    role,
    createdBy,
    createdAt: serverTimestamp(),
    expiresAt,
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(invitationsRef, invitation);
  return docRef.id;
};

/**
 * Get invitation by ID
 */
export const getInvitationById = async (id: string): Promise<Invitation | null> => {
  const docRef = doc(db, 'invitations', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Invitation;
  }
  
  return null;
};

/**
 * Get invitation by token
 */
export const getInvitationByToken = async (token: string): Promise<Invitation | null> => {
  const q = query(invitationsRef, where('token', '==', token), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Invitation;
  }
  
  return null;
};

/**
 * Get invitation by email and team
 */
export const getInvitationByEmailAndTeam = async (
  email: string,
  teamId: string
): Promise<Invitation | null> => {
  const q = query(
    invitationsRef,
    where('email', '==', email),
    where('teamId', '==', teamId),
    where('status', '==', 'pending'),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Invitation;
  }
  
  return null;
};

/**
 * Get all invitations for a team
 */
export const getTeamInvitations = async (teamId: string): Promise<Invitation[]> => {
  const q = query(invitationsRef, where('teamId', '==', teamId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Invitation[];
};

/**
 * Accept an invitation
 */
export const acceptInvitation = async (invitationId: string): Promise<void> => {
  const docRef = doc(db, 'invitations', invitationId);
  
  await updateDoc(docRef, {
    status: 'accepted',
    updatedAt: serverTimestamp()
  });
};

/**
 * Expire an invitation
 */
export const expireInvitation = async (invitationId: string): Promise<void> => {
  const docRef = doc(db, 'invitations', invitationId);
  
  await updateDoc(docRef, {
    status: 'expired',
    updatedAt: serverTimestamp()
  });
};

/**
 * Delete an invitation
 */
export const deleteInvitation = async (invitationId: string): Promise<void> => {
  const docRef = doc(db, 'invitations', invitationId);
  await deleteDoc(docRef);
};
