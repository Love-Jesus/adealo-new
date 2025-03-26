import React, { useState } from 'react';
import { Plan, PLANS } from '@/types/subscription';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface PricingPlansProps {
  currentPlanId?: string;
  onSelectPlan?: (plan: Plan) => void;
  isYearly?: boolean;
  showToggle?: boolean;
}

export function PricingPlans({
  currentPlanId,
  onSelectPlan,
  isYearly = false,
  showToggle = true,
}: PricingPlansProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    isYearly ? 'yearly' : 'monthly'
  );

  // Apply yearly discount (20%)
  const getPrice = (price: number): number => {
    if (billingCycle === 'yearly') {
      return Math.round(price * 0.8);
    }
    return price;
  };

  const handleSelectPlan = (plan: Plan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {showToggle && (
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs font-bold text-green-500">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col h-full overflow-hidden border-2 ${
              plan.popular
                ? 'border-blue-500 dark:border-blue-400'
                : 'border-gray-200 dark:border-gray-700'
            } ${
              currentPlanId === plan.id
                ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                : ''
            }`}
          >
            {plan.popular && (
              <div className="bg-blue-500 dark:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-2 text-center">
                Most Popular
              </div>
            )}

            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                {plan.description}
              </p>

              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold">
                  ${getPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                )}
              </div>

              <div className="space-y-4 mb-6 flex-grow">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Credits
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 flex-shrink-0">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-sm">
                        {plan.credits.prospecting.toLocaleString()} Prospecting
                        Credits
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 flex-shrink-0">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-sm">
                        {plan.credits.leads.toLocaleString()} Lead Credits
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 flex-shrink-0">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-sm">
                        {plan.credits.widgets === 100
                          ? 'Unlimited'
                          : plan.credits.widgets}{' '}
                        Widgets
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Features
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-4 h-4 mr-2 flex-shrink-0">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            feature.included
                              ? ''
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {feature.name}
                          {feature.limit && (
                            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                              ({feature.limit})
                            </span>
                          )}
                          {feature.tooltip && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 cursor-help">
                                  ℹ️
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {feature.tooltip}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full ${
                  plan.gradient
                    ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90`
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
                disabled={currentPlanId === plan.id}
              >
                {currentPlanId === plan.id
                  ? 'Current Plan'
                  : plan.price === 0
                  ? 'Get Started'
                  : 'Select Plan'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        All plans include a 14-day free trial. No credit card required.
        <br />
        Need a custom plan? <a href="#" className="text-blue-500 hover:underline">Contact us</a> for enterprise pricing.
      </div>
    </div>
  );
}
