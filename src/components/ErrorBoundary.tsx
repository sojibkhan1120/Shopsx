import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[App Crash Caught by ErrorBoundary]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.clear();
        window.sessionStorage?.clear();
      }
    } catch {
      // ignore
    }
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4 shadow-lg">
            <AlertTriangle size={32} />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            The platform encountered an unexpected runtime error. You can refresh to resume or reset local cache.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw size={16} />
              <span>Reload Page</span>
            </button>
            <button
              onClick={this.handleResetAndReload}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-all border border-slate-700 active:scale-95 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Reset Cache</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
