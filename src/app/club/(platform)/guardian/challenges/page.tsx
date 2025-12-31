'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_CHALLENGES } from '@/lib/mock';
import { useSimulatedTime } from '@/lib/mock/simulated-time-context';
import { cn } from '@/lib/utils/cn';

type StatusFilter = 'all' | 'upcoming' | 'active' | 'ended';

export default function ChallengesManagementPage() {
  const router = useRouter();
  const { currentDate } = useSimulatedTime();
  const [filter, setFilter] = useState<StatusFilter>('all');

  const getChallengeStatus = (challenge: typeof MOCK_CHALLENGES[0]) => {
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);
    if (currentDate < start) return 'upcoming';
    if (currentDate > end) return 'ended';
    return 'active';
  };

  // Filter challenges
  let challenges = [...MOCK_CHALLENGES];
  if (filter !== 'all') {
    challenges = challenges.filter(c => getChallengeStatus(c) === filter);
  }

  // Sort by start date descending
  challenges = challenges.sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const statusLabels = {
    upcoming: '即將開始',
    active: '進行中',
    ended: '已結束',
  };

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    ended: 'bg-gray-100 text-gray-700',
  };

  const activeCount = MOCK_CHALLENGES.filter(c => getChallengeStatus(c) === 'active').length;
  const upcomingCount = MOCK_CHALLENGES.filter(c => getChallengeStatus(c) === 'upcoming').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">挑戰管理</h1>
          <p className="text-muted-foreground">建立和管理月度挑戰活動</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/club/guardian/dashboard')}>
            返回主頁
          </Button>
          <Button>新增挑戰</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn(activeCount > 0 && 'border-green-300 bg-green-50')}>
          <CardContent className="pt-4 pb-4 text-center">
            <p className={cn('text-3xl font-bold', activeCount > 0 && 'text-green-600')}>
              {activeCount}
            </p>
            <p className="text-sm text-muted-foreground">進行中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{upcomingCount}</p>
            <p className="text-sm text-muted-foreground">即將開始</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{MOCK_CHALLENGES.length}</p>
            <p className="text-sm text-muted-foreground">總挑戰數</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: '全部' },
          { key: 'active', label: '進行中' },
          { key: 'upcoming', label: '即將開始' },
          { key: 'ended', label: '已結束' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as StatusFilter)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === key
                ? 'bg-primary text-white'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Challenges List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">挑戰列表</CardTitle>
          <CardDescription>共 {challenges.length} 個挑戰</CardDescription>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              沒有符合條件的挑戰
            </p>
          ) : (
            <div className="space-y-4">
              {challenges.map(challenge => {
                const status = getChallengeStatus(challenge);
                return (
                  <div
                    key={challenge.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      status === 'active' && 'border-green-300 bg-green-50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{challenge.title}</h3>
                          <Badge className={cn(statusColors[status])}>
                            {statusLabels[status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {challenge.description}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">開始：</span>
                            <span>{new Date(challenge.startDate).toLocaleDateString('zh-TW')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">結束：</span>
                            <span>{new Date(challenge.endDate).toLocaleDateString('zh-TW')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">獎品：</span>
                            <span>{challenge.prize}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">編輯</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
