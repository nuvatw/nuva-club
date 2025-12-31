import type { UserRole, PlanType, SubscriptionStatus, LevelNumber } from '@/types';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  image: string;
  role: UserRole;
  availableRoles: UserRole[];
  level: LevelNumber;
  planType: PlanType;
  subscriptionStatus: SubscriptionStatus;
  cohortMonth: string;
  nunuApplicationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  assignedNunuId?: string;
  createdAt: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'user-xiaomei',
    name: '小美',
    email: 'xiaomei@example.com',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    role: 'vava',
    availableRoles: ['vava'],
    level: 3,
    planType: 'basic',
    subscriptionStatus: 'active',
    cohortMonth: '2024-10',
    nunuApplicationStatus: 'none',
    assignedNunuId: 'user-ajie',
    createdAt: '2024-10-15T08:00:00Z',
  },
  {
    id: 'user-ajie',
    name: '阿傑',
    email: 'ajie@example.com',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'nunu',
    availableRoles: ['vava', 'nunu'],
    level: 8,
    planType: 'club',
    subscriptionStatus: 'active',
    cohortMonth: '2024-06',
    nunuApplicationStatus: 'approved',
    createdAt: '2024-06-01T08:00:00Z',
  },
  {
    id: 'user-yating',
    name: '雅婷',
    email: 'yating@example.com',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'vava',
    availableRoles: ['vava'],
    level: 5,
    planType: 'club',
    subscriptionStatus: 'active',
    cohortMonth: '2024-08',
    nunuApplicationStatus: 'pending',
    assignedNunuId: 'user-ajie',
    createdAt: '2024-08-20T08:00:00Z',
  },
  {
    id: 'user-admin',
    name: '管理員',
    email: 'admin@nuvaclub.com',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'guardian',
    availableRoles: ['vava', 'nunu', 'guardian'],
    level: 12,
    planType: 'club',
    subscriptionStatus: 'active',
    cohortMonth: '2024-01',
    nunuApplicationStatus: 'approved',
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'user-xiaofang',
    name: '小芳',
    email: 'xiaofang@example.com',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    role: 'vava',
    availableRoles: ['vava'],
    level: 2,
    planType: 'basic',
    subscriptionStatus: 'trial',
    cohortMonth: '2024-11',
    nunuApplicationStatus: 'none',
    assignedNunuId: 'user-ajie',
    createdAt: '2024-11-01T08:00:00Z',
  },
];

export const getDemoAccounts = () => [
  {
    user: MOCK_USERS[0],
    description: '新學員，等級 3，基礎方案',
    tag: '法法',
  },
  {
    user: MOCK_USERS[1],
    description: '已認證教練，可切換法法 ↔ 努努',
    tag: '努努',
  },
  {
    user: MOCK_USERS[3],
    description: '完整權限，三角色切換',
    tag: '守護者',
  },
];
