// Re-export types
export { LEVELS, STAGE_NAMES, getLevelsByStage, getLevelInfo } from '@/types';
export type { LevelInfo, LevelNumber, StageNumber } from '@/types';

// Mock Data Exports
export * from './users';
export * from './courses';
export * from './challenges';
export * from './events';
export * from './posts';
export * from './messages';
export * from './feedback';

// User Context
export { UserProvider, useUser, useRole } from './user-context';

// Database Context
export { DatabaseProvider, useDatabase } from './database-context';
export type { UserCourseProgress, ChallengeParticipation, DatabaseState } from './database-context';

// Simulated Time Context
export { SimulatedTimeProvider, useSimulatedTime, useCurrentDate, useChallengeStatus } from './simulated-time-context';

// Challenge Utils
export * from '@/lib/utils/challenge-utils';
