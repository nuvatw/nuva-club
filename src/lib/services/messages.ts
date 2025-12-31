import { getClient } from '@/lib/supabase/client';
import type { Message, Profile } from '@/types/database';

export interface MessageWithSender extends Message {
  sender: Profile;
}

export interface MessageWithReceiver extends Message {
  receiver: Profile;
}

export interface Conversation {
  partnerId: string;
  partner: Profile;
  lastMessage: Message;
  unreadCount: number;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const supabase = getClient();

  // Get all messages involving this user
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(*),
      receiver:profiles!messages_receiver_id_fkey(*)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error || !messages) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Group by conversation partner
  const conversationMap = new Map<string, Conversation>();

  for (const message of messages as (Message & { sender: unknown; receiver: unknown })[]) {
    const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
    const partner = message.sender_id === userId ? message.receiver : message.sender;

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        partnerId,
        partner: partner as Profile,
        lastMessage: message,
        unreadCount: 0,
      });
    }

    // Count unread messages
    if (message.receiver_id === userId && !message.is_read) {
      const conv = conversationMap.get(partnerId)!;
      conv.unreadCount++;
    }
  }

  return Array.from(conversationMap.values());
}

export async function getConversationMessages(
  userId: string,
  partnerId: string
): Promise<MessageWithSender[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(*)
    `)
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data.map((m: Message & { sender: unknown }) => ({
    ...m,
    sender: m.sender as Profile,
  }));
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message | null> {
  const supabase = getClient();

  const messageId = `msg-${Date.now()}`;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      id: messageId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  return data;
}

export async function markMessagesAsRead(userId: string, partnerId: string): Promise<void> {
  const supabase = getClient();

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', partnerId)
    .eq('receiver_id', userId)
    .eq('is_read', false);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = getClient();

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false);

  if (error) {
    return 0;
  }

  return count || 0;
}
