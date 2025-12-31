'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import type { Challenge } from '@/types/database';

type StatusFilter = 'all' | 'upcoming' | 'active' | 'ended';

interface ChallengeWithStatus extends Challenge {
  status: 'upcoming' | 'active' | 'ended';
}

export default function ChallengesManagementPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading && profile && profile.role !== 'guardian') {
      router.push('/club/dashboard');
    }
  }, [authLoading, profile, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchChallenges = async () => {
      const supabase = getClient();
      const now = new Date();

      const { data } = await supabase
        .from('challenges')
        .select('*')
        .order('start_date', { ascending: false });

      if (data) {
        const withStatus = data.map((c: Challenge) => {
          const start = new Date(c.start_date);
          const end = new Date(c.end_date);
          let status: 'upcoming' | 'active' | 'ended' = 'upcoming';
          if (now < start) status = 'upcoming';
          else if (now > end) status = 'ended';
          else status = 'active';
          return { ...c, status };
        });
        setChallenges(withStatus);
      }
      setLoading(false);
    };

    fetchChallenges();
  }, [profile]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // Filter challenges
  const filteredChallenges = filter === 'all'
    ? challenges
    : challenges.filter(c => c.status === filter);

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

  const activeCount = challenges.filter(c => c.status === 'active').length;
  const upcomingCount = challenges.filter(c => c.status === 'upcoming').length;

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
            <p className="text-3xl font-bold">{challenges.length}</p>
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
          <CardDescription>共 {filteredChallenges.length} 個挑戰</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredChallenges.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              沒有符合條件的挑戰
            </p>
          ) : (
            <div className="space-y-4">
              {filteredChallenges.map(challenge => {
                return (
                  <div
                    key={challenge.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      challenge.status === 'active' && 'border-green-300 bg-green-50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{challenge.title}</h3>
                          <Badge className={cn(statusColors[challenge.status])}>
                            {statusLabels[challenge.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {challenge.description}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">開始：</span>
                            <span>{new Date(challenge.start_date).toLocaleDateString('zh-TW')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">結束：</span>
                            <span>{new Date(challenge.end_date).toLocaleDateString('zh-TW')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">獎品：</span>
                            <span>{challenge.prize || '-'}</span>
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
