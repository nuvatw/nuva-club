'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, useRole, getActiveChallenge, LEVELS, useDatabase, getCoursesByLevel } from '@/lib/mock';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useUser();
  const { isNunu, isGuardian } = useRole();
  const { getCurrentCourse, getChallengeParticipation, getCompletedCoursesForLevel, getTotalCoursesForLevel } = useDatabase();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/club/login');
    }
  }, [isLoggedIn, router]);

  if (!user) {
    return null;
  }

  if (isNunu) {
    router.push('/nunu/dashboard');
    return null;
  }
  if (isGuardian) {
    router.push('/guardian/dashboard');
    return null;
  }

  const activeChallenge = getActiveChallenge();
  const currentCourse = getCurrentCourse();
  const levelInfo = LEVELS.find(l => l.level === user.level);
  const challengeParticipation = activeChallenge
    ? getChallengeParticipation(activeChallenge.id, user.id)
    : undefined;
  const hasJoinedChallenge = !!challengeParticipation;

  // Calculate remaining time for challenge
  const getRemainingTime = () => {
    if (!activeChallenge) return null;
    const endDate = new Date(activeChallenge.endDate);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    if (diff <= 0) return '已結束';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} 天 ${hours} 小時`;
  };

  // Calculate level progress
  const completedCourses = getCompletedCoursesForLevel(user.level);
  const totalCourses = getTotalCoursesForLevel(user.level);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold">歡迎回來，{user.name}！</h1>
        <p className="text-muted-foreground">繼續你的 AI 學習之旅</p>
      </div>

      {/* Three Main Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Level Card */}
        <Link href="/club/levels" className="block">
          <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <LevelIcon />
                <CardTitle className="text-base">目前等級</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-primary">{levelInfo?.displayName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{levelInfo?.stageName}階段</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">課程進度</span>
                    <span className="font-medium">{completedCourses}/{totalCourses} 完成</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-primary text-center pt-2">
                  查看等級詳情 →
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Continue Watching Card */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-green-600">
              <PlayIcon />
              <CardTitle className="text-base">繼續觀看</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {currentCourse ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <img
                    src={currentCourse.course.thumbnail}
                    alt={currentCourse.course.title}
                    className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{currentCourse.course.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {currentCourse.currentLesson?.title || '開始學習'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">進度</span>
                    <span>
                      {currentCourse.progress.completedLessons.length}/{currentCourse.course.lessonsCount} 課
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${(currentCourse.progress.completedLessons.length / currentCourse.course.lessonsCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <Link
                  href={
                    currentCourse.currentLesson
                      ? `/courses/${currentCourse.course.id}/lessons/${currentCourse.currentLesson.id}`
                      : `/courses/${currentCourse.course.id}`
                  }
                >
                  <Button className="w-full" size="sm">
                    繼續觀看
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">
                  尚無進行中的課程
                </p>
                <Link href="/club/courses">
                  <Button variant="outline" size="sm">
                    開始學習
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Challenge Card */}
        <Link href="/club/challenges" className="block md:col-span-2 lg:col-span-1">
          <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-purple-600">
                <TrophyIcon />
                <CardTitle className="text-base">每月挑戰</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {activeChallenge ? (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={activeChallenge.thumbnail}
                      alt={activeChallenge.title}
                      className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{activeChallenge.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {activeChallenge.description}
                      </p>
                    </div>
                  </div>

                  {hasJoinedChallenge ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          已加入挑戰
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>剩餘時間</span>
                        <span className="font-medium text-foreground">{getRemainingTime()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>我的作品</span>
                        <span className="font-medium text-foreground">
                          {challengeParticipation?.hasSubmitted ? '已提交' : '尚未提交'}
                        </span>
                      </div>
                      <Button variant="outline" className="w-full" size="sm">
                        查看詳情
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{activeChallenge.participantCount} 位參與者</span>
                        <span>剩餘 {getRemainingTime()}</span>
                      </div>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm">
                        加入挑戰
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    本月暫無挑戰，敬請期待！
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function LevelIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  );
}
