'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { MOCK_POSTS, POST_CATEGORIES, type PostCategory } from '@/lib/mock/posts';
import { useUser } from '@/lib/mock/user-context';
import { useDatabase } from '@/lib/mock/database-context';

const categoryColors: Record<string, string> = {
  general: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  question: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  showcase: 'bg-green-100 text-green-700 hover:bg-green-200',
  resource: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  challenge: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
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

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useUser();
  const { state, firePost, unfirePost, createPost } = useDatabase();
  const [filter, setFilter] = useState<PostCategory | 'all'>('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' as 'general' | 'showcase' | 'question' | 'resource' | 'challenge' });

  // 合併 mock posts 和 database posts，並根據篩選器過濾
  const allPosts = useMemo(() => {
    // 將 database posts 放在前面（較新），mock posts 在後面
    const combined = [...state.posts, ...MOCK_POSTS.filter(mp => !state.posts.some(p => p.id === mp.id))];

    // 根據篩選器過濾
    const filtered = filter === 'all'
      ? combined
      : combined.filter(p => p.category === filter);

    // 置頂貼文優先，然後按時間排序
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [state.posts, filter]);

  const handleReaction = (postId: string, hasFired: boolean) => {
    if (!user) return;
    if (hasFired) {
      unfirePost(postId, user.id);
    } else {
      firePost(postId, user.id);
    }
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !user) return;

    createPost({
      id: `post-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      userLevel: user.level,
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      fireCount: 0,
      commentCount: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    });

    setShowNewPost(false);
    setNewPost({ title: '', content: '', category: 'general' });
  };

  const categories = Object.entries(POST_CATEGORIES) as [PostCategory | 'all', typeof POST_CATEGORIES[keyof typeof POST_CATEGORIES]][];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">社群論壇</h1>
          <p className="text-muted-foreground">
            一起交流、分享、學習
          </p>
        </div>
        <Button onClick={() => setShowNewPost(true)}>發表貼文</Button>
      </div>

      {/* 篩選器 */}
      <div className="flex flex-wrap gap-2">
        {categories.map(([key, { label, emoji }]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
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

      {/* 新貼文表單 */}
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
                {Object.entries(POST_CATEGORIES)
                  .filter(([key]) => key !== 'all')
                  .map(([key, { label, emoji }]) => (
                    <button
                      key={key}
                      onClick={() => setNewPost((prev) => ({ ...prev, category: key as 'general' | 'showcase' | 'question' | 'resource' | 'challenge' }))}
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all',
                        newPost.category === key
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
                disabled={!newPost.title.trim() || !newPost.content.trim()}
              >
                發表
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 貼文列表 */}
      {allPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">還沒有貼文，來發表第一則吧！</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allPosts.map((post) => (
            <Card
              key={post.id}
              className={cn(
                'hover:shadow-md transition-shadow cursor-pointer',
                post.isPinned && 'border-primary bg-primary/5'
              )}
              onClick={() => router.push(`/community/${post.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* 用戶頭像 */}
                  {post.userImage ? (
                    <img
                      src={post.userImage}
                      alt=""
                      className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">
                        {post.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* 內容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{post.userName}</span>
                      <span className="text-xs text-muted-foreground">Lv.{post.userLevel}</span>
                      <span className="text-sm text-muted-foreground">
                        {timeAgo(post.createdAt)}
                      </span>
                      {post.isPinned && (
                        <Badge variant="outline" className="text-xs">
                          📌 置頂
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-start gap-2 mb-2">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          categoryColors[post.category] || 'bg-gray-100'
                        )}
                      >
                        {POST_CATEGORIES[post.category as keyof typeof POST_CATEGORIES]?.emoji}{' '}
                        {POST_CATEGORIES[post.category as keyof typeof POST_CATEGORIES]?.label || post.category}
                      </span>
                      <h3 className="font-semibold">{post.title}</h3>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>

                    {/* 媒體預覽 */}
                    {post.mediaUrl && post.mediaType === 'image' && (
                      <div className="mt-3 rounded-lg overflow-hidden max-w-xs">
                        <img
                          src={post.mediaUrl}
                          alt=""
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}

                    {/* 互動區 */}
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(post.id, post.hasFired || false);
                        }}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded transition-all',
                          post.hasFired ? 'bg-orange-100 text-orange-700' : 'hover:bg-muted'
                        )}
                      >
                        <span>🔥</span>
                        <span className="text-sm font-medium">{post.fireCount}</span>
                      </button>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>💬</span>
                        <span className="text-sm">{post.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
