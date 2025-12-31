'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Notification } from '@/types/database';
import { cn } from '@/lib/utils/cn';

const NOTIFICATION_ICONS: Record<string, string> = {
  feedback: '💬',
  challenge: '🏆',
  course: '📚',
  event: '🎉',
  system: '🔔',
  message: '✉️',
};

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '剛剛';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分鐘前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小時前`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} 天前`;
  return date.toLocaleDateString('zh-TW');
}

export function NotificationBell() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    if (!profile) return;

    const fetchNotifications = async () => {
      const supabase = getClient();
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, [profile]);

  // Close on click outside
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    if (!profile) return;

    const supabase = getClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markAsRead = async (notifId: string) => {
    const supabase = getClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId);

    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
    );
  };

  if (!profile) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        aria-label="通知"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <h3 className="font-semibold">通知</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:underline"
              >
                全部標為已讀
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <span className="text-4xl">🔔</span>
                <p className="mt-2">暫無通知</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link || '#'}
                  onClick={() => {
                    markAsRead(notif.id);
                    setIsOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0',
                      !notif.is_read && 'bg-primary/5'
                    )}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{NOTIFICATION_ICONS[notif.type] || '🔔'}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{notif.title}</span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {timeAgo(notif.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t bg-muted/30 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                關閉
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
