'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser, MOCK_USERS, MOCK_COACH_STUDENTS, MOCK_CHALLENGES, MOCK_EVENTS } from '@/lib/mock';
import { useSimulatedTime } from '@/lib/mock/simulated-time-context';
import { cn } from '@/lib/utils/cn';

export default function GuardianDashboardPage() {
  const { user } = useUser();
  const { currentDate } = useSimulatedTime();

  if (!user) {
    return null;
  }

  // Calculate stats
  const totalUsers = MOCK_USERS.length;
  const pendingApplications = MOCK_USERS.filter(u => u.nunuApplicationStatus === 'pending').length;
  const activeCoaches = MOCK_USERS.filter(u => u.availableRoles.includes('nunu')).length;
  const trialUsers = MOCK_USERS.filter(u => u.subscriptionStatus === 'trial').length;
  const upcomingEvents = MOCK_EVENTS.filter(e => new Date(e.startDate) > currentDate).length;
  const activeChallenges = MOCK_CHALLENGES.filter(c => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return start <= currentDate && end >= currentDate;
  }).length;

  const quickStats = [
    { label: '總用戶', value: totalUsers, icon: '👥', href: '/club/guardian/users' },
    { label: '待審核申請', value: pendingApplications, icon: '📋', href: '/club/guardian/applications', highlight: pendingApplications > 0 },
    { label: '教練數', value: activeCoaches, icon: '🎓', href: '/club/guardian/users' },
    { label: '試用用戶', value: trialUsers, icon: '⏳', href: '/club/guardian/users' },
    { label: '進行中挑戰', value: activeChallenges, icon: '🎯', href: '/club/guardian/challenges' },
    { label: '即將活動', value: upcomingEvents, icon: '📅', href: '/club/guardian/events' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">守護者主頁</h1>
        <p className="text-muted-foreground">管理平台用戶、挑戰和活動</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {quickStats.map(stat => (
          <Link key={stat.label} href={stat.href}>
            <Card className={cn(
              'hover:shadow-md transition-all cursor-pointer',
              stat.highlight && 'border-orange-300 bg-orange-50'
            )}>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className={cn(
                  'text-2xl font-bold',
                  stat.highlight && 'text-orange-600'
                )}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending Applications Alert */}
      {pendingApplications > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-orange-500">!</span>
              待審核的教練申請
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_USERS.filter(u => u.nunuApplicationStatus === 'pending').map(applicant => (
                <div key={applicant.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    {applicant.image ? (
                      <img src={applicant.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium">{applicant.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{applicant.name}</p>
                      <p className="text-sm text-muted-foreground">第 {applicant.level} 級 · {applicant.email}</p>
                    </div>
                  </div>
                  <Link href="/club/guardian/applications">
                    <Button size="sm">審核</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/club/guardian/users">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                👥 用戶管理
              </CardTitle>
              <CardDescription>查看和管理所有平台用戶</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">活躍：</span>
                  <span className="font-medium">{MOCK_USERS.filter(u => u.subscriptionStatus === 'active').length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">試用：</span>
                  <span className="font-medium">{trialUsers}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/club/guardian/assignments">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🔗 配對管理
              </CardTitle>
              <CardDescription>管理教練與學員的配對關係</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">配對數：</span>
                  <span className="font-medium">{MOCK_COACH_STUDENTS.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/club/guardian/challenges">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🎯 挑戰管理
              </CardTitle>
              <CardDescription>建立和管理月度挑戰活動</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">進行中：</span>
                  <span className="font-medium">{activeChallenges}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">總計：</span>
                  <span className="font-medium">{MOCK_CHALLENGES.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/club/guardian/events">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📅 活動管理
              </CardTitle>
              <CardDescription>建立和管理線上與實體活動</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">即將舉行：</span>
                  <span className="font-medium">{upcomingEvents}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/club/guardian/courses">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📚 課程管理
              </CardTitle>
              <CardDescription>管理平台課程內容</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">總課程：</span>
                  <span className="font-medium">52</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/club/guardian/applications">
          <Card className={cn(
            'hover:shadow-md transition-all cursor-pointer h-full',
            pendingApplications > 0 && 'border-orange-300'
          )}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📋 申請審核
                {pendingApplications > 0 && (
                  <Badge className="bg-orange-500">{pendingApplications}</Badge>
                )}
              </CardTitle>
              <CardDescription>審核教練申請</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">待審核：</span>
                  <span className={cn('font-medium', pendingApplications > 0 && 'text-orange-600')}>
                    {pendingApplications}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">最近活動</CardTitle>
          <CardDescription>平台近期動態</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '今天', action: '雅婷 申請成為教練', type: 'application' },
              { time: '昨天', action: '小芳 開始試用', type: 'user' },
              { time: '2 天前', action: '十二月挑戰開始', type: 'challenge' },
              { time: '3 天前', action: '小美 完成第 3 級課程', type: 'progress' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  activity.type === 'application' ? 'bg-orange-500' :
                  activity.type === 'challenge' ? 'bg-purple-500' :
                  activity.type === 'user' ? 'bg-blue-500' :
                  'bg-green-500'
                )} />
                <span className="text-sm text-muted-foreground w-16">{activity.time}</span>
                <span className="text-sm">{activity.action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
