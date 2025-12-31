'use client';

import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_USERS, MOCK_CHALLENGES } from '@/lib/mock';
import { DevGate } from '@/components/club/dev-gate';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

// Mock function to get user by username
function getUserByUsername(username: string) {
  // In a real app, this would be an API call
  const mockUser = MOCK_USERS.find((u) => u.name.toLowerCase().includes(username.charAt(0)));

  if (!mockUser) {
    return null;
  }

  return {
    ...mockUser,
    username: username.toLowerCase(),
    bio: '熱愛學習，正在成為更好的自己。',
    joinedAt: '2024-01-15',
    challengesCompleted: 3,
    coursesCompleted: 12,
    followers: 42,
    following: 28,
  };
}

// Mock challenge submissions
function getUserSubmissions(userId: string) {
  return [
    {
      id: '1',
      challengeId: MOCK_CHALLENGES[0]?.id,
      challengeEmoji: MOCK_CHALLENGES[0]?.theme.emoji || '',
      challengeTitle: MOCK_CHALLENGES[0]?.theme.title || '挑戰',
      content: '這是我這個月的挑戰心得分享...',
      imageUrl: 'https://picsum.photos/seed/sub1/400/300',
      fireCount: 24,
      createdAt: '2024-12-20',
    },
    {
      id: '2',
      challengeId: MOCK_CHALLENGES[1]?.id,
      challengeEmoji: MOCK_CHALLENGES[1]?.theme.emoji || '',
      challengeTitle: MOCK_CHALLENGES[1]?.theme.title || '挑戰',
      content: '完成了一個很有意義的專案...',
      imageUrl: 'https://picsum.photos/seed/sub2/400/300',
      fireCount: 18,
      createdAt: '2024-11-15',
    },
  ];
}

function ProfileContent({ username }: { username: string }) {
  const user = getUserByUsername(username);
  const submissions = user ? getUserSubmissions(user.id) : [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <div className="text-6xl mb-4">404</div>
          <h1 className="text-xl font-semibold mb-2">找不到用戶</h1>
          <p className="text-muted-foreground mb-6">
            用戶 @{username} 不存在或已被刪除
          </p>
          <Link href="/">
            <Button>返回首頁</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const getLevelStage = (level: number) => {
    if (level <= 3) return '入門';
    if (level <= 6) return '進階';
    if (level <= 9) return '高階';
    return '大師';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            nuva
          </Link>
          <Link href="/club/login">
            <Button size="sm" variant="outline">
              登入
            </Button>
          </Link>
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.image}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                Lv.{user.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <Badge variant="outline" className="w-fit mx-auto md:mx-0">
                  {getLevelStage(user.level)}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">@{user.username}</p>
              <p className="text-gray-600 mb-4 max-w-md">{user.bio}</p>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg">{user.challengesCompleted}</div>
                  <div className="text-muted-foreground">挑戰完成</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{user.coursesCompleted}</div>
                  <div className="text-muted-foreground">課程完成</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{user.followers}</div>
                  <div className="text-muted-foreground">追蹤者</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Submissions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
            </svg>
            挑戰作品
          </h2>

          {submissions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((submission) => (
                <Card key={submission.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <img
                      src={submission.imageUrl}
                      alt={submission.challengeTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <span>{submission.challengeEmoji}</span>
                      <span>{submission.challengeTitle}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {submission.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="text-orange-500">🔥</span>
                        {submission.fireCount}
                      </span>
                      <span>{submission.createdAt}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <p>還沒有挑戰作品</p>
            </Card>
          )}
        </div>

        {/* Join Date */}
        <div className="text-center text-sm text-muted-foreground">
          加入於 {user.joinedAt}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params);

  return (
    <DevGate>
      <ProfileContent username={username} />
    </DevGate>
  );
}
