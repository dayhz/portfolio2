/**
 * Custom hook for duplicate upload debugging
 * Provides easy access to debugging functionality
 * Requirements: 1.4, 3.4
 */

import { useEffect, useCallback } from 'react';
import { duplicateUploadDebugger } from '@/services/DuplicateUploadDebugger';

export interface UseDuplicateUploadDebuggerOptions {
  componentName?: string;
  autoLogRenders?: boolean;
  autoLogErrors?: boolean;
}

export function useDuplicateUploadDebugger(options: UseDuplicateUploadDebuggerOptions = {}) {
  const { componentName = 'UnknownComponent', autoLogRenders = false, autoLogErrors = true } = options;

  // Auto-log component renders if enabled
  useEffect(() => {
    if (autoLogRenders) {
      duplicateUploadDebugger.logEvent('processing', {
        stage: 'component_render',
        componentName,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Auto-log errors if enabled
  useEffect(() => {
    if (autoLogErrors) {
      const handleError = (event: ErrorEvent) => {
        if (duplicateUploadDebugger && event.error) {
          duplicateUploadDebugger.logError({
            type: 'render_error',
            message: event.message,
            stack: event.error.stack,
            context: {
              componentName,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno
            },
            severity: 'high'
          });
        }
      };

      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, [autoLogErrors, componentName]);

  // Logging functions
  const logEvent = useCallback((type: string, data: any) => {
    duplicateUploadDebugger.logEvent(type as any, {
      ...data,
      componentName,
      timestamp: new Date().toISOString()
    });
  }, [componentName]);

  const logError = useCallback((message: string, context: any = {}, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    duplicateUploadDebugger.logError({
      type: 'render_error',
      message,
      context: {
        ...context,
        componentName
      },
      severity
    });
  }, [componentName]);

  const logValidation = useCallback((isValid: boolean, details: any) => {
    duplicateUploadDebugger.logValidation(isValid, {
      ...details,
      componentName,
      timestamp: new Date().toISOString()
    });
  }, [componentName]);

  const logProcessing = useCallback((stage: string, data: any) => {
    duplicateUploadDebugger.logProcessing(stage, {
      ...data,
      componentName,
      timestamp: new Date().toISOString()
    });
  }, [componentName]);

  const logDuplicateDetection = useCallback((existingFile: any, uploadedFile: any, file: File) => {
    duplicateUploadDebugger.logDuplicateDetection(existingFile, uploadedFile, file);
    duplicateUploadDebugger.logEvent('processing', {
      stage: 'duplicate_detection_logged',
      componentName,
      existingFileId: existingFile?.id,
      uploadedFileName: uploadedFile?.originalName,
      fileName: file.name
    });
  }, [componentName]);

  const logDialogStateChange = useCallback((isOpen: boolean, reason: string, context?: any) => {
    duplicateUploadDebugger.logDialogStateChange(isOpen, reason, {
      ...context,
      componentName,
      timestamp: new Date().toISOString()
    });
  }, [componentName]);

  const logUserAction = useCallback((action: 'replace' | 'rename' | 'cancel', context?: any) => {
    duplicateUploadDebugger.logUserAction(action, {
      ...context,
      componentName,
      timestamp: new Date().toISOString()
    });
  }, [componentName]);

  return {
    // Direct access to debugger
    debugger: duplicateUploadDebugger,
    
    // Logging functions
    logEvent,
    logError,
    logValidation,
    logProcessing,
    logDuplicateDetection,
    logDialogStateChange,
    logUserAction,
    
    // Utility functions
    getMetrics: duplicateUploadDebugger.getMetrics.bind(duplicateUploadDebugger),
    getRecentEvents: duplicateUploadDebugger.getRecentEvents.bind(duplicateUploadDebugger),
    getRecentErrors: duplicateUploadDebugger.getRecentErrors.bind(duplicateUploadDebugger),
    exportDebugData: duplicateUploadDebugger.exportDebugData.bind(duplicateUploadDebugger),
    clearDebugData: duplicateUploadDebugger.clearDebugData.bind(duplicateUploadDebugger)
  };
}