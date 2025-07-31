/**
 * Debugging and monitoring service for duplicate upload functionality
 * Implements comprehensive logging, error tracking, and debugging tools
 * Requirements: 1.4, 3.4
 */

export interface DuplicateUploadEvent {
  id: string;
  type: 'detection' | 'dialog_open' | 'dialog_close' | 'action_taken' | 'error' | 'validation' | 'processing';
  timestamp: string;
  data: any;
  userAgent?: string;
  sessionId?: string;
}

export interface DuplicateUploadError {
  id: string;
  type: 'render_error' | 'validation_error' | 'api_error' | 'timeout_error' | 'unknown_error';
  message: string;
  stack?: string;
  timestamp: string;
  context: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DuplicateUploadMetrics {
  totalDetections: number;
  successfulActions: number;
  failedActions: number;
  dialogOpenCount: number;
  dialogCloseCount: number;
  averageProcessingTime: number;
  errorRate: number;
  lastActivity: string;
}

class DuplicateUploadDebugger {
  private events: DuplicateUploadEvent[] = [];
  private errors: DuplicateUploadError[] = [];
  private sessionId: string;
  private isEnabled: boolean = true;
  private maxEvents: number = 1000;
  private maxErrors: number = 100;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeDebugger();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeDebugger(): void {
    console.log('[DuplicateUploadDebugger] Initializing debugger', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Add global error handler for JavaScript rendering errors
    window.addEventListener('error', (event) => {
      if (this.isDuplicateUploadRelated(event.error?.stack || event.message)) {
        this.logError({
          type: 'render_error',
          message: event.message,
          stack: event.error?.stack,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
          },
          severity: 'high'
        });
      }
    });

    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isDuplicateUploadRelated(event.reason?.stack || event.reason?.message)) {
        this.logError({
          type: 'render_error',
          message: event.reason?.message || 'Unhandled promise rejection',
          stack: event.reason?.stack,
          context: {
            reason: event.reason,
            promise: event.promise
          },
          severity: 'high'
        });
      }
    });

    // Expose debugger to window for manual debugging
    (window as any).duplicateUploadDebugger = this;
  }

  private isDuplicateUploadRelated(text: string): boolean {
    if (!text) return false;
    
    const keywords = [
      'DuplicateUploadDialog',
      'duplicate-upload',
      'duplicateInfo',
      'isDuplicateDialogOpen',
      'validateDuplicateData',
      'uploadFile',
      'MediaPage'
    ];
    
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * Log a duplicate upload event
   */
  logEvent(type: DuplicateUploadEvent['type'], data: any, context?: any): void {
    if (!this.isEnabled) return;

    const event: DuplicateUploadEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      data: this.sanitizeData(data),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId
    };

    this.events.push(event);

    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Console logging with structured format
    const logLevel = this.getLogLevel(type);
    const logMessage = `[DuplicateUpload:${type.toUpperCase()}] ${this.formatEventMessage(type, data)}`;
    
    console[logLevel](logMessage, {
      eventId: event.id,
      type,
      data: event.data,
      context,
      timestamp: event.timestamp,
      sessionId: this.sessionId
    });

    // Store in localStorage for persistence
    this.persistEvent(event);
  }

  /**
   * Log an error with detailed context
   */
  logError(errorData: Omit<DuplicateUploadError, 'id' | 'timestamp'>): void {
    const error: DuplicateUploadError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...errorData
    };

    this.errors.push(error);

    // Maintain max errors limit
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Console logging with appropriate level
    const logLevel = this.getErrorLogLevel(error.severity);
    console[logLevel](`[DuplicateUpload:ERROR:${error.type.toUpperCase()}] ${error.message}`, {
      errorId: error.id,
      type: error.type,
      severity: error.severity,
      stack: error.stack,
      context: error.context,
      timestamp: error.timestamp,
      sessionId: this.sessionId
    });

    // Store in localStorage for persistence
    this.persistError(error);

    // Send to external monitoring service if configured
    this.sendToMonitoring(error);
  }

  /**
   * Log duplicate detection event
   */
  logDuplicateDetection(existingFile: any, uploadedFile: any, file: File): void {
    this.logEvent('detection', {
      existingFile: {
        id: existingFile?.id,
        name: existingFile?.name,
        size: existingFile?.size,
        createdAt: existingFile?.createdAt
      },
      uploadedFile: {
        originalName: uploadedFile?.originalName,
        size: uploadedFile?.size,
        mimetype: uploadedFile?.mimetype
      },
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }
    });
  }

  /**
   * Log dialog state changes
   */
  logDialogStateChange(isOpen: boolean, reason: string, context?: any): void {
    this.logEvent(isOpen ? 'dialog_open' : 'dialog_close', {
      isOpen,
      reason,
      context: this.sanitizeData(context)
    });
  }

  /**
   * Log user actions (replace, rename, cancel)
   */
  logUserAction(action: 'replace' | 'rename' | 'cancel', context?: any): void {
    this.logEvent('action_taken', {
      action,
      context: this.sanitizeData(context)
    });
  }

  /**
   * Log validation events
   */
  logValidation(isValid: boolean, validationDetails: any): void {
    this.logEvent('validation', {
      isValid,
      validationDetails: this.sanitizeData(validationDetails)
    });
  }

  /**
   * Log processing events
   */
  logProcessing(stage: string, data: any): void {
    this.logEvent('processing', {
      stage,
      data: this.sanitizeData(data)
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): DuplicateUploadMetrics {
    const detections = this.events.filter(e => e.type === 'detection').length;
    const actions = this.events.filter(e => e.type === 'action_taken').length;
    const errors = this.errors.length;
    const dialogOpens = this.events.filter(e => e.type === 'dialog_open').length;
    const dialogCloses = this.events.filter(e => e.type === 'dialog_close').length;

    // Calculate average processing time
    const processingEvents = this.events.filter(e => e.type === 'processing');
    const avgProcessingTime = processingEvents.length > 0 
      ? processingEvents.reduce((sum, event) => sum + (event.data?.duration || 0), 0) / processingEvents.length
      : 0;

    const errorRate = actions > 0 ? (errors / actions) * 100 : 0;
    const lastActivity = this.events.length > 0 ? this.events[this.events.length - 1].timestamp : '';

    return {
      totalDetections: detections,
      successfulActions: actions - errors,
      failedActions: errors,
      dialogOpenCount: dialogOpens,
      dialogCloseCount: dialogCloses,
      averageProcessingTime: avgProcessingTime,
      errorRate,
      lastActivity
    };
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 50): DuplicateUploadEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 20): DuplicateUploadError[] {
    return this.errors.slice(-limit);
  }

  /**
   * Export debug data for troubleshooting
   */
  exportDebugData(): string {
    const debugData = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metrics: this.getMetrics(),
      recentEvents: this.getRecentEvents(100),
      recentErrors: this.getRecentErrors(50),
      localStorage: this.getStoredDebugData()
    };

    return JSON.stringify(debugData, null, 2);
  }

  /**
   * Clear debug data
   */
  clearDebugData(): void {
    this.events = [];
    this.errors = [];
    localStorage.removeItem('duplicateUploadDebugEvents');
    localStorage.removeItem('duplicateUploadDebugErrors');
    console.log('[DuplicateUploadDebugger] Debug data cleared');
  }

  /**
   * Enable/disable debugging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`[DuplicateUploadDebugger] Debugging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Create debugging tools for troubleshooting
   */
  createDebuggingTools(): any {
    return {
      // Simulate duplicate detection
      simulateDuplicate: (fileName: string = 'test-file.jpg') => {
        console.log('[DEBUG] Simulating duplicate detection for:', fileName);
        this.logDuplicateDetection(
          { id: 'test-1', name: fileName, size: 1024, createdAt: new Date().toISOString() },
          { originalName: fileName, size: 1024, mimetype: 'image/jpeg' },
          new File(['test'], fileName, { type: 'image/jpeg' })
        );
      },

      // Test validation
      testValidation: (data: any) => {
        console.log('[DEBUG] Testing validation for:', data);
        const isValid = this.validateTestData(data);
        this.logValidation(isValid, { testData: data, result: isValid });
        return isValid;
      },

      // Force error
      forceError: (type: DuplicateUploadError['type'] = 'unknown_error') => {
        console.log('[DEBUG] Forcing error of type:', type);
        this.logError({
          type,
          message: `Forced error for testing - ${type}`,
          context: { forced: true, timestamp: new Date().toISOString() },
          severity: 'medium'
        });
      },

      // Get debug summary
      getSummary: () => {
        const metrics = this.getMetrics();
        console.table(metrics);
        return metrics;
      },

      // Export data
      export: () => {
        const data = this.exportDebugData();
        console.log('[DEBUG] Exported debug data:', data);
        return data;
      }
    };
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    try {
      // Remove circular references and sensitive data
      return JSON.parse(JSON.stringify(data, (key, value) => {
        if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
          return '[REDACTED]';
        }
        return value;
      }));
    } catch (error) {
      return { error: 'Failed to sanitize data', original: String(data) };
    }
  }

  private getLogLevel(type: DuplicateUploadEvent['type']): 'log' | 'info' | 'warn' | 'error' {
    switch (type) {
      case 'error': return 'error';
      case 'detection': return 'warn';
      case 'validation': return 'info';
      default: return 'log';
    }
  }

  private getErrorLogLevel(severity: DuplicateUploadError['severity']): 'warn' | 'error' {
    return severity === 'low' || severity === 'medium' ? 'warn' : 'error';
  }

  private formatEventMessage(type: DuplicateUploadEvent['type'], data: any): string {
    switch (type) {
      case 'detection':
        return `Duplicate detected: ${data.uploadedFile?.originalName || 'unknown'} matches ${data.existingFile?.name || 'unknown'}`;
      case 'dialog_open':
        return `Dialog opened: ${data.reason || 'unknown reason'}`;
      case 'dialog_close':
        return `Dialog closed: ${data.reason || 'unknown reason'}`;
      case 'action_taken':
        return `User action: ${data.action || 'unknown'}`;
      case 'validation':
        return `Validation ${data.isValid ? 'passed' : 'failed'}`;
      case 'processing':
        return `Processing stage: ${data.stage || 'unknown'}`;
      default:
        return `Event: ${type}`;
    }
  }

  private persistEvent(event: DuplicateUploadEvent): void {
    try {
      const stored = localStorage.getItem('duplicateUploadDebugEvents');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      
      // Keep only last 500 events in localStorage
      if (events.length > 500) {
        events.splice(0, events.length - 500);
      }
      
      localStorage.setItem('duplicateUploadDebugEvents', JSON.stringify(events));
    } catch (error) {
      console.warn('[DuplicateUploadDebugger] Failed to persist event:', error);
    }
  }

  private persistError(error: DuplicateUploadError): void {
    try {
      const stored = localStorage.getItem('duplicateUploadDebugErrors');
      const errors = stored ? JSON.parse(stored) : [];
      errors.push(error);
      
      // Keep only last 100 errors in localStorage
      if (errors.length > 100) {
        errors.splice(0, errors.length - 100);
      }
      
      localStorage.setItem('duplicateUploadDebugErrors', JSON.stringify(errors));
    } catch (error) {
      console.warn('[DuplicateUploadDebugger] Failed to persist error:', error);
    }
  }

  private getStoredDebugData(): any {
    try {
      return {
        events: JSON.parse(localStorage.getItem('duplicateUploadDebugEvents') || '[]'),
        errors: JSON.parse(localStorage.getItem('duplicateUploadDebugErrors') || '[]')
      };
    } catch (error) {
      return { events: [], errors: [] };
    }
  }

  private sendToMonitoring(error: DuplicateUploadError): void {
    // Placeholder for external monitoring service integration
    // This could send to services like Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
      console.log('[DuplicateUploadDebugger] Would send to monitoring service:', error);
    }
  }

  private validateTestData(data: any): boolean {
    // Simple validation for testing purposes
    return data && typeof data === 'object' && !Array.isArray(data);
  }
}

// Create singleton instance
export const duplicateUploadDebugger = new DuplicateUploadDebugger();

// Export debugging tools for manual use
export const debugTools = duplicateUploadDebugger.createDebuggingTools();

// Console helper for easy access
if (typeof window !== 'undefined') {
  (window as any).debugDuplicateUpload = debugTools;
}