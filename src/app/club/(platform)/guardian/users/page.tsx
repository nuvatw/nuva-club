'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_USERS, LEVELS } from '@/lib/mock';
import { cn } from '@/lib/utils/cn';

function getLevelName(level: number) {
  return LEVELS.find((l) => l.level === level)?.displayName || `第 ${level} 級`;
}

type RoleFilter = 'all' | 'vava' | 'nunu' | 'guardian';
type StatusFilter = 'all' | 'active' | 'trial' | 'canceled';

export default function UsersPage() {
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users
  let users = [...MOCK_USERS];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    users = users.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  }

  if (roleFilter !== 'all') {
    users = users.filter(u => u.role === roleFilter);
  }

  if (statusFilter !== 'all') {
    users = users.filter(u => u.subscriptionStatus === statusFilter);
  }

  // Sort by level descending
  users = users.sort((a, b) => b.level - a.level);

  const roleLabels = {
    vava: '法法',
    nunu: '努努',
    guardian: '守護者',
  };

  const statusLabels = {
    active: '活躍',
    trial: '試用',
    canceled: '已取消',
    expired: '已過期',
  };

  const statusColors = {
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
            <p className="text-3xl font-bold">{MOCK_USERS.length}</p>
            <p className="text-sm text-muted-foreground">總用戶</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {MOCK_USERS.filter(u => u.subscriptionStatus === 'active').length}
            </p>
            <p className="text-sm text-muted-foreground">活躍用戶</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {MOCK_USERS.filter(u => u.subscriptionStatus === 'trial').length}
            </p>
            <p className="text-sm text-muted-foreground">試用中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {MOCK_USERS.filter(u => u.availableRoles.includes('nunu')).length}
            </p>
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
          <CardDescription>共 {users.length} 位用戶</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
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
                  {users.map(user => (
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
                        <div className="flex gap-1">
                          {user.availableRoles.map(role => (
                            <Badge
                              key={role}
                              variant="outline"
                              className={cn(
                                'text-xs',
                                role === 'guardian' && 'bg-purple-50 text-purple-700',
                                role === 'nunu' && 'bg-blue-50 text-blue-700'
                              )}
                            >
                              {roleLabels[role]}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-sm">
                          {user.planType === 'club' ? '俱樂部' : '基礎'}
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge className={cn('text-xs', statusColors[user.subscriptionStatus])}>
                          {statusLabels[user.subscriptionStatus]}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {user.cohortMonth}
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
