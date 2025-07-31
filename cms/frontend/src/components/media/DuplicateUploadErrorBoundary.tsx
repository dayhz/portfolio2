import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class DuplicateUploadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console for debugging
    console.error('DuplicateUploadDialog Error Boundary caught an error:', error, errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Store error info for display
    this.setState({ errorInfo });
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when dialog is reopened
    if (!prevProps.isOpen && this.props.isOpen && this.state.hasError) {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI within the dialog structure
      return (
        <Dialog open={this.props.isOpen} onOpenChange={this.props.onClose}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <span className="text-2xl">⚠️</span>
                Erreur d'affichage
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm mb-2">
                  Une erreur s'est produite lors de l'affichage de la boîte de dialogue de gestion des doublons.
                </p>
                <p className="text-red-700 text-xs">
                  Cette erreur peut être causée par des problèmes d'import d'icônes ou de rendu des composants.
                </p>
              </div>

              {/* Error details for debugging */}
              <details className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <summary className="cursor-pointer font-medium text-gray-700 text-sm">
                  Détails techniques (pour le débogage)
                </summary>
                <div className="mt-2 space-y-2">
                  <div className="text-xs">
                    <strong>Erreur:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {this.state.error?.message || 'Erreur inconnue'}
                    </pre>
                  </div>
                  {this.state.error?.stack && (
                    <div className="text-xs">
                      <strong>Stack trace:</strong>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className="text-xs">
                      <strong>Component stack:</strong>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  className="flex-1"
                >
                  Réessayer
                </Button>
                <Button
                  onClick={this.props.onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Fermer
                </Button>
              </div>

              {/* Help text */}
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium mb-1">💡 Que faire ?</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Cliquez sur "Réessayer" pour tenter de réafficher la boîte de dialogue</li>
                  <li>Si le problème persiste, fermez cette fenêtre et réessayez l'upload</li>
                  <li>Contactez le support technique si l'erreur continue</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage with DuplicateUploadDialog
export const withDuplicateUploadErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  return (props: P & { isOpen: boolean; onClose: () => void }) => (
    <DuplicateUploadErrorBoundary 
      isOpen={props.isOpen} 
      onClose={props.onClose}
      onError={onError}
    >
      <Component {...props} />
    </DuplicateUploadErrorBoundary>
  );
};