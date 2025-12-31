'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useUser } from '@/lib/mock/user-context';
import type { PlanType, BillingCycle } from '@/types';

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
      '基礎方案所有功能',
      '每月挑戰活動（含獎品）',
      '個人教練回饋',
      '論壇發文與互動',
      '實體活動參與權',
      '優先客服支援',
    ],
    monthlyPrice: 999,
    yearlyPrice: 9990,
    recommended: true,
  },
};

const STATUS_LABELS = {
  trial: { label: '試用中', color: 'bg-blue-100 text-blue-700' },
  active: { label: '使用中', color: 'bg-green-100 text-green-700' },
  canceled: { label: '已取消', color: 'bg-red-100 text-red-700' },
  expired: { label: '已過期', color: 'bg-gray-100 text-gray-700' },
};

export default function SubscriptionPage() {
  const router = useRouter();
  const {
    user,
    isLoggedIn,
    subscription,
    changePlan,
    changeBillingCycle,
    cancelSubscription,
    reactivateSubscription,
  } = useUser();

  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showPlanChange, setShowPlanChange] = useState(false);

  if (!isLoggedIn || !user || !subscription) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">請先登入以查看訂閱資訊</p>
            <Button onClick={() => router.push('/club/login')}>登入</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlan = PLANS[subscription.planType];
  const otherPlan = subscription.planType === 'basic' ? 'club' : 'basic';
  const statusInfo = STATUS_LABELS[subscription.status];
  const price = subscription.billingCycle === 'monthly'
    ? currentPlan.monthlyPrice
    : currentPlan.yearlyPrice;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleChangePlan = (newPlan: PlanType) => {
    changePlan(newPlan);
    setShowPlanChange(false);
  };

  const handleToggleBillingCycle = () => {
    const newCycle: BillingCycle = subscription.billingCycle === 'monthly' ? 'yearly' : 'monthly';
    changeBillingCycle(newCycle);
  };

  const handleCancelSubscription = () => {
    cancelSubscription();
    setShowConfirmCancel(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">訂閱管理</h1>
        <p className="text-muted-foreground">管理你的方案與帳單設定</p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{currentPlan.nameChinese}</CardTitle>
              <CardDescription>{currentPlan.description}</CardDescription>
            </div>
            <Badge className={cn('text-sm', statusInfo.color)}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">NT${price}</span>
            <span className="text-muted-foreground">
              /{subscription.billingCycle === 'monthly' ? '月' : '年'}
            </span>
          </div>

          {/* Features */}
          <div>
            <p className="text-sm font-medium mb-2">方案內容：</p>
            <ul className="space-y-1.5">
              {currentPlan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Billing Info */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">訂閱開始日期</span>
              <span>{formatDate(subscription.startDate)}</span>
            </div>
            {subscription.status !== 'canceled' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">下次扣款日期</span>
                <span>{formatDate(subscription.nextBillingDate)}</span>
              </div>
            )}
            {subscription.cancelDate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">取消日期</span>
                <span className="text-red-600">{formatDate(subscription.cancelDate)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">帳單週期</span>
              <span>{subscription.billingCycle === 'monthly' ? '每月' : '每年'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">管理訂閱</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Change Plan */}
          {!showPlanChange ? (
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">變更方案</p>
                <p className="text-sm text-muted-foreground">
                  切換到 {PLANS[otherPlan].nameChinese}
                </p>
              </div>
              <Button variant="outline" onClick={() => setShowPlanChange(true)}>
                變更
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-muted/30 rounded-lg space-y-4">
              <p className="font-medium">選擇新方案</p>
              <div className="grid gap-3">
                {(Object.entries(PLANS) as [PlanType, typeof PLANS.basic][]).map(([key, plan]) => (
                  <button
                    key={key}
                    onClick={() => handleChangePlan(key)}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all',
                      subscription.planType === key
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{plan.nameChinese}</span>
                      {subscription.planType === key && (
                        <Badge variant="outline" className="text-xs">目前方案</Badge>
                      )}
                      {'recommended' in plan && plan.recommended && (
                        <Badge>推薦</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <p className="text-sm font-medium mt-2">
                      NT${subscription.billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      /{subscription.billingCycle === 'monthly' ? '月' : '年'}
                    </p>
                  </button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setShowPlanChange(false)}>
                取消
              </Button>
            </div>
          )}

          {/* Toggle Billing Cycle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">帳單週期</p>
              <p className="text-sm text-muted-foreground">
                {subscription.billingCycle === 'monthly'
                  ? '切換到年繳可省 17%'
                  : '目前為年繳方案'}
              </p>
            </div>
            <Button variant="outline" onClick={handleToggleBillingCycle}>
              切換到{subscription.billingCycle === 'monthly' ? '年繳' : '月繳'}
            </Button>
          </div>

          {/* Cancel / Reactivate */}
          {subscription.status === 'canceled' ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-700">重新訂閱</p>
                <p className="text-sm text-green-600">恢復你的訂閱以繼續學習</p>
              </div>
              <Button onClick={reactivateSubscription}>
                重新訂閱
              </Button>
            </div>
          ) : !showConfirmCancel ? (
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">取消訂閱</p>
                <p className="text-sm text-muted-foreground">你可以隨時重新訂閱</p>
              </div>
              <Button variant="outline" onClick={() => setShowConfirmCancel(true)}>
                取消訂閱
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-3">
              <p className="font-medium text-red-700">確定要取消訂閱嗎？</p>
              <p className="text-sm text-red-600">
                取消後，你將在目前帳單週期結束前仍可使用所有功能。
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleCancelSubscription}>
                  確定取消
                </Button>
                <Button variant="ghost" onClick={() => setShowConfirmCancel(false)}>
                  返回
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">付款紀錄</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Mock payment history */}
            {[
              { date: subscription.startDate, amount: price, status: 'paid' },
            ].map((payment, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">NT${payment.amount}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(payment.date)}</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  已付款
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
