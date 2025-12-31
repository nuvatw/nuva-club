'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/cn';

interface Attendee {
  id: string;
  name: string;
  image?: string;
}

interface EventDetail {
  id: string;
  title: string;
  description: string;
  type: 'online' | 'offline';
  status: string;
  startDate: string;
  endDate: string;
  location?: string;
  address?: string;
  meetingUrl?: string;
  coverImage?: string;
  rsvpCount: number;
  maxAttendees?: number;
  clubOnly: boolean;
  host: {
    id: string;
    name: string;
    image?: string;
  } | null;
  myRsvp: string | null;
  isFull: boolean;
  attendees: Attendee[];
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
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
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error.message);
      } else {
        setEvent(data.data.event);
      }
    } catch (err) {
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (status: 'going' | 'maybe' | 'not_going') => {
    setRsvpLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'RSVP failed');
      }

      fetchEvent(); // Refresh to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'RSVP failed');
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/events')}>
          ← Back to Events
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">{error || 'Event not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/events')}
      >
        ← Back to Events
      </Button>

      {/* Cover Image */}
      {event.coverImage ? (
        <div
          className="h-64 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${event.coverImage})` }}
        />
      ) : (
        <div
          className={cn(
            'h-64 rounded-lg flex items-center justify-center',
            event.type === 'online'
              ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
              : 'bg-gradient-to-br from-green-500/20 to-teal-500/20'
          )}
        >
          <span className="text-6xl">{event.type === 'online' ? '💻' : '🎉'}</span>
        </div>
      )}

      {/* Event Info */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {formatDateTime(event.startDate)}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant={event.type === 'online' ? 'default' : 'secondary'}>
                    {event.type === 'online' ? '💻 Online' : '📍 Offline'}
                  </Badge>
                  {event.clubOnly && (
                    <Badge variant="outline">Club Only</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap">{event.description}</p>

              {event.location && (
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-medium mb-1">📍 Location</h4>
                  <p>{event.location}</p>
                  {event.address && (
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                  )}
                </div>
              )}

              {event.meetingUrl && event.myRsvp === 'going' && (
                <div className="p-4 rounded-lg bg-primary/10">
                  <h4 className="font-medium mb-2">🔗 Meeting Link</h4>
                  <a
                    href={event.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline break-all"
                  >
                    {event.meetingUrl}
                  </a>
                </div>
              )}

              {event.host && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Hosted by</span>
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
              <CardTitle className="text-lg">RSVP</CardTitle>
              <CardDescription>
                {event.rsvpCount} going
                {event.maxAttendees && ` / ${event.maxAttendees} spots`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {event.isFull && event.myRsvp !== 'going' ? (
                <p className="text-center text-muted-foreground py-4">
                  This event is at full capacity.
                </p>
              ) : (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant={event.myRsvp === 'going' ? 'default' : 'outline'}
                    disabled={rsvpLoading}
                    onClick={() => handleRsvp('going')}
                  >
                    {event.myRsvp === 'going' ? '✓ Going' : "I'm going!"}
                  </Button>
                  <Button
                    className="w-full"
                    variant={event.myRsvp === 'maybe' ? 'default' : 'outline'}
                    disabled={rsvpLoading}
                    onClick={() => handleRsvp('maybe')}
                  >
                    {event.myRsvp === 'maybe' ? '? Maybe' : 'Maybe'}
                  </Button>
                  {event.myRsvp && (
                    <Button
                      className="w-full"
                      variant="ghost"
                      disabled={rsvpLoading}
                      onClick={() => handleRsvp('not_going')}
                    >
                      Cancel RSVP
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendees */}
          {event.attendees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                    >
                      {attendee.image ? (
                        <img
                          src={attendee.image}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {attendee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm">{attendee.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
