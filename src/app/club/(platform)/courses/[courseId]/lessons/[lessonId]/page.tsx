'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useUser, useDatabase } from '@/lib/mock';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}:${remainMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, isLoggedIn } = useUser();
  const { state, getCourseProgress, completeLesson, dispatch } = useDatabase();

  const [showCompletedToast, setShowCompletedToast] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/club/login');
    }
  }, [isLoggedIn, router]);

  const course = state.courses.find(c => c.id === courseId);
  const progress = getCourseProgress(courseId);
  const lesson = course?.lessons.find(l => l.id === lessonId);

  useEffect(() => {
    // Set current lesson when viewing
    if (course && lesson && progress?.isEnrolled) {
      dispatch({ type: 'START_LESSON', courseId, lessonId });
    }
  }, [courseId, lessonId, course, lesson, progress?.isEnrolled, dispatch]);

  if (!user) {
    return null;
  }

  if (!course || !lesson) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)}>
          ← 返回課程
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">課程單元不存在</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedLessons = progress?.completedLessons ?? [];
  const isCompleted = completedLessons.includes(lessonId);
  const currentIndex = course.lessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;

  const handleMarkComplete = () => {
    if (!isCompleted) {
      completeLesson(courseId, lessonId);
      setShowCompletedToast(true);
      setTimeout(() => setShowCompletedToast(false), 3000);
    }
  };

  const handleVideoEnded = () => {
    if (!isCompleted) {
      handleMarkComplete();
    }
  };

  // Calculate if all lessons are now complete
  const allLessonsComplete = course.lessons.every(l =>
    completedLessons.includes(l.id) || l.id === lessonId
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Completion Toast */}
      {showCompletedToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
          <CheckCircleIcon className="w-5 h-5" />
          <span>課程單元已完成！</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/club/courses/${courseId}`}>
            <Button variant="outline">← {course.title}</Button>
          </Link>
        </div>
        {isCompleted && (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            已完成
          </Badge>
        )}
      </div>

      {/* Lesson Title */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          第 {currentIndex + 1} 課 / 共 {course.lessonsCount} 課
        </p>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
      </div>

      {/* Video Player */}
      <Card className="overflow-hidden">
        <div className="aspect-video bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            onEnded={handleVideoEnded}
            poster={course.thumbnail}
          >
            <source src={lesson.videoUrl || '/placeholder-video.mp4'} type="video/mp4" />
            您的瀏覽器不支援影片播放
          </video>
        </div>
      </Card>

      {/* Lesson Info & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-medium">{lesson.title}</p>
              <p className="text-sm text-muted-foreground">
                時長：{formatDuration(lesson.videoDuration)}
              </p>
            </div>
            {!isCompleted ? (
              <Button onClick={handleMarkComplete} className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4" />
                標記完成
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="font-medium">已完成</span>
              </div>
            )}
          </div>
          {lesson.description && (
            <p className="text-muted-foreground mt-4">{lesson.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        {prevLesson ? (
          <Link href={`/club/courses/${courseId}/lessons/${prevLesson.id}`}>
            <Button variant="outline">
              ← 上一課
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link href={`/club/courses/${courseId}/lessons/${nextLesson.id}`}>
            <Button>
              下一課 →
            </Button>
          </Link>
        ) : allLessonsComplete ? (
          <Link href={`/club/courses/${courseId}`}>
            <Button className="bg-green-600 hover:bg-green-700">
              完成課程
            </Button>
          </Link>
        ) : (
          <Link href={`/club/courses/${courseId}`}>
            <Button variant="outline">
              返回課程
            </Button>
          </Link>
        )}
      </div>

      {/* Course Completed Banner */}
      {allLessonsComplete && isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700">
              <TrophyIcon className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-lg">恭喜！你已完成這門課程</h3>
                <p className="text-sm text-green-600">
                  繼續學習其他課程來提升你的等級
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">課程大綱</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {course.lessons.map((l, index) => {
            const lessonCompleted = completedLessons.includes(l.id);
            const isCurrent = l.id === lessonId;

            return (
              <Link
                key={l.id}
                href={`/club/courses/${courseId}/lessons/${l.id}`}
                className="block"
              >
                <div
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-all',
                    isCurrent
                      ? 'bg-primary/10 border border-primary/20'
                      : lessonCompleted
                      ? 'bg-green-50 hover:bg-green-100'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                      lessonCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {lessonCompleted ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={cn(
                    "flex-1 truncate text-sm",
                    lessonCompleted && "text-green-700",
                    isCurrent && "font-medium"
                  )}>
                    {l.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(l.videoDuration)}
                  </span>
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs">
                      目前
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
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

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  );
}
