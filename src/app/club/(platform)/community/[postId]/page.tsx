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

const POST_CATEGORIES: Record<string, { label: string; emoji: string }> = {
  general: { label: '一般', emoji: '💬' },
  question: { label: '發問', emoji: '❓' },
  showcase: { label: '分享', emoji: '✨' },
  resource: { label: '資源', emoji: '📚' },
  challenge: { label: '挑戰', emoji: '🏆' },
};

const categoryColors: Record<string, string> = {
  general: 'bg-blue-100 text-blue-700',
  question: 'bg-purple-100 text-purple-700',
  showcase: 'bg-green-100 text-green-700',
  resource: 'bg-amber-100 text-amber-700',
  challenge: 'bg-orange-100 text-orange-700',
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

interface PostWithUser extends Post {
  user?: Profile;
  has_fired?: boolean;
}

interface CommentWithUser extends Comment {
  user?: Profile;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [post, setPost] = useState<PostWithUser | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      const supabase = getClient();

      // Fetch post with user info
      const { data: postData } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles(id, name, image, level)
        `)
        .eq('id', postId)
        .maybeSingle();

      if (postData) {
        // Check if user has fired this post
        const { data: fireData } = await supabase
          .from('post_fires')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', profile.id)
          .maybeSingle();

        setPost({
          ...postData,
          has_fired: !!fireData,
        });
      }

      // Fetch comments with user info
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select(`
          *,
          user:profiles(id, name, image, level)
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

    if (post.has_fired) {
      // Remove fire
      await supabase
        .from('post_fires')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', profile.id);

      // Decrement fire count
      await supabase.rpc('decrement_likes_count', { p_post_id: postId });

      setPost(prev => prev ? {
        ...prev,
        has_fired: false,
        likes_count: prev.likes_count - 1,
      } : null);
    } else {
      // Add fire
      await supabase.from('post_fires').insert({
        post_id: postId,
        user_id: profile.id,
      });

      // Increment fire count
      await supabase.rpc('increment_likes_count', { p_post_id: postId });

      setPost(prev => prev ? {
        ...prev,
        has_fired: true,
        likes_count: prev.likes_count + 1,
      } : null);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !profile) return;

    setSubmitting(true);
    const supabase = getClient();

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: profile.id,
        content: newComment.trim(),
      })
      .select(`
        *,
        user:profiles(id, name, image, level)
      `)
      .single();

    if (data && !error) {
      setComments(prev => [...prev, data]);

      // Update comment count on post
      await supabase
        .from('posts')
        .update({ comments_count: (post?.comments_count || 0) + 1 })
        .eq('id', postId);

      setPost(prev => prev ? {
        ...prev,
        comments_count: prev.comments_count + 1,
      } : null);
    }

    setNewComment('');
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

  if (!post) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/club/community')}>
          ← 返回論壇
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">找不到這則貼文</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const postUser = post.user as Profile | undefined;
  const category = POST_CATEGORIES[post.type] || { label: post.type, emoji: '💬' };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 返回按鈕 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/club/community')}
      >
        ← 返回論壇
      </Button>

      {/* 貼文內容 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {/* 用戶頭像 */}
            {postUser?.image ? (
              <img
                src={postUser.image}
                alt=""
                className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-medium">
                  {postUser?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}

            {/* 內容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{postUser?.name || '匿名用戶'}</span>
                <span className="text-xs text-muted-foreground">Lv.{postUser?.level || 1}</span>
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
                  {category.emoji} {category.label}
                </span>
                <h1 className="text-xl font-bold">{post.title}</h1>
              </div>

              <p className="whitespace-pre-wrap mb-4 text-foreground">{post.content}</p>

              {/* 媒體內容 */}
              {post.image && (
                <div className="mb-4">
                  <img
                    src={post.image}
                    alt=""
                    className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setEnlargedImage(post.image!)}
                  />
                </div>
              )}

              {/* 互動區 */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <button
                  onClick={handleReaction}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                    post.has_fired
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

      {/* 新增留言 */}
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

      {/* 留言列表 */}
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
                const commentUser = comment.user as Profile | undefined;
                return (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                    {commentUser?.image ? (
                      <img
                        src={commentUser.image}
                        alt=""
                        className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">
                          {commentUser?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{commentUser?.name || '匿名用戶'}</span>
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

      {/* 圖片放大查看 */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={enlargedImage}
              alt=""
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
