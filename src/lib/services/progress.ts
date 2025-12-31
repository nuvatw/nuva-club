import { getClient } from '@/lib/supabase/client';
import type { UserCourseProgress, UserLessonProgress } from '@/types/database';

export async function enrollInCourse(userId: string, courseId: string): Promise<UserCourseProgress | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('user_course_progress')
    .upsert({
      user_id: userId,
      course_id: courseId,
      is_enrolled: true,
      enrolled_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error enrolling in course:', error);
    return null;
  }

  return data;
}

export async function getCourseProgress(userId: string, courseId: string): Promise<UserCourseProgress | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('user_course_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  courseId: string,
  progress: number,
  watchTime: number
): Promise<UserLessonProgress | null> {
  const supabase = getClient();

  const isCompleted = progress >= 90;

  const { data, error } = await supabase
    .from('user_lesson_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      progress: Math.min(progress, 100),
      watch_time: watchTime,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      last_watched_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating lesson progress:', error);
    return null;
  }

  // Check if all lessons in course are completed
  if (isCompleted) {
    await checkCourseCompletion(userId, courseId);
  }

  return data;
}

export async function markLessonComplete(
  userId: string,
  lessonId: string,
  courseId: string
): Promise<void> {
  const supabase = getClient();

  await supabase
    .from('user_lesson_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      progress: 100,
      is_completed: true,
      completed_at: new Date().toISOString(),
      last_watched_at: new Date().toISOString(),
    });

  await checkCourseCompletion(userId, courseId);
}

async function checkCourseCompletion(userId: string, courseId: string): Promise<void> {
  const supabase = getClient();

  // Get total lessons in course
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  // Get completed lessons
  const { count: completedLessons } = await supabase
    .from('user_lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('is_completed', true);

  if (totalLessons && completedLessons && completedLessons >= totalLessons) {
    // Mark course as completed
    await supabase
      .from('user_course_progress')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);
  }
}

export async function setCurrentLesson(userId: string, courseId: string, lessonId: string): Promise<void> {
  const supabase = getClient();

  await supabase
    .from('user_course_progress')
    .upsert({
      user_id: userId,
      course_id: courseId,
      current_lesson_id: lessonId,
      is_enrolled: true,
      enrolled_at: new Date().toISOString(),
    });
}

export async function getUserProgress(userId: string): Promise<{
  coursesInProgress: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  totalWatchTime: number;
}> {
  const supabase = getClient();

  const { count: coursesInProgress } = await supabase
    .from('user_course_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_enrolled', true)
    .eq('is_completed', false);

  const { count: coursesCompleted } = await supabase
    .from('user_course_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_completed', true);

  const { count: lessonsCompleted } = await supabase
    .from('user_lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_completed', true);

  const { data: watchTimeData } = await supabase
    .from('user_lesson_progress')
    .select('watch_time')
    .eq('user_id', userId);

  const totalWatchTime = watchTimeData?.reduce(
    (sum: number, lp: { watch_time: number | null }) => sum + (lp.watch_time || 0),
    0
  ) || 0;

  return {
    coursesInProgress: coursesInProgress || 0,
    coursesCompleted: coursesCompleted || 0,
    lessonsCompleted: lessonsCompleted || 0,
    totalWatchTime,
  };
}
