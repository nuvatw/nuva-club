import { MOCK_USERS } from './users';

export type NotificationType = 'comment' | 'fire' | 'system' | 'message';

export interface MockNotification {
  id: string;
  userId: string;           // 接收者
  type: NotificationType;
  title: string;
  content: string;
  linkTo?: string;          // 點擊後導向
  fromUserId?: string;      // 來源用戶
  fromUserName?: string;
  fromUserImage?: string;
  isRead: boolean;
  createdAt: string;
}

// 為小美建立的通知（預設登入用戶）
export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-xiaomei',
    type: 'comment',
    title: '新留言',
    content: '阿傑 在你的貼文「Claude 和 ChatGPT 哪個比較好用？」留言了',
    linkTo: '/community/post-6',
    fromUserId: 'user-ajie',
    fromUserName: '阿傑',
    fromUserImage: MOCK_USERS[1].image,
    isRead: false,
    createdAt: '2024-12-23T10:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-xiaomei',
    type: 'fire',
    title: '獲得火焰',
    content: '雅婷 給你的「免費 AI 工具大全」點了火焰 🔥',
    linkTo: '/community/post-4',
    fromUserId: 'user-yating',
    fromUserName: '雅婷',
    fromUserImage: MOCK_USERS[2].image,
    isRead: false,
    createdAt: '2024-12-20T09:00:00Z',
  },
  {
    id: 'notif-3',
    userId: 'user-xiaomei',
    type: 'message',
    title: '新訊息',
    content: '阿傑 傳送了新訊息給你',
    linkTo: '/messages',
    fromUserId: 'user-ajie',
    fromUserName: '阿傑',
    fromUserImage: MOCK_USERS[1].image,
    isRead: false,
    createdAt: '2024-12-22T16:00:00Z',
  },
  {
    id: 'notif-4',
    userId: 'user-xiaomei',
    type: 'system',
    title: '挑戰即將結束',
    content: '「AI 節日賀卡創作」挑戰還剩 7 天，趕快參加吧！',
    linkTo: '/challenges/challenge-dec-2024',
    isRead: true,
    createdAt: '2024-12-24T09:00:00Z',
  },
  {
    id: 'notif-5',
    userId: 'user-xiaomei',
    type: 'system',
    title: '新挑戰預告',
    content: '一月挑戰「AI 新年目標」即將開始，準備好了嗎？',
    linkTo: '/challenges',
    isRead: true,
    createdAt: '2024-12-25T09:00:00Z',
  },
  {
    id: 'notif-6',
    userId: 'user-xiaomei',
    type: 'comment',
    title: '新留言',
    content: '雅婷 在你的貼文「免費 AI 工具大全」留言了',
    linkTo: '/community/post-4',
    fromUserId: 'user-yating',
    fromUserName: '雅婷',
    fromUserImage: MOCK_USERS[2].image,
    isRead: true,
    createdAt: '2024-12-20T09:00:00Z',
  },
];

// 根據用戶 ID 取得通知
export function getNotificationsByUserId(userId: string): MockNotification[] {
  return MOCK_NOTIFICATIONS.filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// 取得未讀通知數量
export function getUnreadCount(userId: string): number {
  return MOCK_NOTIFICATIONS.filter(n => n.userId === userId && !n.isRead).length;
}

// 通知類型圖示
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  comment: '💬',
  fire: '🔥',
  system: '📢',
  message: '✉️',
};
