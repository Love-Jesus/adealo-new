import { useState, useEffect } from 'react';
import { MoreHorizontal, UserPlus, Shield, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { InviteMemberDialog } from './invite-member-dialog';
import { getTeamMembers, updateTeamMemberRole, removeTeamMember, TeamMember } from '@/services/teamMembers';
import { getCurrentUserId, currentUserHasPermission, Permission } from '@/services/permissions';
import { getCurrentUserTeam } from '@/services/teams';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/use-toast';

interface TeamMemberWithUser extends TeamMember {
  user: {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
  };
}

export function TeamMembersList() {
  const [members, setMembers] = useState<TeamMemberWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [canInvite, setCanInvite] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

  // Load team members
  const loadTeamMembers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getCurrentUserId();
      setCurrentUserId(userId);
      
      if (!userId) {
        setError('You must be logged in to view team members');
        setIsLoading(false);
        return;
      }

      const team = await getCurrentUserTeam(userId);
      if (!team) {
        setError('You must be part of a team to view team members');
        setIsLoading(false);
        return;
      }
      
      setCurrentTeamId(team.id);

      // Check if user can invite members
      const canInviteMembers = await currentUserHasPermission(team.id, Permission.INVITE_MEMBER);
      setCanInvite(canInviteMembers);

      // Get team members
      const teamMembers = await getTeamMembers(team.id);
      
      // For a real implementation, you would fetch user details for each team member
      // This is a simplified version that creates mock user data
      const membersWithUsers = teamMembers.map(member => ({
        ...member,
        user: {
          id: member.userId,
          displayName: `User ${member.userId.substring(0, 5)}`,
          email: `user-${member.userId.substring(0, 5)}@example.com`,
          photoURL: undefined
        }
      }));
      
      setMembers(membersWithUsers);
    } catch (err) {
      console.error('Error loading team members:', err);
      setError('Failed to load team members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'member') => {
    try {
      await updateTeamMemberRole(userId, newRole);
      
      // Update local state
      setMembers(members.map(member => 
        member.userId === userId 
          ? { ...member, role: newRole } 
          : member
      ));
      
      toast({
        title: 'Role updated',
        description: `User role has been updated to ${newRole}`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error updating role:', err);
      toast({
        title: 'Error',
        description: 'Failed to update user role. Please try again.',
        type: 'error'
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }
    
    try {
      await removeTeamMember(userId);
      
      // Update local state
      setMembers(members.filter(member => member.userId !== userId));
      
      toast({
        title: 'Member removed',
        description: 'Team member has been removed successfully',
        type: 'success'
      });
    } catch (err) {
      console.error('Error removing member:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove team member. Please try again.',
        type: 'error'
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading team members...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Team Members</h2>
        {canInvite && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((member) => (
              <tr key={member.userId} className="bg-card">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                      {member.user.photoURL ? (
                        <img 
                          src={member.user.photoURL} 
                          alt={member.user.displayName} 
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{member.user.displayName}</div>
                      <div className="text-sm text-muted-foreground">{member.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {member.role === 'admin' ? (
                      <>
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Admin</span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Member</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="p-3 text-right">
                  {currentUserId !== member.userId && canInvite && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(
                            member.userId, 
                            member.role === 'admin' ? 'member' : 'admin'
                          )}
                        >
                          {member.role === 'admin' ? (
                            <>
                              <User className="mr-2 h-4 w-4" />
                              <span>Change to Member</span>
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Change to Admin</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRemoveMember(member.userId)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Remove from Team</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No team members found. Invite someone to get started.
        </div>
      )}
      
      <InviteMemberDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen}
        onInviteSent={loadTeamMembers}
      />
      
      <Toaster />
    </div>
  );
}
