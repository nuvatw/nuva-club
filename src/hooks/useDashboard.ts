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
      const now = new Date().toISOString();

      try {
        // Run all independent queries in parallel for faster loading
        const [
          courseProgressResult,
          activeChallengeResult,
          totalCoursesResult,
          completedCoursesResult,
        ] = await Promise.all([
          // 1. Get current course progress
          supabase
            .from('user_course_progress')
            .select(`*, course:courses(*)`)
            .eq('user_id', userId)
            .eq('is_enrolled', true)
            .eq('is_completed', false)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          // 2. Get active challenge
          supabase
            .from('challenges')
            .select('*')
            .lte('start_date', now)
            .gte('end_date', now)
            .order('start_date', { ascending: false })
            .limit(1)
            .maybeSingle(),
          // 3. Get total courses for level
          supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('level', userLevel),
          // 4. Get completed courses for level
          supabase
            .from('user_course_progress')
            .select(`*, course:courses!inner(level)`, { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_completed', true)
            .eq('course.level', userLevel),
        ]);

        const courseProgress = courseProgressResult.data;
        const activeChallenge = activeChallengeResult.data;

        // Process current course data
        let currentCourse: CurrentCourseData | null = null;
        if (courseProgress?.course) {
          // Fetch lesson data in parallel
          const [lessonsResult, completedLessonsResult, currentLessonResult] = await Promise.all([
            supabase
              .from('lessons')
              .select('*')
              .eq('course_id', courseProgress.course_id)
              .order('order', { ascending: true }),
            supabase
              .from('user_lesson_progress')
              .select('lesson_id')
              .eq('user_id', userId)
              .eq('course_id', courseProgress.course_id)
              .eq('is_completed', true),
            courseProgress.current_lesson_id
              ? supabase
                  .from('lessons')
                  .select('*')
                  .eq('id', courseProgress.current_lesson_id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
          ]);

          const completedIds = new Set(completedLessonsResult.data?.map(l => l.lesson_id) || []);
          let currentLesson = currentLessonResult.data;

          // If no current lesson, find first incomplete
          if (!currentLesson && lessonsResult.data) {
            currentLesson = lessonsResult.data.find(l => !completedIds.has(l.id)) || lessonsResult.data[0] || null;
          }

          currentCourse = {
            course: courseProgress.course as Course,
            progress: courseProgress,
            currentLesson,
            completedLessonsCount: completedIds.size,
          };
        }

        // Get challenge participation if there's an active challenge
        let challengeParticipation = null;
        if (activeChallenge) {
          const { data: participation } = await supabase
            .from('challenge_participations')
            .select('status, submission_url')
            .eq('user_id', userId)
            .eq('challenge_id', activeChallenge.id)
            .maybeSingle();
          challengeParticipation = participation;
        }

        setData({
          currentCourse,
          activeChallenge,
          challengeParticipation,
          completedCoursesForLevel: completedCoursesResult.count || 0,
          totalCoursesForLevel: totalCoursesResult.count || 0,
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
