'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: 'vava' | 'nunu' | 'guardian';
  level: number;
  planType: 'basic' | 'club';
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  // Vava accounts (5)
  { email: 'vava1@demo.nuva.club', password: 'demo1234', name: '小明', role: 'vava', level: 3, planType: 'club' },
  { email: 'vava2@demo.nuva.club', password: 'demo1234', name: '小華', role: 'vava', level: 5, planType: 'club' },
  { email: 'vava3@demo.nuva.club', password: 'demo1234', name: '小美', role: 'vava', level: 2, planType: 'basic' },
  { email: 'vava4@demo.nuva.club', password: 'demo1234', name: '小強', role: 'vava', level: 7, planType: 'club' },
  { email: 'vava5@demo.nuva.club', password: 'demo1234', name: '小芳', role: 'vava', level: 1, planType: 'basic' },
  // Nunu accounts (3)
  { email: 'nunu1@demo.nuva.club', password: 'demo1234', name: '陳教練', role: 'nunu', level: 10, planType: 'club' },
  { email: 'nunu2@demo.nuva.club', password: 'demo1234', name: '林教練', role: 'nunu', level: 9, planType: 'club' },
  { email: 'nunu3@demo.nuva.club', password: 'demo1234', name: '王教練', role: 'nunu', level: 11, planType: 'club' },
  // Guardian accounts (2)
  { email: 'guardian1@demo.nuva.club', password: 'demo1234', name: '張守護', role: 'guardian', level: 12, planType: 'club' },
  { email: 'guardian2@demo.nuva.club', password: 'demo1234', name: '李守護', role: 'guardian', level: 12, planType: 'club' },
];

const roleLabels = {
  vava: '法法',
  nunu: '努努',
  guardian: '守護者',
};

const roleColors = {
  vava: 'bg-green-100 text-green-700 border-green-300',
  nunu: 'bg-blue-100 text-blue-700 border-blue-300',
  guardian: 'bg-purple-100 text-purple-700 border-purple-300',
};

const roleBgColors = {
  vava: 'hover:border-green-400 hover:bg-green-50',
  nunu: 'hover:border-blue-400 hover:bg-blue-50',
  guardian: 'hover:border-purple-400 hover:bg-purple-50',
};

export function CharacterPicker() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectAccount = async (account: DemoAccount) => {
    setLoading(account.email);
    setError(null);

    try {
      const supabase = getClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (signInError) {
        throw signInError;
      }

      // Redirect based on role
      const redirectPath = account.role === 'guardian'
        ? '/club/guardian/dashboard'
        : account.role === 'nunu'
        ? '/club/nunu/dashboard'
        : '/club/dashboard';

      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : '登入失敗';
      if (errorMessage.includes('Invalid login credentials')) {
        setError('帳號或密碼錯誤。請確認資料庫已設定完成。');
      } else {
        setError(`登入失敗：${errorMessage}`);
      }
      setLoading(null);
    }
  };

  // Group accounts by role
  const vavas = DEMO_ACCOUNTS.filter(a => a.role === 'vava');
  const nunus = DEMO_ACCOUNTS.filter(a => a.role === 'nunu');
  const guardians = DEMO_ACCOUNTS.filter(a => a.role === 'guardian');

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Vava Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className={cn('px-2 py-0.5 rounded text-sm', roleColors.vava)}>
            {roleLabels.vava}
          </span>
          <span className="text-muted-foreground text-sm font-normal">學員帳號</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {vavas.map((account) => (
            <CharacterCard
              key={account.email}
              account={account}
              loading={loading === account.email}
              disabled={loading !== null}
              onClick={() => handleSelectAccount(account)}
            />
          ))}
        </div>
      </div>

      {/* Nunu Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className={cn('px-2 py-0.5 rounded text-sm', roleColors.nunu)}>
            {roleLabels.nunu}
          </span>
          <span className="text-muted-foreground text-sm font-normal">教練帳號</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {nunus.map((account) => (
            <CharacterCard
              key={account.email}
              account={account}
              loading={loading === account.email}
              disabled={loading !== null}
              onClick={() => handleSelectAccount(account)}
            />
          ))}
        </div>
      </div>

      {/* Guardian Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className={cn('px-2 py-0.5 rounded text-sm', roleColors.guardian)}>
            {roleLabels.guardian}
          </span>
          <span className="text-muted-foreground text-sm font-normal">管理員帳號</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {guardians.map((account) => (
            <CharacterCard
              key={account.email}
              account={account}
              loading={loading === account.email}
              disabled={loading !== null}
              onClick={() => handleSelectAccount(account)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CharacterCard({
  account,
  loading,
  disabled,
  onClick,
}: {
  account: DemoAccount;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(account.name)}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-4 rounded-xl border-2 border-border bg-background transition-all duration-200',
        'flex flex-col items-center gap-2',
        roleBgColors[account.role],
        disabled && !loading && 'opacity-50 cursor-not-allowed',
        loading && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="relative">
        <img
          src={avatarUrl}
          alt={account.name}
          className="w-16 h-16 rounded-full bg-muted"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="font-medium">{account.name}</p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className={cn('px-1.5 py-0.5 rounded text-xs', roleColors[account.role])}>
            Lv.{account.level}
          </span>
          {account.planType === 'club' && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
              Club
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
