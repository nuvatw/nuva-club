'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_EVENTS } from '@/lib/mock';
import { useSimulatedTime } from '@/lib/mock/simulated-time-context';
import { cn } from '@/lib/utils/cn';

type TypeFilter = 'all' | 'online' | 'offline';
type StatusFilter = 'all' | 'upcoming' | 'ongoing' | 'past';

export default function EventsManagementPage() {
  const router = useRouter();
  const { currentDate } = useSimulatedTime();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const getEventStatus = (event: typeof MOCK_EVENTS[0]) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    if (currentDate < start) return 'upcoming';
    if (currentDate > end) return 'past';
    return 'ongoing';
  };

  // Filter events
  let events = [...MOCK_EVENTS];

  if (typeFilter !== 'all') {
    events = events.filter(e => e.type === typeFilter);
  }

  if (statusFilter !== 'all') {
    events = events.filter(e => getEventStatus(e) === statusFilter);
  }

  // Sort by start date
  events = events.sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Take first 20
  events = events.slice(0, 20);

  const upcomingCount = MOCK_EVENTS.filter(e => getEventStatus(e) === 'upcoming').length;
  const onlineCount = MOCK_EVENTS.filter(e => e.type === 'online').length;
  const offlineCount = MOCK_EVENTS.filter(e => e.type === 'offline').length;

  const statusLabels = {
    upcoming: '即將開始',
    ongoing: '進行中',
    past: '已結束',
  };

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-green-100 text-green-700',
    past: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">活動管理</h1>
          <p className="text-muted-foreground">建立和管理線上與實體活動</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/club/guardian/dashboard')}>
            返回主頁
          </Button>
          <Button>新增活動</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{MOCK_EVENTS.length}</p>
            <p className="text-sm text-muted-foreground">總活動數</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{upcomingCount}</p>
            <p className="text-sm text-muted-foreground">即將舉行</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{onlineCount}</p>
            <p className="text-sm text-muted-foreground">線上活動</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{offlineCount}</p>
            <p className="text-sm text-muted-foreground">實體活動</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {[
            { key: 'all', label: '全部類型' },
            { key: 'online', label: '線上' },
            { key: 'offline', label: '實體' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key as TypeFilter)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                typeFilter === key
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: '全部狀態' },
            { key: 'upcoming', label: '即將開始' },
            { key: 'past', label: '已結束' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key as StatusFilter)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm transition-all border',
                statusFilter === key
                  ? 'bg-foreground text-background'
                  : 'bg-background hover:bg-muted'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">活動列表</CardTitle>
          <CardDescription>顯示 {events.length} 個活動</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              沒有符合條件的活動
            </p>
          ) : (
            <div className="space-y-3">
              {events.map(event => {
                const status = getEventStatus(event);
                return (
                  <div
                    key={event.id}
                    className={cn(
                      'p-4 rounded-lg border flex items-center gap-4',
                      status === 'ongoing' && 'border-green-300 bg-green-50'
                    )}
                  >
                    <div className="text-center w-14">
                      <p className="text-2xl font-bold">
                        {new Date(event.startDate).getDate()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString('zh-TW', { month: 'short' })}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{event.title}</h3>
                        <Badge variant={event.type === 'online' ? 'default' : 'secondary'}>
                          {event.type === 'online' ? '線上' : '實體'}
                        </Badge>
                        <Badge className={cn('text-xs', statusColors[status])}>
                          {statusLabels[status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startDate).toLocaleTimeString('zh-TW', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">{event.rsvpCount} 人</p>
                      <p className="text-xs text-muted-foreground">已報名</p>
                    </div>

                    <Button variant="outline" size="sm">編輯</Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
