import { getClient } from '@/lib/supabase/client';
import type { Event, EventRsvp } from '@/types/database';

export async function getEvents(): Promise<Event[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data;
}

export async function getUpcomingEvents(limit = 10): Promise<Event[]> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_date', now)
    .order('start_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }

  return data;
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data;
}

export async function rsvpEvent(userId: string, eventId: string): Promise<boolean> {
  const supabase = getClient();

  const { error } = await supabase
    .from('event_rsvps')
    .insert({
      user_id: userId,
      event_id: eventId,
    });

  if (error) {
    console.error('Error RSVPing to event:', error);
    return false;
  }

  // Increment RSVP count
  await supabase.rpc('increment_rsvp_count', { event_id: eventId });

  return true;
}

export async function cancelRsvp(userId: string, eventId: string): Promise<boolean> {
  const supabase = getClient();

  const { error } = await supabase
    .from('event_rsvps')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);

  if (error) {
    console.error('Error canceling RSVP:', error);
    return false;
  }

  // Decrement RSVP count
  await supabase.rpc('decrement_rsvp_count', { event_id: eventId });

  return true;
}

export async function hasUserRsvped(userId: string, eventId: string): Promise<boolean> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('event_rsvps')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();

  return !error && !!data;
}

export async function getUserRsvps(userId: string): Promise<(EventRsvp & { event: Event })[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('event_rsvps')
    .select(`
      *,
      event:events(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user RSVPs:', error);
    return [];
  }

  return data.map((r: EventRsvp & { event: unknown }) => ({
    ...r,
    event: r.event as Event,
  }));
}
