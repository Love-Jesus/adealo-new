import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPlanById, Plan, PlanId } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import { getCurrentPlan } from '@/services/subscription';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY, createSubscription } from '@/services/stripe';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';

// Load Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface LocationState {
  planId: PlanId;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlanId, setCurrentPlanId] = useState<PlanId | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        if (!auth.currentUser) {
          navigate('/login', { state: { redirectTo: '/checkout' } });
          return;
        }

        // Get current plan
        const userPlanId = await getCurrentPlan();
        setCurrentPlanId(userPlanId);

        // Get selected plan from location state
        const state = location.state as LocationState;
        if (!state || !state.planId) {
          navigate('/pricing');
          return;
        }

        const selectedPlan = getPlanById(state.planId);
        if (!selectedPlan) {
          navigate('/pricing');
          return;
        }

        setPlan(selectedPlan);

        // Pre-fill email if available
        if (auth.currentUser.email) {
          setFormData(prev => ({
            ...prev,
            email: auth.currentUser?.email || '',
            name: auth.currentUser?.displayName || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, location]);

  const getPrice = (price: number): number => {
    if (isYearly) {
      return Math.round(price * 0.8 * 12);
    }
    return price;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      agreeToTerms: checked,
    }));

    // Clear error when user checks
    if (errors.agreeToTerms) {
      setErrors(prev => ({
        ...prev,
        agreeToTerms: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    }

    if (!formData.cvc.trim()) {
      newErrors.cvc = 'CVC is required';
    } else if (!/^\d{3,4}$/.test(formData.cvc)) {
      newErrors.cvc = 'CVC must be 3 or 4 digits';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // In a real application, you would process the payment here
    // For now, we'll just simulate a successful payment
    
    // Show loading state
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Redirect to success page
      navigate('/checkout/success', { 
        state: { 
          planId: plan?.id,
          isYearly 
        } 
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Plan not found</h1>
        <p className="mb-6">The selected plan could not be found.</p>
        <Button onClick={() => navigate('/pricing')}>
          View Plans
        </Button>
      </div>
    );
  }

  // If user is already on this plan, show a message
  if (currentPlanId === plan.id) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">You're already subscribed to this plan</h1>
        <p className="mb-6">You're currently on the {plan.name} plan.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // If it's the free plan, no payment needed
  if (plan.price === 0) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Switch to Free Plan</h1>
        <p className="mb-6">You're about to switch to the Free plan. No payment is required.</p>
        <Button onClick={() => {
          // In a real app, you would call an API to update the subscription
          setTimeout(() => {
            navigate('/checkout/success', { state: { planId: plan.id } });
          }, 1000);
        }}>
          Confirm Switch
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Purchase</h1>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="mb-6">
                <h3 className="font-semibold text-lg">{plan.name} Plan</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{plan.description}</p>
                
                <div className="flex items-center mb-4">
                  <Checkbox 
                    id="yearly-billing" 
                    checked={isYearly}
                    onCheckedChange={(checked) => setIsYearly(checked as boolean)}
                  />
                  <label 
                    htmlFor="yearly-billing" 
                    className="ml-2 text-sm font-medium cursor-pointer"
                  >
                    Pay yearly (save 20%)
                  </label>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Subtotal</span>
                  <span>${getPrice(plan.price)}</span>
                </div>
                
                {isYearly && (
                  <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700 text-green-600">
                    <span>Yearly discount (20%)</span>
                    <span>-${Math.round(plan.price * 0.2 * 12)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700 font-bold">
                  <span>Total</span>
                  <span>${getPrice(plan.price)}</span>
                </div>
                
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  {isYearly ? 'Billed annually' : 'Billed monthly'}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold">What's included:</h4>
                <ul className="space-y-1">
                  <li>• {plan.credits.prospecting.toLocaleString()} Prospecting Credits</li>
                  <li>• {plan.credits.leads.toLocaleString()} Lead Credits</li>
                  <li>• {plan.credits.widgets === 100 ? 'Unlimited' : plan.credits.widgets} Widgets</li>
                  {plan.features
                    .filter(f => f.included)
                    .map((feature, index) => (
                      <li key={index}>• {feature.name} {feature.limit && `(${feature.limit})`}</li>
                    ))
                  }
                </ul>
              </div>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-3">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Payment Details</h2>
              
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  amount={getPrice(plan.price)}
                  currency="usd"
                  isYearly={isYearly}
                  planName={plan.name}
                  onSuccess={async (paymentMethodId) => {
                    try {
                      setIsLoading(true);
                      
                      // Create a subscription with the payment method
                      const result = await createSubscription(
                        plan.id,
                        paymentMethodId,
                        isYearly
                      );
                      
                      // Redirect to success page
                      navigate('/checkout/success', {
                        state: {
                          planId: plan.id,
                          isYearly,
                          subscriptionId: result.subscriptionId
                        }
                      });
                    } catch (error) {
                      console.error('Error creating subscription:', error);
                      setIsLoading(false);
                    }
                  }}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    setIsLoading(false);
                  }}
                />
              </Elements>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Your payment is secured by Stripe
                </p>
                <div className="flex justify-center mt-2 space-x-2">
                  <span className="text-2xl">💳</span>
                  <span className="text-2xl">🔒</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
