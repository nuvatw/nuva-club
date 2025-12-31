import type { FeedbackType } from '@/types';
import { MOCK_USERS } from './users';

export interface MockFeedback {
  id: string;
  studentId: string;
  nunuId: string;
  nunuName: string;
  nunuImage: string;
  type: FeedbackType;
  checkInContent?: string;
  feedbackContent: string;
  rating?: number;
  isRead: boolean;
  createdAt: string;
}

export interface MockCoachStudent {
  id: string;
  assignmentId: string;
  name: string;
  email: string;
  image: string;
  level: number;
  planType: string;
  subscriptionStatus: string;
  cohortMonth: string;
  assignedAt: string;
  feedbackCount: number;
}

export const MOCK_FEEDBACK: MockFeedback[] = [
  {
    id: 'feedback-1',
    studentId: 'user-xiaomei',
    nunuId: 'user-ajie',
    nunuName: '阿傑',
    nunuImage: MOCK_USERS[1].image,
    type: 'check_in',
    checkInContent: '完成 AI 基礎入門課程第 3 課',
    feedbackContent: '進度很棒，小美！我注意到你很快地學完基礎。你關於機器學習和深度學習的問題顯示出很好的批判性思維。下一步建議在進入提示詞工程課程前，先嘗試一些實作練習。',
    rating: 4,
    isRead: true,
    createdAt: '2024-10-20T14:00:00Z',
  },
  {
    id: 'feedback-2',
    studentId: 'user-xiaomei',
    nunuId: 'user-ajie',
    nunuName: '阿傑',
    nunuImage: MOCK_USERS[1].image,
    type: 'challenge_feedback',
    feedbackContent: '很喜歡你十一月的生產力技巧投稿！會議記錄摘要的點子很實用，展現了對 AI 工具的實際應用。建議：你也可以試著用 AI 生成有截止日期的後續行動項目。繼續加油！',
    rating: 5,
    isRead: true,
    createdAt: '2024-11-25T10:00:00Z',
  },
  {
    id: 'feedback-3',
    studentId: 'user-xiaomei',
    nunuId: 'user-ajie',
    nunuName: '阿傑',
    nunuImage: MOCK_USERS[1].image,
    type: 'check_in',
    checkInContent: '開始提示詞工程精通課程',
    feedbackContent: '很高興看到你開始學提示詞工程！這是真正有趣的部分。記得如果可以的話，多用不同的 AI 模型練習——每個都有自己的特點。有任何地方卡住就讓我知道。',
    isRead: false,
    createdAt: '2024-12-15T09:00:00Z',
  },
  {
    id: 'feedback-4',
    studentId: 'user-yating',
    nunuId: 'user-ajie',
    nunuName: '阿傑',
    nunuImage: MOCK_USERS[1].image,
    type: 'check_in',
    feedbackContent: '你在等級 5 的進展很棒！我看到你對成為教練有興趣——太好了。開始觀察我怎麼給回饋，試著在論壇向其他人解釋概念。這是很好的練習！',
    rating: 4,
    isRead: true,
    createdAt: '2024-12-10T11:00:00Z',
  },
  {
    id: 'feedback-5',
    studentId: 'user-xiaofang',
    nunuId: 'user-ajie',
    nunuName: '阿傑',
    nunuImage: MOCK_USERS[1].image,
    type: 'check_in',
    feedbackContent: '歡迎加入俱樂部，小芳！我看到你的第一個 AI 專案貼文了——那個烘焙坊聊天機器人是很棒的第一個專案！從真實商業問題開始顯示出很好的主動性。我們來幫它加一些錯誤處理，讓它更有對話感。',
    rating: 4,
    isRead: true,
    createdAt: '2024-12-23T08:00:00Z',
  },
];

export const MOCK_COACH_STUDENTS: MockCoachStudent[] = [
  {
    id: 'user-xiaomei',
    assignmentId: 'assign-1',
    name: '小美',
    email: 'xiaomei@example.com',
    image: MOCK_USERS[0].image,
    level: 3,
    planType: 'basic',
    subscriptionStatus: 'active',
    cohortMonth: '2024-10',
    assignedAt: '2024-10-16T00:00:00Z',
    feedbackCount: 3,
  },
  {
    id: 'user-yating',
    assignmentId: 'assign-2',
    name: '雅婷',
    email: 'yating@example.com',
    image: MOCK_USERS[2].image,
    level: 5,
    planType: 'club',
    subscriptionStatus: 'active',
    cohortMonth: '2024-08',
    assignedAt: '2024-08-25T00:00:00Z',
    feedbackCount: 1,
  },
  {
    id: 'user-xiaofang',
    assignmentId: 'assign-3',
    name: '小芳',
    email: 'xiaofang@example.com',
    image: MOCK_USERS[4].image,
    level: 2,
    planType: 'basic',
    subscriptionStatus: 'trial',
    cohortMonth: '2024-11',
    assignedAt: '2024-11-05T00:00:00Z',
    feedbackCount: 1,
  },
];

export const getFeedbackForStudent = (studentId: string) =>
  MOCK_FEEDBACK.filter(f => f.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const getFeedbackByCoach = (nunuId: string) =>
  MOCK_FEEDBACK.filter(f => f.nunuId === nunuId);

export const getUnreadFeedbackCount = (studentId: string) =>
  MOCK_FEEDBACK.filter(f => f.studentId === studentId && !f.isRead).length;

export const getStudentsForCoach = (nunuId: string) => MOCK_COACH_STUDENTS;
