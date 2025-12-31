'use client';

import { useState, useEffect } from 'react';
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

type SortOption = 'level' | 'recent' | 'feedback';

export default function VavasListPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter and sort students
  let filteredStudents = [...students];

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredStudents = filteredStudents.filter(
      s => s.name.toLowerCase().includes(query)
    );
  }

  // Sort
  switch (sortBy) {
    case 'level':
      filteredStudents.sort((a, b) => b.level - a.level);
      break;
    case 'recent':
      filteredStudents.sort((a, b) =>
        new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
      );
      break;
    case 'feedback':
      filteredStudents.sort((a, b) => a.feedback_count - b.feedback_count);
      break;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">我的學員</h1>
        <p className="text-muted-foreground">管理你指導的學員</p>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="搜尋學員..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-2">
          {([
            { value: 'recent', label: '最新配對' },
            { value: 'level', label: '等級高低' },
            { value: 'feedback', label: '待回饋' },
          ] as const).map((option) => (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? '沒有找到符合的學員' : '目前沒有配對的學員'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <Link key={student.id} href={`/club/nunu/vavas/${student.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {student.image ? (
                      <img
                        src={student.image}
                        alt=""
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-medium">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{student.name}</h3>
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
                      <p className={cn(
                        'text-lg font-bold',
                        student.feedback_count === 0 && 'text-orange-600'
                      )}>
                        {student.feedback_count}
                      </p>
                      <p className="text-xs text-muted-foreground">次回饋</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">學員統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-xs text-muted-foreground">總學員數</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {students.reduce((sum, s) => sum + s.feedback_count, 0)}
              </p>
              <p className="text-xs text-muted-foreground">累計回饋</p>
            </div>
            <div>
              <p className={cn(
                'text-2xl font-bold',
                students.filter(s => s.feedback_count === 0).length > 0 && 'text-orange-600'
              )}>
                {students.filter(s => s.feedback_count === 0).length}
              </p>
              <p className="text-xs text-muted-foreground">待首次回饋</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
