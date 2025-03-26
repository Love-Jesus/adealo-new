import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getInvitationByToken, acceptInvitation } from '@/services/invitations';
import { addTeamMember } from '@/services/teamMembers';
import { getCurrentUserId } from '@/services/permissions';
import { getTeamById } from '@/services/teams';
import { isValidTokenFormat } from '@/utils/token';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/use-toast';

export function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<any | null>(null);
  const [team, setTeam] = useState<any | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  
  useEffect(() => {
    const validateInvitation = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Validate token format
        if (!token || !isValidTokenFormat(token)) {
          setError('Invalid invitation link. Please check the URL and try again.');
          setIsLoading(false);
          return;
        }
        
        // Get invitation by token
        const invitationData = await getInvitationByToken(token);
        
        if (!invitationData) {
          setError('Invitation not found. It may have expired or been revoked.');
          setIsLoading(false);
          return;
        }
        
        // Check if invitation is expired
        if (invitationData.status === 'expired') {
          setError('This invitation has expired. Please ask for a new invitation.');
          setIsLoading(false);
          return;
        }
        
        // Check if invitation is already accepted
        if (invitationData.status === 'accepted') {
          setError('This invitation has already been accepted.');
          setIsLoading(false);
          return;
        }
        
        // Get team information
        const teamData = await getTeamById(invitationData.teamId);
        
        if (!teamData) {
          setError('The team associated with this invitation no longer exists.');
          setIsLoading(false);
          return;
        }
        
        setInvitation(invitationData);
        setTeam(teamData);
      } catch (err) {
        console.error('Error validating invitation:', err);
        setError('Failed to validate invitation. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    validateInvitation();
  }, [token]);
  
  const handleAcceptInvitation = async () => {
    setIsAccepting(true);
    setError(null);
    
    try {
      const userId = getCurrentUserId();
      
      if (!userId) {
        setError('You must be logged in to accept an invitation.');
        setIsAccepting(false);
        return;
      }
      
      // Add user to team
      await addTeamMember(userId, invitation.teamId, invitation.role);
      
      // Mark invitation as accepted
      await acceptInvitation(invitation.id);
      
      toast({
        title: 'Invitation accepted',
        description: `You have successfully joined ${team.name}`,
        type: 'success'
      });
      
      // Redirect to team page after a short delay
      setTimeout(() => {
        navigate('/team');
      }, 2000);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation. Please try again.');
      setIsAccepting(false);
    }
  };
  
  const handleDeclineInvitation = () => {
    // Simply navigate back to home page
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Validating invitation...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <X className="h-5 w-5" />
              Invitation Error
            </CardTitle>
            <CardDescription>
              There was a problem with this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">Team:</p>
            <p>{team?.name}</p>
          </div>
          <div>
            <p className="font-medium">Role:</p>
            <p className="capitalize">{invitation?.role}</p>
          </div>
          <div>
            <p className="font-medium">Invited by:</p>
            <p>{invitation?.createdBy}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleDeclineInvitation} disabled={isAccepting}>
            Decline
          </Button>
          <Button onClick={handleAcceptInvitation} disabled={isAccepting}>
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Accept Invitation
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Toaster />
    </div>
  );
}
