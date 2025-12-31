'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NotificationBell } from './notification-bell';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { profile, isAuthenticated, signOut, loading } = useAuthContext();

  if (loading) {
    return (
      <header className={cn('sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur', className)}>
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <span className="font-bold text-xl text-primary">nuva</span>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60',
        className
      )}
    >
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href={isAuthenticated ? '/club/dashboard' : '/club/login'} className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">nuva</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {isAuthenticated && profile ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="hidden md:flex items-center gap-3">
                {profile.image && (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {profile.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Lv.{profile.level} {profile.role === 'vava' ? '法法' : profile.role === 'nunu' ? '努努' : '守護者'}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="rounded-full"
              >
                登出
              </Button>
            </div>
          ) : (
            <Link href="/club/login">
              <Button size="sm" className="rounded-full">
                登入
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
