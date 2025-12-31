'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Event, EventRsvp, Profile } from '@/types/database';

interface EventWithHost extends Event {
  host?: Profile;
}

interface RsvpWithUser extends EventRsvp {
  user?: Profile;
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<EventWithHost | null>(null);
  const [myRsvp, setMyRsvp] = useState<EventRsvp | null>(null);
  const [attendees, setAttendees] = useState<RsvpWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      const supabase = getClient();

      // Fetch event with host info
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          host:profiles!events_host_id_fkey(id, name, image)
        `)
        .eq('id', eventId)
        .maybeSingle();

      if (eventError) {
        setError('活動不存在');
        setLoading(false);
        return;
      }

      setEvent(eventData);

      // Fetch user's RSVP
      const { data: rsvpData } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (rsvpData) {
        setMyRsvp(rsvpData);
      }

      // Fetch attendees (going only)
      const { data: attendeesData } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          user:profiles(id, name, image)
        `)
        .eq('event_id', eventId)
        .eq('status', 'going')
        .limit(20);

      if (attendeesData) {
        setAttendees(attendeesData);
      }

      setLoading(false);
    };

    fetchData();
  }, [profile, eventId]);

  const handleJoinEvent = async () => {
    if (!profile) return;

    setRsvpLoading(true);
    const supabase = getClient();

    const { data } = await supabase
      .from('event_rsvps')
      .insert({
        event_id: eventId,
        user_id: profile.id,
      })
      .select()
      .single();

    if (data) {
      setMyRsvp(data);
      setAttendees(prev => [...prev, { ...data, user: profile }]);
    }

    setRsvpLoading(false);
  };

  const handleCancelRsvp = async () => {
    if (!profile || !myRsvp) return;

    setRsvpLoading(true);
    const supabase = getClient();

    await supabase
      .from('event_rsvps')
      .delete()
      .eq('id', myRsvp.id);

    setMyRsvp(null);
    setAttendees(prev => prev.filter(a => a.user_id !== profile.id));

    setRsvpLoading(false);
  };

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

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/club/events')}>
          ← 返回活動列表
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">{error || '活動不存在'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFull = event.max_participants ? attendees.length >= event.max_participants : false;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/club/events')}
      >
        ← 返回活動列表
      </Button>

      {/* Cover Banner */}
      <div
        className={cn(
          'h-48 rounded-lg flex items-center justify-center',
          event.type === 'online'
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
            : 'bg-gradient-to-br from-green-500/20 to-teal-500/20'
        )}
      >
        <span className="text-6xl">{event.type === 'online' ? '💻' : '🎉'}</span>
      </div>

      {/* Event Info */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {formatDateTime(event.start_date)}
                  </CardDescription>
                </div>
                <Badge variant={event.type === 'online' ? 'default' : 'secondary'}>
                  {event.type === 'online' ? '💻 線上' : '📍 線下'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap">{event.description}</p>

              {event.location && (
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-medium mb-1">📍 地點</h4>
                  <p>{event.location}</p>
                </div>
              )}

              {event.host && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">主辦人</span>
                  {event.host.image ? (
                    <img
                      src={event.host.image}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {event.host.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-medium">{event.host.name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RSVP Section */}
        <div className="w-full md:w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">報名</CardTitle>
              <CardDescription>
                {attendees.length} 人參加
                {event.max_participants && ` / ${event.max_participants} 名額`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isFull && !myRsvp ? (
                <p className="text-center text-muted-foreground py-4">
                  此活動已額滿
                </p>
              ) : (
                <div className="space-y-2">
                  {myRsvp ? (
                    <>
                      <Button className="w-full" variant="default" disabled>
                        ✓ 已報名
                      </Button>
                      <Button
                        className="w-full"
                        variant="ghost"
                        disabled={rsvpLoading}
                        onClick={handleCancelRsvp}
                      >
                        取消報名
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={rsvpLoading}
                      onClick={handleJoinEvent}
                    >
                      {rsvpLoading ? '處理中...' : '我要參加'}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendees */}
          {attendees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">參加者</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {attendees.map((attendee) => {
                    const user = attendee.user as Profile | undefined;
                    return (
                      <div
                        key={attendee.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                      >
                        {user?.image ? (
                          <img
                            src={user.image}
                            alt=""
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {user?.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        <span className="text-sm">{user?.name || '匿名用戶'}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
