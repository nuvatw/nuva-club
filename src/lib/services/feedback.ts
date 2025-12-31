import { getClient } from '@/lib/supabase/client';
import type { Feedback, Profile, Course, Lesson } from '@/types/database';

export interface FeedbackWithDetails extends Feedback {
  nunu: Profile;
  vava: Profile;
  course?: Course;
  lesson?: Lesson;
}

export async function getStudentFeedback(studentId: string): Promise<FeedbackWithDetails[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('feedback')
    .select(`
      *,
      nunu:profiles!feedback_nunu_id_fkey(*),
      vava:profiles!feedback_vava_id_fkey(*),
      course:courses(*),
      lesson:lessons(*)
    `)
    .eq('vava_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }

  return data.map((f: Feedback & { nunu: unknown; vava: unknown; course: unknown; lesson: unknown }) => ({
    ...f,
    nunu: f.nunu as Profile,
    vava: f.vava as Profile,
    course: f.course as Course | undefined,
    lesson: f.lesson as Lesson | undefined,
  }));
}

export async function getCoachFeedback(coachId: string): Promise<FeedbackWithDetails[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('feedback')
    .select(`
      *,
      nunu:profiles!feedback_nunu_id_fkey(*),
      vava:profiles!feedback_vava_id_fkey(*),
      course:courses(*),
      lesson:lessons(*)
    `)
    .eq('nunu_id', coachId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }

  return data.map((f: Feedback & { nunu: unknown; vava: unknown; course: unknown; lesson: unknown }) => ({
    ...f,
    nunu: f.nunu as Profile,
    vava: f.vava as Profile,
    course: f.course as Course | undefined,
    lesson: f.lesson as Lesson | undefined,
  }));
}

export async function createFeedback(
  nunuId: string,
  vavaId: string,
  content: string,
  rating?: number,
  courseId?: string,
  lessonId?: string
): Promise<Feedback | null> {
  const supabase = getClient();

  const feedbackId = `feedback-${Date.now()}`;

  const { data, error } = await supabase
    .from('feedback')
    .insert({
      id: feedbackId,
      nunu_id: nunuId,
      vava_id: vavaId,
      content,
      rating,
      course_id: courseId,
      lesson_id: lessonId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating feedback:', error);
    return null;
  }

  // Update feedback count in coach_students
  await supabase.rpc('increment_feedback_count', {
    coach_id: nunuId,
    student_id: vavaId,
  });

  return data;
}

export async function getFeedbackStats(coachId: string): Promise<{
  totalFeedback: number;
  averageRating: number;
  studentsHelped: number;
}> {
  const supabase = getClient();

  const { data: feedback, error } = await supabase
    .from('feedback')
    .select('rating, vava_id')
    .eq('nunu_id', coachId);

  if (error || !feedback) {
    return { totalFeedback: 0, averageRating: 0, studentsHelped: 0 };
  }

  const totalFeedback = feedback.length;
  const ratings = feedback.filter((f: { rating: number | null }) => f.rating !== null).map((f: { rating: number | null }) => f.rating!);
  const averageRating = ratings.length > 0
    ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
    : 0;
  const studentsHelped = new Set(feedback.map((f: { vava_id: string }) => f.vava_id)).size;

  return {
    totalFeedback,
    averageRating: Math.round(averageRating * 10) / 10,
    studentsHelped,
  };
}
