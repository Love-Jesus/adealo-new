import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PricingPlans } from '@/components/pricing/pricing-plans';
import { Plan } from '@/types/subscription';
import { getCurrentPlan } from '@/services/subscription';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        const planId = await getCurrentPlan();
        setCurrentPlanId(planId);
      } catch (error) {
        console.error('Error fetching current plan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (auth.currentUser) {
      fetchCurrentPlan();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    if (!auth.currentUser) {
      // Redirect to login page if not authenticated
      navigate('/login', { state: { redirectTo: '/pricing', selectedPlan: plan.id } });
      return;
    }

    // If user is authenticated, redirect to checkout page
    navigate('/checkout', { state: { planId: plan.id } });
  };

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Select the perfect plan for your business needs. All plans include a 14-day free trial.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <PricingPlans 
          currentPlanId={currentPlanId} 
          onSelectPlan={handleSelectPlan} 
          showToggle={true}
        />
      )}

      <div className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Find answers to common questions about our plans and pricing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">What happens after my trial ends?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              After your 14-day trial, you'll be automatically switched to the free plan unless you choose to upgrade. Your data will be preserved, but some features may be limited.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Can I change plans later?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated amount for the remainder of your billing cycle.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">How do credits work?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Credits are refreshed monthly and allow you to perform specific actions. Prospecting credits are used for searching and filtering companies, lead credits for capturing contact information, and widget credits for creating lead capture forms.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with our service, contact our support team within 30 days of your purchase for a full refund.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely through Stripe.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Do you offer custom plans?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, we offer custom enterprise plans for larger teams with specific needs. Contact our sales team to discuss your requirements and get a tailored quote.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Still have questions? We're here to help.
          </p>
          <Button variant="outline" onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
