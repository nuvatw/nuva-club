'use client';

import Link from 'next/link';
import { CharacterPicker } from '@/components/auth/CharacterPicker';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 p-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">nuva</h1>
          <p className="text-lg text-muted-foreground">
            AI 學習平台
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">選擇角色登入</h2>
            <p className="text-muted-foreground text-sm mt-1">
              點擊任一角色卡片即可登入體驗
            </p>
          </div>

          <CharacterPicker />
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            還沒有帳號？{' '}
            <Link href="/waitlist" className="text-primary font-medium hover:underline">
              加入候補名單
            </Link>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Supabase 資料庫</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span>真實 YouTube 影片</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span>學習進度追蹤</span>
          </div>
        </div>
      </div>
    </div>
  );
}
