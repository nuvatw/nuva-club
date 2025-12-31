'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';

export default function ApplyNunuPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated, refreshProfile } = useAuth();
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">請先登入以申請。</p>
      </div>
    );
  }

  // Already a Nunu
  if (profile.available_roles?.includes('nunu')) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">你已經是教練了!</CardTitle>
            <CardDescription className="text-green-700">
              你可以在努努主頁管理學員。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/club/nunu/dashboard')}>
              前往教練主頁
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application pending
  if (profile.nunu_application_status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">申請審核中</CardTitle>
            <CardDescription className="text-yellow-700">
              你的教練申請正在審核中，請耐心等待。我們會盡快通知你結果。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push('/club/dashboard')}>
              返回主頁
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application rejected
  if (profile.nunu_application_status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">申請未通過</CardTitle>
            <CardDescription className="text-red-700">
              很抱歉，你的教練申請未通過。如有疑問請聯繫我們。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push('/club/dashboard')}>
              返回主頁
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check level requirement
  if (profile.level < 6) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>申請成為教練</CardTitle>
            <CardDescription>
              成為努努教練，指導其他學員成長
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                申請教練需要達到第 6 級。你目前是第 {profile.level} 級。
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                繼續學習，達到第 6 級後即可申請!
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/club/courses')}>
              繼續學習
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!motivation.trim() || !experience.trim()) return;

    setSubmitting(true);
    const supabase = getClient();

    await supabase
      .from('profiles')
      .update({ nunu_application_status: 'pending' })
      .eq('id', profile.id);

    await refreshProfile();
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">申請已送出!</CardTitle>
            <CardDescription className="text-green-700">
              感謝你的申請。我們會盡快審核並通知你結果。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/club/dashboard')}>
              返回主頁
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>申請成為教練</CardTitle>
          <CardDescription>
            成為努努教練，指導其他學員成長，獲得額外獎勵!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-primary/5 rounded-lg space-y-2">
            <h3 className="font-medium">教練福利</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- 每月獲得指導獎金</li>
              <li>- 優先體驗新課程</li>
              <li>- 專屬教練徽章</li>
              <li>- 建立個人品牌</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                為什麼想成為教練？
              </label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="分享你想指導他人的動機..."
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                相關經驗
              </label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="描述你的相關經驗或技能..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!motivation.trim() || !experience.trim() || submitting}
          >
            {submitting ? '送出中...' : '送出申請'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
