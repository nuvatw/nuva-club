// 季度挑戰時間計算工具

// 挑戰配置：每年 7 個挑戰，每個持續 45 天
export const CHALLENGE_DURATION_DAYS = 45;

// 挑戰開始日期（月/日）
export const CHALLENGE_START_DATES = [
  { month: 1, day: 1 },   // 1/1
  { month: 3, day: 1 },   // 3/1
  { month: 4, day: 1 },   // 4/1
  { month: 5, day: 1 },   // 5/1
  { month: 7, day: 1 },   // 7/1
  { month: 9, day: 1 },   // 9/1
  { month: 11, day: 1 },  // 11/1
] as const;

// 季度挑戰主題
export const CHALLENGE_THEMES = [
  { month: 1, emoji: '🎯', title: 'AI 新年目標', description: '用 AI 制定並追蹤你的新年計畫' },
  { month: 3, emoji: '🌸', title: 'AI 創意春天', description: '運用 AI 進行創意發想與設計' },
  { month: 4, emoji: '📚', title: 'AI 學習加速', description: '用 AI 工具提升學習效率' },
  { month: 5, emoji: '💼', title: 'AI 職場應用', description: '將 AI 融入日常工作流程' },
  { month: 7, emoji: '🎨', title: 'AI 藝術創作', description: '探索 AI 生成藝術的可能性' },
  { month: 9, emoji: '🔧', title: 'AI 工具大師', description: '深度掌握進階 AI 工具' },
  { month: 11, emoji: '🎄', title: 'AI 年終回顧', description: '用 AI 總結這一年的成長' },
] as const;

export interface ChallengeInfo {
  startDate: Date;
  endDate: Date;
  month: number;
  year: number;
  theme: typeof CHALLENGE_THEMES[number];
}

export interface ChallengeStatusResult {
  status: 'active' | 'countdown';
  currentChallenge?: ChallengeInfo;
  nextChallenge: ChallengeInfo;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  totalMillisecondsLeft: number;
  progressPercentage?: number; // 挑戰進行中的進度百分比
}

// 取得某個日期對應的挑戰開始時間
function getChallengeStartDate(year: number, month: number): Date {
  return new Date(year, month - 1, 1, 0, 0, 0, 0);
}

// 取得某個日期對應的挑戰結束時間
function getChallengeEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + CHALLENGE_DURATION_DAYS);
  return endDate;
}

// 取得某個月份的挑戰主題
export function getChallengeTheme(month: number) {
  return CHALLENGE_THEMES.find(t => t.month === month)!;
}

// 建立挑戰資訊
function createChallengeInfo(year: number, month: number): ChallengeInfo {
  const startDate = getChallengeStartDate(year, month);
  const endDate = getChallengeEndDate(startDate);
  const theme = getChallengeTheme(month);

  return {
    startDate,
    endDate,
    month,
    year,
    theme,
  };
}

// 取得所有挑戰的開始日期（給定年份範圍）
function getAllChallengeStarts(fromYear: number, toYear: number): ChallengeInfo[] {
  const challenges: ChallengeInfo[] = [];

  for (let year = fromYear; year <= toYear; year++) {
    for (const { month } of CHALLENGE_START_DATES) {
      challenges.push(createChallengeInfo(year, month));
    }
  }

  return challenges.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

// 主要函數：根據日期計算挑戰狀態
export function getChallengeStatus(currentDate: Date): ChallengeStatusResult {
  const now = currentDate.getTime();
  const currentYear = currentDate.getFullYear();

  // 取得前後兩年的所有挑戰
  const allChallenges = getAllChallengeStarts(currentYear - 1, currentYear + 1);

  // 找出當前正在進行的挑戰
  const activeChallenge = allChallenges.find(challenge => {
    const start = challenge.startDate.getTime();
    const end = challenge.endDate.getTime();
    return now >= start && now < end;
  });

  if (activeChallenge) {
    // 挑戰進行中
    const msLeft = activeChallenge.endDate.getTime() - now;
    const { days, hours, minutes } = msToTimeUnits(msLeft);

    // 計算進度百分比
    const totalDuration = activeChallenge.endDate.getTime() - activeChallenge.startDate.getTime();
    const elapsed = now - activeChallenge.startDate.getTime();
    const progressPercentage = Math.round((elapsed / totalDuration) * 100);

    // 找下一個挑戰
    const nextChallenge = allChallenges.find(c => c.startDate.getTime() > activeChallenge.endDate.getTime())!;

    return {
      status: 'active',
      currentChallenge: activeChallenge,
      nextChallenge,
      daysLeft: days,
      hoursLeft: hours,
      minutesLeft: minutes,
      totalMillisecondsLeft: msLeft,
      progressPercentage,
    };
  } else {
    // 挑戰間歇期，倒數下一個挑戰
    const nextChallenge = allChallenges.find(c => c.startDate.getTime() > now)!;
    const msLeft = nextChallenge.startDate.getTime() - now;
    const { days, hours, minutes } = msToTimeUnits(msLeft);

    return {
      status: 'countdown',
      nextChallenge,
      daysLeft: days,
      hoursLeft: hours,
      minutesLeft: minutes,
      totalMillisecondsLeft: msLeft,
    };
  }
}

// 毫秒轉換為天/時/分
function msToTimeUnits(ms: number): { days: number; hours: number; minutes: number } {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

// 格式化倒數時間顯示
export function formatCountdown(status: ChallengeStatusResult): string {
  if (status.daysLeft > 0) {
    return `${status.daysLeft} 天 ${status.hoursLeft} 小時`;
  } else if (status.hoursLeft > 0) {
    return `${status.hoursLeft} 小時 ${status.minutesLeft} 分鐘`;
  } else {
    return `${status.minutesLeft} 分鐘`;
  }
}

// 格式化挑戰日期範圍
export function formatChallengeDate(challenge: ChallengeInfo): string {
  const startMonth = challenge.startDate.getMonth() + 1;
  const startDay = challenge.startDate.getDate();
  const endMonth = challenge.endDate.getMonth() + 1;
  const endDay = challenge.endDate.getDate();

  if (startMonth === endMonth) {
    return `${startMonth}/${startDay} - ${endDay}`;
  }
  return `${startMonth}/${startDay} - ${endMonth}/${endDay}`;
}

// 取得年度所有挑戰
export function getYearChallenges(year: number): ChallengeInfo[] {
  return CHALLENGE_START_DATES.map(({ month }) => createChallengeInfo(year, month));
}
