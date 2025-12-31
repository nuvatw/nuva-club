'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Post, Profile } from '@/types/database';

const FILTERS = {
  all: { label: '全部', emoji: '📋' },
  question: { label: '發問', emoji: '❓' },
  share: { label: '分享', emoji: '🏆' },
  challenge: { label: '挑戰', emoji: '🎯' },
} as const;

type FilterType = keyof typeof FILTERS;

const categoryColors: Record<string, string> = {
  question: 'bg-purple-100 text-purple-700',
  share: 'bg-green-100 text-green-700',
  challenge: 'bg-orange-100 text-orange-700',
};

interface PostWithAuthor extends Post {
  author?: Profile;
  has_fired?: boolean;
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '剛剛';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分鐘前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小時前`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} 天前`;
  return date.toLocaleDateString('zh-TW');
}

export default function CommunityPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'share' as 'share' | 'question' | 'challenge'
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchPosts = async () => {
      const supabase = getClient();

      // Fetch posts with author info
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_user_id_fkey(id, name, image, level)
        `)
        .order('created_at', { ascending: false });

      if (postsData) {
        // Check which posts the user has fired
        const { data: firesData } = await supabase
          .from('post_fires')
          .select('post_id')
          .eq('user_id', profile.id);

        const firedPostIds = new Set(firesData?.map(f => f.post_id) || []);

        const postsWithFires = postsData.map(post => ({
          ...post,
          has_fired: firedPostIds.has(post.id),
        }));

        setPosts(postsWithFires);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [profile]);

  const handleReaction = async (postId: string, hasFired: boolean) => {
    if (!profile) return;

    const supabase = getClient();

    if (hasFired) {
      // Remove fire
      await supabase
        .from('post_fires')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', profile.id);

      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, likes_count: p.likes_count - 1, has_fired: false }
            : p
        )
      );
    } else {
      // Add fire
      await supabase
        .from('post_fires')
        .insert({ post_id: postId, user_id: profile.id });

      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, likes_count: p.likes_count + 1, has_fired: true }
            : p
        )
      );
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !profile) return;

    setSubmitting(true);
    const supabase = getClient();

    const { data, error } = await supabase
      .from('posts')
      .insert({
        id: crypto.randomUUID(),
        user_id: profile.id,
        type: newPost.type,
        title: newPost.title,
        content: newPost.content,
      })
      .select(`
        *,
        author:profiles!posts_user_id_fkey(id, name, image, level)
      `)
      .single();

    if (data && !error) {
      setPosts(prev => [{ ...data, has_fired: false }, ...prev]);
      setShowNewPost(false);
      setNewPost({ title: '', content: '', type: 'share' });
    }

    setSubmitting(false);
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

  // Filter posts
  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter(p => p.type === filter);

  const postCategories = [
    { key: 'question', label: '發問', emoji: '❓' },
    { key: 'share', label: '分享', emoji: '🏆' },
    { key: 'challenge', label: '挑戰', emoji: '🎯' },
  ] as const;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">社群</h1>
          <p className="text-muted-foreground">一起交流、分享、學習</p>
        </div>
        <Button onClick={() => setShowNewPost(true)}>發表貼文</Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {Object.entries(FILTERS).map(([key, { label, emoji }]) => (
          <button
            key={key}
            onClick={() => setFilter(key as FilterType)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
              filter === key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            )}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">發表新貼文</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              className="w-full p-3 rounded-lg border bg-background"
              placeholder="標題"
              value={newPost.title}
              onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-none"
              placeholder="分享你的想法..."
              value={newPost.content}
              onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
            />
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {postCategories.map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    onClick={() => setNewPost((prev) => ({ ...prev, type: key }))}
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all',
                      newPost.type === key
                        ? categoryColors[key]
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                取消
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={!newPost.title.trim() || !newPost.content.trim() || submitting}
              >
                {submitting ? '發表中...' : '發表'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">還沒有貼文，來發表第一則吧！</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const author = post.author as Profile | undefined;
            return (
              <Card
                key={post.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/community/${post.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* User Avatar */}
                    {author?.image ? (
                      <img
                        src={author.image}
                        alt=""
                        className="w-10 h-10 rounded-full shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium">
                          {author?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{author?.name || '匿名用戶'}</span>
                        <span className="text-xs text-muted-foreground">Lv.{author?.level || 1}</span>
                        <span className="text-sm text-muted-foreground">
                          {timeAgo(post.created_at)}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 mb-2">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium shrink-0',
                            categoryColors[post.type] || 'bg-gray-100'
                          )}
                        >
                          {FILTERS[post.type as FilterType]?.emoji || '📋'}{' '}
                          {FILTERS[post.type as FilterType]?.label || post.type}
                        </span>
                        <h3 className="font-semibold">{post.title}</h3>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>

                      {/* Image Preview */}
                      {post.image && (
                        <div className="mt-3 rounded-lg overflow-hidden max-w-xs">
                          <img
                            src={post.image}
                            alt=""
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}

                      {/* Interactions */}
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReaction(post.id, post.has_fired || false);
                          }}
                          className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded transition-all',
                            post.has_fired ? 'bg-orange-100 text-orange-700' : 'hover:bg-muted'
                          )}
                        >
                          <span>🔥</span>
                          <span className="text-sm font-medium">{post.likes_count}</span>
                        </button>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>💬</span>
                          <span className="text-sm">{post.comments_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
