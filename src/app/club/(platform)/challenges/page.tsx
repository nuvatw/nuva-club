'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useUser, useDatabase } from '@/lib/mock';
import {
  MOCK_CHALLENGES,
  getChallengesForRole,
  getChallengesByYear,
  type MockChallenge,
  type FilteredChallenge,
} from '@/lib/mock/challenges';
import { useSimulatedTime } from '@/lib/mock/simulated-time-context';

const statusConfig = {
  upcoming: { label: '即將開始', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-700' },
  active: { label: '進行中', variant: 'default' as const, color: 'bg-purple-600 text-white' },
  ended: { label: '已結束', variant: 'outline' as const, color: 'bg-gray-100 text-gray-600' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
  });
}

function getRemainingTime(endDate: string, now: Date): string {
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return '已結束';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days} 天 ${hours} 小時`;
}

export default function ChallengesPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useUser();
  const { state, getChallengeParticipation, joinChallenge } = useDatabase();
  const { currentDate: simulatedDate } = useSimulatedTime();
  const [selectedYear, setSelectedYear] = useState(2025);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/club/login');
    }
  }, [isLoggedIn, router]);

  // 根據角色獲取挑戰列表
  const challenges = useMemo(() => {
    if (!user) return [];
    return getChallengesForRole(user.role, simulatedDate);
  }, [user, simulatedDate]);

  // 根據模擬時間重新計算狀態
  const categorizedChallenges = useMemo(() => {
    const now = simulatedDate;

    const recalculateStatus = (challenge: FilteredChallenge) => {
      if (!challenge.startDate || !challenge.endDate) return challenge;

      const start = new Date(challenge.startDate);
      const end = new Date(challenge.endDate);

      let status: 'upcoming' | 'active' | 'ended' = 'upcoming';
      if (now < start) status = 'upcoming';
      else if (now >= start && now <= end) status = 'active';
      else status = 'ended';

      return { ...challenge, status };
    };

    const updated = challenges.map(recalculateStatus);

    return {
      active: updated.find(c => c.status === 'active'),
      upcoming: updated.filter(c => c.status === 'upcoming'),
      ended: updated.filter(c => c.status === 'ended'),
    };
  }, [challenges, simulatedDate]);

  // 取得選定年份的挑戰
  const yearChallenges = useMemo(() => {
    return challenges
      .filter(c => c.year === selectedYear)
      .sort((a, b) => a.monthNum - b.monthNum);
  }, [challenges, selectedYear]);

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'guardian';
  const isCoach = user.role === 'nunu';
  const canSeeDetails = isAdmin || isCoach;

  const handleJoinChallenge = (challengeId: string) => {
    joinChallenge(challengeId, user.id);
  };

  const availableYears = [2024, 2025, 2026];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">季度挑戰</h1>
          <p className="text-muted-foreground">
            與社群成員一起挑戰，獲得火焰反應，贏取獎品！
          </p>
        </div>
        {isAdmin && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            管理員模式
          </Badge>
        )}
      </div>

      {/* 當前挑戰 */}
      {categorizedChallenges.active && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-purple-600" />
            當前挑戰
          </h2>
          <ActiveChallengeCard
            challenge={categorizedChallenges.active}
            userId={user.id}
            participation={getChallengeParticipation(categorizedChallenges.active.id, user.id)}
            onJoin={() => handleJoinChallenge(categorizedChallenges.active!.id)}
            now={simulatedDate}
          />
        </div>
      )}

      {/* 年度挑戰總覽 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">年度挑戰總覽</h2>
          <div className="flex gap-2">
            {availableYears.map(year => (
              <Button
                key={year}
                variant={selectedYear === year ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {yearChallenges.map((challenge) => {
            const participation = getChallengeParticipation(challenge.id, user.id);
            const isUpcoming = challenge.status === 'upcoming';
            const hasLimitedView = !canSeeDetails && isUpcoming;

            return (
              <Card
                key={challenge.id}
                className={cn(
                  'transition-all',
                  challenge.status === 'active' && 'border-purple-300 ring-2 ring-purple-100',
                  challenge.status === 'ended' && 'opacity-70',
                  hasLimitedView ? 'cursor-default' : 'hover:shadow-md cursor-pointer'
                )}
                onClick={() => !hasLimitedView && router.push(`/challenges/${challenge.id}`)}
              >
                {challenge.thumbnail && !hasLimitedView && (
                  <div
                    className="h-24 bg-cover bg-center rounded-t-lg"
                    style={{ backgroundImage: `url(${challenge.thumbnail})` }}
                  />
                )}

                {hasLimitedView && (
                  <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-4xl">{challenge.theme.emoji}</span>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-lg">{challenge.theme.emoji}</span>
                        {challenge.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {challenge.startDate ? formatShortDate(challenge.startDate) : challenge.month}
                      </CardDescription>
                    </div>
                    <Badge className={cn('text-xs flex-shrink-0', statusConfig[challenge.status].color)}>
                      {statusConfig[challenge.status].label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-2">
                  {hasLimitedView ? (
                    <p className="text-sm text-muted-foreground italic">
                      詳細資訊將在挑戰開始時公佈
                    </p>
                  ) : (
                    <>
                      {challenge.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {challenge.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {challenge.participantCount !== undefined && (
                          <span>{challenge.participantCount} 位參與者</span>
                        )}
                        {participation?.hasSubmitted && (
                          <Badge variant="secondary" className="text-xs">
                            已參與
                          </Badge>
                        )}
                      </div>
                    </>
                  )}

                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: 開啟編輯對話框
                        alert(`編輯挑戰：${challenge.title}`);
                      }}
                    >
                      編輯挑戰
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 即將開始的挑戰 */}
      {categorizedChallenges.upcoming.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">即將開始</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categorizedChallenges.upcoming.slice(0, 3).map((challenge) => {
              const hasLimitedView = !canSeeDetails;

              return (
                <Card
                  key={challenge.id}
                  className={cn(
                    'transition-all border-blue-100',
                    hasLimitedView ? 'cursor-default' : 'hover:shadow-md cursor-pointer'
                  )}
                >
                  <div className="h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center">
                    <span className="text-3xl">{challenge.theme.emoji}</span>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{challenge.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {challenge.startDate ? `開始日期：${formatDate(challenge.startDate)}` : challenge.month}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {hasLimitedView ? (
                      <p className="text-sm text-muted-foreground italic">
                        敬請期待
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {challenge.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 歷史挑戰 */}
      {categorizedChallenges.ended.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">歷史挑戰</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categorizedChallenges.ended.slice(0, 8).map((challenge) => {
              const participation = getChallengeParticipation(challenge.id, user.id);
              return (
                <Link key={challenge.id} href={`/club/challenges/${challenge.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer opacity-80">
                    {challenge.thumbnail && (
                      <div
                        className="h-20 bg-cover bg-center rounded-t-lg"
                        style={{ backgroundImage: `url(${challenge.thumbnail})` }}
                      />
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm line-clamp-1">{challenge.title}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">{challenge.month}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{challenge.participantCount} 人</span>
                        {participation?.hasSubmitted && (
                          <Badge variant="secondary" className="text-xs">
                            已參與
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ActiveChallengeCardProps {
  challenge: FilteredChallenge;
  userId: string;
  participation?: { hasSubmitted: boolean } | undefined;
  onJoin: () => void;
  now: Date;
}

function ActiveChallengeCard({ challenge, userId, participation, onJoin, now }: ActiveChallengeCardProps) {
  const hasJoined = !!participation;

  return (
    <Link href={`/club/challenges/${challenge.id}`}>
      <Card className="border-purple-200 bg-purple-50/30 hover:shadow-md transition-all cursor-pointer">
        <div className="md:flex">
          {challenge.thumbnail && (
            <div
              className="md:w-64 h-48 md:h-auto bg-cover bg-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
              style={{ backgroundImage: `url(${challenge.thumbnail})` }}
            />
          )}
          <div className="flex-1">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span>{challenge.theme.emoji}</span>
                    {challenge.title}
                  </CardTitle>
                  {challenge.startDate && challenge.endDate && (
                    <CardDescription className="mt-1">
                      {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                    </CardDescription>
                  )}
                </div>
                <Badge className="bg-purple-600">{statusConfig.active.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenge.description && (
                <p className="text-muted-foreground">{challenge.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {challenge.participantCount !== undefined && (
                  <span className="text-muted-foreground">
                    {challenge.participantCount} 位參與者
                  </span>
                )}
                {challenge.endDate && (
                  <span className="text-purple-600 font-medium">
                    剩餘 {getRemainingTime(challenge.endDate, now)}
                  </span>
                )}
              </div>

              {hasJoined ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      已加入挑戰
                    </Badge>
                    {participation?.hasSubmitted ? (
                      <Badge variant="secondary">已提交作品</Badge>
                    ) : (
                      <Badge variant="outline">尚未提交</Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                    查看詳情
                  </Button>
                </div>
              ) : (
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onJoin();
                  }}
                >
                  加入挑戰
                </Button>
              )}
            </CardContent>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  );
}
