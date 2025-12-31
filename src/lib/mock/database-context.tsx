'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { LevelNumber } from '@/types';
import { MOCK_COURSES, MockCourse, MockLesson } from './courses';
import { MOCK_CHALLENGES, MockChallenge } from './challenges';
import { MOCK_POSTS, MockPost } from './posts';

// User Progress Interface
export interface UserCourseProgress {
  courseId: string;
  isEnrolled: boolean;
  enrolledAt: string | null;
  completedLessons: string[]; // lessonIds
  currentLessonId: string | null;
  lessonProgress: Record<string, number>; // lessonId -> progress %
  isCompleted: boolean;
  completedAt: string | null;
}

// Challenge Participation Interface
export interface ChallengeParticipation {
  challengeId: string;
  userId: string;
  joinedAt: string;
  hasSubmitted: boolean;
  submissionPostId: string | null;
}

// Database State Interface
export interface DatabaseState {
  courses: MockCourse[];
  userProgress: Record<string, UserCourseProgress>; // courseId -> progress
  challenges: MockChallenge[];
  challengeParticipations: ChallengeParticipation[];
  posts: MockPost[];
  completedLevels: LevelNumber[]; // levels user has passed the test for
}

// Action Types
type DatabaseAction =
  | { type: 'ENROLL_COURSE'; courseId: string }
  | { type: 'UNENROLL_COURSE'; courseId: string }
  | { type: 'START_LESSON'; courseId: string; lessonId: string }
  | { type: 'UPDATE_LESSON_PROGRESS'; courseId: string; lessonId: string; progress: number }
  | { type: 'COMPLETE_LESSON'; courseId: string; lessonId: string }
  | { type: 'JOIN_CHALLENGE'; challengeId: string; userId: string }
  | { type: 'SUBMIT_CHALLENGE_POST'; challengeId: string; userId: string; postId: string }
  | { type: 'CREATE_POST'; post: MockPost }
  | { type: 'FIRE_POST'; postId: string; userId: string }
  | { type: 'UNFIRE_POST'; postId: string; userId: string }
  | { type: 'COMPLETE_LEVEL_TEST'; level: LevelNumber }
  | { type: 'LOAD_STATE'; state: DatabaseState };

// Initial state
const createInitialState = (): DatabaseState => {
  // Transform existing courses data into progress records
  const userProgress: Record<string, UserCourseProgress> = {};

  MOCK_COURSES.forEach(course => {
    const completedLessons = course.lessons
      .filter(l => l.isCompleted)
      .map(l => l.id);

    const lessonProgress: Record<string, number> = {};
    course.lessons.forEach(l => {
      lessonProgress[l.id] = l.progress ?? 0;
    });

    const currentLesson = course.lessons.find(l => !l.isCompleted && (l.progress ?? 0) > 0);

    userProgress[course.id] = {
      courseId: course.id,
      isEnrolled: course.isEnrolled ?? false,
      enrolledAt: course.isEnrolled ? new Date().toISOString() : null,
      completedLessons,
      currentLessonId: currentLesson?.id ?? null,
      lessonProgress,
      isCompleted: completedLessons.length === course.lessonsCount,
      completedAt: null,
    };
  });

  return {
    courses: MOCK_COURSES,
    userProgress,
    challenges: MOCK_CHALLENGES,
    challengeParticipations: [],
    posts: MOCK_POSTS,
    completedLevels: [],
  };
};

// Reducer
function databaseReducer(state: DatabaseState, action: DatabaseAction): DatabaseState {
  switch (action.type) {
    case 'ENROLL_COURSE': {
      const course = state.courses.find(c => c.id === action.courseId);
      if (!course) return state;

      const existingProgress = state.userProgress[action.courseId];
      const firstLesson = course.lessons[0];

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.courseId]: {
            ...existingProgress,
            courseId: action.courseId,
            isEnrolled: true,
            enrolledAt: new Date().toISOString(),
            currentLessonId: existingProgress?.currentLessonId ?? firstLesson?.id ?? null,
            completedLessons: existingProgress?.completedLessons ?? [],
            lessonProgress: existingProgress?.lessonProgress ?? {},
            isCompleted: false,
            completedAt: null,
          },
        },
      };
    }

    case 'UNENROLL_COURSE': {
      const existingProgress = state.userProgress[action.courseId];
      if (!existingProgress) return state;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.courseId]: {
            ...existingProgress,
            isEnrolled: false,
            enrolledAt: null,
          },
        },
      };
    }

    case 'START_LESSON': {
      const existingProgress = state.userProgress[action.courseId];
      if (!existingProgress) return state;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.courseId]: {
            ...existingProgress,
            currentLessonId: action.lessonId,
          },
        },
      };
    }

    case 'UPDATE_LESSON_PROGRESS': {
      const existingProgress = state.userProgress[action.courseId];
      if (!existingProgress) return state;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.courseId]: {
            ...existingProgress,
            lessonProgress: {
              ...existingProgress.lessonProgress,
              [action.lessonId]: action.progress,
            },
          },
        },
      };
    }

    case 'COMPLETE_LESSON': {
      const existingProgress = state.userProgress[action.courseId];
      const course = state.courses.find(c => c.id === action.courseId);
      if (!existingProgress || !course) return state;

      const newCompletedLessons = existingProgress.completedLessons.includes(action.lessonId)
        ? existingProgress.completedLessons
        : [...existingProgress.completedLessons, action.lessonId];

      // Find next lesson
      const currentLessonIndex = course.lessons.findIndex(l => l.id === action.lessonId);
      const nextLesson = course.lessons[currentLessonIndex + 1];

      const isCompleted = newCompletedLessons.length === course.lessonsCount;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.courseId]: {
            ...existingProgress,
            completedLessons: newCompletedLessons,
            currentLessonId: nextLesson?.id ?? null,
            lessonProgress: {
              ...existingProgress.lessonProgress,
              [action.lessonId]: 100,
            },
            isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : null,
          },
        },
      };
    }

    case 'JOIN_CHALLENGE': {
      const alreadyJoined = state.challengeParticipations.some(
        p => p.challengeId === action.challengeId && p.userId === action.userId
      );
      if (alreadyJoined) return state;

      return {
        ...state,
        challengeParticipations: [
          ...state.challengeParticipations,
          {
            challengeId: action.challengeId,
            userId: action.userId,
            joinedAt: new Date().toISOString(),
            hasSubmitted: false,
            submissionPostId: null,
          },
        ],
      };
    }

    case 'SUBMIT_CHALLENGE_POST': {
      return {
        ...state,
        challengeParticipations: state.challengeParticipations.map(p =>
          p.challengeId === action.challengeId && p.userId === action.userId
            ? { ...p, hasSubmitted: true, submissionPostId: action.postId }
            : p
        ),
      };
    }

    case 'CREATE_POST': {
      return {
        ...state,
        posts: [action.post, ...state.posts],
      };
    }

    case 'FIRE_POST': {
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === action.postId && !p.firedByUsers?.includes(action.userId)
            ? {
                ...p,
                fireCount: p.fireCount + 1,
                firedByUsers: [...(p.firedByUsers ?? []), action.userId],
                hasFired: true,
              }
            : p
        ),
      };
    }

    case 'UNFIRE_POST': {
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === action.postId && p.firedByUsers?.includes(action.userId)
            ? {
                ...p,
                fireCount: Math.max(0, p.fireCount - 1),
                firedByUsers: p.firedByUsers?.filter(id => id !== action.userId) ?? [],
                hasFired: false,
              }
            : p
        ),
      };
    }

    case 'COMPLETE_LEVEL_TEST': {
      if (state.completedLevels.includes(action.level)) return state;
      return {
        ...state,
        completedLevels: [...state.completedLevels, action.level].sort((a, b) => a - b),
      };
    }

    case 'LOAD_STATE': {
      return action.state;
    }

    default:
      return state;
  }
}

// Context
interface DatabaseContextType {
  state: DatabaseState;
  dispatch: React.Dispatch<DatabaseAction>;
  // Helper methods
  enrollCourse: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  joinChallenge: (challengeId: string, userId: string) => void;
  submitChallengePost: (challengeId: string, userId: string, postId: string) => void;
  createPost: (post: MockPost) => void;
  firePost: (postId: string, userId: string) => void;
  unfirePost: (postId: string, userId: string) => void;
  completeLevelTest: (level: LevelNumber) => void;
  // Getters
  getCourseProgress: (courseId: string) => UserCourseProgress | undefined;
  getEnrolledCourses: () => MockCourse[];
  getCurrentCourse: () => { course: MockCourse; progress: UserCourseProgress; currentLesson: MockLesson | undefined } | null;
  getChallengeParticipation: (challengeId: string, userId: string) => ChallengeParticipation | undefined;
  getCompletedCoursesForLevel: (level: LevelNumber) => number;
  getTotalCoursesForLevel: (level: LevelNumber) => number;
  isLevelCompleted: (level: LevelNumber) => boolean;
  canTakeLevelTest: (level: LevelNumber) => boolean;
  getChallengeLeaderboard: (challengeId: string) => MockPost[];
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

// Provider
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(databaseReducer, undefined, createInitialState);

  // Persist state to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nuva-database-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', state: { ...createInitialState(), ...parsed } });
      } catch (e) {
        console.error('Failed to load database state:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nuva-database-state', JSON.stringify({
      userProgress: state.userProgress,
      challengeParticipations: state.challengeParticipations,
      completedLevels: state.completedLevels,
    }));
  }, [state.userProgress, state.challengeParticipations, state.completedLevels]);

  // Helper methods
  const enrollCourse = (courseId: string) => dispatch({ type: 'ENROLL_COURSE', courseId });
  const completeLesson = (courseId: string, lessonId: string) => dispatch({ type: 'COMPLETE_LESSON', courseId, lessonId });
  const joinChallenge = (challengeId: string, userId: string) => dispatch({ type: 'JOIN_CHALLENGE', challengeId, userId });
  const submitChallengePost = (challengeId: string, userId: string, postId: string) => dispatch({ type: 'SUBMIT_CHALLENGE_POST', challengeId, userId, postId });
  const createPost = (post: MockPost) => dispatch({ type: 'CREATE_POST', post });
  const firePost = (postId: string, userId: string) => dispatch({ type: 'FIRE_POST', postId, userId });
  const unfirePost = (postId: string, userId: string) => dispatch({ type: 'UNFIRE_POST', postId, userId });
  const completeLevelTest = (level: LevelNumber) => dispatch({ type: 'COMPLETE_LEVEL_TEST', level });

  // Getters
  const getCourseProgress = (courseId: string) => state.userProgress[courseId];

  const getEnrolledCourses = () =>
    state.courses.filter(c => state.userProgress[c.id]?.isEnrolled);

  const getCurrentCourse = () => {
    const enrolledCourses = getEnrolledCourses();
    // Find course with progress but not completed
    for (const course of enrolledCourses) {
      const progress = state.userProgress[course.id];
      if (progress && !progress.isCompleted && progress.currentLessonId) {
        const currentLesson = course.lessons.find(l => l.id === progress.currentLessonId);
        return { course, progress, currentLesson };
      }
    }
    // Return first enrolled course if no specific progress
    if (enrolledCourses.length > 0) {
      const course = enrolledCourses[0];
      const progress = state.userProgress[course.id];
      const currentLesson = course.lessons[0];
      return { course, progress, currentLesson };
    }
    return null;
  };

  const getChallengeParticipation = (challengeId: string, userId: string) =>
    state.challengeParticipations.find(p => p.challengeId === challengeId && p.userId === userId);

  const getCompletedCoursesForLevel = (level: LevelNumber) => {
    return state.courses
      .filter(c => c.level === level)
      .filter(c => state.userProgress[c.id]?.isCompleted)
      .length;
  };

  const getTotalCoursesForLevel = (level: LevelNumber) => {
    return state.courses.filter(c => c.level === level).length;
  };

  const isLevelCompleted = (level: LevelNumber) => state.completedLevels.includes(level);

  const canTakeLevelTest = (level: LevelNumber) => {
    const total = getTotalCoursesForLevel(level);
    const completed = getCompletedCoursesForLevel(level);
    return total > 0 && completed >= total && !isLevelCompleted(level);
  };

  const getChallengeLeaderboard = (challengeId: string) => {
    return state.posts
      .filter(p => p.category === 'challenge' && p.challengeId === challengeId)
      .sort((a, b) => b.fireCount - a.fireCount)
      .slice(0, 10);
  };

  const value: DatabaseContextType = {
    state,
    dispatch,
    enrollCourse,
    completeLesson,
    joinChallenge,
    submitChallengePost,
    createPost,
    firePost,
    unfirePost,
    completeLevelTest,
    getCourseProgress,
    getEnrolledCourses,
    getCurrentCourse,
    getChallengeParticipation,
    getCompletedCoursesForLevel,
    getTotalCoursesForLevel,
    isLevelCompleted,
    canTakeLevelTest,
    getChallengeLeaderboard,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

// Hook
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
