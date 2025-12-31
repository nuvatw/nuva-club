'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Course } from '@/types/database';

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

interface CourseWithProgress extends Course {
  completedLessons: number;
  isEnrolled: boolean;
  isCompleted: boolean;
}

export default function CoursesPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [inProgressCourses, setInProgressCourses] = useState<CourseWithProgress[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [nextLevelCourses, setNextLevelCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchCourses = async () => {
      const supabase = getClient();

      // Get in-progress courses
      const { data: progressData } = await supabase
        .from('user_course_progress')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', profile.id)
        .eq('is_enrolled', true)
        .eq('is_completed', false);

      if (progressData) {
        const inProgress = await Promise.all(progressData.map(async (p: any) => {
          const { count } = await supabase
            .from('user_lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
            .eq('course_id', p.course_id)
            .eq('is_completed', true);

          return {
            ...p.course,
            completedLessons: count || 0,
            isEnrolled: true,
            isCompleted: false,
          };
        }));
        setInProgressCourses(inProgress);
      }

      // Get recommended courses (same level, not enrolled)
      const { data: enrolled } = await supabase
        .from('user_course_progress')
        .select('course_id')
        .eq('user_id', profile.id)
        .eq('is_enrolled', true);

      const enrolledIds = enrolled?.map(e => e.course_id) || [];

      const { data: recommended } = await supabase
        .from('courses')
        .select('*')
        .eq('level', profile.level)
        .not('id', 'in', `(${enrolledIds.length > 0 ? enrolledIds.join(',') : 'null'})`)
        .limit(6);

      setRecommendedCourses(recommended || []);

      // Get next level courses
      if (profile.level < 12) {
        const { data: nextLevel } = await supabase
          .from('courses')
          .select('*')
          .eq('level', profile.level + 1)
          .limit(3);

        setNextLevelCourses(nextLevel || []);
      }

      setLoading(false);
    };

    fetchCourses();
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

  const getLevelInfo = (level: number) => {
    return LEVELS.find((l) => l.level === level);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">我的課程</h1>
        <p className="text-muted-foreground">
          目前等級：<Badge variant="secondary">{getLevelInfo(profile.level)?.displayName}</Badge>
        </p>
      </div>

      {/* Currently Taking */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <PlayIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">正在學習</h2>
          <Badge variant="outline">{inProgressCourses.length}</Badge>
        </div>

        {inProgressCourses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">你還沒有開始任何課程</p>
              <p className="text-sm text-muted-foreground">從下方推薦課程開始你的學習旅程吧！</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {inProgressCourses.map((course) => {
              const progressPercent = course.lessons_count > 0
                ? (course.completedLessons / course.lessons_count) * 100
                : 0;
              const levelInfo = getLevelInfo(course.level);

              return (
                <Link key={course.id} href={`/club/courses/${course.id}`}>
                  <Card className="h-full hover:shadow-md transition-all cursor-pointer border-primary/20 bg-primary/5">
                    <div className="flex">
                      {/* Thumbnail */}
                      <div
                        className="w-32 h-full min-h-[120px] bg-cover bg-center rounded-l-lg shrink-0"
                        style={{ backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : undefined }}
                      >
                        {!course.thumbnail && (
                          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 rounded-l-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary/50">{course.title.charAt(0)}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {levelInfo?.displayName}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {course.lessons_count} 課 · {course.total_duration} 分鐘
                        </p>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">進度</span>
                            <span className="font-medium text-primary">
                              {course.completedLessons}/{course.lessons_count} 課
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommended Courses */}
      {recommendedCourses.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold">推薦課程</h2>
            <Badge variant="secondary">{getLevelInfo(profile.level)?.displayName}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedCourses.map((course) => (
              <Link key={course.id} href={`/club/courses/${course.id}`}>
                <Card className="h-full hover:shadow-md transition-all cursor-pointer">
                  {course.thumbnail ? (
                    <div
                      className="h-32 bg-cover bg-center rounded-t-lg"
                      style={{ backgroundImage: `url(${course.thumbnail})` }}
                    />
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary/30">{course.title.charAt(0)}</span>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{course.lessons_count} 課</span>
                      <span>{course.total_duration} 分鐘</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Next Level Preview */}
      {nextLevelCourses.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <LockIcon className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-muted-foreground">下一級課程預覽</h2>
            <Badge variant="outline">{getLevelInfo(profile.level + 1)?.displayName}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {nextLevelCourses.map((course) => (
              <Card key={course.id} className="h-full opacity-60">
                <div
                  className="h-28 bg-cover bg-center rounded-t-lg relative"
                  style={{ backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : undefined }}
                >
                  {!course.thumbnail && (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 rounded-t-lg" />
                  )}
                  <div className="absolute inset-0 bg-black/30 rounded-t-lg flex items-center justify-center">
                    <LockIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm line-clamp-1 text-muted-foreground">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    完成目前等級課程後解鎖
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Link to all courses */}
      <div className="text-center pt-4">
        <Link href="/club/levels" className="text-sm text-primary hover:underline">
          查看所有等級課程 →
        </Link>
      </div>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
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
