'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RoleSwitcher } from './role-switcher';
import { NotificationBell } from './notification-bell';
import { useUser } from '@/lib/mock';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user, isLoggedIn, logout } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/club/login');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60',
        className
      )}
    >
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href={isLoggedIn ? '/club/dashboard' : '/club/login'} className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">nuva</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="hidden md:flex items-center gap-3">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium text-foreground">
                  {user.name}
                </span>
              </div>
              <RoleSwitcher />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="rounded-full"
              >
                登出
              </Button>
            </div>
          ) : (
            <Link href="/club/login">
              <Button size="sm" className="rounded-full">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
