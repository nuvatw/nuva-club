'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

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

interface Student {
  id: string;
  name: string;
  image: string | null;
  level: number;
  cohort_month: string;
  subscription_status: string;
  plan_type: string;
  feedback_count: number;
  assigned_at: string;
}

export default function NunuDashboardPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/club/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading && profile && profile.role !== 'nunu') {
      router.push('/club/dashboard');
    }
  }, [authLoading, profile, router]);

  useEffect(() => {
    if (!profile) return;

    const fetchStudents = async () => {
      const supabase = getClient();

      const { data } = await supabase
        .from('coach_students')
        .select(`
          student_id,
          feedback_count,
          assigned_at,
          student:profiles!coach_students_student_id_fkey(
            id,
            name,
            image,
            level,
            cohort_month,
            subscription_status,
            plan_type
          )
        `)
        .eq('coach_id', profile.id);

      if (data) {
        const studentList = data.map((item: any) => ({
          id: item.student.id,
          name: item.student.name,
          image: item.student.image,
          level: item.student.level,
          cohort_month: item.student.cohort_month,
          subscription_status: item.student.subscription_status,
          plan_type: item.student.plan_type,
          feedback_count: item.feedback_count,
          assigned_at: item.assigned_at,
        }));
        setStudents(studentList);
      }
      setLoading(false);
    };

    fetchStudents();
  }, [profile]);

  // Count students who haven't received feedback recently
  const pendingFeedbackCount = students.filter(s => s.feedback_count === 0).length;

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">教練主頁</h1>
        <p className="text-muted-foreground">管理學員並提供回饋</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>我的學員</CardDescription>
            <CardTitle className="text-3xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>累計回饋</CardDescription>
            <CardTitle className="text-3xl">
              {students.reduce((sum, s) => sum + s.feedback_count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>平均等級</CardDescription>
            <CardTitle className="text-3xl">
              {students.length > 0
                ? Math.round(students.reduce((sum, s) => sum + s.level, 0) / students.length)
                : 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className={cn(pendingFeedbackCount > 0 && 'border-orange-300 bg-orange-50')}>
          <CardHeader className="pb-2">
            <CardDescription>待首次回饋</CardDescription>
            <CardTitle className={cn('text-3xl', pendingFeedbackCount > 0 && 'text-orange-600')}>
              {pendingFeedbackCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pending Feedback Alert */}
      {pendingFeedbackCount > 0 && (
        <Card className="border-orange-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-orange-500">!</span>
              需要首次回饋的學員
            </CardTitle>
            <CardDescription>這些學員尚未收到任何回饋</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.filter(s => s.feedback_count === 0).slice(0, 3).map((student) => (
                <Link
                  key={student.id}
                  href={`/club/nunu/vavas/${student.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                    {student.image ? (
                      <img src={student.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium">{student.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getLevelName(student.level)} · {student.cohort_month} 加入
                      </p>
                    </div>
                    <Button size="sm">給予回饋</Button>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">我的學員</CardTitle>
            <CardDescription>已配對給你指導的學員</CardDescription>
          </div>
          <Link href="/club/nunu/vavas">
            <Button variant="outline" size="sm">查看全部</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              目前沒有配對的學員
            </p>
          ) : (
            <div className="divide-y">
              {students.slice(0, 5).map((student) => {
                return (
                  <Link
                    key={student.id}
                    href={`/club/nunu/vavas/${student.id}`}
                    className="block"
                  >
                    <div className="py-4 flex items-center gap-4 hover:bg-muted/50 -mx-4 px-4 rounded-xl transition-colors">
                      {student.image ? (
                        <img
                          src={student.image}
                          alt=""
                          className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-medium">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{student.name}</h3>
                          <Badge variant="secondary">{getLevelName(student.level)}</Badge>
                          {student.subscription_status === 'trial' && (
                            <Badge variant="outline" className="text-xs">試用中</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {student.cohort_month} 加入 · {student.plan_type === 'club' ? '俱樂部' : '基礎'}方案
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium">{student.feedback_count} 次回饋</p>
                        <p className="text-xs text-muted-foreground">
                          配對於 {new Date(student.assigned_at).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats by Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">學員等級分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map(level => {
              const count = students.filter(s => s.level === level).length;
              return (
                <div
                  key={level}
                  className={cn(
                    'px-4 py-2 rounded-lg text-center min-w-[60px]',
                    count > 0 ? 'bg-primary/10' : 'bg-muted'
                  )}
                >
                  <p className="text-xs text-muted-foreground">Lv.{level}</p>
                  <p className={cn('font-bold', count > 0 ? 'text-primary' : 'text-muted-foreground')}>
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
