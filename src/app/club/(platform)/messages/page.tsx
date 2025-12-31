'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerImage: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface UserForMessage {
  id: string;
  name: string;
  image: string | null;
}

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
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserForMessage[]>([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchConversations = async () => {
      const supabase = getClient();

      // Get all messages involving this user
      const { data: allMessages } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, name, image),
          receiver:profiles!messages_receiver_id_fkey(id, name, image)
        `)
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (allMessages) {
        // Group by conversation partner
        const convMap = new Map<string, Conversation>();

        allMessages.forEach((msg: any) => {
          const isReceived = msg.receiver_id === profile.id;
          const partnerId = isReceived ? msg.sender_id : msg.receiver_id;
          const partner = isReceived ? msg.sender : msg.receiver;

          if (!convMap.has(partnerId)) {
            convMap.set(partnerId, {
              partnerId,
              partnerName: partner?.name || 'Unknown',
              partnerImage: partner?.image,
              lastMessage: msg.content,
              lastMessageTime: msg.created_at,
              unreadCount: isReceived && !msg.is_read ? 1 : 0,
            });
          } else if (isReceived && !msg.is_read) {
            const conv = convMap.get(partnerId)!;
            conv.unreadCount++;
          }
        });

        setConversations(Array.from(convMap.values()));
      }
      setLoading(false);
    };

    fetchConversations();
  }, [profile]);

  useEffect(() => {
    if (!profile || !selectedConversation) return;

    const fetchMessages = async () => {
      const supabase = getClient();

      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, name, image)
        `)
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);

        // Mark as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('receiver_id', profile.id)
          .eq('sender_id', selectedConversation);
      }
    };

    fetchMessages();
  }, [profile, selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search for users to start new conversation
  useEffect(() => {
    if (!profile || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setSearching(true);
      const supabase = getClient();

      const { data } = await supabase
        .from('profiles')
        .select('id, name, image')
        .neq('id', profile.id)
        .ilike('name', `%${searchQuery}%`)
        .limit(10);

      setSearchResults(data || []);
      setSearching(false);
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, profile]);

  const startConversation = (user: UserForMessage) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.partnerId === user.id);
    if (existing) {
      setSelectedConversation(user.id);
    } else {
      // Add new conversation to list
      setConversations(prev => [{
        partnerId: user.id,
        partnerName: user.name,
        partnerImage: user.image,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      }, ...prev]);
      setSelectedConversation(user.id);
    }
    setShowNewConversation(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !profile) return;

    const supabase = getClient();

    const { data } = await supabase
      .from('messages')
      .insert({
        sender_id: profile.id,
        receiver_id: selectedConversation,
        content: newMessage.trim(),
        is_read: false,
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, name, image)
      `)
      .single();

    if (data) {
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    }
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

  const selectedPartner = conversations.find(c => c.partnerId === selectedConversation);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">訊息</h1>

      <div className="grid md:grid-cols-3 gap-4 h-[600px]">
        {/* Conversation List */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">對話列表</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNewConversation(!showNewConversation)}
              >
                + 新訊息
              </Button>
            </div>
            {showNewConversation && (
              <div className="mt-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋用戶..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                {searching && <p className="text-xs text-muted-foreground mt-2">搜尋中...</p>}
                {searchResults.length > 0 && (
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => startConversation(user)}
                        className="w-full flex items-center gap-2 p-2 text-left hover:bg-muted/50 border-b last:border-b-0"
                      >
                        {user.image ? (
                          <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">{user.name.charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-sm">{user.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto" style={{ maxHeight: showNewConversation ? '350px' : '520px' }}>
            {conversations.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">沒有對話，點擊「新訊息」開始聊天</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.partnerId}
                  onClick={() => setSelectedConversation(conv.partnerId)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors border-b',
                    selectedConversation === conv.partnerId && 'bg-primary/5'
                  )}
                >
                  {conv.partnerImage ? (
                    <img
                      src={conv.partnerImage}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium">{conv.partnerName.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{conv.partnerName}</span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          {selectedConversation && selectedPartner ? (
            <>
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center gap-3">
                  {selectedPartner.partnerImage ? (
                    <img
                      src={selectedPartner.partnerImage}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium">{selectedPartner.partnerName.charAt(0)}</span>
                    </div>
                  )}
                  <CardTitle className="text-base">{selectedPartner.partnerName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '420px' }}>
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === profile.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2',
                          isOwn
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={cn(
                          'text-[10px] mt-1',
                          isOwn ? 'text-white/70' : 'text-muted-foreground'
                        )}>
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="輸入訊息..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="rounded-full"
                  >
                    送出
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              選擇一個對話開始聊天
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
