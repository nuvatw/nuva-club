import { getClient } from '@/lib/supabase/client';
import type { Notification } from '@/types/database';

export async function getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data;
}

export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }

  return data;
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = getClient();

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    return 0;
  }

  return count || 0;
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const supabase = getClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }

  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const supabase = getClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }

  return true;
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
): Promise<Notification | null> {
  const supabase = getClient();

  const notificationId = `notif-${Date.now()}`;

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      id: notificationId,
      user_id: userId,
      type,
      title,
      message,
      link,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }

  return data;
}
