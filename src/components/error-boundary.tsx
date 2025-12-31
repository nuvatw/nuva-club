'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">發生錯誤</h2>
            <p className="text-muted-foreground mb-4">
              頁面載入時發生問題，請重試或重新整理頁面。
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleRetry}>重試</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                重新整理
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 p-4 bg-muted rounded text-left text-xs overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
