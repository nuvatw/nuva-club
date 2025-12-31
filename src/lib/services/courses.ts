import { getClient } from '@/lib/supabase/client';
import type { Course, Lesson, CourseWithProgress, LessonWithProgress } from '@/types/database';

export async function getCourses(): Promise<Course[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('level', { ascending: true });

  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }

  return data;
}

export async function getCoursesByLevel(level: number): Promise<Course[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('level', level)
    .order('title');

  if (error) {
    console.error('Error fetching courses by level:', error);
    return [];
  }

  return data;
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) {
    console.error('Error fetching course:', error);
    return null;
  }

  return data;
}

export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }

  return data;
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }

  return data;
}

export async function getCourseWithProgress(courseId: string, userId: string): Promise<CourseWithProgress | null> {
  const supabase = getClient();

  // Get course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return null;
  }

  // Get course progress
  const { data: progress } = await supabase
    .from('user_course_progress')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .single();

  // Get lessons with progress
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order', { ascending: true });

  const { data: lessonProgress } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', userId);

  const lessonsWithProgress: LessonWithProgress[] = (lessons || []).map((lesson: Lesson) => ({
    ...lesson,
    progress: lessonProgress?.find((lp: { lesson_id: string }) => lp.lesson_id === lesson.id),
  }));

  return {
    ...course,
    progress: progress || undefined,
    lessons: lessonsWithProgress,
  };
}

export async function getUserEnrolledCourses(userId: string): Promise<CourseWithProgress[]> {
  const supabase = getClient();

  const { data: enrollments, error } = await supabase
    .from('user_course_progress')
    .select(`
      *,
      course:courses(*)
    `)
    .eq('user_id', userId)
    .eq('is_enrolled', true);

  if (error || !enrollments) {
    return [];
  }

  return enrollments.map((e: {
    id: string;
    user_id: string;
    course_id: string;
    is_enrolled: boolean;
    enrolled_at: string | null;
    is_completed: boolean;
    completed_at: string | null;
    current_lesson_id: string | null;
    created_at: string;
    updated_at: string;
    course: unknown;
  }) => ({
    ...(e.course as Course),
    progress: {
      id: e.id,
      user_id: e.user_id,
      course_id: e.course_id,
      is_enrolled: e.is_enrolled,
      enrolled_at: e.enrolled_at,
      is_completed: e.is_completed,
      completed_at: e.completed_at,
      current_lesson_id: e.current_lesson_id,
      created_at: e.created_at,
      updated_at: e.updated_at,
    },
  }));
}
