'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser, MOCK_COACH_STUDENTS, LEVELS, MOCK_FEEDBACK } from '@/lib/mock';
import { cn } from '@/lib/utils/cn';

function getLevelName(level: number) {
  return LEVELS.find((l) => l.level === level)?.displayName || `第 ${level} 級`;
}

type SortOption = 'level' | 'recent' | 'feedback';

export default function VavasListPage() {
  const { user } = useUser();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return null;
  }

  // Filter and sort students
  let students = [...MOCK_COACH_STUDENTS];

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    students = students.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
    );
  }

  // Sort
  students = students.sort((a, b) => {
    switch (sortBy) {
      case 'level':
        return b.level - a.level;
      case 'feedback':
        return b.feedbackCount - a.feedbackCount;
      case 'recent':
      default:
        return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
    }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的學員</h1>
          <p className="text-muted-foreground">管理配對給你的學員</p>
        </div>
        <Link href="/club/nunu/dashboard">
          <Button variant="outline">返回主頁</Button>
        </Link>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="搜尋學員姓名或 Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border bg-background"
        />
        <div className="flex gap-2">
          {[
            { key: 'recent', label: '最近配對' },
            { key: 'level', label: '等級高低' },
            { key: 'feedback', label: '回饋次數' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key as SortOption)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm transition-all',
                sortBy === key
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">總學員</p>
            <p className="text-2xl font-bold">{MOCK_COACH_STUDENTS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">試用中</p>
            <p className="text-2xl font-bold">
              {MOCK_COACH_STUDENTS.filter(s => s.subscriptionStatus === 'trial').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">俱樂部會員</p>
            <p className="text-2xl font-bold">
              {MOCK_COACH_STUDENTS.filter(s => s.planType === 'club').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">累計回饋</p>
            <p className="text-2xl font-bold">
              {MOCK_COACH_STUDENTS.reduce((sum, s) => sum + s.feedbackCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">學員列表</CardTitle>
          <CardDescription>共 {students.length} 位學員</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {searchQuery ? '找不到符合的學員' : '目前沒有配對的學員'}
            </p>
          ) : (
            <div className="divide-y">
              {students.map((student) => {
                const unreadFeedback = MOCK_FEEDBACK.filter(
                  f => f.studentId === student.id && !f.isRead
                ).length;

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
                          className="w-14 h-14 rounded-full shrink-0 object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xl font-medium">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{student.name}</h3>
                          <Badge variant="secondary">{getLevelName(student.level)}</Badge>
                          {student.subscriptionStatus === 'trial' && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              試用中
                            </Badge>
                          )}
                          {student.planType === 'club' && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                              俱樂部
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {student.cohortMonth} 加入 · 配對於 {new Date(student.assignedAt).toLocaleDateString('zh-TW')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-lg font-semibold">{student.feedbackCount}</p>
                        <p className="text-xs text-muted-foreground">次回饋</p>
                        {unreadFeedback > 0 && (
                          <Badge className="mt-1 bg-orange-500">{unreadFeedback} 則待讀</Badge>
                        )}
                      </div>

                      <ChevronRightIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
