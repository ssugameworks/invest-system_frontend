'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 전역 에러 바운더리 컴포넌트
 * 예상치 못한 에러 발생 시 앱 크래시를 방지하고 사용자에게 친화적인 에러 메시지 표시
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 로깅 (프로덕션에서는 에러 리포팅 서비스로 전송)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // PostHog나 다른 에러 리포팅 서비스로 전송 가능
    if (typeof window !== 'undefined' && (window as any).posthog) {
      try {
        (window as any).posthog.capture('error_boundary', {
          error_message: error.message,
          error_stack: error.stack,
          component_stack: errorInfo.componentStack,
        });
      } catch {
        // 에러 리포팅 실패 시 무시
      }
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full bg-background-card flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-background-card border border-border-card rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">오류가 발생했습니다</h2>
            <p className="text-text-secondary mb-4">
              예상치 못한 문제가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-accent-yellow text-background-card rounded-lg font-medium hover:bg-accent-yellow/90 transition-colors"
              >
                새로고침
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                다시 시도
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-text-tertiary cursor-pointer text-sm">에러 상세 정보</summary>
                <pre className="mt-2 text-xs text-text-tertiary bg-black/20 p-3 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

