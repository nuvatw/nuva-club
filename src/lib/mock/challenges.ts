import type { ChallengeStatus } from '@/types';
import { MOCK_USERS } from './users';
import { CHALLENGE_THEMES, CHALLENGE_START_DATES, CHALLENGE_DURATION_DAYS } from '@/lib/utils/challenge-utils';

export interface MockSubmission {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  fireCount: number;
  hasFired?: boolean;
  createdAt: string;
}

export interface MockChallenge {
  id: string;
  title: string;
  description: string;
  month: string;
  status: ChallengeStatus;
  thumbnail: string;
  startDate: string;
  endDate: string;
  submissions: MockSubmission[];
  mySubmission?: MockSubmission;
  participantCount: number;
  year: number;
  monthNum: number; // 1-12
  theme: typeof CHALLENGE_THEMES[number];
  // 管理員可編輯的欄位
  isEditable?: boolean;
  customTitle?: string;
  customDescription?: string;
}

// 根據月份取得挑戰封面圖
function getChallengeImage(month: number): string {
  const images: Record<number, string> = {
    1: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&h=450&fit=crop',
    3: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=450&fit=crop',
    4: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop',
    5: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=450&fit=crop',
    7: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=450&fit=crop',
    9: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
    11: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=450&fit=crop',
  };
  return images[month] || images[1];
}

// 計算挑戰狀態
function getChallengeStatusForDate(startDate: Date, endDate: Date, now: Date = new Date()): ChallengeStatus {
  if (now < startDate) return 'upcoming';
  if (now >= startDate && now <= endDate) return 'active';
  return 'ended';
}

// 生成某年的所有挑戰
export function generateYearChallenges(year: number, referenceDate: Date = new Date()): MockChallenge[] {
  return CHALLENGE_START_DATES.map(({ month }, index) => {
    const theme = CHALLENGE_THEMES[index];
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + CHALLENGE_DURATION_DAYS);

    const status = getChallengeStatusForDate(startDate, endDate, referenceDate);

    // 為已結束或進行中的挑戰生成一些模擬投稿
    const submissions: MockSubmission[] = [];
    let participantCount = 0;

    if (status === 'ended' || status === 'active') {
      participantCount = Math.floor(Math.random() * 50) + 20;

      // 生成一些範例投稿
      const sampleUsers = MOCK_USERS.slice(0, 4);
      sampleUsers.forEach((user, i) => {
        submissions.push({
          id: `sub-${year}-${month}-${i}`,
          userId: `user-${user.name.toLowerCase()}`,
          userName: user.name,
          userImage: user.image,
          content: `我的 ${theme.title} 挑戰作品！`,
          mediaUrl: getChallengeImage(month),
          mediaType: 'image',
          fireCount: Math.floor(Math.random() * 50) + 5,
          hasFired: Math.random() > 0.5,
          createdAt: new Date(startDate.getTime() + Math.random() * (CHALLENGE_DURATION_DAYS * 24 * 60 * 60 * 1000)).toISOString(),
        });
      });
    }

    return {
      id: `challenge-${year}-${month}`,
      title: theme.title,
      description: theme.description,
      month: `${year}-${String(month).padStart(2, '0')}`,
      status,
      thumbnail: getChallengeImage(month),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      submissions,
      participantCount,
      year,
      monthNum: month,
      theme,
      isEditable: true,
    };
  });
}

// 預設挑戰資料（2024, 2025, 2026）
const challenges2024 = generateYearChallenges(2024);
const challenges2025 = generateYearChallenges(2025);
const challenges2026 = generateYearChallenges(2026);

// 合併所有挑戰
export const MOCK_CHALLENGES: MockChallenge[] = [
  ...challenges2024,
  ...challenges2025,
  ...challenges2026,
].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

// 舊的手動定義的挑戰資料（保留向後相容）
export const LEGACY_CHALLENGES: MockChallenge[] = [
  {
    id: 'challenge-dec-2024',
    title: 'AI 節日賀卡創作',
    description: '使用 AI 圖像生成工具創作獨特的節日賀卡。與社群分享你的節慶作品，用 AI 傳遞溫暖祝福！',
    month: '2024-12',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=450&fit=crop',
    startDate: '2024-12-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    participantCount: 47,
    year: 2024,
    monthNum: 12,
    theme: CHALLENGE_THEMES[6],
    submissions: [
      {
        id: 'sub-1',
        userId: 'user-yating',
        userName: '雅婷',
        userImage: MOCK_USERS[2].image,
        content: '用 Midjourney 創作了冬季仙境賀卡！AI 完美捕捉了溫馨壁爐的氛圍。',
        mediaUrl: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600&h=400&fit=crop',
        mediaType: 'image',
        fireCount: 23,
        hasFired: true,
        createdAt: '2024-12-15T14:30:00Z',
      },
      {
        id: 'sub-2',
        userId: 'user-xiaofang',
        userName: '小芳',
        userImage: MOCK_USERS[4].image,
        content: '我的第一次 AI 藝術嘗試！用 DALL-E 創作了這個有友善機器人聖誕老人的雪景。',
        mediaUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop',
        mediaType: 'image',
        fireCount: 15,
        hasFired: false,
        createdAt: '2024-12-16T09:15:00Z',
      },
      {
        id: 'sub-3',
        userId: 'user-ajie',
        userName: '阿傑',
        userImage: MOCK_USERS[1].image,
        content: '結合多種 AI 工具 - 用 Claude 寫詩，Midjourney 做視覺。祝大家佳節愉快！',
        mediaUrl: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=600&h=400&fit=crop',
        mediaType: 'image',
        fireCount: 31,
        hasFired: true,
        createdAt: '2024-12-14T18:45:00Z',
      },
    ],
    mySubmission: undefined,
  },
];

// 工具函數
export const getActiveChallenge = () => MOCK_CHALLENGES.find(c => c.status === 'active');

export const getChallengeById = (id: string) => MOCK_CHALLENGES.find(c => c.id === id);

export const getChallengeByMonth = (month: string) => MOCK_CHALLENGES.find(c => c.month === month);

export const getChallengesByYear = (year: number) =>
  MOCK_CHALLENGES.filter(c => c.year === year)
    .sort((a, b) => a.monthNum - b.monthNum);

export const getUpcomingChallenges = (limit?: number) => {
  const upcoming = MOCK_CHALLENGES.filter(c => c.status === 'upcoming')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  return limit ? upcoming.slice(0, limit) : upcoming;
};

export const getEndedChallenges = (limit?: number) => {
  const ended = MOCK_CHALLENGES.filter(c => c.status === 'ended')
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  return limit ? ended.slice(0, limit) : ended;
};

export const getLeaderboard = (challengeId: string) => {
  const challenge = getChallengeById(challengeId);
  if (!challenge) return [];

  return [...challenge.submissions]
    .sort((a, b) => b.fireCount - a.fireCount)
    .slice(0, 10)
    .map((sub, index) => ({
      rank: index + 1,
      ...sub,
    }));
};

// 根據用戶角色過濾挑戰（vava 只能看到即將開始的挑戰標題）
export interface FilteredChallenge {
  id: string;
  title: string;
  month: string;
  status: ChallengeStatus;
  year: number;
  monthNum: number;
  theme: typeof CHALLENGE_THEMES[number];
  // 以下欄位可能被隱藏
  description?: string;
  thumbnail?: string;
  startDate?: string;
  endDate?: string;
  submissions?: MockSubmission[];
  participantCount?: number;
}

export function getChallengesForRole(
  role: 'vava' | 'nunu' | 'guardian',
  referenceDate: Date = new Date()
): FilteredChallenge[] {
  // Admin (guardian) 和教練 (nunu) 可以看到所有挑戰的完整資訊
  if (role === 'guardian' || role === 'nunu') {
    return MOCK_CHALLENGES.map(c => ({
      ...c,
    }));
  }

  // 學員 (vava) 只能看到：
  // 1. 已結束的挑戰（完整資訊）
  // 2. 進行中的挑戰（完整資訊）
  // 3. 即將開始的挑戰（只有標題和基本資訊）
  return MOCK_CHALLENGES.map(c => {
    const startDate = new Date(c.startDate);
    const isUpcoming = startDate > referenceDate;

    if (isUpcoming) {
      // 即將開始的挑戰只顯示基本資訊
      return {
        id: c.id,
        title: c.title,
        month: c.month,
        status: c.status,
        year: c.year,
        monthNum: c.monthNum,
        theme: c.theme,
        startDate: c.startDate,
        // 不顯示詳細描述和投稿
      };
    }

    // 其他挑戰顯示完整資訊
    return {
      ...c,
    };
  });
}

// 取得 2026 年完整挑戰列表（用於管理頁面）
export function get2026Challenges(): MockChallenge[] {
  return getChallengesByYear(2026);
}
