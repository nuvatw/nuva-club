'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Challenge } from '@/types/database';

const statusConfig = {
  upcoming: { label: '即將開始', color: 'bg-blue-100 text-blue-700' },
  active: { label: '進行中', color: 'bg-purple-600 text-white' },
  ended: { label: '已結束', color: 'bg-gray-100 text-gray-600' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getRemainingTime(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return '已結束';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days} 天 ${hours} 小時`;
}

interface ChallengeWithStatus extends Challenge {
  status: 'upcoming' | 'active' | 'ended';
  hasJoined: boolean;
}

export default function ChallengesPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchChallenges = async () => {
      const supabase = getClient();
      const now = new Date();

      const { data: challengeData } = await supabase
        .from('challenges')
        .select('*')
        .order('start_date', { ascending: false });

      const { data: participations } = await supabase
        .from('challenge_participations')
        .select('challenge_id')
        .eq('user_id', profile.id);

      const joinedIds = new Set(participations?.map(p => p.challenge_id) || []);

      const withStatus = (challengeData || []).map((c: Challenge) => {
        const start = new Date(c.start_date);
        const end = new Date(c.end_date);
        let status: 'upcoming' | 'active' | 'ended' = 'upcoming';
        if (now < start) status = 'upcoming';
        else if (now >= start && now <= end) status = 'active';
        else status = 'ended';

        return {
          ...c,
          status,
          hasJoined: joinedIds.has(c.id),
        };
      });

      setChallenges(withStatus);
      setLoading(false);
    };

    fetchChallenges();
  }, [profile]);

  const handleJoinChallenge = async (challengeId: string) => {
    if (!profile) return;

    const supabase = getClient();
    await supabase
      .from('challenge_participations')
      .insert({
        user_id: profile.id,
        challenge_id: challengeId,
        status: 'joined',
      });

    setChallenges(prev =>
      prev.map(c =>
        c.id === challengeId ? { ...c, hasJoined: true } : c
      )
    );
  };

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

  const activeChallenge = challenges.find(c => c.status === 'active');
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');
  const endedChallenges = challenges.filter(c => c.status === 'ended');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">挑戰</h1>
        <p className="text-muted-foreground">
          與社群成員一起挑戰，贏取獎品！
        </p>
      </div>

      {/* Active Challenge */}
      {activeChallenge && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-purple-600" />
            當前挑戰
          </h2>
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-xl">{activeChallenge.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {formatDate(activeChallenge.start_date)} - {formatDate(activeChallenge.end_date)}
                  </CardDescription>
                </div>
                <Badge className={statusConfig.active.color}>{statusConfig.active.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{activeChallenge.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-purple-600 font-medium">
                  剩餘 {getRemainingTime(activeChallenge.end_date)}
                </span>
                <span className="text-muted-foreground">獎品: {activeChallenge.prize}</span>
              </div>
              {activeChallenge.hasJoined ? (
                <Badge className="bg-green-100 text-green-700">已加入挑戰</Badge>
              ) : (
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleJoinChallenge(activeChallenge.id)}
                >
                  加入挑戰
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upcoming Challenges */}
      {upcomingChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">即將開始</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingChallenges.map((challenge) => (
              <Card key={challenge.id} className="border-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{challenge.title}</CardTitle>
                  <CardDescription className="text-xs">
                    開始: {formatDate(challenge.start_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {challenge.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ended Challenges */}
      {endedChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">歷史挑戰</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {endedChallenges.slice(0, 8).map((challenge) => (
              <Card key={challenge.id} className="opacity-70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm line-clamp-1">{challenge.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {formatDate(challenge.end_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {challenge.hasJoined && (
                    <Badge variant="secondary" className="text-xs">已參與</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {challenges.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">目前沒有挑戰活動</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  );
}
