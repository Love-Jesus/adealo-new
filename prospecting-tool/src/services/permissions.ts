import { getTeamMemberByUserId } from './teamMembers';
import { getTeamById } from './teams';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Define permission operations
export enum Permission {
  // Team management
  MANAGE_TEAM = 'manage_team',
  INVITE_MEMBER = 'invite_member',
  REMOVE_MEMBER = 'remove_member',
  CHANGE_MEMBER_ROLE = 'change_member_role',
  
  // Widget management
  CREATE_WIDGET = 'create_widget',
  EDIT_WIDGET = 'edit_widget',
  DELETE_WIDGET = 'delete_widget',
  
  // Billing management
  MANAGE_BILLING = 'manage_billing',
  CHANGE_SUBSCRIPTION = 'change_subscription',
  
  // Admin operations
  ACCESS_ADMIN_PANEL = 'access_admin_panel',
  MANAGE_ALL_TEAMS = 'manage_all_teams'
}

/**
 * Check if the current user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const auth = getAuth();
  return auth.currentUser !== null;
};

/**
 * Get the current user's ID
 */
export const getCurrentUserId = (): string | null => {
  const auth = getAuth();
  return auth.currentUser?.uid || null;
};

/**
 * Check if a user is a system admin
 */
export const isSystemAdmin = async (userId: string): Promise<boolean> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    return userData.role === 'admin';
  }
  
  return false;
};

/**
 * Check if a user is a team admin
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
 * Check if a user is a team owner
 */
export const isTeamOwner = async (userId: string, teamId: string): Promise<boolean> => {
  const team = await getTeamById(teamId);
  return team !== null && team.ownerId === userId;
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = async (
  userId: string,
  teamId: string,
  permission: Permission
): Promise<boolean> => {
  // System admins have all permissions
  if (await isSystemAdmin(userId)) {
    return true;
  }
  
  // Check team-specific permissions
  const teamMember = await getTeamMemberByUserId(userId);
  const isOwner = await isTeamOwner(userId, teamId);
  
  // If not a team member or owner, no permissions
  if (!teamMember && !isOwner) {
    return false;
  }
  
  // Team owners have all team permissions
  if (isOwner) {
    return true;
  }
  
  // Check if user is a team member with the right role
  if (teamMember && teamMember.teamId === teamId && teamMember.status === 'active') {
    const isAdmin = teamMember.role === 'admin';
    
    // Admin permissions
    if (isAdmin) {
      switch (permission) {
        case Permission.MANAGE_TEAM:
        case Permission.INVITE_MEMBER:
        case Permission.REMOVE_MEMBER:
        case Permission.CHANGE_MEMBER_ROLE:
        case Permission.MANAGE_BILLING:
        case Permission.CHANGE_SUBSCRIPTION:
          return true;
      }
    }
    
    // Permissions for all active team members
    switch (permission) {
      case Permission.CREATE_WIDGET:
      case Permission.EDIT_WIDGET:
      case Permission.DELETE_WIDGET:
        return true;
    }
  }
  
  return false;
};

/**
 * Check if the current user has a specific permission
 */
export const currentUserHasPermission = async (
  teamId: string,
  permission: Permission
): Promise<boolean> => {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return false;
  }
  
  return hasPermission(userId, teamId, permission);
};
