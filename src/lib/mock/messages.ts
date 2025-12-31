import { MOCK_USERS } from './users';

export interface MockMessage {
  id: string;
  senderId: string;
  content: string;
  mediaUrl?: string;        // 圖片 URL
  mediaType?: 'image';      // 媒體類型
  createdAt: string;
  isRead: boolean;
}

// 預設 mock 圖片列表（用於模擬上傳）
export const MOCK_IMAGE_OPTIONS = [
  { id: 'img-1', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop', label: 'AI 機器人' },
  { id: 'img-2', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', label: '科技場景' },
  { id: 'img-3', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop', label: '電腦螢幕' },
  { id: 'img-4', url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=300&fit=crop', label: '工作桌面' },
  { id: 'img-5', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop', label: 'AI 藝術' },
  { id: 'img-6', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', label: '團隊協作' },
];

export interface MockConversation {
  id: string;
  participants: {
    id: string;
    name: string;
    image: string;
  }[];
  messages: MockMessage[];
  lastMessage?: MockMessage;
  unreadCount: number;
  updatedAt: string;
}

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: 'conv-1',
    participants: [
      { id: 'user-xiaomei', name: '小美', image: MOCK_USERS[0].image },
      { id: 'user-ajie', name: '阿傑', image: MOCK_USERS[1].image },
    ],
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-ajie',
        content: '嗨小美！歡迎加入俱樂部。我是你的指定教練，有任何問題隨時找我！',
        createdAt: '2024-10-16T09:00:00Z',
        isRead: true,
      },
      {
        id: 'msg-2',
        senderId: 'user-xiaomei',
        content: '謝謝阿傑！我真的很興奮要開始學習。我有一個關於第一堂課的問題。',
        createdAt: '2024-10-16T09:30:00Z',
        isRead: true,
      },
      {
        id: 'msg-3',
        senderId: 'user-ajie',
        content: '當然！你想知道什麼？',
        createdAt: '2024-10-16T09:35:00Z',
        isRead: true,
      },
      {
        id: 'msg-4',
        senderId: 'user-xiaomei',
        content: '我有點搞不清楚機器學習和深度學習的差別。可以解釋一下嗎？',
        createdAt: '2024-10-16T10:00:00Z',
        isRead: true,
      },
      {
        id: 'msg-5',
        senderId: 'user-ajie',
        content: '好問題！這樣想：\n\n機器學習就像教電腦辨識模式。你給它看很多例子，它就學會規則。\n\n深度學習是機器學習的一種，使用多層神經網路（所以叫「深度」）。它特別擅長複雜任務，像是圖像辨識。\n\n所以所有深度學習都是機器學習，但不是所有機器學習都是深度學習！',
        createdAt: '2024-10-16T10:15:00Z',
        isRead: true,
      },
      {
        id: 'msg-6',
        senderId: 'user-xiaomei',
        content: '這樣說就懂了！謝謝你解釋得這麼清楚 🙏',
        createdAt: '2024-10-16T10:20:00Z',
        isRead: true,
      },
      {
        id: 'msg-7',
        senderId: 'user-ajie',
        content: '十二月的挑戰進行得如何？有創作 AI 節日賀卡了嗎？',
        createdAt: '2024-12-20T14:00:00Z',
        isRead: true,
      },
      {
        id: 'msg-8a',
        senderId: 'user-xiaomei',
        content: '正在做！這是我的草稿，覺得怎麼樣？',
        mediaUrl: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600&h=400&fit=crop',
        mediaType: 'image',
        createdAt: '2024-12-21T10:00:00Z',
        isRead: true,
      },
      {
        id: 'msg-8b',
        senderId: 'user-ajie',
        content: '哇，很有冬天的氛圍！構圖很棒，建議可以加一些溫暖的燈光元素。這是我之前做的一個參考：',
        mediaUrl: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=600&h=400&fit=crop',
        mediaType: 'image',
        createdAt: '2024-12-21T11:30:00Z',
        isRead: false,
      },
    ],
    unreadCount: 1,
    updatedAt: '2024-12-21T11:30:00Z',
  },
  {
    id: 'conv-2',
    participants: [
      { id: 'user-xiaomei', name: '小美', image: MOCK_USERS[0].image },
      { id: 'user-yating', name: '雅婷', image: MOCK_USERS[2].image },
    ],
    messages: [
      {
        id: 'msg-8',
        senderId: 'user-yating',
        content: '嗨小美！我看到你的資源分享文了，超有用的！',
        createdAt: '2024-12-19T15:00:00Z',
        isRead: true,
      },
      {
        id: 'msg-9',
        senderId: 'user-xiaomei',
        content: '謝謝雅婷！很高興你覺得有幫助 😊',
        createdAt: '2024-12-19T15:30:00Z',
        isRead: true,
      },
      {
        id: 'msg-10',
        senderId: 'user-yating',
        content: '你要不要一起參加二月的黑客松？我在找隊友！',
        createdAt: '2024-12-19T15:45:00Z',
        isRead: true,
      },
      {
        id: 'msg-11',
        senderId: 'user-xiaomei',
        content: '聽起來很有趣！不過我還是新手，不確定能幫上什麼忙 😅',
        createdAt: '2024-12-19T16:00:00Z',
        isRead: true,
      },
      {
        id: 'msg-12',
        senderId: 'user-yating',
        content: '沒關係！重點是一起學習。而且新鮮的觀點總是很有價值！',
        createdAt: '2024-12-19T16:10:00Z',
        isRead: true,
      },
    ],
    unreadCount: 0,
    updatedAt: '2024-12-19T16:10:00Z',
  },
  {
    id: 'conv-3',
    participants: [
      { id: 'user-ajie', name: '阿傑', image: MOCK_USERS[1].image },
      { id: 'user-yating', name: '雅婷', image: MOCK_USERS[2].image },
    ],
    messages: [
      {
        id: 'msg-13',
        senderId: 'user-yating',
        content: '嗨阿傑！聽說你是這裡的教練之一。想請教你一些建議？',
        createdAt: '2024-12-15T11:00:00Z',
        isRead: true,
      },
      {
        id: 'msg-14',
        senderId: 'user-ajie',
        content: '嗨雅婷！很樂意幫忙。有什麼想法？',
        createdAt: '2024-12-15T11:30:00Z',
        isRead: true,
      },
      {
        id: 'msg-15',
        senderId: 'user-yating',
        content: '我現在等級 5 了，在考慮申請成為教練。可以分享一下感受嗎？有什麼要注意的？',
        createdAt: '2024-12-15T11:45:00Z',
        isRead: true,
      },
      {
        id: 'msg-16',
        senderId: 'user-ajie',
        content: '當努努真的很有成就感！你可以幫助別人同時加深自己的理解。\n\n幾個重點：\n1. 你應該對所有基礎都很熟悉\n2. 耐心和溝通技巧很重要\n3. 不需要什麼都懂——說「讓我查一下」也可以\n4. 時間承諾很彈性，但每週預留幾小時',
        createdAt: '2024-12-15T12:00:00Z',
        isRead: true,
      },
      {
        id: 'msg-17',
        senderId: 'user-yating',
        content: '太有幫助了！我想下個月會申請。謝謝阿傑！',
        createdAt: '2024-12-15T12:15:00Z',
        isRead: true,
      },
    ],
    unreadCount: 0,
    updatedAt: '2024-12-15T12:15:00Z',
  },
];

export const getConversationsForUser = (userId: string) =>
  MOCK_CONVERSATIONS.filter(c => c.participants.some(p => p.id === userId))
    .map(c => ({
      ...c,
      lastMessage: c.messages[c.messages.length - 1],
      otherParticipant: c.participants.find(p => p.id !== userId),
    }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

export const getConversationById = (id: string) => MOCK_CONVERSATIONS.find(c => c.id === id);

export const getTotalUnreadCount = (userId: string) =>
  getConversationsForUser(userId).reduce((sum, c) => sum + c.unreadCount, 0);
