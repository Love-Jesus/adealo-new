export interface Invitation {
  id?: string;
  email: string;
  teamId: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  role: 'admin' | 'member';
  createdBy: string;
  createdAt: any; // Firestore Timestamp
  expiresAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}
