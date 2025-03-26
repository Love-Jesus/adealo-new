import { AcceptInvitation } from '@/components/team/accept-invitation';
import { Toaster } from '@/components/ui/use-toast';

export default function InvitationPage() {
  return (
    <div className="container mx-auto py-10">
      <AcceptInvitation />
      <Toaster />
    </div>
  );
}
