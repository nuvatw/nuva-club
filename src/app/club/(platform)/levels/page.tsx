'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, useDatabase, LEVELS } from '@/lib/mock';
import type { LevelNumber } from '@/types';
import { cn } from '@/lib/utils/cn';

export default function LevelsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useUser();
  const {
    state,
    getCompletedCoursesForLevel,
    getTotalCoursesForLevel,
    isLevelCompleted,
    canTakeLevelTest,
    getCourseProgress,
  } = useDatabase();

  const [selectedLevel, setSelectedLevel] = useState<LevelNumber | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/club/login');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    // Auto-select user's current level on load
    if (user && !selectedLevel) {
      setSelectedLevel(user.level);
    }
  }, [user, selectedLevel]);

  if (!user) {
    return null;
  }

  const userLevel = user.level;
  const levels: LevelNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const getLevelStatus = (level: LevelNumber): 'completed' | 'current' | 'locked' => {
    if (isLevelCompleted(level)) return 'completed';
    if (level === userLevel) return 'current';
    if (level < userLevel) return 'completed';
    return 'locked';
  };

  const getCoursesForLevel = (level: LevelNumber) => {
    return state.courses.filter(c => c.level === level);
  };

  const selectedLevelInfo = selectedLevel ? LEVELS.find(l => l.level === selectedLevel) : null;
  const selectedCourses = selectedLevel ? getCoursesForLevel(selectedLevel) : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">等級總覽</h1>
        <p className="text-muted-foreground">點擊等級查看課程內容</p>
      </div>

      {/* 12 Level Grid - Horizontal */}
      <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
        {levels.map(level => {
          const status = getLevelStatus(level);
          const completedCourses = getCompletedCoursesForLevel(level);
          const totalCourses = getTotalCoursesForLevel(level);
          const isSelected = selectedLevel === level;

          return (
            <button
              key={level}
              onClick={() => status !== 'locked' && setSelectedLevel(level)}
              disabled={status === 'locked'}
              className={cn(
                'relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all',
                'border-2 font-bold text-lg',
                status === 'locked' && 'opacity-40 cursor-not-allowed bg-muted border-muted',
                status === 'completed' && !isSelected && 'bg-green-50 border-green-300 text-green-700 hover:border-green-500',
                status === 'current' && !isSelected && 'bg-primary/10 border-primary text-primary hover:bg-primary/20',
                isSelected && 'ring-2 ring-offset-2 ring-primary bg-primary text-white border-primary',
                status !== 'locked' && !isSelected && 'hover:scale-105 cursor-pointer'
              )}
            >
              <span className="text-xl md:text-2xl">{level}</span>
              {status === 'completed' && !isSelected && (
                <CheckIcon className="absolute top-1 right-1 w-4 h-4 text-green-600" />
              )}
              {status === 'locked' && (
                <LockIcon className="absolute top-1 right-1 w-3 h-3 text-muted-foreground" />
              )}
              {/* Progress indicator */}
              {status !== 'locked' && totalCourses > 0 && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="h-1 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        isSelected ? 'bg-white/60' : status === 'completed' ? 'bg-green-500' : 'bg-primary'
                      )}
                      style={{ width: `${(completedCourses / totalCourses) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Stage Labels */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground">
        <div className="border-t pt-2">
          <span className="font-medium">入門</span>
          <span className="block text-[10px]">Level 1-3</span>
        </div>
        <div className="border-t pt-2">
          <span className="font-medium">進階</span>
          <span className="block text-[10px]">Level 4-6</span>
        </div>
        <div className="border-t pt-2">
          <span className="font-medium">高階</span>
          <span className="block text-[10px]">Level 7-9</span>
        </div>
        <div className="border-t pt-2">
          <span className="font-medium">大師</span>
          <span className="block text-[10px]">Level 10-12</span>
        </div>
      </div>

      {/* Selected Level Detail */}
      {selectedLevel && selectedLevelInfo && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl',
                  getLevelStatus(selectedLevel) === 'completed' ? 'bg-green-100 text-green-700' :
                  getLevelStatus(selectedLevel) === 'current' ? 'bg-primary text-white' :
                  'bg-muted text-muted-foreground'
                )}>
                  {selectedLevel}
                </div>
                <div>
                  <CardTitle className="text-lg">{selectedLevelInfo.displayName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedLevelInfo.stageName}階段</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">課程進度</p>
                <p className="text-lg font-semibold">
                  {getCompletedCoursesForLevel(selectedLevel)}/{getTotalCoursesForLevel(selectedLevel)} 完成
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Course List */}
            <div className="space-y-2">
              {selectedCourses.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">此等級尚無課程</p>
              ) : (
                selectedCourses.map(course => {
                  const progress = getCourseProgress(course.id);
                  const isCompleted = progress?.isCompleted;
                  const isInProgress = progress?.isEnrolled && !isCompleted && (progress?.completedLessons?.length ?? 0) > 0;
                  const isEnrolled = progress?.isEnrolled;

                  return (
                    <Link
                      key={course.id}
                      href={`/club/courses/${course.id}`}
                      className="block"
                    >
                      <div className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md',
                        isCompleted ? 'bg-green-50 border-green-200' :
                        isInProgress ? 'bg-primary/5 border-primary/20' :
                        'hover:bg-muted/50'
                      )}>
                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                          ) : isInProgress ? (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <PlayCircleIcon className="w-6 h-6 text-primary" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <CircleIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-medium truncate',
                            isCompleted && 'text-green-700'
                          )}>
                            {course.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {course.lessonsCount} 課 · {course.totalDuration} 分鐘
                          </p>
                        </div>

                        {/* Progress / Status */}
                        <div className="flex-shrink-0 text-right">
                          {isCompleted ? (
                            <span className="text-sm font-medium text-green-600">已完成 ✓</span>
                          ) : isInProgress ? (
                            <div>
                              <span className="text-sm font-medium text-primary">
                                {progress?.completedLessons?.length}/{course.lessonsCount} 課
                              </span>
                              <div className="w-20 h-1.5 bg-muted rounded-full mt-1">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${((progress?.completedLessons?.length ?? 0) / course.lessonsCount) * 100}%` }}
                                />
                              </div>
                            </div>
                          ) : isEnrolled ? (
                            <span className="text-sm text-muted-foreground">未開始</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">未報名</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Level Test CTA */}
            {canTakeLevelTest(selectedLevel) && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="font-medium text-primary mb-2">
                  恭喜！你已完成 {selectedLevelInfo.displayName} 所有課程
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  準備好挑戰升級測驗了嗎？通過測驗即可解鎖第 {selectedLevel + 1} 級課程！
                </p>
                <Link href={`/placement?type=level_up&targetLevel=${selectedLevel + 1}`}>
                  <Button className="w-full">開始升級測驗</Button>
                </Link>
              </div>
            )}

            {/* Already completed */}
            {isLevelCompleted(selectedLevel) && selectedLevel < 12 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-medium">測驗已通過！已解鎖第 {selectedLevel + 1} 級</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Icon Components
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function PlayCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
    </svg>
  );
}

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
