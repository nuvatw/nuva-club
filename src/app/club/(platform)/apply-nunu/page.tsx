'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/lib/mock';

export default function ApplyNunuPage() {
  const router = useRouter();
  const { user, nunuApplicationStatus, applyForNunu, approveNunuApplication } = useUser();
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">請先登入以申請。</p>
      </div>
    );
  }

  // Already a Nunu
  if (user.availableRoles.includes('nunu')) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">你已經是教練了！</CardTitle>
            <CardDescription className="text-green-700">
              你可以使用頁首的角色切換器在法法和努努之間切換。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/nunu/dashboard')}>
              前往教練主頁
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending application
  if (nunuApplicationStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>申請進度</CardTitle>
            <CardDescription>
              你的教練申請正在審核中
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="p-3 rounded-full bg-amber-100">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-amber-800">審核中</h3>
                <p className="text-sm text-amber-700">
                  我們正在審核你的申請，通常需要 2-3 個工作天。
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50">
              <h4 className="font-medium mb-2">接下來會發生什麼？</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  我們的團隊審核你的申請
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  審核通過後你會收到通知
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  完成教練入職培訓
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  開始以努努身份幫助學員！
                </li>
              </ul>
            </div>

            {/* Demo only: Quick approve button */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-3">
                展示模式：點擊下方按鈕模擬審核通過
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  approveNunuApplication();
                  router.push('/club/dashboard');
                }}
              >
                模擬審核通過（展示用）
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyForNunu();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">申請已送出！</CardTitle>
            <CardDescription className="text-green-700">
              感謝你申請成為努努教練。
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
      <div>
        <h1 className="text-2xl font-bold">成為努努教練</h1>
        <p className="text-muted-foreground">
          分享你的知識，幫助其他學員踏上 AI 學習之旅
        </p>
      </div>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">為什麼要成為教練？</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-primary/10 h-fit">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">深化知識</h4>
                <p className="text-sm text-muted-foreground">教導他人能鞏固自己的理解</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-primary/10 h-fit">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">建立社群</h4>
                <p className="text-sm text-muted-foreground">與積極的學習者建立連結</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-primary/10 h-fit">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">獲得認可</h4>
                <p className="text-sm text-muted-foreground">取得努努徽章和專屬福利</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-primary/10 h-fit">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">提升技能</h4>
                <p className="text-sm text-muted-foreground">培養領導力和溝通能力</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">申請條件</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${user.level >= 5 ? 'bg-green-100' : 'bg-red-100'}`}>
                {user.level >= 5 ? (
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={user.level >= 5 ? 'text-foreground' : 'text-muted-foreground'}>
                等級 5 或以上（你目前是等級 {user.level}）
              </span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>有效訂閱</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>對幫助他人學習充滿熱忱</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">申請表</CardTitle>
          <CardDescription>告訴我們為什麼你會是一位優秀的教練</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                你為什麼想成為努努教練？
              </label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="分享你的動機..."
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                你有哪些教學或指導經驗？
              </label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="描述任何相關經驗..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              送出申請
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
