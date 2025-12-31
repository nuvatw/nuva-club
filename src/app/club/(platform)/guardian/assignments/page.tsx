'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_USERS, MOCK_COACH_STUDENTS, LEVELS } from '@/lib/mock';
import { cn } from '@/lib/utils/cn';

function getLevelName(level: number) {
  return LEVELS.find((l) => l.level === level)?.displayName || `第 ${level} 級`;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

  // Get all coaches
  const coaches = MOCK_USERS.filter(u => u.availableRoles.includes('nunu'));

  // Get students for each coach
  const getStudentsForCoach = (coachId: string) => {
    // In real app, would filter by coachId
    // For demo, we'll show all students for any coach
    return MOCK_COACH_STUDENTS;
  };

  // Get unassigned students (students without a coach)
  const unassignedStudents = MOCK_USERS.filter(u =>
    u.role === 'vava' &&
    !u.assignedNunuId &&
    u.planType === 'club'
  );

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
            <p className="text-3xl font-bold">{MOCK_COACH_STUDENTS.length}</p>
            <p className="text-sm text-muted-foreground">已配對學員</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">
              {coaches.length > 0 ? Math.round(MOCK_COACH_STUDENTS.length / coaches.length * 10) / 10 : 0}
            </p>
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
          const students = getStudentsForCoach(coach.id);
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
                    <p className="text-2xl font-bold">{students.length}</p>
                    <p className="text-xs text-muted-foreground">學員</p>
                  </div>
                </div>
              </CardHeader>
              {isSelected && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">配對的學員：</p>
                    {students.length === 0 ? (
                      <p className="text-sm text-muted-foreground">尚無配對的學員</p>
                    ) : (
                      <div className="space-y-2">
                        {students.map(student => (
                          <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
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
                              <p>{student.feedbackCount} 次回饋</p>
                              <p>配對於 {new Date(student.assignedAt).toLocaleDateString('zh-TW')}</p>
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
    </div>
  );
}
