// Subscription plan types
export type PlanId = 'free_tier' | 'starter_tier' | 'professional_tier' | 'organization_tier';

// Subscription status types
export type SubscriptionStatus = 
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'unpaid'
  | 'paused';

// Subscription data interface
export interface Subscription {
  id: string;
  customerId: string;
  status: SubscriptionStatus;
  planId: PlanId;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd: number | null;
  createdAt: number;
}

// Credit limits for each plan
export interface CreditLimits {
  prospecting: number;
  leads: number;
  widgets: number;
}

// User credits interface
export interface UserCredits {
  userId: string;
  prospectingCredits: {
    total: number;
    used: number;
    lastRefillDate: Date;
  };
  leadCredits: {
    total: number;
    used: number;
    lastRefillDate: Date;
  };
  widgetCredits: {
    total: number;
    used: number;
  };
  updatedAt: Date;
}

// Plan feature interface
export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number | string;
  tooltip?: string;
}

// Plan interface for display
export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  price: number;
  priceId: string; // Stripe price ID
  features: PlanFeature[];
  popular?: boolean;
  credits: CreditLimits;
  color?: string;
  gradient?: string;
}

// Predefined plans
export const PLANS: Plan[] = [
  {
    id: 'free_tier',
    name: 'Free',
    description: 'Basic features for individuals',
    price: 0,
    priceId: 'price_free',
    features: [
      { name: 'Basic prospecting', included: true },
      { name: 'Lead tracking', included: true, limit: '10/month' },
      { name: 'Basic widget', included: true, limit: '1' },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: false },
      { name: 'Team collaboration', included: false },
      { name: 'Custom integrations', included: false },
      { name: 'Priority support', included: false },
    ],
    credits: {
      prospecting: 100,
      leads: 10,
      widgets: 1
    },
    color: '#6b7280', // Gray
  },
  {
    id: 'starter_tier',
    name: 'Starter',
    description: 'Essential features for small businesses',
    price: 29,
    priceId: 'price_starter',
    features: [
      { name: 'Enhanced prospecting', included: true },
      { name: 'Lead tracking', included: true, limit: '50/month' },
      { name: 'Advanced widgets', included: true, limit: '3' },
      { name: 'Email support', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Team collaboration', included: false },
      { name: 'Custom integrations', included: false },
      { name: 'Priority support', included: false },
    ],
    popular: true,
    credits: {
      prospecting: 500,
      leads: 50,
      widgets: 3
    },
    color: '#3b82f6', // Blue
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'professional_tier',
    name: 'Professional',
    description: 'Advanced features for growing teams',
    price: 79,
    priceId: 'price_professional',
    features: [
      { name: 'Advanced prospecting', included: true },
      { name: 'Lead tracking', included: true, limit: '200/month' },
      { name: 'Unlimited widgets', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Team collaboration', included: true, limit: '5 users' },
      { name: 'Basic integrations', included: true },
      { name: 'Priority support', included: false },
    ],
    credits: {
      prospecting: 2000,
      leads: 200,
      widgets: 10
    },
    color: '#8b5cf6', // Purple
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'organization_tier',
    name: 'Organization',
    description: 'Enterprise-grade features for large teams',
    price: 199,
    priceId: 'price_organization',
    features: [
      { name: 'Unlimited prospecting', included: true },
      { name: 'Unlimited lead tracking', included: true },
      { name: 'Unlimited widgets', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Team collaboration', included: true, limit: 'Unlimited' },
      { name: 'Custom integrations', included: true },
      { name: 'Priority support', included: true },
    ],
    credits: {
      prospecting: 10000,
      leads: 1000,
      widgets: 100
    },
    color: '#ec4899', // Pink
    gradient: 'from-pink-500 to-rose-500',
  }
];

// Get plan by ID
export function getPlanById(planId: PlanId): Plan | undefined {
  return PLANS.find(plan => plan.id === planId);
}

// Get plan by Stripe price ID
export function getPlanByPriceId(priceId: string): Plan | undefined {
  return PLANS.find(plan => plan.priceId === priceId);
}
