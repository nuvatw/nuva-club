'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Profile, CoachStudent } from '@/types/database';

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

interface CoachWithStudents extends Profile {
  students: Array<{
    id: string;
    student: Profile;
    feedback_count: number;
    assigned_at: string;
  }>;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [coaches, setCoaches] = useState<CoachWithStudents[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

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

    const fetchData = async () => {
      const supabase = getClient();

      // Fetch all coaches
      const { data: coachesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'nunu')
        .order('name');

      // Fetch all coach-student assignments with student info
      const { data: assignmentsData } = await supabase
        .from('coach_students')
        .select(`
          id,
          coach_id,
          student_id,
          feedback_count,
          assigned_at,
          student:profiles!coach_students_student_id_fkey(*)
        `);

      // Group students by coach
      const coachesWithStudents = (coachesData || []).map(coach => ({
        ...coach,
        students: (assignmentsData || [])
          .filter(a => a.coach_id === coach.id)
          .map(a => ({
            id: a.id,
            student: (Array.isArray(a.student) ? a.student[0] : a.student) as Profile,
            feedback_count: a.feedback_count,
            assigned_at: a.assigned_at,
          })),
      }));

      setCoaches(coachesWithStudents);

      // Find assigned student IDs
      const assignedStudentIds = new Set(
        (assignmentsData || []).map(a => a.student_id)
      );

      // Fetch club members without a coach assignment
      const { data: clubMembers } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'vava')
        .eq('plan_type', 'club');

      const unassigned = (clubMembers || []).filter(
        m => !assignedStudentIds.has(m.id)
      );

      setUnassignedStudents(unassigned);
      setLoading(false);
    };

    fetchData();
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

  const totalAssigned = coaches.reduce((sum, c) => sum + c.students.length, 0);
  const avgStudents = coaches.length > 0
    ? Math.round(totalAssigned / coaches.length * 10) / 10
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">配對管理</h1>
          <p className="text-muted-foreground">管理教練與學員的配對關係</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/club/guardian/dashboard')}>
          返回主頁
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{coaches.length}</p>
            <p className="text-sm text-muted-foreground">教練總數</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{totalAssigned}</p>
            <p className="text-sm text-muted-foreground">已配對學員</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{avgStudents}</p>
            <p className="text-sm text-muted-foreground">平均學員數</p>
          </CardContent>
        </Card>
        <Card className={cn(unassignedStudents.length > 0 && 'border-orange-300 bg-orange-50')}>
          <CardContent className="pt-4 pb-4 text-center">
            <p className={cn('text-3xl font-bold', unassignedStudents.length > 0 && 'text-orange-600')}>
              {unassignedStudents.length}
            </p>
            <p className="text-sm text-muted-foreground">待配對學員</p>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Students Alert */}
      {unassignedStudents.length > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-orange-500">!</span>
              待配對的俱樂部會員
            </CardTitle>
            <CardDescription>這些會員尚未被分配教練</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unassignedStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    {student.image ? (
                      <img src={student.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium">{student.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{getLevelName(student.level)}</p>
                    </div>
                  </div>
                  <Button size="sm">分配教練</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coaches and their students */}
      <div className="grid gap-6 md:grid-cols-2">
        {coaches.map(coach => {
          const isSelected = selectedCoach === coach.id;

          return (
            <Card
              key={coach.id}
              className={cn(
                'cursor-pointer transition-all',
                isSelected && 'ring-2 ring-primary'
              )}
              onClick={() => setSelectedCoach(isSelected ? null : coach.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  {coach.image ? (
                    <img src={coach.image} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-medium">{coach.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {coach.name}
                      <Badge variant="secondary">{getLevelName(coach.level)}</Badge>
                    </CardTitle>
                    <CardDescription>{coach.email}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{coach.students.length}</p>
                    <p className="text-xs text-muted-foreground">學員</p>
                  </div>
                </div>
              </CardHeader>
              {isSelected && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">配對的學員：</p>
                    {coach.students.length === 0 ? (
                      <p className="text-sm text-muted-foreground">尚無配對的學員</p>
                    ) : (
                      <div className="space-y-2">
                        {coach.students.map(({ id, student, feedback_count, assigned_at }) => (
                          <div key={id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              {student.image ? (
                                <img src={student.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm">{student.name.charAt(0)}</span>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{getLevelName(student.level)}</p>
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <p>{feedback_count} 次回饋</p>
                              <p>配對於 {new Date(assigned_at).toLocaleDateString('zh-TW')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {coaches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">目前沒有教練</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
