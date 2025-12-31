'use client';

import { useState, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useUser } from '@/lib/mock/user-context';
import { useDatabase } from '@/lib/mock/database-context';
import { MOCK_POSTS, POST_CATEGORIES, type MockPost, type MockComment } from '@/lib/mock/posts';
import { MOCK_IMAGE_OPTIONS } from '@/lib/mock/messages';

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

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const { state, firePost, unfirePost } = useDatabase();
  const [newComment, setNewComment] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<MockComment[]>([]);

  // 從 database state 或 mock data 取得貼文
  const post = useMemo(() => {
    const dbPost = state.posts.find(p => p.id === postId);
    if (dbPost) return dbPost;
    return MOCK_POSTS.find(p => p.id === postId);
  }, [state.posts, postId]);

  // 合併原有留言和本地新增的留言
  const allComments = useMemo(() => {
    if (!post) return [];
    return [...post.comments, ...localComments];
  }, [post, localComments]);

  const handleReaction = () => {
    if (!user || !post) return;
    const hasFired = post.firedByUsers?.includes(user.id) || post.hasFired;
    if (hasFired) {
      unfirePost(post.id, user.id);
    } else {
      firePost(post.id, user.id);
    }
  };

  const handleAddComment = () => {
    if ((!newComment.trim() && !selectedImage) || !user) return;

    const newCommentObj: MockComment = {
      id: `comment-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      content: newComment.trim(),
      mediaUrl: selectedImage || undefined,
      mediaType: selectedImage ? 'image' : undefined,
      fireCount: 0,
      createdAt: new Date().toISOString(),
    };

    setLocalComments(prev => [...prev, newCommentObj]);
    setNewComment('');
    setSelectedImage(null);
    setShowImagePicker(false);
  };

  if (!post) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/community')}>
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

  const category = POST_CATEGORIES[post.category as keyof typeof POST_CATEGORIES];
  const hasFired = user ? (post.firedByUsers?.includes(user.id) || post.hasFired) : false;

  return (
    <div className="space-y-6">
      {/* 返回按鈕 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/community')}
      >
        ← 返回論壇
      </Button>

      {/* 貼文內容 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {/* 用戶頭像 */}
            {post.userImage ? (
              <img
                src={post.userImage}
                alt=""
                className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-medium">
                  {post.userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* 內容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
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

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    categoryColors[post.category] || 'bg-gray-100'
                  )}
                >
                  {category?.emoji} {category?.label || post.category}
                </span>
                <h1 className="text-xl font-bold">{post.title}</h1>
              </div>

              <p className="whitespace-pre-wrap mb-4 text-foreground">{post.content}</p>

              {/* 媒體內容 */}
              {post.mediaUrl && post.mediaType === 'image' && (
                <div className="mb-4">
                  <img
                    src={post.mediaUrl}
                    alt=""
                    className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setEnlargedImage(post.mediaUrl!)}
                  />
                </div>
              )}

              {/* 互動區 */}
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
                  <span className="font-medium">{post.fireCount}</span>
                </button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>💬</span>
                  <span>{allComments.length} 則留言</span>
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

            {/* 圖片選擇器 */}
            {showImagePicker && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">選擇圖片</span>
                  <button
                    onClick={() => {
                      setShowImagePicker(false);
                      setSelectedImage(null);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    取消
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {MOCK_IMAGE_OPTIONS.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.url)}
                      className={cn(
                        'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                        selectedImage === img.url
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent hover:border-muted-foreground/30'
                      )}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 已選圖片預覽 */}
            {selectedImage && !showImagePicker && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                <img
                  src={selectedImage}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-sm text-red-500 hover:underline"
                >
                  移除
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowImagePicker(!showImagePicker)}
                className={cn(
                  'p-3 rounded-lg border transition-colors',
                  showImagePicker ? 'bg-primary text-white' : 'hover:bg-muted'
                )}
                title="上傳圖片"
              >
                📷
              </button>
              <div className="flex-1" />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() && !selectedImage}
              >
                發表留言
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 留言列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">留言 ({allComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {allComments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              還沒有留言，來當第一個吧！
            </p>
          ) : (
            <div className="space-y-4">
              {allComments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                  {comment.userImage ? (
                    <img
                      src={comment.userImage}
                      alt=""
                      className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">
                        {comment.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                    {comment.content && (
                      <p className="text-sm whitespace-pre-wrap mb-2">{comment.content}</p>
                    )}
                    {/* 留言圖片 */}
                    {comment.mediaUrl && comment.mediaType === 'image' && (
                      <div
                        className="mt-2 cursor-pointer"
                        onClick={() => setEnlargedImage(comment.mediaUrl!)}
                      >
                        <img
                          src={comment.mediaUrl}
                          alt=""
                          className="max-w-xs rounded-lg hover:opacity-90 transition-opacity"
                        />
                      </div>
                    )}
                    {/* 火焰反應 */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded text-xs transition-all',
                          comment.hasFired
                            ? 'bg-orange-100 text-orange-700'
                            : 'hover:bg-muted'
                        )}
                      >
                        🔥 {comment.fireCount}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
