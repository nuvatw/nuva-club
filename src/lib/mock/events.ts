import { MOCK_USERS } from './users';
import { CHALLENGE_THEMES, CHALLENGE_START_DATES, CHALLENGE_DURATION_DAYS } from '@/lib/utils/challenge-utils';

export type EventType = 'online' | 'offline';
export type EventStatus = 'upcoming' | 'ongoing' | 'ended';
export type RSVPStatus = 'going' | 'maybe' | 'not_going' | null;

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  location?: string;
  meetingLink?: string;
  coverImage?: string;
  hostId: string;
  hostName: string;
  hostImage: string;
  rsvpCount: number;
  maxAttendees?: number;
  clubOnly: boolean;
  myRsvp: RSVPStatus;
  isFull: boolean;
  challengeId?: string;
  tags?: string[];
}

// 計算挑戰結束後的最近週六
function getNextSaturday(date: Date): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  result.setDate(result.getDate() + daysUntilSaturday);
  return result;
}

// 根據挑戰月份取得封面圖
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

// 計算活動狀態
function getEventStatus(startDate: Date, endDate: Date): EventStatus {
  const now = new Date();
  if (endDate < now) return 'ended';
  if (startDate <= now && endDate >= now) return 'ongoing';
  return 'upcoming';
}

// 生成週週線上會議（每週三晚上 8 點）
function generateWeeklyMeetings(year: number): MockEvent[] {
  const events: MockEvent[] = [];
  const startDate = new Date(year, 0, 1);

  // 找到第一個週三
  while (startDate.getDay() !== 3) {
    startDate.setDate(startDate.getDate() + 1);
  }

  let weekNum = 1;
  while (startDate.getFullYear() === year && weekNum <= 52) {
    const eventStart = new Date(startDate);
    eventStart.setHours(20, 0, 0, 0);
    const eventEnd = new Date(eventStart);
    eventEnd.setHours(21, 30, 0, 0);

    events.push({
      id: `weekly-${year}-w${weekNum}`,
      title: `週週 AI 交流會 #${weekNum}`,
      description: '每週三晚上 8 點，我們一起上線聊聊本週的 AI 學習心得、分享新發現的工具、討論遇到的問題。無論你是新手還是老手，都歡迎加入！',
      type: 'online',
      status: getEventStatus(eventStart, eventEnd),
      startDate: eventStart.toISOString(),
      endDate: eventEnd.toISOString(),
      meetingLink: 'https://meet.google.com/nuva-weekly',
      hostId: 'user-ajie',
      hostName: '阿傑',
      hostImage: MOCK_USERS[1].image,
      rsvpCount: Math.floor(Math.random() * 20) + 10,
      clubOnly: true,
      myRsvp: null,
      isFull: false,
      tags: ['每週', '交流', '線上'],
    });

    startDate.setDate(startDate.getDate() + 7);
    weekNum++;
  }

  return events;
}

// 生成挑戰實體聚會（每個挑戰結束後的週六下午）
function generateChallengeMeetups(year: number): MockEvent[] {
  const events: MockEvent[] = [];

  CHALLENGE_START_DATES.forEach(({ month }, index) => {
    const challengeStart = new Date(year, month - 1, 1);
    const challengeEnd = new Date(challengeStart);
    challengeEnd.setDate(challengeEnd.getDate() + CHALLENGE_DURATION_DAYS);

    const meetupDate = getNextSaturday(challengeEnd);
    meetupDate.setHours(14, 0, 0, 0); // 下午 2 點

    const eventEnd = new Date(meetupDate);
    eventEnd.setHours(17, 0, 0, 0); // 下午 5 點

    const theme = CHALLENGE_THEMES[index];

    events.push({
      id: `meetup-${year}-${month}`,
      title: `${theme.emoji} ${theme.title} 成果發表會`,
      description: `本季挑戰圓滿結束！歡迎來參加「${theme.title}」的實體成果發表會。現場將有優秀作品展示、經驗分享、頒獎典禮，還有茶點和交流時間。期待與大家面對面交流！`,
      type: 'offline',
      status: getEventStatus(meetupDate, eventEnd),
      startDate: meetupDate.toISOString(),
      endDate: eventEnd.toISOString(),
      location: '台北市信義區松仁路 100 號 2F（Nuva 創意空間）',
      coverImage: getChallengeImage(month),
      hostId: 'user-admin',
      hostName: '管理員',
      hostImage: MOCK_USERS[3].image,
      rsvpCount: Math.floor(Math.random() * 30) + 20,
      maxAttendees: 50,
      clubOnly: true,
      myRsvp: null,
      isFull: false,
      challengeId: `challenge-${year}-${month}`,
      tags: ['實體', '成果發表', '挑戰'],
    });
  });

  return events;
}

// 生成特別活動
function generateSpecialEvents(year: number): MockEvent[] {
  const events: MockEvent[] = [];

  // 新年開工分享會
  const newYearStart = new Date(year, 0, 4, 14, 0, 0);
  const newYearEnd = new Date(year, 0, 4, 17, 0, 0);
  events.push({
    id: `special-${year}-newyear`,
    title: '新年開工分享會',
    description: '新的一年，新的開始！一起來分享你的 AI 學習目標，認識新朋友，獲得教練的指導建議。還有神秘小禮物等著你！',
    type: 'offline',
    status: getEventStatus(newYearStart, newYearEnd),
    startDate: newYearStart.toISOString(),
    endDate: newYearEnd.toISOString(),
    location: '台北市信義區松仁路 100 號 2F（Nuva 創意空間）',
    coverImage: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&h=450&fit=crop',
    hostId: 'user-admin',
    hostName: '管理員',
    hostImage: MOCK_USERS[3].image,
    rsvpCount: 35,
    maxAttendees: 50,
    clubOnly: false,
    myRsvp: null,
    isFull: false,
    tags: ['新年', '交流', '實體'],
  });

  // 年中大會
  const midYearStart = new Date(year, 5, 28, 13, 0, 0);
  const midYearEnd = new Date(year, 5, 28, 18, 0, 0);
  events.push({
    id: `special-${year}-midyear`,
    title: '年中學習大會',
    description: '回顧上半年的學習成果，展望下半年的目標。特別邀請業界專家分享 AI 最新趨勢，還有學員心得分享和頒獎典禮！',
    type: 'offline',
    status: getEventStatus(midYearStart, midYearEnd),
    startDate: midYearStart.toISOString(),
    endDate: midYearEnd.toISOString(),
    location: '台北市信義區松仁路 100 號 B1（Nuva 大會堂）',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop',
    hostId: 'user-admin',
    hostName: '管理員',
    hostImage: MOCK_USERS[3].image,
    rsvpCount: 68,
    maxAttendees: 100,
    clubOnly: true,
    myRsvp: null,
    isFull: false,
    tags: ['年中', '大會', '實體'],
  });

  // 年終派對
  const yearEndStart = new Date(year, 11, 20, 18, 0, 0);
  const yearEndEnd = new Date(year, 11, 20, 21, 0, 0);
  events.push({
    id: `special-${year}-yearend`,
    title: '年終感恩派對',
    description: '感謝大家一整年的陪伴！一起來回顧這一年的精彩時刻，頒發年度獎項，享受美食和歡樂的派對時光！',
    type: 'offline',
    status: getEventStatus(yearEndStart, yearEndEnd),
    startDate: yearEndStart.toISOString(),
    endDate: yearEndEnd.toISOString(),
    location: '台北市信義區松仁路 100 號 B1（Nuva 大會堂）',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=450&fit=crop',
    hostId: 'user-admin',
    hostName: '管理員',
    hostImage: MOCK_USERS[3].image,
    rsvpCount: 82,
    maxAttendees: 120,
    clubOnly: true,
    myRsvp: null,
    isFull: false,
    tags: ['年終', '派對', '實體'],
  });

  return events;
}

// 生成所有活動
export function generateAllEvents(year: number = 2025): MockEvent[] {
  const weekly = generateWeeklyMeetings(year);
  const meetups = generateChallengeMeetups(year);
  const special = generateSpecialEvents(year);

  return [...weekly, ...meetups, ...special].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

// 預設活動列表（2025 年）
export const MOCK_EVENTS: MockEvent[] = generateAllEvents(2025);

// 工具函數
export const getEventById = (id: string) => MOCK_EVENTS.find(e => e.id === id);

export const getEventsByType = (type: EventType) => MOCK_EVENTS.filter(e => e.type === type);

export const getEventsByStatus = (status: EventStatus) => MOCK_EVENTS.filter(e => e.status === status);

export const getUpcomingEvents = (limit?: number) => {
  const now = new Date();
  const upcoming = MOCK_EVENTS.filter(e => new Date(e.startDate) > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  return limit ? upcoming.slice(0, limit) : upcoming;
};

export const getNextEvent = () => getUpcomingEvents(1)[0];

export const getWeeklyMeetings = () => MOCK_EVENTS.filter(e => e.id.startsWith('weekly-'));

export const getChallengeMeetups = () => MOCK_EVENTS.filter(e => e.id.startsWith('meetup-'));

export const getSpecialEvents = () => MOCK_EVENTS.filter(e => e.id.startsWith('special-'));

export const getMyRsvpedEvents = () => MOCK_EVENTS.filter(e => e.myRsvp === 'going');
