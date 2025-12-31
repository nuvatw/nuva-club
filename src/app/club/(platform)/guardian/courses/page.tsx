'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import type { Course } from '@/types/database';

const LEVELS = [
  { level: 1, displayName: 'Lv.1', stageName: '入門' },
  { level: 2, displayName: 'Lv.2', stageName: '入門' },
  { level: 3, displayName: 'Lv.3', stageName: '入門' },
  { level: 4, displayName: 'Lv.4', stageName: '進階' },
  { level: 5, displayName: 'Lv.5', stageName: '進階' },
  { level: 6, displayName: 'Lv.6', stageName: '進階' },
  { level: 7, displayName: 'Lv.7', stageName: '高階' },
  { level: 8, displayName: 'Lv.8', stageName: '高階' },
  { level: 9, displayName: 'Lv.9', stageName: '高階' },
  { level: 10, displayName: 'Lv.10', stageName: '大師' },
  { level: 11, displayName: 'Lv.11', stageName: '大師' },
  { level: 12, displayName: 'Lv.12', stageName: '大師' },
];

type LevelNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export default function CoursesManagementPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<LevelNumber | 'all'>('all');

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

    const fetchCourses = async () => {
      const supabase = getClient();
      const { data } = await supabase
        .from('courses')
        .select('*')
        .order('level')
        .order('title');

      if (data) {
        setCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
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

  // Filter courses
  let filteredCourses = [...courses];
  if (selectedLevel !== 'all') {
    filteredCourses = filteredCourses.filter(c => c.level === selectedLevel);
  }

  // Group by level for stats
  const coursesByLevel = courses.reduce((acc, course) => {
    acc[course.level] = (acc[course.level] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const totalLessons = courses.reduce((sum, c) => sum + c.lessons_count, 0);
  const totalDuration = courses.reduce((sum, c) => sum + c.total_duration, 0);

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
            <p className="text-3xl font-bold">{courses.length}</p>
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
          <CardDescription>共 {filteredCourses.length} 個課程</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {selectedLevel === 'all' ? '目前沒有課程' : '此等級沒有課程'}
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
                  {filteredCourses.map(course => {
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
                          <span className="text-sm">{course.lessons_count} 課</span>
                        </td>
                        <td className="py-3">
                          <span className="text-sm">{course.total_duration} 分鐘</span>
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
