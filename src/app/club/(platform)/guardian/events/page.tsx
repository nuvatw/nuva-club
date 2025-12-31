'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import type { Event } from '@/types/database';

type TypeFilter = 'all' | 'online' | 'offline';
type StatusFilter = 'all' | 'upcoming' | 'ongoing' | 'past';

interface EventWithStatus extends Event {
  status: 'upcoming' | 'ongoing' | 'past';
}

export default function EventsManagementPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<EventWithStatus[]>([]);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading && profile && profile.role !== 'guardian') {
      router.push('/club/dashboard');
    }
  }, [authLoading, profile, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchEvents = async () => {
      const supabase = getClient();
      const now = new Date();

      const { data } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false });

      if (data) {
        const withStatus = data.map((e: Event) => {
          const start = new Date(e.start_date);
          const end = new Date(e.end_date);
          let status: 'upcoming' | 'ongoing' | 'past' = 'upcoming';
          if (now < start) status = 'upcoming';
          else if (now > end) status = 'past';
          else status = 'ongoing';
          return { ...e, status };
        });
        setEvents(withStatus);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [profile]);

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

  // Apply filters
  let filteredEvents = [...events];
  if (typeFilter !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.type === typeFilter);
  }
  if (statusFilter !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.status === statusFilter);
  }

  const statusConfig = {
    upcoming: { label: '即將舉行', color: 'bg-blue-100 text-blue-700' },
    ongoing: { label: '進行中', color: 'bg-green-100 text-green-700' },
    past: { label: '已結束', color: 'bg-gray-100 text-gray-600' },
  };

  const typeConfig = {
    online: { label: '線上', color: 'bg-purple-100 text-purple-700' },
    offline: { label: '實體', color: 'bg-orange-100 text-orange-700' },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">活動管理</h1>
          <p className="text-muted-foreground">管理平台活動</p>
        </div>
        <Button>新增活動</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground self-center">類型:</span>
          {(['all', 'online', 'offline'] as TypeFilter[]).map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(t)}
            >
              {t === 'all' ? '全部' : typeConfig[t].label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground self-center">狀態:</span>
          {(['all', 'upcoming', 'ongoing', 'past'] as StatusFilter[]).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? '全部' : statusConfig[s].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">沒有符合條件的活動</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>
                      {new Date(event.start_date).toLocaleDateString('zh-TW')} - {new Date(event.end_date).toLocaleDateString('zh-TW')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={cn('text-xs', typeConfig[event.type as 'online' | 'offline']?.color)}>
                      {typeConfig[event.type as 'online' | 'offline']?.label || event.type}
                    </Badge>
                    <Badge className={cn('text-xs', statusConfig[event.status].color)}>
                      {statusConfig[event.status].label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    地點: {event.location || '線上'}
                  </span>
                  <span className="text-muted-foreground">
                    報名: {event.rsvp_count || 0} 人
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
