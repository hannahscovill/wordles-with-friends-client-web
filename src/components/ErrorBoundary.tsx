import React from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { reportError } from '../lib/telemetry';
import './ErrorBoundary.scss';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, {
      'error.source': 'error-boundary',
      'error.severity': 'critical',
      'error.component_stack': errorInfo.componentStack ?? '',
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <h1 className="error-boundary__title">Oops</h1>
            <p className="error-boundary__subtitle">Something went wrong</p>
            <p className="error-boundary__message">
              An unexpected error occurred.
              <br />
              Please try again in a moment.
            </p>
            <a href="/" className="error-boundary__link">
              Return home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
