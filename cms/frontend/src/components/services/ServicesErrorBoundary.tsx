/**
 * Error Boundary pour les composants Services
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  section?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ServicesErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ServicesErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would typically send to an error reporting service
      console.error('Production error in Services CMS:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        section: this.props.section
      });
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Erreur dans {this.props.section || 'le composant'}
            </CardTitle>
            <CardDescription className="text-red-700">
              Une erreur inattendue s'est produite. Veuillez réessayer ou contacter le support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <Bug className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Message d'erreur:</p>
                  <p className="text-sm font-mono bg-red-100 p-2 rounded">
                    {error?.message || 'Erreur inconnue'}
                  </p>
                  {process.env.NODE_ENV === 'development' && error?.stack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium">
                        Stack trace (développement)
                      </summary>
                      <pre className="mt-2 bg-red-100 p-2 rounded overflow-auto text-xs">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réessayer ({this.maxRetries - retryCount} restant{this.maxRetries - retryCount > 1 ? 's' : ''})
                </Button>
              )}
              <Button
                onClick={this.handleReset}
                variant="outline"
              >
                Réinitialiser
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="default"
              >
                Recharger la page
              </Button>
            </div>

            {!canRetry && (
              <Alert>
                <AlertDescription>
                  Nombre maximum de tentatives atteint. Veuillez recharger la page ou contacter le support technique.
                </AlertDescription>
              </Alert>
            )}

            {process.env.NODE_ENV === 'development' && errorInfo && (
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">
                  Component Stack (développement)
                </summary>
                <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-xs">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}