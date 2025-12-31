'use client';

import { useUser, useRole } from '@/lib/mock';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils/cn';

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: string }> = {
  guardian: { label: '守護者', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '👑' },
  nunu: { label: '努努', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🌟' },
  vava: { label: '法法', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🎓' },
};

export function RoleSwitcher() {
  const { user } = useUser();
  const { role, availableRoles, switchRole } = useRole();

  if (!user || availableRoles.length <= 1) {
    const config = ROLE_CONFIG[role];
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border',
          config.color
        )}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <div className="relative group">
      <button
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all',
          'hover:ring-2 hover:ring-offset-1 hover:ring-primary/20',
          ROLE_CONFIG[role].color
        )}
      >
        <span>{ROLE_CONFIG[role].icon}</span>
        <span>{ROLE_CONFIG[role].label}</span>
        <svg
          className="w-3 h-3 ml-1 opacity-60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="absolute right-0 mt-2 py-1 w-40 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="px-3 py-2 text-xs text-muted-foreground border-b">
          切換角色：
        </div>
        {availableRoles.map((r) => {
          const config = ROLE_CONFIG[r];
          return (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted/50 transition-colors',
                role === r && 'bg-muted/80'
              )}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              {role === r && (
                <svg className="w-4 h-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
