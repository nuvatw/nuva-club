'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (newTimeLeft) {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className={className}>
        <div className="text-center">
          <span className="text-2xl md:text-3xl font-bold text-primary">
            已上線！
          </span>
        </div>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className={className}>
        <div className="flex justify-center gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="w-16 md:w-20 h-16 md:h-20 rounded-2xl bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: '天' },
    { value: timeLeft.hours, label: '時' },
    { value: timeLeft.minutes, label: '分' },
    { value: timeLeft.seconds, label: '秒' },
  ];

  return (
    <div className={className}>
      <div className="flex justify-center gap-3 md:gap-4">
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="text-center">
            <div className="w-16 md:w-20 h-16 md:h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs md:text-sm text-white/70 mt-2 block">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
