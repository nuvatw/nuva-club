'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
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

type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export default function ApplicationsPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [applicants, setApplicants] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');
  const [updating, setUpdating] = useState<string | null>(null);

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

    const fetchApplicants = async () => {
      const supabase = getClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('nunu_application_status', 'none')
        .not('nunu_application_status', 'is', null)
        .order('created_at', { ascending: false });

      if (data) {
        setApplicants(data);
      }
      setLoading(false);
    };

    fetchApplicants();
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

  // Filter applicants
  const filteredApplicants = filter === 'all'
    ? applicants
    : applicants.filter(a => a.nunu_application_status === filter);

  const handleApprove = async (applicantId: string) => {
    setUpdating(applicantId);
    const supabase = getClient();

    await supabase
      .from('profiles')
      .update({
        nunu_application_status: 'approved',
        available_roles: ['vava', 'nunu'],
      })
      .eq('id', applicantId);

    setApplicants(prev =>
      prev.map(a =>
        a.id === applicantId
          ? { ...a, nunu_application_status: 'approved' as const }
          : a
      )
    );
    setUpdating(null);
  };

  const handleReject = async (applicantId: string) => {
    setUpdating(applicantId);
    const supabase = getClient();

    await supabase
      .from('profiles')
      .update({ nunu_application_status: 'rejected' })
      .eq('id', applicantId);

    setApplicants(prev =>
      prev.map(a =>
        a.id === applicantId
          ? { ...a, nunu_application_status: 'rejected' as const }
          : a
      )
    );
    setUpdating(null);
  };

  const statusColors = {
    pending: 'bg-orange-100 text-orange-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    pending: '待審核',
    approved: '已通過',
    rejected: '已拒絕',
  };

  const pendingCount = applicants.filter(a => a.nunu_application_status === 'pending').length;
  const approvedCount = applicants.filter(a => a.nunu_application_status === 'approved').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">教練申請審核</h1>
          <p className="text-muted-foreground">審核用戶的教練資格申請</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/club/guardian/dashboard')}>
          返回主頁
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn(pendingCount > 0 && 'border-orange-300 bg-orange-50')}>
          <CardContent className="pt-4 pb-4 text-center">
            <p className={cn('text-3xl font-bold', pendingCount > 0 && 'text-orange-600')}>
              {pendingCount}
            </p>
            <p className="text-sm text-muted-foreground">待審核</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-sm text-muted-foreground">已通過</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{applicants.length}</p>
            <p className="text-sm text-muted-foreground">總申請</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: '全部' },
          { key: 'pending', label: '待審核' },
          { key: 'approved', label: '已通過' },
          { key: 'rejected', label: '已拒絕' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === key
                ? 'bg-primary text-white'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">申請列表</CardTitle>
          <CardDescription>共 {filteredApplicants.length} 則申請</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplicants.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {filter === 'pending' ? '沒有待審核的申請' : '沒有符合條件的申請'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredApplicants.map(applicant => {
                const status = applicant.nunu_application_status as ApplicationStatus;
                const isPending = status === 'pending';
                const isUpdating = updating === applicant.id;

                return (
                  <div
                    key={applicant.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      isPending && 'border-orange-300 bg-orange-50'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {applicant.image ? (
                        <img
                          src={applicant.image}
                          alt=""
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xl font-medium">
                            {applicant.name.charAt(0)}
                          </span>
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{applicant.name}</h3>
                          <Badge variant="secondary">{getLevelName(applicant.level)}</Badge>
                          <Badge className={cn(statusColors[status])}>
                            {statusLabels[status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{applicant.email}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">方案：</span>
                            <span className="font-medium">
                              {applicant.plan_type === 'club' ? '俱樂部' : '基礎'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">加入：</span>
                            <span className="font-medium">{applicant.cohort_month || '-'}</span>
                          </div>
                        </div>

                        {/* Application requirements check */}
                        <div className="mt-3 p-3 bg-white/50 rounded-lg">
                          <p className="text-sm font-medium mb-2">資格檢查：</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              {applicant.level >= 5 ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-red-600">✗</span>
                              )}
                              <span className={applicant.level >= 5 ? '' : 'text-muted-foreground'}>
                                等級 5 以上（目前：{applicant.level}）
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {applicant.plan_type === 'club' ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-red-600">✗</span>
                              )}
                              <span className={applicant.plan_type === 'club' ? '' : 'text-muted-foreground'}>
                                俱樂部會員
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {isPending && (
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => handleApprove(applicant.id)}
                            disabled={applicant.level < 5 || isUpdating}
                          >
                            {isUpdating ? '處理中...' : '通過'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleReject(applicant.id)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? '處理中...' : '拒絕'}
                          </Button>
                        </div>
                      )}

                      {!isPending && (
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{status === 'approved' ? '已通過' : '已拒絕'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
