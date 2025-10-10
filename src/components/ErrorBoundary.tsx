import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

/**
 * Global error boundary with user-friendly error display
 * Prevents full app crashes and provides recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.error('[ErrorBoundary]', errorId, error);
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to external service here (e.g., Sentry)
    console.error('Error details:', {
      error,
      errorInfo,
      errorId: this.state.errorId
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: ''
    });
  };

  handleCopyError = () => {
    const errorText = `Error ID: ${this.state.errorId}\n${this.state.error?.message || 'Unknown error'}\n${this.state.error?.stack || ''}`;
    navigator.clipboard.writeText(errorText);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. Your data is safe and has been preserved.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                <p className="text-xs text-muted-foreground">Error ID: {this.state.errorId}</p>
                <pre className="text-xs overflow-auto max-h-32 bg-background/50 p-2 rounded">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={this.handleReset} className="flex-1">
                Try Again
              </Button>
              <Button onClick={this.handleCopyError} variant="outline" className="flex-1">
                Copy Error
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If this problem persists, please contact support with the error ID above.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
