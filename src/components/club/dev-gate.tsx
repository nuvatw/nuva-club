'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEV_PASSWORD = process.env.NEXT_PUBLIC_DEV_PASSWORD || 'nuva2025';
const STORAGE_KEY = 'nuva-dev-access';

export function DevGate({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsVerified(stored === 'true');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEV_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsVerified(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  // Loading state
  if (isVerified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="animate-pulse text-muted-foreground">載入中...</div>
      </div>
    );
  }

  // Not verified - show password gate
  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-primary">nuva club</h1>
            <p className="text-muted-foreground">
              開發中，請輸入密碼進入
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="輸入開發密碼"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={error ? 'border-destructive' : ''}
              />
              {error && (
                <p className="text-sm text-destructive mt-2">
                  密碼錯誤，請再試一次
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              進入
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            此區域僅供開發測試使用
          </p>
        </div>
      </div>
    );
  }

  // Verified - render children
  return <>{children}</>;
}
