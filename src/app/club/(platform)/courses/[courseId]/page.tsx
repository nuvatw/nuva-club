'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useUser, useDatabase, LEVELS } from '@/lib/mock';
import type { LevelNumber } from '@/types';

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs} 小時 ${mins} 分鐘`;
  }
  return `${minutes} 分鐘`;
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const { user, isLoggedIn } = useUser();
  const { state, getCourseProgress, enrollCourse } = useDatabase();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/club/login');
    }
  }, [isLoggedIn, router]);

  const course = state.courses.find(c => c.id === courseId);
  const progress = getCourseProgress(courseId);

  if (!user) {
    return null;
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/club/courses')}>
          ← 返回課程列表
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">課程不存在</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getLevelInfo = (level: number) => {
    return LEVELS.find((l) => l.level === level);
  };

  const levelInfo = getLevelInfo(course.level);
  const isEnrolled = progress?.isEnrolled ?? false;
  const completedLessons = progress?.completedLessons ?? [];
  const isLocked = course.level > user.level;

  const getNextLesson = () => {
    // Find first incomplete lesson
    const nextIncomplete = course.lessons.find(l => !completedLessons.includes(l.id));
    return nextIncomplete || course.lessons[0];
  };

  const handleEnroll = () => {
    enrollCourse(courseId);
  };

  const nextLesson = getNextLesson();
  const progressPercent = course.lessonsCount > 0
    ? (completedLessons.length / course.lessonsCount) * 100
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" onClick={() => router.push('/club/courses')}>
            ← 返回
          </Button>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{levelInfo?.displayName}</Badge>
              <span className="text-sm text-muted-foreground">
                {course.lessonsCount} 課 · {formatDuration(course.totalDuration)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {isLocked ? (
            <Button disabled variant="secondary">
              需達到{levelInfo?.displayName}
            </Button>
          ) : !isEnrolled ? (
            <Button size="lg" onClick={handleEnroll}>
              加入課程
            </Button>
          ) : nextLesson ? (
            <Link href={`/club/courses/${course.id}/lessons/${nextLesson.id}`}>
              <Button size="lg">
                {completedLessons.length === 0 ? '開始學習' : '繼續學習'}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Course Thumbnail */}
      {course.thumbnail && (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Progress Overview (only show if enrolled) */}
      {isEnrolled && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">課程進度</span>
              <span className="text-sm text-muted-foreground">
                {completedLessons.length}/{course.lessonsCount} 課完成
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all",
                  progress?.isCompleted ? "bg-green-500" : "bg-primary"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progress?.isCompleted && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckIcon className="w-4 h-4" />
                課程已完成
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {course.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">課程簡介</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{course.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">課程單元</CardTitle>
          <CardDescription>
            {isEnrolled ? '點擊單元開始觀看' : '加入課程後即可觀看'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {course.lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isCurrentLesson = progress?.currentLessonId === lesson.id;
            const canAccess = isEnrolled && !isLocked;

            return (
              <div key={lesson.id}>
                {canAccess ? (
                  <Link
                    href={`/club/courses/${course.id}/lessons/${lesson.id}`}
                    className="block"
                  >
                    <LessonItem
                      index={index}
                      title={lesson.title}
                      description={lesson.description}
                      duration={lesson.videoDuration}
                      isCompleted={isCompleted}
                      isCurrent={isCurrentLesson}
                    />
                  </Link>
                ) : (
                  <LessonItem
                    index={index}
                    title={lesson.title}
                    description={lesson.description}
                    duration={lesson.videoDuration}
                    isCompleted={isCompleted}
                    isCurrent={false}
                    isLocked={!isEnrolled || isLocked}
                  />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Enroll CTA at bottom */}
      {!isEnrolled && !isLocked && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold">準備好開始學習了嗎？</h3>
                <p className="text-sm text-muted-foreground">
                  加入課程後即可開始觀看所有單元
                </p>
              </div>
              <Button size="lg" onClick={handleEnroll}>
                加入課程
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface LessonItemProps {
  index: number;
  title: string;
  description?: string;
  duration: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked?: boolean;
}

function LessonItem({ index, title, description, duration, isCompleted, isCurrent, isLocked }: LessonItemProps) {
  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border transition-all',
        isCompleted && 'bg-green-50 border-green-200',
        isCurrent && !isCompleted && 'bg-primary/5 border-primary/20',
        !isLocked && !isCompleted && !isCurrent && 'hover:bg-muted/50',
        isLocked && 'opacity-60 cursor-not-allowed'
      )}
    >
      {/* Lesson Number */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-medium',
          isCompleted
            ? 'bg-green-500 text-white'
            : isCurrent
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isCompleted ? <CheckIcon className="w-5 h-5" /> : index + 1}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "font-medium truncate",
            isCompleted && "text-green-700"
          )}>
            第 {index + 1} 課：{title}
          </h3>
          {isCompleted && (
            <Badge variant="secondary" className="shrink-0 bg-green-100 text-green-700">
              已完成
            </Badge>
          )}
          {isCurrent && !isCompleted && (
            <Badge variant="secondary" className="shrink-0">
              進行中
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {description}
          </p>
        )}
      </div>

      {/* Duration */}
      <div className="text-sm text-muted-foreground shrink-0">
        {formatSeconds(duration)}
      </div>

      {/* Lock icon */}
      {isLocked && (
        <LockIcon className="w-5 h-5 text-muted-foreground" />
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
