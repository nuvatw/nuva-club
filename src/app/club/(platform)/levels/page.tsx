'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Course } from '@/types/database';
import { cn } from '@/lib/utils/cn';

type LevelNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

const LEVELS = [
  { level: 1, displayName: 'Lv.1', stageName: '入門' },
  { level: 2, displayName: 'Lv.2', stageName: '入門' },
  { level: 3, displayName: 'Lv.3', stageName: '入門' },
  { level: 4, displayName: 'Lv.4', stageName: '進階' },
  { level: 5, displayName: 'Lv.5', stageName: '進階' },
  { level: 6, displayName: 'Lv.6', stageName: '進階' },
  { level: 7, displayName: 'Lv.7', stageName: '高階' },
  { level: 8, displayName: 'Lv.8', stageName: '高階' },
  { level: 9, displayName: 'Lv.9', stageName: '高階' },
  { level: 10, displayName: 'Lv.10', stageName: '專家' },
  { level: 11, displayName: 'Lv.11', stageName: '專家' },
  { level: 12, displayName: 'Lv.12', stageName: '大師' },
];

interface LevelProgress {
  level: number;
  totalCourses: number;
  completedCourses: number;
}

export default function LevelsPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<LevelNumber | null>(null);
  const [levelProgress, setLevelProgress] = useState<Record<number, LevelProgress>>({});
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, { completed: number; isCompleted: boolean }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (profile && !selectedLevel) {
      setSelectedLevel(profile.level as LevelNumber);
    }
  }, [profile, selectedLevel]);

  useEffect(() => {
    if (!profile) return;

    const fetchLevelProgress = async () => {
      const supabase = getClient();

      const { data: courses } = await supabase
        .from('courses')
        .select('id, level');

      const { data: completed } = await supabase
        .from('user_course_progress')
        .select('course_id')
        .eq('user_id', profile.id)
        .eq('is_completed', true);

      const completedIds = new Set(completed?.map(c => c.course_id) || []);

      const progress: Record<number, LevelProgress> = {};
      for (let level = 1; level <= 12; level++) {
        const levelCourses = courses?.filter(c => c.level === level) || [];
        const completedCount = levelCourses.filter(c => completedIds.has(c.id)).length;
        progress[level] = {
          level,
          totalCourses: levelCourses.length,
          completedCourses: completedCount,
        };
      }
      setLevelProgress(progress);
      setLoading(false);
    };

    fetchLevelProgress();
  }, [profile]);

  useEffect(() => {
    if (!profile || !selectedLevel) return;

    const fetchCoursesForLevel = async () => {
      const supabase = getClient();

      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('level', selectedLevel)
        .order('id');

      setSelectedCourses(courses || []);

      if (courses && courses.length > 0) {
        const courseIds = courses.map(c => c.id);
        const { data: progress } = await supabase
          .from('user_course_progress')
          .select('course_id, is_completed')
          .eq('user_id', profile.id)
          .in('course_id', courseIds);

        const { data: lessonProgress } = await supabase
          .from('user_lesson_progress')
          .select('course_id')
          .eq('user_id', profile.id)
          .eq('is_completed', true)
          .in('course_id', courseIds);

        const progressMap: Record<string, { completed: number; isCompleted: boolean }> = {};
        courses.forEach(course => {
          const courseP = progress?.find(p => p.course_id === course.id);
          const lessonCount = lessonProgress?.filter(l => l.course_id === course.id).length || 0;
          progressMap[course.id] = {
            completed: lessonCount,
            isCompleted: courseP?.is_completed || false,
          };
        });
        setCourseProgress(progressMap);
      }
    };

    fetchCoursesForLevel();
  }, [profile, selectedLevel]);

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

  const userLevel = profile.level;
  const levels: LevelNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const getLevelStatus = (level: LevelNumber): 'completed' | 'current' | 'locked' => {
    const progress = levelProgress[level];
    if (progress && progress.completedCourses === progress.totalCourses && progress.totalCourses > 0) {
      return 'completed';
    }
    if (level === userLevel) return 'current';
    if (level < userLevel) return 'completed';
    return 'locked';
  };

  const selectedLevelInfo = selectedLevel ? LEVELS.find(l => l.level === selectedLevel) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">等級總覽</h1>
        <p className="text-muted-foreground">點擊等級查看課程內容</p>
      </div>

      <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
        {levels.map(level => {
          const status = getLevelStatus(level);
          const progress = levelProgress[level] || { totalCourses: 0, completedCourses: 0 };
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
              {status !== 'locked' && progress.totalCourses > 0 && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="h-1 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        isSelected ? 'bg-white/60' : status === 'completed' ? 'bg-green-500' : 'bg-primary'
                      )}
                      style={{ width: `${(progress.completedCourses / progress.totalCourses) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

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
                  {levelProgress[selectedLevel]?.completedCourses || 0}/{levelProgress[selectedLevel]?.totalCourses || 0} 完成
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedCourses.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">此等級尚無課程</p>
              ) : (
                selectedCourses.map(course => {
                  const progress = courseProgress[course.id];
                  const isCompleted = progress?.isCompleted;
                  const hasProgress = (progress?.completed || 0) > 0;

                  return (
                    <Link key={course.id} href={`/club/courses/${course.id}`} className="block">
                      <div className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md',
                        isCompleted ? 'bg-green-50 border-green-200' :
                        hasProgress ? 'bg-primary/5 border-primary/20' :
                        'hover:bg-muted/50'
                      )}>
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                          ) : hasProgress ? (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <PlayCircleIcon className="w-6 h-6 text-primary" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <CircleIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-medium truncate', isCompleted && 'text-green-700')}>
                            {course.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {course.lessons_count} 課 · {course.total_duration} 分鐘
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {isCompleted ? (
                            <span className="text-sm font-medium text-green-600">已完成</span>
                          ) : hasProgress ? (
                            <span className="text-sm font-medium text-primary">
                              {progress?.completed}/{course.lessons_count} 課
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">未開始</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

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
