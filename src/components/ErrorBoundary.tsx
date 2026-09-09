import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean };

/** Keeps a rendering failure contained and gives the user a safe recovery path. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('Upserve rendering error', error, info.componentStack);
    window.dispatchEvent(new CustomEvent('upserve:render-error'));
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return <main className="error-boundary" role="alert" aria-labelledby="error-boundary-title">
      <div className="error-boundary-card">
        <p className="eyebrow">Something went wrong</p>
        <h1 id="error-boundary-title">This screen needs a quick refresh.</h1>
        <p>Upserve could not finish rendering this page. Your saved data is safe. Try again, or return to the dashboard.</p>
        <div className="error-boundary-actions">
          <button type="button" onClick={() => window.location.reload()}>Try again</button>
          <button type="button" className="secondary" onClick={() => { window.location.href = '/app'; }}>Go to dashboard</button>
        </div>
      </div>
    </main>;
  }
}
