'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useUser } from '@/lib/mock/user-context';
import {
  MOCK_CONVERSATIONS,
  MOCK_IMAGE_OPTIONS,
  type MockMessage,
  type MockConversation,
} from '@/lib/mock/messages';

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '剛剛';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分鐘`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小時`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} 天`;
  return date.toLocaleDateString('zh-TW');
}

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
}

export default function MessagesPage() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<MockConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 載入對話
  useEffect(() => {
    if (user) {
      const userConvs = MOCK_CONVERSATIONS.filter(c =>
        c.participants.some(p => p.id === user.id)
      );
      setConversations(userConvs);
    }
  }, [user]);

  // 滾動到最新訊息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversationId, conversations]);

  // 取得選中的對話
  const selectedConversation = useMemo(() => {
    return conversations.find(c => c.id === selectedConversationId);
  }, [conversations, selectedConversationId]);

  // 取得對話的另一方
  const getOtherParticipant = (conv: MockConversation) => {
    return conv.participants.find(p => p.id !== user?.id);
  };

  // 發送訊息
  const handleSend = () => {
    if ((!newMessage.trim() && !selectedImage) || !selectedConversationId || !user) return;

    const newMsg: MockMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      content: newMessage.trim(),
      mediaUrl: selectedImage || undefined,
      mediaType: selectedImage ? 'image' : undefined,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConversationId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              updatedAt: newMsg.createdAt,
            }
          : c
      )
    );

    setNewMessage('');
    setSelectedImage(null);
    setShowImagePicker(false);
  };

  // 選擇對話
  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    // 標記為已讀
    setConversations(prev =>
      prev.map(c =>
        c.id === convId
          ? {
              ...c,
              unreadCount: 0,
              messages: c.messages.map(m => ({ ...m, isRead: true })),
            }
          : c
      )
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-muted-foreground">請先登入</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* 對話列表側邊欄 */}
      <Card className="w-80 flex-shrink-0 overflow-hidden">
        <CardHeader className="py-4 border-b">
          <CardTitle className="text-lg">訊息</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto h-[calc(100%-4rem)]">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              還沒有對話
            </p>
          ) : (
            <div className="divide-y">
              {conversations
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((conv) => {
                  const other = getOtherParticipant(conv);
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  const lastPreview = lastMsg?.mediaUrl
                    ? '📷 圖片'
                    : lastMsg?.content?.slice(0, 30) || '開始對話...';

                  return (
                    <button
                      key={conv.id}
                      className={cn(
                        'w-full p-4 flex items-start gap-3 text-left hover:bg-muted/50 transition-colors',
                        selectedConversationId === conv.id && 'bg-muted'
                      )}
                      onClick={() => handleSelectConversation(conv.id)}
                    >
                      <img
                        src={other?.image}
                        alt=""
                        className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{other?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(conv.updatedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground truncate flex-1">
                            {lastPreview}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 訊息區域 */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            選擇一個對話開始聊天
          </div>
        ) : (
          <>
            {/* 標題列 */}
            <CardHeader className="py-3 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={getOtherParticipant(selectedConversation)?.image}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <CardTitle className="text-lg">
                  {getOtherParticipant(selectedConversation)?.name}
                </CardTitle>
              </div>
            </CardHeader>

            {/* 訊息列表 */}
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {selectedConversation.messages.map((msg) => {
                  const isOwn = msg.senderId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl',
                          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}
                      >
                        {/* 圖片訊息 */}
                        {msg.mediaUrl && msg.mediaType === 'image' && (
                          <div
                            className="cursor-pointer"
                            onClick={() => setEnlargedImage(msg.mediaUrl!)}
                          >
                            <img
                              src={msg.mediaUrl}
                              alt=""
                              className="rounded-t-2xl w-full max-w-xs object-cover"
                            />
                          </div>
                        )}
                        {/* 文字內容 */}
                        {msg.content && (
                          <div className={cn('p-3', msg.mediaUrl && 'pt-2')}>
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                        )}
                        {/* 時間 */}
                        <div
                          className={cn(
                            'text-xs px-3 pb-2',
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}
                        >
                          {formatMessageTime(msg.createdAt)}
                          {isOwn && (
                            <span className="ml-2">{msg.isRead ? '✓✓' : '✓'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* 圖片選擇器 */}
            {showImagePicker && (
              <div className="border-t p-3 bg-muted/30">
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
              <div className="border-t p-3 bg-muted/30">
                <div className="flex items-center gap-2">
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
              </div>
            )}

            {/* 輸入區 */}
            <div className="p-4 border-t flex-shrink-0">
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
                <input
                  type="text"
                  className="flex-1 p-3 rounded-lg border bg-background"
                  placeholder="輸入訊息..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() && !selectedImage}
                >
                  發送
                </Button>
              </div>
            </div>
          </>
        )}
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
