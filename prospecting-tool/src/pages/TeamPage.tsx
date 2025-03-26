import { useState, useEffect } from 'react';
import { Users, Settings, CreditCard } from 'lucide-react';
import { TeamMembersList } from '@/components/team/team-members-list';
import { getCurrentUserId } from '@/services/permissions';
import { getCurrentUserTeam, Team } from '@/services/teams';
import { Toaster } from '@/components/ui/use-toast';

// Tabs for the team page
type TeamTab = 'members' | 'settings' | 'billing';

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<TeamTab>('members');
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeam = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userId = getCurrentUserId();
        
        if (!userId) {
          setError('You must be logged in to view team information');
          setIsLoading(false);
          return;
        }

        const userTeam = await getCurrentUserTeam(userId);
        
        if (!userTeam) {
          setError('You are not a member of any team');
          setIsLoading(false);
          return;
        }
        
        setTeam(userTeam);
      } catch (err) {
        console.error('Error loading team:', err);
        setError('Failed to load team information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeam();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center py-8">Loading team information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center py-8 text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team?.name || 'Your Team'}</h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members, settings, and subscription.
          </p>
        </div>

        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === 'members'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('members')}
          >
            <Users className="h-4 w-4" />
            Members
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === 'billing'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('billing')}
          >
            <CreditCard className="h-4 w-4" />
            Billing
          </button>
        </div>

        <div className="py-4">
          {activeTab === 'members' && <TeamMembersList />}
          
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight">Team Settings</h2>
              <p className="text-muted-foreground">
                Team settings will be implemented in a future update.
              </p>
            </div>
          )}
          
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight">Billing & Subscription</h2>
              <p className="text-muted-foreground">
                Billing and subscription management will be implemented in a future update.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}
