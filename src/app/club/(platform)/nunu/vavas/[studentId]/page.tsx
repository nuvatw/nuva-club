'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Profile, Feedback } from '@/types/database';

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getLevelName(level: number) {
  return LEVELS.find((l) => l.level === level)?.displayName || `第 ${level} 級`;
}

interface StudentWithAssignment extends Profile {
  assigned_at?: string;
}

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [student, setStudent] = useState<StudentWithAssignment | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    content: '',
    rating: 0,
  });

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

    const fetchData = async () => {
      const supabase = getClient();

      // Check if this student is assigned to this coach
      const { data: assignmentData } = await supabase
        .from('coach_students')
        .select(`
          assigned_at,
          student:profiles!coach_students_student_id_fkey(*)
        `)
        .eq('coach_id', profile.id)
        .eq('student_id', studentId)
        .single();

      if (assignmentData?.student) {
        const studentData = Array.isArray(assignmentData.student)
          ? assignmentData.student[0]
          : assignmentData.student;
        setStudent({
          ...(studentData as Profile),
          assigned_at: assignmentData.assigned_at,
        });
      }

      // Fetch feedback for this student from this coach
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('*')
        .eq('nunu_id', profile.id)
        .eq('vava_id', studentId)
        .order('created_at', { ascending: false });

      if (feedbackData) {
        setFeedback(feedbackData);
      }

      setLoading(false);
    };

    fetchData();
  }, [profile, studentId]);

  const handleSubmit = async () => {
    if (!newFeedback.content.trim() || !profile || !student) return;

    setSubmitting(true);
    const supabase = getClient();

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        id: crypto.randomUUID(),
        nunu_id: profile.id,
        vava_id: studentId,
        content: newFeedback.content,
        rating: newFeedback.rating || null,
      })
      .select()
      .single();

    if (data && !error) {
      setFeedback(prev => [data, ...prev]);

      // Update feedback count in coach_students
      await supabase.rpc('increment_feedback_count', {
        p_coach_id: profile.id,
        p_student_id: studentId,
      });
    }

    setNewFeedback({ content: '', rating: 0 });
    setShowForm(false);
    setSubmitting(false);
  };

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

  if (!student) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/club/nunu/vavas')}>
          ← 返回學員列表
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">找不到此學員</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          onClick={() => router.push('/club/nunu/vavas')}
        >
          ← 返回學員列表
        </Button>
      </div>

      {/* Student Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {student.image ? (
              <img
                src={student.image}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-medium">{student.name.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{student.name}</h1>
                <Badge variant="secondary">{getLevelName(student.level)}</Badge>
              </div>
              <p className="text-muted-foreground">{student.email}</p>
              <div className="flex gap-4 mt-3 text-sm">
                <div>
                  <span className="text-muted-foreground">方案：</span>
                  <span className="font-medium">{student.plan_type === 'club' ? '俱樂部' : '基礎'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">加入：</span>
                  <span className="font-medium">{student.cohort_month}</span>
                </div>
                {student.assigned_at && (
                  <div>
                    <span className="text-muted-foreground">配對於：</span>
                    <span className="font-medium">{new Date(student.assigned_at).toLocaleDateString('zh-TW')}</span>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={() => setShowForm(true)}>給予回饋</Button>
          </div>
        </CardContent>
      </Card>

      {/* New Feedback Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">新增回饋</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">回饋內容</label>
              <textarea
                className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-none"
                placeholder="寫下你的回饋..."
                value={newFeedback.content}
                onChange={(e) =>
                  setNewFeedback((prev) => ({ ...prev, content: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">評分（選填）</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="text-2xl hover:scale-110 transition-transform"
                    onClick={() =>
                      setNewFeedback((prev) => ({
                        ...prev,
                        rating: prev.rating === star ? 0 : star,
                      }))
                    }
                  >
                    {star <= newFeedback.rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!newFeedback.content.trim() || submitting}
              >
                {submitting ? '送出中...' : '送出回饋'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">回饋紀錄</CardTitle>
          <CardDescription>共 {feedback.length} 則回饋</CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              尚未給予任何回饋
            </p>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">回饋</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{item.content}</p>
                  {item.rating && item.rating > 0 && (
                    <div className="mt-2 text-amber-500">
                      {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
