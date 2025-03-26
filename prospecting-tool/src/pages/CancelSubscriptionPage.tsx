import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';
import { 
  getCurrentSubscription, 
  getSubscriptionRenewalDate
} from '@/services/subscription';
import { Subscription, PlanId, getPlanById } from '@/types/subscription';

export default function CancelSubscriptionPage() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState<string>('');
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subscriptionData, renewalDateValue] = await Promise.all([
          getCurrentSubscription(),
          getSubscriptionRenewalDate()
        ]);
        
        setSubscription(subscriptionData);
        setRenewalDate(renewalDateValue);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCancel = async () => {
    if (!confirmed || !cancelReason || (cancelReason === 'other' && !otherReason)) {
      return;
    }

    setSubmitting(true);

    // In a real application, you would call an API to cancel the subscription
    setTimeout(() => {
      // Redirect to confirmation page
      navigate('/account/subscription', { 
        state: { 
          cancelSuccess: true 
        } 
      });
    }, 2000);
  };

  const handleGoBack = () => {
    navigate('/account/subscription');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no subscription or free plan, redirect back
  if (!subscription || subscription.planId === 'free_tier') {
    navigate('/account/subscription');
    return null;
  }

  const plan = getPlanById(subscription.planId as PlanId);

  if (!plan) {
    navigate('/account/subscription');
    return null;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Cancel Subscription</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          We're sorry to see you go. Please let us know why you're canceling.
        </p>

        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">{plan.name} Plan</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                ${plan.price}/month
              </p>
            </div>
            {renewalDate && (
              <div className="text-right">
                <p className="text-sm font-medium">Current billing period ends</p>
                <p className="text-gray-500 dark:text-gray-400">
                  {renewalDate.toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-500">
                  Important information about cancellation
                </h3>
                <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-disc pl-5">
                  <li>Your subscription will remain active until the end of your current billing period.</li>
                  <li>You'll still have access to all features until {renewalDate?.toLocaleDateString()}.</li>
                  <li>After cancellation, your account will be downgraded to the Free plan.</li>
                  <li>Your data will be preserved, but some features may be limited.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Why are you canceling?</h3>
              <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="too_expensive" id="too_expensive" />
                    <Label htmlFor="too_expensive">It's too expensive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="missing_features" id="missing_features" />
                    <Label htmlFor="missing_features">Missing features I need</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not_using" id="not_using" />
                    <Label htmlFor="not_using">I'm not using it enough</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="switching" id="switching" />
                    <Label htmlFor="switching">Switching to another service</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="temporary" id="temporary" />
                    <Label htmlFor="temporary">Temporary pause (will subscribe again later)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other reason</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {cancelReason === 'other' && (
              <div>
                <Label htmlFor="other-reason">Please specify</Label>
                <Textarea
                  id="other-reason"
                  placeholder="Tell us more about why you're canceling..."
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex items-center space-x-2 pt-4 border-t">
              <Checkbox 
                id="confirm" 
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              />
              <label
                htmlFor="confirm"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand that my subscription will be canceled and I'll lose access to premium features at the end of my billing period.
              </label>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleGoBack} 
            variant="outline" 
            className="flex-1"
          >
            Keep My Subscription
          </Button>
          <Button 
            onClick={handleCancel} 
            variant="destructive" 
            className="flex-1"
            disabled={!confirmed || !cancelReason || (cancelReason === 'other' && !otherReason) || submitting}
          >
            {submitting ? 'Processing...' : 'Confirm Cancellation'}
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? <a href="/support" className="text-blue-500 hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
}
