'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getChallengeStatus, type ChallengeStatusResult, type ChallengeInfo, getYearChallenges } from '@/lib/utils/challenge-utils';

const STORAGE_KEY = 'nuva-simulated-time';

interface SimulatedTimeContextType {
  // 當前時間（可能是模擬的或真實的）
  currentDate: Date;
  // 是否正在使用模擬時間
  isSimulating: boolean;
  // 設定模擬時間
  setSimulatedDate: (date: Date) => void;
  // 重置為真實時間
  resetToRealTime: () => void;
  // 挑戰相關的便利方法
  challengeStatus: ChallengeStatusResult;
  // 取得某年的所有挑戰
  getYearChallenges: (year: number) => ChallengeInfo[];
}

const SimulatedTimeContext = createContext<SimulatedTimeContextType | null>(null);

export function SimulatedTimeProvider({ children }: { children: ReactNode }) {
  const [simulatedDate, setSimulatedDateState] = useState<Date | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration: 從 localStorage 讀取
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date) {
          setSimulatedDateState(new Date(parsed.date));
        }
      } catch {
        // 忽略解析錯誤
      }
    }
    setIsHydrated(true);
  }, []);

  // 儲存到 localStorage
  useEffect(() => {
    if (!isHydrated) return;

    if (simulatedDate) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: simulatedDate.toISOString() }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [simulatedDate, isHydrated]);

  const setSimulatedDate = useCallback((date: Date) => {
    setSimulatedDateState(date);
  }, []);

  const resetToRealTime = useCallback(() => {
    setSimulatedDateState(null);
  }, []);

  // 計算當前時間
  const currentDate = simulatedDate || new Date();
  const isSimulating = simulatedDate !== null;

  // 計算挑戰狀態
  const challengeStatus = getChallengeStatus(currentDate);

  const value: SimulatedTimeContextType = {
    currentDate,
    isSimulating,
    setSimulatedDate,
    resetToRealTime,
    challengeStatus,
    getYearChallenges,
  };

  // SSR 期間返回預設值
  if (!isHydrated) {
    return (
      <SimulatedTimeContext.Provider value={{
        currentDate: new Date(),
        isSimulating: false,
        setSimulatedDate: () => {},
        resetToRealTime: () => {},
        challengeStatus: getChallengeStatus(new Date()),
        getYearChallenges,
      }}>
        {children}
      </SimulatedTimeContext.Provider>
    );
  }

  return (
    <SimulatedTimeContext.Provider value={value}>
      {children}
    </SimulatedTimeContext.Provider>
  );
}

export function useSimulatedTime() {
  const context = useContext(SimulatedTimeContext);
  if (!context) {
    throw new Error('useSimulatedTime must be used within SimulatedTimeProvider');
  }
  return context;
}

// 便利 hook：只取得當前時間
export function useCurrentDate() {
  const { currentDate } = useSimulatedTime();
  return currentDate;
}

// 便利 hook：只取得挑戰狀態
export function useChallengeStatus() {
  const { challengeStatus } = useSimulatedTime();
  return challengeStatus;
}
