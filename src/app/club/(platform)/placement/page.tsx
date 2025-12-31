'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/cn';

interface Question {
  _id: string;
  prompt: string;
  choices: string[];
  score: number;
}

interface ExamData {
  id: string;
  title: string;
  description?: string;
  timeLimit: number;
  questions: Question[];
}

interface Answer {
  questionId: string;
  selectedChoice: number;
}

interface Result {
  score: number;
  resultLevel: number;
  levelName: string;
  levelDescription: string;
}

export default function PlacementExamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExam();
  }, []);

  const fetchExam = async () => {
    try {
      const response = await fetch('/api/exams/placement');
      const data = await response.json();

      if (data.data?.completed) {
        setAlreadyCompleted(true);
        setResult({
          score: data.data.score,
          resultLevel: data.data.resultLevel,
          levelName: `Level ${data.data.resultLevel}`,
          levelDescription: '',
        });
      } else if (data.data?.exam) {
        setExam(data.data.exam);
      } else if (data.error) {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (choiceIndex: number) => {
    if (!exam) return;

    const questionId = exam.questions[currentQuestion]._id;
    const existingIndex = answers.findIndex((a) => a.questionId === questionId);

    if (existingIndex >= 0) {
      setAnswers((prev) =>
        prev.map((a, i) => (i === existingIndex ? { ...a, selectedChoice: choiceIndex } : a))
      );
    } else {
      setAnswers((prev) => [...prev, { questionId, selectedChoice: choiceIndex }]);
    }
  };

  const getCurrentAnswer = (): number | null => {
    if (!exam) return null;
    const answer = answers.find((a) => a.questionId === exam.questions[currentQuestion]._id);
    return answer?.selectedChoice ?? null;
  };

  const handleSubmit = async () => {
    if (!exam) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/exams/placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam.id,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Submission failed');
      }

      setResult({
        score: data.data.score,
        resultLevel: data.data.resultLevel,
        levelName: data.data.levelName,
        levelDescription: data.data.levelDescription,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !exam && !result) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push('/club/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result || alreadyCompleted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {alreadyCompleted ? 'Placement Complete' : 'Congratulations!'}
            </CardTitle>
            <CardDescription>
              {alreadyCompleted
                ? 'You have already completed the placement exam'
                : 'You have completed the placement exam'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <p className="text-muted-foreground mb-2">Your Score</p>
              <p className="text-4xl font-bold">{result?.score}%</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Your Level</p>
              <Badge className="text-lg px-4 py-2">
                {result?.levelName || `Level ${result?.resultLevel}`}
              </Badge>
              {result?.levelDescription && (
                <p className="text-sm text-muted-foreground mt-2">{result.levelDescription}</p>
              )}
            </div>
            <Button size="lg" onClick={() => router.push('/club/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam) return null;

  const question = exam.questions[currentQuestion];
  const totalQuestions = exam.questions.length;
  const answeredCount = answers.length;
  const selectedAnswer = getCurrentAnswer();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <p className="text-muted-foreground">{exam.description}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <span className="text-sm text-muted-foreground">
          {answeredCount} answered
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.prompt}</CardTitle>
          <CardDescription>
            <Badge variant="secondary">{question.score} points</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.choices.map((choice, index) => (
            <button
              key={index}
              className={cn(
                'w-full text-left p-4 rounded-lg border transition-all',
                selectedAnswer === index
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:border-primary/50'
              )}
              onClick={() => handleSelectAnswer(index)}
            >
              <span className="font-medium mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              {choice}
            </button>
          ))}
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        {currentQuestion < totalQuestions - 1 ? (
          <Button
            onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))}
            disabled={selectedAnswer === null}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={answeredCount < totalQuestions || submitting}
            isLoading={submitting}
          >
            Submit Exam
          </Button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="flex flex-wrap gap-2 justify-center">
        {exam.questions.map((q, index) => {
          const isAnswered = answers.some((a) => a.questionId === q._id);
          return (
            <button
              key={q._id}
              className={cn(
                'w-8 h-8 rounded text-sm font-medium transition-all',
                index === currentQuestion && 'ring-2 ring-primary ring-offset-2',
                isAnswered ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
