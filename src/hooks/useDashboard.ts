'use client';

import { useState, useEffect } from 'react';
import { getClient } from '@/lib/supabase/client';
import type { Course, Challenge, UserCourseProgress, Lesson } from '@/types/database';

interface CurrentCourseData {
  course: Course;
  progress: UserCourseProgress;
  currentLesson: Lesson | null;
  completedLessonsCount: number;
}

interface DashboardData {
  currentCourse: CurrentCourseData | null;
  activeChallenge: Challenge | null;
  challengeParticipation: { status: string; submission_url: string | null } | null;
  completedCoursesForLevel: number;
  totalCoursesForLevel: number;
  loading: boolean;
}

export function useDashboard(userId: string | undefined, userLevel: number | undefined): DashboardData {
  const [data, setData] = useState<DashboardData>({
    currentCourse: null,
    activeChallenge: null,
    challengeParticipation: null,
    completedCoursesForLevel: 0,
    totalCoursesForLevel: 0,
    loading: true,
  });

  useEffect(() => {
    if (!userId || !userLevel) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchDashboardData = async () => {
      const supabase = getClient();

      try {
        // 1. Get current course (most recently updated, not completed)
        const { data: courseProgress } = await supabase
          .from('user_course_progress')
          .select(`
            *,
            course:courses(*)
          `)
          .eq('user_id', userId)
          .eq('is_enrolled', true)
          .eq('is_completed', false)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        let currentCourse: CurrentCourseData | null = null;

        if (courseProgress?.course) {
          // Get current lesson
          let currentLesson: Lesson | null = null;
          if (courseProgress.current_lesson_id) {
            const { data: lesson } = await supabase
              .from('lessons')
              .select('*')
              .eq('id', courseProgress.current_lesson_id)
              .single();
            currentLesson = lesson;
          }

          // If no current lesson set, get the first incomplete lesson
          if (!currentLesson) {
            const { data: incompleteLessons } = await supabase
              .from('lessons')
              .select('*')
              .eq('course_id', courseProgress.course_id)
              .order('order', { ascending: true });

            const { data: completedLessonIds } = await supabase
              .from('user_lesson_progress')
              .select('lesson_id')
              .eq('user_id', userId)
              .eq('course_id', courseProgress.course_id)
              .eq('is_completed', true);

            const completedIds = new Set(completedLessonIds?.map(l => l.lesson_id) || []);
            currentLesson = incompleteLessons?.find(l => !completedIds.has(l.id)) || incompleteLessons?.[0] || null;
          }

          // Get completed lessons count
          const { count: completedCount } = await supabase
            .from('user_lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('course_id', courseProgress.course_id)
            .eq('is_completed', true);

          currentCourse = {
            course: courseProgress.course as Course,
            progress: courseProgress,
            currentLesson,
            completedLessonsCount: completedCount || 0,
          };
        }

        // 2. Get active challenge
        const now = new Date().toISOString();
        const { data: activeChallenge } = await supabase
          .from('challenges')
          .select('*')
          .lte('start_date', now)
          .gte('end_date', now)
          .order('start_date', { ascending: false })
          .limit(1)
          .single();

        // 3. Get challenge participation if there's an active challenge
        let challengeParticipation = null;
        if (activeChallenge) {
          const { data: participation } = await supabase
            .from('challenge_participations')
            .select('status, submission_url')
            .eq('user_id', userId)
            .eq('challenge_id', activeChallenge.id)
            .single();
          challengeParticipation = participation;
        }

        // 4. Get level progress (courses for current level)
        const { count: totalCoursesForLevel } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('level', userLevel);

        const { count: completedCoursesForLevel } = await supabase
          .from('user_course_progress')
          .select(`
            *,
            course:courses!inner(level)
          `, { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_completed', true)
          .eq('course.level', userLevel);

        setData({
          currentCourse,
          activeChallenge,
          challengeParticipation,
          completedCoursesForLevel: completedCoursesForLevel || 0,
          totalCoursesForLevel: totalCoursesForLevel || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, [userId, userLevel]);

  return data;
}

// Level definitions
export const LEVELS = [
  { level: 1, displayName: 'Lv.1', stageName: '入門', stageNameEn: 'Beginner' },
  { level: 2, displayName: 'Lv.2', stageName: '入門', stageNameEn: 'Beginner' },
  { level: 3, displayName: 'Lv.3', stageName: '入門', stageNameEn: 'Beginner' },
  { level: 4, displayName: 'Lv.4', stageName: '進階', stageNameEn: 'Intermediate' },
  { level: 5, displayName: 'Lv.5', stageName: '進階', stageNameEn: 'Intermediate' },
  { level: 6, displayName: 'Lv.6', stageName: '進階', stageNameEn: 'Intermediate' },
  { level: 7, displayName: 'Lv.7', stageName: '高階', stageNameEn: 'Advanced' },
  { level: 8, displayName: 'Lv.8', stageName: '高階', stageNameEn: 'Advanced' },
  { level: 9, displayName: 'Lv.9', stageName: '高階', stageNameEn: 'Advanced' },
  { level: 10, displayName: 'Lv.10', stageName: '專家', stageNameEn: 'Expert' },
  { level: 11, displayName: 'Lv.11', stageName: '專家', stageNameEn: 'Expert' },
  { level: 12, displayName: 'Lv.12', stageName: '大師', stageNameEn: 'Master' },
];
