import { useState } from 'react';
import { X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createInvitation } from '@/services/invitations';
import { getCurrentUserId } from '@/services/permissions';
import { getCurrentUserTeam } from '@/services/teams';
import { toast } from '@/components/ui/use-toast';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSent?: () => void;
}

export function InviteMemberDialog({ 
  open, 
  onOpenChange,
  onInviteSent
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      const userId = getCurrentUserId();
      if (!userId) {
        setError('You must be logged in to invite team members');
        setIsLoading(false);
        return;
      }

      const team = await getCurrentUserTeam(userId);
      if (!team) {
        setError('You must be part of a team to invite members');
        setIsLoading(false);
        return;
      }

      // Create the invitation
      await createInvitation(email, team.id, role, userId);

      // Show success message
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${email}`,
      });

      // Reset form
      setEmail('');
      setRole('member');
      
      // Close dialog
      onOpenChange(false);
      
      // Call callback if provided
      if (onInviteSent) {
        onInviteSent();
      }
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError('Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to add a new member to your team.
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Role</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as 'admin' | 'member')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="member" id="member" />
                  <Label htmlFor="member" className="font-normal">
                    Member - Can use team resources
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="font-normal">
                    Admin - Can manage team and invite members
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <div className="text-sm font-medium text-destructive">{error}</div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
