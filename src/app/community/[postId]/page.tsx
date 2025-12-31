'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Post, Comment, Profile } from '@/types/database';

const categoryColors: Record<string, string> = {
  question: 'bg-purple-100 text-purple-700',
  share: 'bg-green-100 text-green-700',
  challenge: 'bg-orange-100 text-orange-700',
};

const categoryLabels: Record<string, { emoji: string; label: string }> = {
  question: { emoji: '❓', label: '發問' },
  share: { emoji: '🏆', label: '分享' },
  challenge: { emoji: '🎯', label: '挑戰' },
};

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

interface PostWithAuthor extends Post {
  author?: Profile;
}

interface CommentWithAuthor extends Comment {
  author?: Profile;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [hasFired, setHasFired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      const supabase = getClient();

      // Fetch post with author
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_user_id_fkey(id, name, image, level)
        `)
        .eq('id', postId)
        .maybeSingle();

      if (postError) {
        setError('找不到這則貼文');
        setLoading(false);
        return;
      }

      setPost(postData);

      // Check if user has fired
      const { data: fireData } = await supabase
        .from('post_fires')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', profile.id)
        .maybeSingle();

      setHasFired(!!fireData);

      // Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_user_id_fkey(id, name, image)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsData) {
        setComments(commentsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [profile, postId]);

  const handleReaction = async () => {
    if (!profile || !post) return;

    const supabase = getClient();

    if (hasFired) {
      // Remove fire
      await supabase
        .from('post_fires')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', profile.id);

      setHasFired(false);
      setPost(prev => prev ? { ...prev, likes_count: prev.likes_count - 1 } : null);
    } else {
      // Add fire
      await supabase
        .from('post_fires')
        .insert({ post_id: postId, user_id: profile.id });

      setHasFired(true);
      setPost(prev => prev ? { ...prev, likes_count: prev.likes_count + 1 } : null);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !profile) return;

    setSubmitting(true);
    const supabase = getClient();

    const { data, error } = await supabase
      .from('comments')
      .insert({
        id: crypto.randomUUID(),
        post_id: postId,
        user_id: profile.id,
        content: newComment.trim(),
      })
      .select(`
        *,
        author:profiles!comments_user_id_fkey(id, name, image)
      `)
      .single();

    if (data && !error) {
      setComments(prev => [...prev, data]);
      setNewComment('');
      // Update comment count
      setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
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

  if (error || !post) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/community')}>
          ← 返回論壇
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">{error || '找不到這則貼文'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const author = post.author as Profile | undefined;
  const category = categoryLabels[post.type];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/community')}
      >
        ← 返回論壇
      </Button>

      {/* Post Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {/* User Avatar */}
            {author?.image ? (
              <img
                src={author.image}
                alt=""
                className="w-12 h-12 rounded-full shrink-0 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-lg font-medium">
                  {author?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{author?.name || '匿名用戶'}</span>
                <span className="text-xs text-muted-foreground">Lv.{author?.level || 1}</span>
                <span className="text-sm text-muted-foreground">
                  {timeAgo(post.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    categoryColors[post.type] || 'bg-gray-100'
                  )}
                >
                  {category?.emoji} {category?.label || post.type}
                </span>
                <h1 className="text-xl font-bold">{post.title}</h1>
              </div>

              <p className="whitespace-pre-wrap mb-4 text-foreground">{post.content}</p>

              {/* Image */}
              {post.image && (
                <div className="mb-4">
                  <img
                    src={post.image}
                    alt=""
                    className="max-w-full rounded-lg"
                  />
                </div>
              )}

              {/* Interactions */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <button
                  onClick={handleReaction}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                    hasFired
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-muted hover:bg-orange-50'
                  )}
                >
                  <span className="text-xl">🔥</span>
                  <span className="font-medium">{post.likes_count}</span>
                </button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>💬</span>
                  <span>{comments.length} 則留言</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Comment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">發表留言</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <textarea
              className="w-full min-h-[80px] p-3 rounded-lg border bg-background resize-none"
              placeholder="分享你的想法..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? '發表中...' : '發表留言'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">留言 ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              還沒有留言，來當第一個吧！
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const commentAuthor = comment.author as Profile | undefined;
                return (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                    {commentAuthor?.image ? (
                      <img
                        src={commentAuthor.image}
                        alt=""
                        className="w-10 h-10 rounded-full shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium">
                          {commentAuthor?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{commentAuthor?.name || '匿名用戶'}</span>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
