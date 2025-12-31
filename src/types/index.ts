// User Roles
export type UserRole = 'vava' | 'nunu' | 'guardian';

// Subscription
export type PlanType = 'basic' | 'club';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'trial' | 'active' | 'canceled' | 'expired';

// Learning Levels (1-12)
export type LevelNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type StageNumber = 1 | 2 | 3 | 4;

export interface LevelInfo {
  level: LevelNumber;
  name: string;
  displayName: string; // e.g., "第 1 級"
  description: string;
  stage: StageNumber;
  stageName: string; // 入門/進階/高階/大師
  minScore: number;
  requiredCoursesCount: number;
}

export const STAGE_NAMES: Record<StageNumber, string> = {
  1: '入門',
  2: '進階',
  3: '高階',
  4: '大師',
};

export const LEVELS: LevelInfo[] = [
  { level: 1, name: '入門 I', displayName: '第 1 級', description: '開始你的 AI 旅程', stage: 1, stageName: '入門', minScore: 0, requiredCoursesCount: 4 },
  { level: 2, name: '入門 II', displayName: '第 2 級', description: '建立基礎', stage: 1, stageName: '入門', minScore: 10, requiredCoursesCount: 4 },
  { level: 3, name: '入門 III', displayName: '第 3 級', description: '培養信心', stage: 1, stageName: '入門', minScore: 20, requiredCoursesCount: 5 },
  { level: 4, name: '進階 I', displayName: '第 4 級', description: '拓展知識', stage: 2, stageName: '進階', minScore: 30, requiredCoursesCount: 4 },
  { level: 5, name: '進階 II', displayName: '第 5 級', description: '應用概念', stage: 2, stageName: '進階', minScore: 40, requiredCoursesCount: 4 },
  { level: 6, name: '進階 III', displayName: '第 6 級', description: '解決問題', stage: 2, stageName: '進階', minScore: 50, requiredCoursesCount: 5 },
  { level: 7, name: '高階 I', displayName: '第 7 級', description: '深入理解', stage: 3, stageName: '高階', minScore: 60, requiredCoursesCount: 4 },
  { level: 8, name: '高階 II', displayName: '第 8 級', description: '複雜應用', stage: 3, stageName: '高階', minScore: 70, requiredCoursesCount: 4 },
  { level: 9, name: '高階 III', displayName: '第 9 級', description: '專家技巧', stage: 3, stageName: '高階', minScore: 80, requiredCoursesCount: 4 },
  { level: 10, name: '大師 I', displayName: '第 10 級', description: '教導他人', stage: 4, stageName: '大師', minScore: 85, requiredCoursesCount: 4 },
  { level: 11, name: '大師 II', displayName: '第 11 級', description: '創造創新', stage: 4, stageName: '大師', minScore: 90, requiredCoursesCount: 4 },
  { level: 12, name: '大師 III', displayName: '第 12 級', description: 'AI 精通達成', stage: 4, stageName: '大師', minScore: 95, requiredCoursesCount: 4 },
];

export const getLevelsByStage = (stage: StageNumber) => LEVELS.filter(l => l.stage === stage);
export const getLevelInfo = (level: LevelNumber) => LEVELS.find(l => l.level === level)!;

// Exam Types
export type ExamType = 'placement' | 'level_up';

// Challenge Types
export type ChallengeStatus = 'upcoming' | 'active' | 'ended';

// Forum
export type ReactionEmoji = '🔥';

// Feedback Types
export type FeedbackType = 'check_in' | 'challenge_feedback';

// Coach Assignment
export type AssignmentStatus = 'active' | 'ended';
