'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';

const categoryConfig: Record<string, { label: string; color: string }> = {
  question: { label: '發問', color: 'bg-purple-100 text-purple-700' },
  share: { label: '分享', color: 'bg-green-100 text-green-700' },
  challenge: { label: '挑戰', color: 'bg-orange-100 text-orange-700' },
};

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '剛剛';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分鐘前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小時前`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} 天前`;
  return new Date(dateStr).toLocaleDateString('zh-TW');
}

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  likes_count: number;
  created_at: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    level: number;
  };
  comments_count: number;
}

type FilterType = 'all' | 'question' | 'share' | 'challenge';

export default function CommunityPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchPosts = async () => {
      const supabase = getClient();

      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          type,
          likes_count,
          created_at,
          user_id,
          author:profiles!posts_user_id_fkey(id, name, image, level)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data } = await query;

      if (data) {
        // Get comment counts
        const postIds = data.map((p: any) => p.id);
        const { data: comments } = await supabase
          .from('comments')
          .select('post_id')
          .in('post_id', postIds);

        const commentCounts: Record<string, number> = {};
        comments?.forEach((c: any) => {
          commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
        });

        const postsWithCounts = data.map((p: any) => ({
          ...p,
          author: p.author,
          comments_count: commentCounts[p.id] || 0,
        }));

        setPosts(postsWithCounts);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [profile, filter]);

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

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'question', label: '發問' },
    { value: 'share', label: '分享' },
    { value: 'challenge', label: '挑戰' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">社群</h1>
          <p className="text-muted-foreground">與其他學員交流討論</p>
        </div>
        <Button>發表文章</Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">目前沒有文章</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/club/community/${post.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {post.author?.image ? (
                        <img
                          src={post.author.image}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium">
                            {post.author?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{post.author?.name || '匿名'}</p>
                        <p className="text-xs text-muted-foreground">
                          Lv.{post.author?.level || 1} · {timeAgo(post.created_at)}
                        </p>
                      </div>
                    </div>
                    {post.type && categoryConfig[post.type] && (
                      <Badge className={cn('text-xs', categoryConfig[post.type].color)}>
                        {categoryConfig[post.type].label}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-2">{post.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <HeartIcon className="w-4 h-4" />
                      {post.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageIcon className="w-4 h-4" />
                      {post.comments_count}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  );
}
