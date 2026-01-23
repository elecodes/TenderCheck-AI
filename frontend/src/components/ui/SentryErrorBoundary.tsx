import React from 'react';
import * as Sentry from "@sentry/react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class SentryErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: errorInfo as unknown as Record<string, unknown> });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-500 rounded bg-red-50 text-red-900">
          <h2>Something went wrong.</h2>
          <p>Our team has been notified.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
