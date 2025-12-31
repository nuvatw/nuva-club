'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

const LEVELS = [
  { level: 1, displayName: 'Lv.1' },
  { level: 2, displayName: 'Lv.2' },
  { level: 3, displayName: 'Lv.3' },
  { level: 4, displayName: 'Lv.4' },
  { level: 5, displayName: 'Lv.5' },
  { level: 6, displayName: 'Lv.6' },
  { level: 7, displayName: 'Lv.7' },
  { level: 8, displayName: 'Lv.8' },
  { level: 9, displayName: 'Lv.9' },
  { level: 10, displayName: 'Lv.10' },
  { level: 11, displayName: 'Lv.11' },
  { level: 12, displayName: 'Lv.12' },
];

function getLevelName(level: number) {
  return LEVELS.find((l) => l.level === level)?.displayName || `第 ${level} 級`;
}

type RoleFilter = 'all' | 'vava' | 'nunu' | 'guardian';
type StatusFilter = 'all' | 'active' | 'trial' | 'canceled';

export default function UsersPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading && profile && profile.role !== 'guardian') {
      router.push('/club/dashboard');
    }
  }, [authLoading, profile, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchUsers = async () => {
      const supabase = getClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('level', { ascending: false });

      if (data) {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [profile]);

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

  // Filter users
  let filteredUsers = [...users];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredUsers = filteredUsers.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  }

  if (roleFilter !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
  }

  if (statusFilter !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.subscription_status === statusFilter);
  }

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.subscription_status === 'active').length;
  const trialUsers = users.filter(u => u.subscription_status === 'trial').length;
  const coachCount = users.filter(u => u.role === 'nunu').length;

  const roleLabels: Record<string, string> = {
    vava: '法法',
    nunu: '努努',
    guardian: '守護者',
  };

  const statusLabels: Record<string, string> = {
    active: '活躍',
    trial: '試用',
    canceled: '已取消',
    expired: '已過期',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    trial: 'bg-blue-100 text-blue-700',
    canceled: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">用戶管理</h1>
          <p className="text-muted-foreground">查看和管理所有平台用戶</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/club/guardian/dashboard')}>
          返回主頁
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{totalUsers}</p>
            <p className="text-sm text-muted-foreground">總用戶</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
            <p className="text-sm text-muted-foreground">活躍用戶</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{trialUsers}</p>
            <p className="text-sm text-muted-foreground">試用中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{coachCount}</p>
            <p className="text-sm text-muted-foreground">教練數</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="搜尋用戶姓名或 Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border bg-background"
        />
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: '全部角色' },
            { key: 'vava', label: '法法' },
            { key: 'nunu', label: '努努' },
            { key: 'guardian', label: '守護者' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setRoleFilter(key as RoleFilter)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm transition-all',
                roleFilter === key
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: '全部狀態' },
            { key: 'active', label: '活躍' },
            { key: 'trial', label: '試用' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key as StatusFilter)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm transition-all',
                statusFilter === key
                  ? 'bg-foreground text-background'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">用戶列表</CardTitle>
          <CardDescription>共 {filteredUsers.length} 位用戶</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              找不到符合條件的用戶
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">用戶</th>
                    <th className="pb-3 font-medium">等級</th>
                    <th className="pb-3 font-medium">角色</th>
                    <th className="pb-3 font-medium">方案</th>
                    <th className="pb-3 font-medium">狀態</th>
                    <th className="pb-3 font-medium">加入時間</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-medium">{user.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="secondary">{getLevelName(user.level)}</Badge>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            user.role === 'guardian' && 'bg-purple-50 text-purple-700',
                            user.role === 'nunu' && 'bg-blue-50 text-blue-700'
                          )}
                        >
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <span className="text-sm">
                          {user.plan_type === 'club' ? '俱樂部' : '基礎'}
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge className={cn('text-xs', statusColors[user.subscription_status] || '')}>
                          {statusLabels[user.subscription_status] || user.subscription_status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {user.cohort_month}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
