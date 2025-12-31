'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Challenge, ChallengeParticipation, Post, Profile } from '@/types/database';

const statusConfig = {
  upcoming: { label: '即將開始', variant: 'secondary' as const },
  active: { label: '進行中', variant: 'default' as const },
  ended: { label: '已結束', variant: 'outline' as const },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getRemainingTime(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return '已結束';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} 天 ${hours} 小時 ${minutes} 分鐘`;
}

function getChallengeStatus(startDate: string, endDate: string): 'upcoming' | 'active' | 'ended' {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
}

interface PostWithUser extends Post {
  user?: Profile;
  has_fired?: boolean;
}

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = use(params);
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participation, setParticipation] = useState<ChallengeParticipation | null>(null);
  const [challengePosts, setChallengePosts] = useState<PostWithUser[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showJoinedToast, setShowJoinedToast] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      const supabase = getClient();

      // Fetch challenge
      const { data: challengeData } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeData) {
        setChallenge(challengeData);
      }

      // Fetch user's participation
      const { data: participationData } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', profile.id)
        .single();

      if (participationData) {
        setParticipation(participationData);
      }

      // Count total participants
      const { count } = await supabase
        .from('challenge_participations')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_id', challengeId);

      setParticipantCount(count || 0);

      // Fetch challenge posts with user info
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles(id, name, image, level)
        `)
        .eq('category', 'challenge')
        .eq('challenge_id', challengeId)
        .order('likes_count', { ascending: false });

      if (postsData) {
        // Check which posts the user has fired
        const postIds = postsData.map(p => p.id);
        const { data: firesData } = await supabase
          .from('post_fires')
          .select('post_id')
          .eq('user_id', profile.id)
          .in('post_id', postIds);

        const firedPostIds = new Set(firesData?.map(f => f.post_id) || []);

        setChallengePosts(postsData.map(p => ({
          ...p,
          has_fired: firedPostIds.has(p.id),
        })));
      }

      setLoading(false);
    };

    fetchData();
  }, [profile, challengeId]);

  const handleJoin = async () => {
    if (!profile) return;

    const supabase = getClient();
    await supabase.from('challenge_participations').insert({
      challenge_id: challengeId,
      user_id: profile.id,
    });

    setParticipation({
      id: '',
      challenge_id: challengeId,
      user_id: profile.id,
      status: 'joined',
      submission_url: null,
      submitted_at: null,
      created_at: new Date().toISOString(),
    });
    setParticipantCount(prev => prev + 1);
    setShowJoinedToast(true);
    setTimeout(() => setShowJoinedToast(false), 3000);
  };

  const handleFire = async (postId: string, hasFired: boolean) => {
    if (!profile) return;

    const supabase = getClient();

    if (hasFired) {
      // Remove fire
      await supabase
        .from('post_fires')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', profile.id);

      // Decrement fire count
      await supabase.rpc('decrement_likes_count', { p_post_id: postId });
    } else {
      // Add fire
      await supabase.from('post_fires').insert({
        post_id: postId,
        user_id: profile.id,
      });

      // Increment fire count
      await supabase.rpc('increment_likes_count', { p_post_id: postId });
    }

    // Update local state
    setChallengePosts(prev =>
      prev.map(p =>
        p.id === postId
          ? {
              ...p,
              has_fired: !hasFired,
              likes_count: hasFired ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      )
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  if (!challenge) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.push('/club/challenges')}>
          ← 返回挑戰列表
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">挑戰不存在</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasJoined = !!participation;
  const myPost = challengePosts.find(p => p.user_id === profile.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Joined Toast */}
      {showJoinedToast && (
        <div className="fixed top-20 right-4 z-50 bg-purple-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
          <TrophyIcon className="w-5 h-5" />
          <span>成功加入挑戰！</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => router.push('/club/challenges')}
          >
            ← 返回挑戰列表
          </Button>
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
          <p className="text-muted-foreground">
            {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
          </p>
        </div>
        <Badge
          variant={statusConfig[getChallengeStatus(challenge.start_date, challenge.end_date)]?.variant || 'secondary'}
          className={cn(
            "text-sm",
            getChallengeStatus(challenge.start_date, challenge.end_date) === 'active' && "bg-purple-600"
          )}
        >
          {statusConfig[getChallengeStatus(challenge.start_date, challenge.end_date)]?.label}
        </Badge>
      </div>

      {/* Challenge Banner */}
      <div className="w-full h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
        <span className="text-6xl">🏆</span>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">挑戰說明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{challenge.description}</p>

          {getChallengeStatus(challenge.start_date, challenge.end_date) === 'active' && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                {participantCount} 位參與者
              </span>
              <span className="text-purple-600 font-medium">
                剩餘 {getRemainingTime(challenge.end_date)}
              </span>
            </div>
          )}

          {challenge.prize && (
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">🎁 獎品：</span>
                {challenge.prize}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participation Status / Join */}
      {getChallengeStatus(challenge.start_date, challenge.end_date) === 'active' && (
        <Card className={cn(
          hasJoined ? "border-green-200 bg-green-50/30" : "border-purple-200 bg-purple-50/30"
        )}>
          <CardHeader>
            <CardTitle className="text-lg">
              {hasJoined ? '我的參與狀態' : '加入這個挑戰'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasJoined ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    已加入
                  </Badge>
                  {myPost ? (
                    <Badge variant="secondary">已發佈作品</Badge>
                  ) : (
                    <Badge variant="outline">尚未發佈</Badge>
                  )}
                </div>

                {myPost ? (
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="font-medium mb-2">{myPost.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{myPost.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <FireIcon className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">{myPost.likes_count}</span>
                      </div>
                      <Link href={`/club/community/${myPost.id}`}>
                        <Button variant="outline" size="sm">查看貼文</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      準備好分享你的作品了嗎？發佈一篇挑戰作品到社群吧！
                    </p>
                    <Link href={`/club/community?newPost=true&challenge=${challengeId}`}>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        發佈挑戰作品
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  加入挑戰後，你可以在社群發佈你的作品參與競賽。獲得最多火焰反應的作品將贏得獎勵！
                </p>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleJoin}
                >
                  加入挑戰
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-orange-500" />
            作品排行榜
          </CardTitle>
          <CardDescription>
            {challengePosts.length > 0
              ? `${challengePosts.length} 件作品 · 按火焰數排序`
              : '還沒有人發佈作品，成為第一個吧！'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {challengePosts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              尚無作品，成為第一個提交的人吧！
            </p>
          ) : (
            <div className="space-y-4">
              {challengePosts.map((post, index) => {
                const postUser = post.user as Profile | undefined;
                const isOwn = post.user_id === profile.id;
                const rank = index + 1;

                return (
                  <div
                    key={post.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      rank <= 3 && 'bg-orange-50 border-orange-200',
                      isOwn && 'ring-2 ring-purple-500'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank */}
                      <div
                        className={cn(
                          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold',
                          rank === 1 && 'bg-yellow-100 text-yellow-700',
                          rank === 2 && 'bg-gray-100 text-gray-700',
                          rank === 3 && 'bg-orange-100 text-orange-700',
                          rank > 3 && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {rank}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {postUser?.image && (
                            <img
                              src={postUser.image}
                              alt=""
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <span className="font-medium">{postUser?.name || '匿名用戶'}</span>
                          {isOwn && (
                            <Badge variant="outline" className="text-xs">
                              你
                            </Badge>
                          )}
                        </div>
                        <Link href={`/club/community/${post.id}`}>
                          <h4 className="font-medium text-sm hover:text-primary transition-colors">
                            {post.title}
                          </h4>
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {post.content}
                        </p>
                        {post.image && (
                          <img
                            src={post.image}
                            alt=""
                            className="mt-2 rounded-lg max-h-32 object-cover"
                          />
                        )}
                      </div>

                      {/* Fire Button */}
                      <button
                        onClick={() => handleFire(post.id, !!post.has_fired)}
                        disabled={isOwn}
                        className={cn(
                          'flex items-center gap-1 px-3 py-2 rounded-lg transition-all',
                          post.has_fired
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-muted hover:bg-orange-50',
                          isOwn && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <FireIcon className={cn("w-5 h-5", post.has_fired && "text-orange-500")} />
                        <span className="font-bold">{post.likes_count}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View all in community */}
          {challengePosts.length > 0 && (
            <div className="mt-6 text-center">
              <Link href={`/club/community?category=challenge&challengeId=${challengeId}`}>
                <Button variant="outline">
                  在社群查看所有挑戰作品
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  );
}

function FireIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
    </svg>
  );
}
