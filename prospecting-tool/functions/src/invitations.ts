import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
try {
  admin.initializeApp();
} catch (error) {
  console.log('Firebase admin already initialized');
}

// Initialize Firestore
const db = admin.firestore();

// Configure SendGrid API key
// This should be set using Firebase Config or environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';

/**
 * Send invitation email when a new invitation is created
 * This is a callable function that can be invoked from the client
 */
export const sendInvitationEmail = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  try {
    const { invitationId } = data;
    
    if (!invitationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invitation ID is required'
      );
    }
    
    // Get invitation data
    const invitationDoc = await db.collection('invitations').doc(invitationId).get();
    
    if (!invitationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Invitation not found'
      );
    }
    
    const invitationData = invitationDoc.data();
    
    // Get team information
    const teamDoc = await db.collection('teams').doc(invitationData.teamId).get();
    
    if (!teamDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `Team ${invitationData.teamId} not found`
      );
    }
    
    const teamData = teamDoc.data();
    
    // Get inviter information
    const inviterDoc = await db.collection('users').doc(invitationData.createdBy).get();
    
    if (!inviterDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `Inviter ${invitationData.createdBy} not found`
      );
    }
    
    const inviterData = inviterDoc.data();
    
    // Generate invitation URL
    const baseUrl = 'https://adealo-ce238.web.app'; // Replace with your actual domain
    const invitationUrl = `${baseUrl}/invitation/${invitationData.token}`;
    
    // Prepare email content
    const emailContent = {
      to: invitationData.email,
      from: 'noreply@adealo.com', // Replace with your verified sender
      subject: `Invitation to join ${teamData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to join ${teamData.name}</h2>
          <p>${inviterData.displayName || 'A team admin'} has invited you to join their team as a ${invitationData.role}.</p>
          
          <div style="margin: 30px 0;">
            <a href="${invitationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p>This invitation will expire in 48 hours.</p>
          
          <p>If you don't have an account yet, you'll be able to create one when you accept the invitation.</p>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 40px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `
    };
    
    // Send email using SendGrid
    // Note: In a real implementation, you would use the SendGrid SDK here
    // For now, we'll just log the email content
    console.log(`Sending invitation email to ${invitationData.email}`);
    console.log('Email content:', emailContent);
    
    // In a real implementation, you would use:
    // await sgMail.send(emailContent);
    
    // Update invitation with email sent status
    await db.collection('invitations').doc(invitationId).update({
      emailSent: true,
      emailSentAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error sending invitation email'
    );
  }
});

/**
 * Check for expired invitations and mark them as expired
 * This is a callable function that can be invoked from the client
 */
export const checkExpiredInvitations = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  try {
    const now = admin.firestore.FieldValue.serverTimestamp();
    
    // Get all pending invitations that have expired
    const expiredInvitationsQuery = await db.collection('invitations')
      .where('status', '==', 'pending')
      .where('expiresAt', '<', now)
      .get();
    
    if (expiredInvitationsQuery.empty) {
      console.log('No expired invitations found');
      return { count: 0 };
    }
    
    // Update each expired invitation
    const updatePromises = expiredInvitationsQuery.docs.map(docSnapshot => {
      return db.collection('invitations').doc(docSnapshot.id).update({
        status: 'expired',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await Promise.all(updatePromises);
    
    console.log(`Marked ${expiredInvitationsQuery.size} invitations as expired`);
    return { count: expiredInvitationsQuery.size };
  } catch (error) {
    console.error('Error checking expired invitations:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error checking expired invitations'
    );
  }
});
