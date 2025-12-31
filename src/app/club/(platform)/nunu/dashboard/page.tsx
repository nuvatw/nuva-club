'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser, useDatabase, MOCK_COACH_STUDENTS, LEVELS, MOCK_FEEDBACK } from '@/lib/mock';
import { cn } from '@/lib/utils/cn';

function getLevelName(level: number) {
  return LEVELS.find((l) => l.level === level)?.displayName || `第 ${level} 級`;
}

export default function NunuDashboardPage() {
  const { user } = useUser();
  const { state } = useDatabase();
  const students = MOCK_COACH_STUDENTS;

  // Get pending check-ins that need feedback
  const pendingCheckIns = state.checkIns.filter(c => !c.feedbackGiven);

  if (!user) {
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
              {students.reduce((sum, s) => sum + s.feedbackCount, 0)}
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
        <Card className={cn(pendingCheckIns.length > 0 && 'border-orange-300 bg-orange-50')}>
          <CardHeader className="pb-2">
            <CardDescription>待回覆打卡</CardDescription>
            <CardTitle className={cn('text-3xl', pendingCheckIns.length > 0 && 'text-orange-600')}>
              {pendingCheckIns.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pending Check-ins */}
      {pendingCheckIns.length > 0 && (
        <Card className="border-orange-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-orange-500">!</span>
              需要回饋的打卡
            </CardTitle>
            <CardDescription>學員正在等待你的回饋</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingCheckIns.slice(0, 3).map((checkIn) => {
                const student = students.find(s => s.id === checkIn.userId);
                return (
                  <Link
                    key={checkIn.id}
                    href={`/club/nunu/vavas/${checkIn.userId}`}
                    className="block"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                      {student?.image ? (
                        <img src={student.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium">{student?.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{student?.name || '學員'}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {checkIn.content}
                        </p>
                      </div>
                      <Button size="sm">回覆</Button>
                    </div>
                  </Link>
                );
              })}
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
                const unreadCount = MOCK_FEEDBACK.filter(
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
                          {student.subscriptionStatus === 'trial' && (
                            <Badge variant="outline" className="text-xs">試用中</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {student.cohortMonth} 加入 · {student.planType === 'club' ? '俱樂部' : '基礎'}方案
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium">{student.feedbackCount} 次回饋</p>
                        <p className="text-xs text-muted-foreground">
                          配對於 {new Date(student.assignedAt).toLocaleDateString('zh-TW')}
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
