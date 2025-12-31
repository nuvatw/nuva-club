'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

type PlanType = 'basic' | 'club';
type BillingCycle = 'monthly' | 'yearly';

const plans = {
  basic: {
    name: 'Basic',
    description: 'Access to core learning content',
    features: [
      'Access to all courses',
      'Progress tracking',
      'Community forum (read only)',
      'Monthly newsletter',
    ],
    monthlyPrice: 299,
    yearlyPrice: 2990,
    recommended: false,
  },
  club: {
    name: 'Club',
    description: 'Full experience with coaching & challenges',
    features: [
      'Everything in Basic',
      'Monthly challenges with prizes',
      'Personal coach feedback',
      'Forum posting & reactions',
      'Offline events access',
      'Priority support',
    ],
    monthlyPrice: 999,
    yearlyPrice: 9990,
    recommended: true,
  },
};

export default function EnrollPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('club');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPlan,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Enrollment failed');
      }

      // Redirect to placement exam
      router.push('/club/placement');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = plans[selectedPlan];
  const price = billingCycle === 'monthly' ? currentPlan.monthlyPrice : currentPlan.yearlyPrice;
  const savings = billingCycle === 'yearly' ? Math.round((currentPlan.monthlyPrice * 12 - currentPlan.yearlyPrice) / 12) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Start with a free trial, cancel anytime
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <Badge variant="success" className="ml-2">Save 17%</Badge>
          </Button>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {(Object.entries(plans) as [PlanType, typeof plans.basic][]).map(([key, plan]) => (
            <Card
              key={key}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                selectedPlan === key && 'ring-2 ring-primary',
                plan.recommended && 'border-primary'
              )}
              onClick={() => setSelectedPlan(key)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.recommended && (
                    <Badge>Recommended</Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    NT${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary & CTA */}
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">{plans[selectedPlan].name} Plan</span>
              <span className="font-bold">NT${price}/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            {savings > 0 && (
              <p className="text-sm text-green-600 mb-4">
                Save NT${savings}/month with yearly billing
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-4">
              First month free! You won&apos;t be charged until after your trial.
            </p>

            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm mb-4">
                {error}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleEnroll}
              isLoading={isLoading}
            >
              Start Free Trial
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
