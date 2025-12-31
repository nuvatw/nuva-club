'use client';

import { useState, useEffect, useCallback } from 'react';
import { getClient } from '@/lib/supabase/client';
import type { UserCourseProgress, UserLessonProgress } from '@/types/database';

export function useCourseProgress(userId: string | undefined, courseId: string) {
  const [progress, setProgress] = useState<UserCourseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      const supabase = getClient();
      const { data } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      setProgress(data);
      setLoading(false);
    };

    fetchProgress();
  }, [userId, courseId]);

  const enroll = useCallback(async () => {
    if (!userId) return null;

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

    if (!error && data) {
      setProgress(data);
    }

    return data;
  }, [userId, courseId]);

  return { progress, loading, enroll };
}

export function useLessonProgress(
  userId: string | undefined,
  lessonId: string,
  courseId: string
) {
  const [progress, setProgress] = useState<UserLessonProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      const supabase = getClient();
      const { data } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      setProgress(data);
      setLoading(false);
    };

    fetchProgress();
  }, [userId, lessonId]);

  const updateProgress = useCallback(
    async (progressPercent: number, watchTime: number) => {
      if (!userId) return null;

      const isCompleted = progressPercent >= 90;

      const supabase = getClient();
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          progress: Math.min(progressPercent, 100),
          watch_time: watchTime,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          last_watched_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        setProgress(data);
      }

      return data;
    },
    [userId, lessonId, courseId]
  );

  const markComplete = useCallback(async () => {
    if (!userId) return null;

    const supabase = getClient();
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        progress: 100,
        is_completed: true,
        completed_at: new Date().toISOString(),
        last_watched_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setProgress(data);
    }

    return data;
  }, [userId, lessonId, courseId]);

  return { progress, loading, updateProgress, markComplete };
}

export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState({
    coursesInProgress: 0,
    coursesCompleted: 0,
    lessonsCompleted: 0,
    totalWatchTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      const supabase = getClient();

      const [
        { count: coursesInProgress },
        { count: coursesCompleted },
        { count: lessonsCompleted },
        { data: watchTimeData },
      ] = await Promise.all([
        supabase
          .from('user_course_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_enrolled', true)
          .eq('is_completed', false),
        supabase
          .from('user_course_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_completed', true),
        supabase
          .from('user_lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_completed', true),
        supabase
          .from('user_lesson_progress')
          .select('watch_time')
          .eq('user_id', userId),
      ]);

      const totalWatchTime = watchTimeData?.reduce(
        (sum: number, lp: { watch_time: number | null }) => sum + (lp.watch_time || 0),
        0
      ) || 0;

      setStats({
        coursesInProgress: coursesInProgress || 0,
        coursesCompleted: coursesCompleted || 0,
        lessonsCompleted: lessonsCompleted || 0,
        totalWatchTime,
      });
      setLoading(false);
    };

    fetchStats();
  }, [userId]);

  return { stats, loading };
}
