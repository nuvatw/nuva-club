'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_COURSES, LEVELS } from '@/lib/mock';
import { cn } from '@/lib/utils/cn';
import type { LevelNumber } from '@/types';

export default function CoursesManagementPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<LevelNumber | 'all'>('all');

  // Filter courses
  let courses = [...MOCK_COURSES];
  if (selectedLevel !== 'all') {
    courses = courses.filter(c => c.level === selectedLevel);
  }

  // Group by level for stats
  const coursesByLevel = MOCK_COURSES.reduce((acc, course) => {
    acc[course.level] = (acc[course.level] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const totalLessons = MOCK_COURSES.reduce((sum, c) => sum + c.lessonsCount, 0);
  const totalDuration = MOCK_COURSES.reduce((sum, c) => sum + c.totalDuration, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">課程管理</h1>
          <p className="text-muted-foreground">管理平台課程內容</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/club/guardian/dashboard')}>
            返回主頁
          </Button>
          <Button>新增課程</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{MOCK_COURSES.length}</p>
            <p className="text-sm text-muted-foreground">總課程數</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{totalLessons}</p>
            <p className="text-sm text-muted-foreground">總課堂數</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{Math.round(totalDuration / 60)}</p>
            <p className="text-sm text-muted-foreground">總時數（小時）</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">等級數</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedLevel('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            selectedLevel === 'all'
              ? 'bg-primary text-white'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          全部等級
        </button>
        {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as LevelNumber[]).map(level => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-all min-w-[60px]',
              selectedLevel === level
                ? 'bg-primary text-white'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            Lv.{level}
            <span className="ml-1 text-xs opacity-70">({coursesByLevel[level] || 0})</span>
          </button>
        ))}
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">課程列表</CardTitle>
          <CardDescription>共 {courses.length} 個課程</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              此等級沒有課程
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">課程名稱</th>
                    <th className="pb-3 font-medium">等級</th>
                    <th className="pb-3 font-medium">課堂數</th>
                    <th className="pb-3 font-medium">時長</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courses.map(course => {
                    const levelInfo = LEVELS.find(l => l.level === course.level);
                    return (
                      <tr key={course.id} className="hover:bg-muted/50">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {course.description}
                            </p>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant="secondary">
                            {levelInfo?.displayName || `第 ${course.level} 級`}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <span className="text-sm">{course.lessonsCount} 課</span>
                        </td>
                        <td className="py-3">
                          <span className="text-sm">{course.totalDuration} 分鐘</span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">編輯</Button>
                            <Button variant="ghost" size="sm">預覽</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Level Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">各等級課程分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as LevelNumber[]).map(level => {
              const count = coursesByLevel[level] || 0;
              const levelInfo = LEVELS.find(l => l.level === level);
              return (
                <div
                  key={level}
                  className="text-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => setSelectedLevel(level)}
                >
                  <p className="text-xs text-muted-foreground mb-1">Lv.{level}</p>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{levelInfo?.stageName}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
