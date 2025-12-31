'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Event } from '@/types/database';

// Type filters
type TypeFilter = 'all' | 'online' | 'offline';
const TYPE_FILTERS: { key: TypeFilter; label: string; emoji: string }[] = [
  { key: 'all', label: '全部', emoji: '📋' },
  { key: 'online', label: '線上', emoji: '💻' },
  { key: 'offline', label: '實體', emoji: '📍' },
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
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('upcoming');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchEvents = async () => {
      const supabase = getClient();
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [profile]);

  // Filter and group events by month
  const groupedEvents = useMemo(() => {
    const now = new Date();

    let filtered = [...events];

    // Status filter
    if (statusFilter === 'upcoming') {
      filtered = filtered.filter(e => new Date(e.start_date) > now);
    } else {
      filtered = filtered.filter(e => new Date(e.end_date) < now);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(e => e.type === typeFilter);
    }

    // Sort
    filtered = filtered.sort((a, b) => {
      const aTime = new Date(a.start_date).getTime();
      const bTime = new Date(b.start_date).getTime();
      return statusFilter === 'upcoming' ? aTime - bTime : bTime - aTime;
    });

    // Group by month
    const grouped: Record<string, Event[]> = {};
    filtered.forEach(event => {
      const date = new Date(event.start_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    });

    return grouped;
  }, [events, typeFilter, statusFilter]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

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
            const monthEvents = groupedEvents[monthKey];

            return (
              <div key={monthKey}>
                {/* Month Header */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-4xl font-bold text-primary">{month}月</h2>
                  <span className="text-lg text-muted-foreground">{year}</span>
                </div>

                {/* Events Timeline */}
                <div className="relative pl-8 border-l-2 border-muted space-y-4">
                  {monthEvents.slice(0, 10).map((event) => (
                    <EventTimelineItem key={event.id} event={event} />
                  ))}
                  {monthEvents.length > 10 && (
                    <p className="text-sm text-muted-foreground pl-4">
                      還有 {monthEvents.length - 10} 個活動...
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

function EventTimelineItem({ event }: { event: Event }) {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
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
                <div className="text-2xl font-bold">{formatDay(event.start_date)}</div>
                <div className="text-xs text-muted-foreground">週{formatWeekday(event.start_date)}</div>
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
                  {formatTime(event.start_date)} - {formatTime(event.end_date)}
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
                  <span className="text-xs text-muted-foreground ml-auto">
                    {event.rsvp_count} 人參加
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
