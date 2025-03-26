import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getPlanById, PlanId } from '@/types/subscription';
import { Check } from 'lucide-react';

interface LocationState {
  planId: PlanId;
  isYearly?: boolean;
}

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [planName, setPlanName] = useState<string>('');
  const [isYearly, setIsYearly] = useState<boolean>(false);

  useEffect(() => {
    // Get plan details from location state
    const state = location.state as LocationState;
    if (!state || !state.planId) {
      // If no plan ID is provided, redirect to pricing page
      navigate('/pricing');
      return;
    }

    const plan = getPlanById(state.planId);
    if (plan) {
      setPlanName(plan.name);
    }

    if (state.isYearly) {
      setIsYearly(true);
    }

    // In a real application, you would verify the payment status here
  }, [navigate, location]);

  return (
    <div className="container mx-auto py-16 px-4">
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">Thank You for Your Purchase!</h1>
        
        <p className="text-lg mb-6">
          Your subscription to the {planName} Plan has been successfully activated.
          {isYearly ? ' You have chosen annual billing.' : ''}
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="font-semibold mb-4">What's Next?</h2>
          <ul className="space-y-3 text-left">
            <li className="flex items-start">
              <span className="mr-2 mt-1 text-green-500">✓</span>
              <span>Your account has been upgraded with the new features and credits.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1 text-green-500">✓</span>
              <span>You'll receive a confirmation email with your receipt shortly.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1 text-green-500">✓</span>
              <span>You can manage your subscription anytime from your account settings.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="flex-1"
          >
            Go to Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/account/subscription')}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            Manage Subscription
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            If you have any questions or need assistance, please contact our{' '}
            <a href="/support" className="text-blue-500 hover:underline">
              support team
            </a>
            .
          </p>
        </div>
      </Card>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Recommended Next Steps</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Complete Your Profile</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Add your company details and preferences to get personalized recommendations.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/account/profile')}
            >
              Update Profile
            </Button>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Explore Features</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Discover all the powerful features available in your new plan.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/features')}
            >
              View Features
            </Button>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Start Prospecting</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Begin finding and connecting with potential leads right away.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/prospecting')}
            >
              Find Leads
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
