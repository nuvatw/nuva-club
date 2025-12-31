'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDemoAccounts, UserProvider, useUser } from '@/lib/mock';

function LoginContent() {
  const router = useRouter();
  const { login } = useUser();
  const demoAccounts = getDemoAccounts();

  const handleLogin = (userId: string) => {
    login(userId);
    router.push('/club/dashboard');
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">nuva</h1>
        <p className="text-lg text-muted-foreground">
          AI 學習平台展示
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">選擇展示帳號</CardTitle>
          <CardDescription>
            選擇一個帳號來探索不同的使用者角色
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {demoAccounts.map(({ user, description, tag }) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user.id)}
              className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {user.name}
                    </span>
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full font-medium
                      ${tag === '法法' ? 'bg-blue-100 text-blue-800' : ''}
                      ${tag === '努努' ? 'bg-purple-100 text-purple-800' : ''}
                      ${tag === '守護者' ? 'bg-amber-100 text-amber-800' : ''}
                    `}>
                      {tag}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {description}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          還沒有帳號？{' '}
          <Link href="/club/sign-up" className="text-primary font-medium hover:underline">
            立即註冊
          </Link>
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>前端展示</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>模擬資料</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <UserProvider>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 p-4">
        <LoginContent />
      </div>
    </UserProvider>
  );
}
