'use client';

import { useState, useRef, useEffect } from 'react';
import { useSimulatedTime } from '@/lib/mock/simulated-time-context';
import { CHALLENGE_START_DATES, getChallengeTheme } from '@/lib/utils/challenge-utils';
import { cn } from '@/lib/utils/cn';

export function TimeSimulator() {
  const { currentDate, isSimulating, setSimulatedDate, resetToRealTime, challengeStatus } = useSimulatedTime();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const panelRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 格式化日期顯示
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 取得該月份的天數
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 取得該月份第一天是星期幾
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // 建立日曆格子
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days: (number | null)[] = [];

    // 填充空白
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // 檢查是否為挑戰開始日
    const isChallengeStart = (day: number) => {
      return CHALLENGE_START_DATES.some(d => d.month === selectedMonth + 1 && d.day === day);
    };

    // 檢查是否為當前選中的日期
    const isSelected = (day: number) => {
      return (
        currentDate.getFullYear() === selectedYear &&
        currentDate.getMonth() === selectedMonth &&
        currentDate.getDate() === day
      );
    };

    // 檢查是否為今天
    const isToday = (day: number) => {
      const today = new Date();
      return (
        today.getFullYear() === selectedYear &&
        today.getMonth() === selectedMonth &&
        today.getDate() === day
      );
    };

    return (
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="text-muted-foreground text-xs py-1">{d}</div>
        ))}
        {days.map((day, idx) => (
          <button
            key={idx}
            disabled={day === null}
            onClick={() => {
              if (day) {
                setSimulatedDate(new Date(selectedYear, selectedMonth, day, 12, 0, 0));
                setIsOpen(false);
              }
            }}
            className={cn(
              'w-8 h-8 rounded-full text-sm transition-colors disabled:invisible',
              day && 'hover:bg-muted cursor-pointer',
              isSelected(day!) && 'bg-primary text-white hover:bg-primary',
              isToday(day!) && !isSelected(day!) && 'border border-primary text-primary',
              isChallengeStart(day!) && !isSelected(day!) && 'bg-accent text-accent-foreground font-semibold'
            )}
          >
            {day}
          </button>
        ))}
      </div>
    );
  };

  // 快捷按鈕
  const quickActions = [
    {
      label: '今天',
      icon: '📅',
      onClick: () => {
        resetToRealTime();
        setIsOpen(false);
      }
    },
    {
      label: challengeStatus.status === 'active' ? '跳到挑戰結束前' : '跳到挑戰開始日',
      icon: challengeStatus.status === 'active' ? '⏰' : '🎯',
      onClick: () => {
        if (challengeStatus.status === 'active' && challengeStatus.currentChallenge) {
          // 跳到結束前 3 天
          const endDate = new Date(challengeStatus.currentChallenge.endDate);
          endDate.setDate(endDate.getDate() - 3);
          setSimulatedDate(endDate);
        } else {
          // 跳到下一個挑戰開始日
          setSimulatedDate(new Date(challengeStatus.nextChallenge.startDate));
        }
        setIsOpen(false);
      }
    }
  ];

  // 挑戰快捷跳轉
  const challengeJumps = CHALLENGE_START_DATES.slice(0, 4).map(({ month }) => {
    const theme = getChallengeTheme(month);
    return {
      label: `${month}月`,
      emoji: theme.emoji,
      onClick: () => {
        setSimulatedDate(new Date(selectedYear, month - 1, 1, 12, 0, 0));
        setIsOpen(false);
      }
    };
  });

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={panelRef}>
      {/* 浮動按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all',
          isSimulating
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-white border hover:bg-muted'
        )}
      >
        <span className="text-lg">🕐</span>
        <span className="text-sm font-medium">
          {isSimulating ? formatDate(currentDate) : '模擬時間'}
        </span>
        {isSimulating && (
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        )}
      </button>

      {/* 展開面板 */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 bg-white rounded-2xl shadow-xl border p-4 animate-in slide-in-from-bottom-2 duration-200">
          {/* 標題 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">時間模擬器</h3>
            {isSimulating && (
              <button
                onClick={() => {
                  resetToRealTime();
                  setIsOpen(false);
                }}
                className="text-xs text-primary hover:underline"
              >
                重置為真實時間
              </button>
            )}
          </div>

          {/* 當前狀態 */}
          <div className="mb-4 p-3 bg-muted rounded-xl">
            <div className="text-xs text-muted-foreground mb-1">
              {isSimulating ? '模擬時間' : '真實時間'}
            </div>
            <div className="font-semibold">{formatDate(currentDate)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {challengeStatus.status === 'active' ? (
                <>挑戰進行中 - 剩餘 {challengeStatus.daysLeft} 天</>
              ) : (
                <>下一季挑戰倒數 {challengeStatus.daysLeft} 天</>
              )}
            </div>
          </div>

          {/* 快捷按鈕 */}
          <div className="flex gap-2 mb-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          {/* 挑戰快捷跳轉 */}
          <div className="flex gap-1 mb-4">
            {challengeJumps.map((jump, idx) => (
              <button
                key={idx}
                onClick={jump.onClick}
                className="flex-1 flex flex-col items-center py-2 text-xs bg-accent/50 hover:bg-accent rounded-lg transition-colors"
              >
                <span>{jump.emoji}</span>
                <span>{jump.label}</span>
              </button>
            ))}
          </div>

          {/* 年月選擇器 */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(y => y - 1);
                } else {
                  setSelectedMonth(m => m - 1);
                }
              }}
              className="p-1 hover:bg-muted rounded"
            >
              ←
            </button>
            <div className="font-medium">
              {selectedYear} 年 {selectedMonth + 1} 月
            </div>
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(y => y + 1);
                } else {
                  setSelectedMonth(m => m + 1);
                }
              }}
              className="p-1 hover:bg-muted rounded"
            >
              →
            </button>
          </div>

          {/* 日曆 */}
          {renderCalendar()}

          {/* 說明 */}
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span className="inline-block w-3 h-3 rounded-full bg-accent mr-1 align-middle" />
            挑戰開始日
          </div>
        </div>
      )}
    </div>
  );
}
