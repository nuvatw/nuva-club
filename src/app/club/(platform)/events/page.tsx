'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { MOCK_EVENTS, type MockEvent } from '@/lib/mock/events';
import { useSimulatedTime } from '@/lib/mock/simulated-time-context';

// Type filters
type TypeFilter = 'all' | 'online' | 'offline' | 'challenge';
const TYPE_FILTERS: { key: TypeFilter; label: string; emoji: string }[] = [
  { key: 'all', label: '全部', emoji: '📋' },
  { key: 'online', label: '線上', emoji: '💻' },
  { key: 'offline', label: '實體', emoji: '📍' },
  { key: 'challenge', label: '挑戰', emoji: '🎯' },
];

// Status filters
type StatusFilter = 'upcoming' | 'past';
const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'upcoming', label: '尚未開始' },
  { key: 'past', label: '已結束' },
];

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDay(dateStr: string) {
  const date = new Date(dateStr);
  return date.getDate();
}

function formatWeekday(dateStr: string) {
  const date = new Date(dateStr);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return weekdays[date.getDay()];
}

export default function EventsPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('upcoming');
  const { currentDate: simulatedDate } = useSimulatedTime();

  // Filter and group events by month
  const groupedEvents = useMemo(() => {
    const now = simulatedDate;

    let filtered = MOCK_EVENTS;

    // Status filter
    if (statusFilter === 'upcoming') {
      filtered = filtered.filter(e => new Date(e.startDate) > now);
    } else {
      filtered = filtered.filter(e => new Date(e.endDate) < now);
    }

    // Type filter
    if (typeFilter === 'online') {
      filtered = filtered.filter(e => e.type === 'online');
    } else if (typeFilter === 'offline') {
      filtered = filtered.filter(e => e.type === 'offline');
    } else if (typeFilter === 'challenge') {
      filtered = filtered.filter(e => e.challengeId);
    }

    // Sort
    filtered = filtered.sort((a, b) => {
      const aTime = new Date(a.startDate).getTime();
      const bTime = new Date(b.startDate).getTime();
      return statusFilter === 'upcoming' ? aTime - bTime : bTime - aTime;
    });

    // Group by month
    const grouped: Record<string, MockEvent[]> = {};
    filtered.forEach(event => {
      const date = new Date(event.startDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    });

    return grouped;
  }, [typeFilter, statusFilter, simulatedDate]);

  const monthKeys = Object.keys(groupedEvents);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">活動</h1>
        <p className="text-muted-foreground">參加線上工作坊和實體聚會</p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Type Filter */}
        <div className="flex gap-2">
          {TYPE_FILTERS.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                typeFilter === key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              )}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {STATUS_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                statusFilter === key
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background hover:bg-muted border-muted-foreground/30'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {monthKeys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {statusFilter === 'past' ? '沒有已結束的活動' : '目前沒有活動'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {monthKeys.slice(0, 5).map(monthKey => {
            const [year, month] = monthKey.split('-').map(Number);
            const events = groupedEvents[monthKey];

            return (
              <div key={monthKey}>
                {/* Month Header */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-4xl font-bold text-primary">{month}月</h2>
                  <span className="text-lg text-muted-foreground">{year}</span>
                </div>

                {/* Events Timeline */}
                <div className="relative pl-8 border-l-2 border-muted space-y-4">
                  {events.slice(0, 10).map((event) => (
                    <EventTimelineItem key={event.id} event={event} />
                  ))}
                  {events.length > 10 && (
                    <p className="text-sm text-muted-foreground pl-4">
                      還有 {events.length - 10} 個活動...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EventTimelineItem({ event }: { event: MockEvent }) {
  const { currentDate: simulatedDate } = useSimulatedTime();
  const now = simulatedDate;
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isPast = endDate < now;
  const isOngoing = startDate <= now && endDate >= now;

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className={cn(
        'absolute -left-[41px] w-4 h-4 rounded-full border-2 border-background',
        isPast ? 'bg-muted' :
        isOngoing ? 'bg-green-500' :
        event.type === 'online' ? 'bg-blue-500' : 'bg-orange-500'
      )} />

      <Link href={`/club/events/${event.id}`}>
        <Card className={cn(
          'hover:shadow-md transition-all cursor-pointer',
          isPast && 'opacity-60'
        )}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Date */}
              <div className="text-center shrink-0 w-12">
                <div className="text-2xl font-bold">{formatDay(event.startDate)}</div>
                <div className="text-xs text-muted-foreground">週{formatWeekday(event.startDate)}</div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                  <Badge
                    variant={event.type === 'online' ? 'default' : 'secondary'}
                    className="shrink-0"
                  >
                    {event.type === 'online' ? '💻 線上' : '📍 實體'}
                  </Badge>
                </div>

                {/* Time */}
                <p className="text-sm text-muted-foreground mb-2">
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </p>

                {/* Location or Link */}
                {event.type === 'offline' && event.location && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    📍 {event.location}
                  </p>
                )}
                {event.type === 'online' && !isPast && (
                  <p className="text-sm text-blue-600">
                    🔗 點擊進入線上會議室
                  </p>
                )}

                {/* Status badges */}
                <div className="flex items-center gap-2 mt-2">
                  {isOngoing && (
                    <Badge variant="destructive" className="text-xs">進行中</Badge>
                  )}
                  {event.challengeId && (
                    <Badge variant="outline" className="text-xs">🎯 挑戰活動</Badge>
                  )}
                  {event.clubOnly && (
                    <Badge variant="outline" className="text-xs">會員限定</Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {event.rsvpCount} 人參加
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
