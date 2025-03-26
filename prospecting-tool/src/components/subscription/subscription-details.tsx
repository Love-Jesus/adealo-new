import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Subscription, 
  UserCredits, 
  getPlanById,
  PlanId
} from '@/types/subscription';
import { 
  getCurrentSubscription, 
  getUserCredits,
  getTrialDaysRemaining,
  getSubscriptionRenewalDate,
  willCancelAtPeriodEnd
} from '@/services/subscription';
import { TeamCredits, getTeamCredits, subscribeToTeamCredits } from '@/services/teamCredits';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, CreditCard, AlertTriangle, CheckCircle, Users } from 'lucide-react';

interface SubscriptionDetailsProps {
  onUpgrade?: () => void;
}

export function SubscriptionDetails({ onUpgrade }: SubscriptionDetailsProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [teamCredits, setTeamCredits] = useState<TeamCredits | null>(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(0);
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  const [willCancel, setWillCancel] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          subscriptionData, 
          userCreditsData, 
          teamCreditsData,
          trialDays, 
          renewalDateValue,
          willCancelValue
        ] = await Promise.all([
          getCurrentSubscription(),
          getUserCredits(),
          getTeamCredits(),
          getTrialDaysRemaining(),
          getSubscriptionRenewalDate(),
          willCancelAtPeriodEnd()
        ]);
        
        setSubscription(subscriptionData);
        setUserCredits(userCreditsData);
        setTeamCredits(teamCreditsData);
        setTrialDaysRemaining(trialDays);
        setRenewalDate(renewalDateValue);
        setWillCancel(willCancelValue);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to team credits updates
    const unsubscribe = subscribeToTeamCredits((credits) => {
      if (credits) {
        setTeamCredits(credits);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  const handleManagePayment = () => {
    navigate('/account/billing');
  };

  const handleCancelSubscription = () => {
    navigate('/account/cancel-subscription');
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </Card>
    );
  }

  // If no subscription, show free plan
  const planId = subscription?.planId || 'free_tier';
  const plan = getPlanById(planId as PlanId);

  if (!plan) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Subscription Error</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Unable to load subscription details. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh
          </Button>
        </div>
      </Card>
    );
  }

  const isTrialing = subscription?.status === 'trialing';
  const isActive = subscription?.status === 'active' || isTrialing;
  const isFree = planId === 'free_tier';

  // Calculate credit usage percentages - prefer team credits over user credits
  const credits = teamCredits || userCredits;
  
  const prospectingUsagePercent = credits 
    ? Math.min(100, Math.round((credits.prospectingCredits.used / credits.prospectingCredits.total) * 100)) 
    : 0;
  
  const leadUsagePercent = credits 
    ? Math.min(100, Math.round((credits.leadCredits.used / credits.leadCredits.total) * 100)) 
    : 0;
  
  const widgetUsagePercent = credits && credits.widgetCredits.total > 0
    ? Math.min(100, Math.round((credits.widgetCredits.used / credits.widgetCredits.total) * 100)) 
    : 0;

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{plan.name} Plan</h3>
            {isTrialing && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                Trial
              </Badge>
            )}
            {willCancel && (
              <Badge variant="outline" className="text-red-600 border-red-600">
                Canceling
              </Badge>
            )}
            {isActive && !isTrialing && !willCancel && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            )}
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {plan.description}
          </p>
          
          {/* Trial or renewal information */}
          {isTrialing && trialDaysRemaining > 0 && (
            <div className="mt-4 flex items-center text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Your trial ends in {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'}
              </span>
            </div>
          )}
          
          {isActive && !isTrialing && renewalDate && (
            <div className="mt-4 flex items-center text-gray-600 dark:text-gray-400">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {willCancel 
                  ? `Your subscription will end on ${renewalDate.toLocaleDateString()}`
                  : `Next billing date: ${renewalDate.toLocaleDateString()}`
                }
              </span>
            </div>
          )}
          
          {/* Credit usage */}
          {credits && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">Team Credit Usage</h4>
                {teamCredits && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <Users className="h-3 w-3 mr-1" />
                    Shared
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Prospecting Credits</span>
                  <span>{credits.prospectingCredits.used} / {credits.prospectingCredits.total}</span>
                </div>
                <Progress value={prospectingUsagePercent} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Lead Credits</span>
                  <span>{credits.leadCredits.used} / {credits.leadCredits.total}</span>
                </div>
                <Progress value={leadUsagePercent} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Widget Credits</span>
                  <span>
                    {credits.widgetCredits.used} / 
                    {credits.widgetCredits.total === 100 ? '∞' : credits.widgetCredits.total}
                  </span>
                </div>
                <Progress 
                  value={credits.widgetCredits.total === 100 ? 0 : widgetUsagePercent} 
                  className="h-2" 
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col gap-2 min-w-[150px]">
          {isFree && (
            <Button onClick={handleUpgrade} className="w-full">
              Upgrade
            </Button>
          )}
          
          {!isFree && (
            <>
              {!willCancel && (
                <Button 
                  onClick={handleCancelSubscription} 
                  variant="outline" 
                  className="w-full"
                >
                  Cancel Plan
                </Button>
              )}
              
              <Button 
                onClick={handleManagePayment} 
                variant="outline" 
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </Button>
              
              {!isTrialing && (
                <Button 
                  onClick={handleUpgrade} 
                  variant="outline" 
                  className="w-full"
                >
                  Change Plan
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Features list */}
      <div className="mt-8 border-t pt-6">
        <h4 className="text-sm font-medium mb-4">Plan Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plan.features
            .filter(feature => feature.included)
            .map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">
                  {feature.name}
                  {feature.limit && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      ({feature.limit})
                    </span>
                  )}
                </span>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}
