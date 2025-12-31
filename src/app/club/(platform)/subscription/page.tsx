'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';

type PlanType = 'basic' | 'club';
type BillingCycle = 'monthly' | 'yearly';

const PLANS = {
  basic: {
    name: 'Basic',
    nameChinese: '基礎方案',
    description: '基本學習功能',
    features: [
      '所有課程存取',
      '學習進度追蹤',
      '社群論壇（唯讀）',
      '每月電子報',
    ],
    monthlyPrice: 299,
    yearlyPrice: 2990,
  },
  club: {
    name: 'Club',
    nameChinese: '俱樂部方案',
    description: '完整體驗，含教練指導與挑戰',
    features: [
      'Basic 所有功能',
      '1 對 1 教練指導',
      '月度挑戰參與',
      '社群論壇（完整功能）',
      '線上活動優先報名',
      '專屬會員徽章',
    ],
    monthlyPrice: 599,
    yearlyPrice: 5990,
  },
};

export default function SubscriptionPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated, refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      setSelectedPlan(profile.plan_type as PlanType || 'basic');
      setBillingCycle(profile.billing_cycle as BillingCycle || 'monthly');
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const currentPlan = profile.plan_type as PlanType || 'basic';
  const isTrialing = profile.subscription_status === 'trial';
  const isActive = profile.subscription_status === 'active';
  const isCancelled = profile.subscription_status === 'canceled';

  const handleChangePlan = async (plan: PlanType) => {
    setUpdating(true);
    const supabase = getClient();

    await supabase
      .from('profiles')
      .update({
        plan_type: plan,
        billing_cycle: billingCycle,
        subscription_status: 'active',
      })
      .eq('id', profile.id);

    await refreshProfile();
    setUpdating(false);
  };

  const handleChangeBillingCycle = async (cycle: BillingCycle) => {
    setBillingCycle(cycle);
    if (isActive) {
      setUpdating(true);
      const supabase = getClient();

      await supabase
        .from('profiles')
        .update({ billing_cycle: cycle })
        .eq('id', profile.id);

      await refreshProfile();
      setUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('確定要取消訂閱嗎？')) return;

    setUpdating(true);
    const supabase = getClient();

    await supabase
      .from('profiles')
      .update({ subscription_status: 'canceled' })
      .eq('id', profile.id);

    await refreshProfile();
    setUpdating(false);
  };

  const handleReactivate = async () => {
    setUpdating(true);
    const supabase = getClient();

    await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('id', profile.id);

    await refreshProfile();
    setUpdating(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">訂閱管理</h1>
        <p className="text-muted-foreground">管理你的訂閱方案</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">目前狀態</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold">{PLANS[currentPlan].nameChinese}</p>
              <p className="text-sm text-muted-foreground">
                {profile.billing_cycle === 'yearly' ? '年繳' : '月繳'}
              </p>
            </div>
            <Badge className={cn(
              isActive ? 'bg-green-100 text-green-700' :
              isTrialing ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            )}>
              {isActive ? '啟用中' : isTrialing ? '試用中' : isCancelled ? '已取消' : '待啟用'}
            </Badge>
          </div>
          {isCancelled && (
            <div className="mt-4">
              <Button onClick={handleReactivate} disabled={updating}>
                {updating ? '處理中...' : '重新啟用訂閱'}
              </Button>
            </div>
          )}
          {(isActive || isTrialing) && (
            <div className="mt-4">
              <Button variant="outline" onClick={handleCancelSubscription} disabled={updating}>
                {updating ? '處理中...' : '取消訂閱'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center gap-2">
        <Button
          variant={billingCycle === 'monthly' ? 'default' : 'outline'}
          onClick={() => handleChangeBillingCycle('monthly')}
          disabled={updating}
        >
          月繳
        </Button>
        <Button
          variant={billingCycle === 'yearly' ? 'default' : 'outline'}
          onClick={() => handleChangeBillingCycle('yearly')}
          disabled={updating}
        >
          年繳（省 2 個月）
        </Button>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {(Object.entries(PLANS) as [PlanType, typeof PLANS.basic][]).map(([key, plan]) => {
          const isCurrentPlan = currentPlan === key;
          const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

          return (
            <Card
              key={key}
              className={cn(
                'relative',
                isCurrentPlan && 'border-primary border-2',
                key === 'club' && 'bg-primary/5'
              )}
            >
              {isCurrentPlan && (
                <Badge className="absolute -top-3 right-4 bg-primary">目前方案</Badge>
              )}
              {key === 'club' && !isCurrentPlan && (
                <Badge className="absolute -top-3 right-4 bg-orange-500">推薦</Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.nameChinese}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">NT${price}</span>
                  <span className="text-muted-foreground">
                    /{billingCycle === 'yearly' ? '年' : '月'}
                  </span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'secondary' : 'default'}
                  disabled={isCurrentPlan || updating}
                  onClick={() => handleChangePlan(key)}
                >
                  {isCurrentPlan ? '目前方案' : updating ? '處理中...' : '切換到此方案'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
