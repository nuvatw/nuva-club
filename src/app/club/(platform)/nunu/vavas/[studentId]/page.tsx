'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFeedbackForStudent, MOCK_COACH_STUDENTS, LEVELS } from '@/lib/mock';
import { cn } from '@/lib/utils/cn';

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

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    type: 'check_in' as 'check_in' | 'challenge_feedback',
    feedbackContent: '',
    rating: 0,
  });
  const [localFeedback, setLocalFeedback] = useState<Array<{
    id: string;
    type: 'check_in' | 'challenge_feedback';
    feedbackContent: string;
    rating: number;
    createdAt: string;
  }>>([]);

  const student = MOCK_COACH_STUDENTS.find(s => s.id === studentId);
  const existingFeedback = getFeedbackForStudent(studentId);
  const allFeedback = [...localFeedback, ...existingFeedback];

  const handleSubmit = () => {
    if (!newFeedback.feedbackContent.trim()) return;

    // Add to local feedback for demo
    setLocalFeedback(prev => [{
      id: `feedback-local-${Date.now()}`,
      type: newFeedback.type,
      feedbackContent: newFeedback.feedbackContent,
      rating: newFeedback.rating,
      createdAt: new Date().toISOString(),
    }, ...prev]);

    setNewFeedback({ type: 'check_in', feedbackContent: '', rating: 0 });
    setShowForm(false);
  };

  if (!student) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/club/nunu/dashboard')}>
          ← 返回教練主頁
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
          onClick={() => router.push('/club/nunu/dashboard')}
        >
          ← 返回教練主頁
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
                  <span className="font-medium">{student.planType === 'club' ? '俱樂部' : '基礎'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">加入：</span>
                  <span className="font-medium">{student.cohortMonth}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">配對於：</span>
                  <span className="font-medium">{new Date(student.assignedAt).toLocaleDateString('zh-TW')}</span>
                </div>
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
              <label className="block text-sm font-medium mb-2">類型</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewFeedback(prev => ({ ...prev, type: 'check_in' }))}
                  className={cn(
                    'px-4 py-2 rounded-lg border transition-all',
                    newFeedback.type === 'check_in'
                      ? 'bg-primary text-white border-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  打卡回饋
                </button>
                <button
                  onClick={() => setNewFeedback(prev => ({ ...prev, type: 'challenge_feedback' }))}
                  className={cn(
                    'px-4 py-2 rounded-lg border transition-all',
                    newFeedback.type === 'challenge_feedback'
                      ? 'bg-primary text-white border-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  挑戰回饋
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">回饋內容</label>
              <textarea
                className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-none"
                placeholder="寫下你的回饋..."
                value={newFeedback.feedbackContent}
                onChange={(e) =>
                  setNewFeedback((prev) => ({ ...prev, feedbackContent: e.target.value }))
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
                disabled={!newFeedback.feedbackContent.trim()}
              >
                送出回饋
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
          <CardDescription>共 {allFeedback.length} 則回饋</CardDescription>
        </CardHeader>
        <CardContent>
          {allFeedback.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              尚未給予任何回饋
            </p>
          ) : (
            <div className="space-y-4">
              {allFeedback.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={item.type === 'check_in' ? 'default' : 'secondary'}>
                      {item.type === 'check_in' ? '打卡回饋' : '挑戰回饋'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{item.feedbackContent}</p>
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
