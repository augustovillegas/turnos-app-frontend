import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { if (import.meta?.env?.VITE_DEBUG === '1') console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Error inesperado</h1>
          <p className="mb-4 text-sm opacity-80">Refresca la página o reintenta.</p>
          {import.meta?.env?.VITE_DEBUG === '1' && (
            <pre className="text-xs text-left whitespace-pre-wrap bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-300 dark:border-red-700 overflow-auto max-h-64">{String(this.state.error?.message || this.state.error)}</pre>
          )}
          <button type="button" onClick={() => this.setState({ hasError: false, error: null })} className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}