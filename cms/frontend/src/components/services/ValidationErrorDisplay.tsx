/**
 * Composant pour afficher les erreurs de validation
 */

import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  X
} from 'lucide-react';
import { ValidationError } from '../../../../shared/types/services';

interface ValidationErrorDisplayProps {
  errors: ValidationError[];
  warnings?: ValidationError[];
  onDismiss?: () => void;
  showInline?: boolean;
  compact?: boolean;
  className?: string;
}

export function ValidationErrorDisplay({
  errors = [],
  warnings = [],
  onDismiss,
  showInline = false,
  compact = false,
  className = ''
}: ValidationErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set());

  const visibleErrors = errors.filter(error => !dismissedErrors.has(error.field));
  const visibleWarnings = warnings.filter(warning => !dismissedErrors.has(warning.field));

  const dismissError = (field: string) => {
    setDismissedErrors(prev => new Set([...prev, field]));
  };

  if (visibleErrors.length === 0 && visibleWarnings.length === 0) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Aucune erreur de validation détectée
        </AlertDescription>
      </Alert>
    );
  }

  if (showInline) {
    return (
      <div className={`space-y-2 ${className}`}>
        {visibleErrors.map((error) => (
          <Alert key={error.field} variant="destructive" className="text-sm">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription>
              <strong>{error.field}:</strong> {error.message}
            </AlertDescription>
          </Alert>
        ))}
        {visibleWarnings.map((warning) => (
          <Alert key={warning.field} className="border-yellow-200 bg-yellow-50 text-sm">
            <AlertTriangle className="h-3 w-3 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>{warning.field}:</strong> {warning.message}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {visibleErrors.length} erreur(s) et {visibleWarnings.length} avertissement(s) détecté(s)
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 p-0 h-auto text-red-600 hover:text-red-700"
          >
            {isExpanded ? (
              <>
                Masquer <ChevronUp className="h-3 w-3 ml-1" />
              </>
            ) : (
              <>
                Voir détails <ChevronDown className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        </AlertDescription>
        {isExpanded && (
          <div className="mt-3 space-y-2">
            {visibleErrors.map((error) => (
              <div key={error.field} className="text-sm">
                <strong>{error.field}:</strong> {error.message}
              </div>
            ))}
            {visibleWarnings.map((warning) => (
              <div key={warning.field} className="text-sm text-yellow-700">
                <strong>{warning.field}:</strong> {warning.message}
              </div>
            ))}
          </div>
        )}
      </Alert>
    );
  }

  return (
    <Card className={`border-red-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg text-red-800">
              Erreurs de validation
            </CardTitle>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription className="text-red-700">
          {visibleErrors.length} erreur(s) et {visibleWarnings.length} avertissement(s) à corriger
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleErrors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Erreurs ({visibleErrors.length})
            </h4>
            {visibleErrors.map((error) => (
              <Alert key={error.field} variant="destructive" className="relative">
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div>
                      <strong>{error.field}:</strong> {error.message}
                      {error.section && (
                        <div className="text-xs text-red-600 mt-1">
                          Section: {error.section}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissError(error.field)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {visibleWarnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Avertissements ({visibleWarnings.length})
            </h4>
            {visibleWarnings.map((warning) => (
              <Alert key={warning.field} className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <strong>{warning.field}:</strong> {warning.message}
                      {warning.section && (
                        <div className="text-xs text-yellow-700 mt-1">
                          Section: {warning.section}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissError(warning.field)}
                      className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 ml-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}