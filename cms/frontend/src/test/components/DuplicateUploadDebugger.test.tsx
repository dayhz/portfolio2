/**
 * Tests for DuplicateUploadDebugger service
 * Requirements: 1.4, 3.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { duplicateUploadDebugger } from '@/services/DuplicateUploadDebugger';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock console methods
const consoleMock = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
Object.defineProperty(console, 'log', { value: consoleMock.log });
Object.defineProperty(console, 'info', { value: consoleMock.info });
Object.defineProperty(console, 'warn', { value: consoleMock.warn });
Object.defineProperty(console, 'error', { value: consoleMock.error });

describe('DuplicateUploadDebugger', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Clear debugger data
    duplicateUploadDebugger.clearDebugData();
  });

  afterEach(() => {
    // Clean up
    duplicateUploadDebugger.clearDebugData();
  });

  describe('Event Logging', () => {
    it('should log duplicate detection events', () => {
      const existingFile = {
        id: 'existing-1',
        name: 'test.jpg',
        size: 1024,
        createdAt: '2024-01-01T00:00:00Z'
      };
      
      const uploadedFile = {
        originalName: 'test.jpg',
        size: 1024,
        mimetype: 'image/jpeg'
      };
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      duplicateUploadDebugger.logDuplicateDetection(existingFile, uploadedFile, file);

      const events = duplicateUploadDebugger.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('detection');
      expect(events[0].data.existingFile.id).toBe('existing-1');
      expect(events[0].data.uploadedFile.originalName).toBe('test.jpg');
      expect(events[0].data.file.name).toBe('test.jpg');
    });

    it('should log dialog state changes', () => {
      duplicateUploadDebugger.logDialogStateChange(true, 'user_opened', { test: 'context' });

      const events = duplicateUploadDebugger.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('dialog_open');
      expect(events[0].data.isOpen).toBe(true);
      expect(events[0].data.reason).toBe('user_opened');
      expect(events[0].data.context.test).toBe('context');
    });

    it('should log user actions', () => {
      duplicateUploadDebugger.logUserAction('replace', { fileId: 'test-123' });

      const events = duplicateUploadDebugger.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('action_taken');
      expect(events[0].data.action).toBe('replace');
      expect(events[0].data.context.fileId).toBe('test-123');
    });

    it('should log validation events', () => {
      const validationDetails = {
        isValid: true,
        errors: [],
        validatedFields: ['existingFile', 'uploadedFile']
      };

      duplicateUploadDebugger.logValidation(true, validationDetails);

      const events = duplicateUploadDebugger.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('validation');
      expect(events[0].data.isValid).toBe(true);
      expect(events[0].data.validationDetails.validatedFields).toEqual(['existingFile', 'uploadedFile']);
    });

    it('should log processing events', () => {
      duplicateUploadDebugger.logProcessing('upload_start', { fileName: 'test.jpg', fileSize: 1024 });

      const events = duplicateUploadDebugger.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('processing');
      expect(events[0].data.stage).toBe('upload_start');
      expect(events[0].data.data.fileName).toBe('test.jpg');
    });
  });

  describe('Error Logging', () => {
    it('should log validation errors', () => {
      duplicateUploadDebugger.logError({
        type: 'validation_error',
        message: 'Invalid duplicate data structure',
        context: { field: 'existingFile', value: null },
        severity: 'high'
      });

      const errors = duplicateUploadDebugger.getRecentErrors(10);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('validation_error');
      expect(errors[0].message).toBe('Invalid duplicate data structure');
      expect(errors[0].severity).toBe('high');
      expect(errors[0].context.field).toBe('existingFile');
    });

    it('should log render errors', () => {
      duplicateUploadDebugger.logError({
        type: 'render_error',
        message: 'Component failed to render',
        stack: 'Error: Component failed\n    at Component.render',
        context: { componentName: 'DuplicateUploadDialog' },
        severity: 'critical'
      });

      const errors = duplicateUploadDebugger.getRecentErrors(10);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('render_error');
      expect(errors[0].severity).toBe('critical');
      expect(errors[0].stack).toContain('Component failed');
    });

    it('should log API errors', () => {
      duplicateUploadDebugger.logError({
        type: 'api_error',
        message: 'Upload failed with status 500',
        context: { 
          status: 500, 
          statusText: 'Internal Server Error',
          url: '/api/media'
        },
        severity: 'medium'
      });

      const errors = duplicateUploadDebugger.getRecentErrors(10);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('api_error');
      expect(errors[0].context.status).toBe(500);
    });
  });

  describe('Metrics', () => {
    it('should calculate metrics correctly', () => {
      // Log some events
      duplicateUploadDebugger.logEvent('detection', { test: 'data' });
      duplicateUploadDebugger.logEvent('action_taken', { action: 'replace' });
      duplicateUploadDebugger.logEvent('dialog_open', { reason: 'duplicate_detected' });
      duplicateUploadDebugger.logEvent('dialog_close', { reason: 'action_completed' });
      
      // Log some errors
      duplicateUploadDebugger.logError({
        type: 'validation_error',
        message: 'Test error',
        context: {},
        severity: 'low'
      });

      const metrics = duplicateUploadDebugger.getMetrics();
      
      expect(metrics.totalDetections).toBe(1);
      expect(metrics.successfulActions).toBe(0); // 1 action - 1 error = 0
      expect(metrics.failedActions).toBe(1);
      expect(metrics.dialogOpenCount).toBe(1);
      expect(metrics.dialogCloseCount).toBe(1);
      expect(metrics.errorRate).toBe(100); // 1 error / 1 action * 100
    });

    it('should handle empty metrics', () => {
      const metrics = duplicateUploadDebugger.getMetrics();
      
      expect(metrics.totalDetections).toBe(0);
      expect(metrics.successfulActions).toBe(0);
      expect(metrics.failedActions).toBe(0);
      expect(metrics.dialogOpenCount).toBe(0);
      expect(metrics.dialogCloseCount).toBe(0);
      expect(metrics.errorRate).toBe(0);
    });
  });

  describe('Data Persistence', () => {
    it('should persist events to localStorage', () => {
      duplicateUploadDebugger.logEvent('detection', { test: 'data' });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'duplicateUploadDebugEvents',
        expect.stringContaining('"type":"detection"')
      );
    });

    it('should persist errors to localStorage', () => {
      duplicateUploadDebugger.logError({
        type: 'validation_error',
        message: 'Test error',
        context: {},
        severity: 'low'
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'duplicateUploadDebugErrors',
        expect.stringContaining('"type":"validation_error"')
      );
    });

    it('should clear localStorage data', () => {
      duplicateUploadDebugger.clearDebugData();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('duplicateUploadDebugEvents');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('duplicateUploadDebugErrors');
    });
  });

  describe('Data Export', () => {
    it('should export debug data as JSON', () => {
      // Add some test data
      duplicateUploadDebugger.logEvent('detection', { test: 'event' });
      duplicateUploadDebugger.logError({
        type: 'validation_error',
        message: 'Test error',
        context: {},
        severity: 'low'
      });

      const exportedData = duplicateUploadDebugger.exportDebugData();
      const parsedData = JSON.parse(exportedData);
      
      expect(parsedData).toHaveProperty('sessionId');
      expect(parsedData).toHaveProperty('timestamp');
      expect(parsedData).toHaveProperty('userAgent');
      expect(parsedData).toHaveProperty('metrics');
      expect(parsedData).toHaveProperty('recentEvents');
      expect(parsedData).toHaveProperty('recentErrors');
      expect(parsedData.recentEvents).toHaveLength(1);
      expect(parsedData.recentErrors).toHaveLength(1);
    });
  });

  describe('Console Logging', () => {
    it('should log events to console with appropriate level', () => {
      duplicateUploadDebugger.logEvent('detection', { test: 'data' });
      
      expect(consoleMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('[DuplicateUpload:DETECTION]'),
        expect.objectContaining({
          type: 'detection',
          data: expect.objectContaining({ test: 'data' })
        })
      );
    });

    it('should log errors to console with appropriate level', () => {
      duplicateUploadDebugger.logError({
        type: 'validation_error',
        message: 'Test error',
        context: { test: 'context' },
        severity: 'high'
      });
      
      expect(consoleMock.error).toHaveBeenCalledWith(
        expect.stringContaining('[DuplicateUpload:ERROR:VALIDATION_ERROR]'),
        expect.objectContaining({
          type: 'validation_error',
          severity: 'high',
          context: expect.objectContaining({ test: 'context' })
        })
      );
    });
  });

  describe('Debugging Tools', () => {
    it('should provide debugging tools', () => {
      const debugTools = duplicateUploadDebugger.createDebuggingTools();
      
      expect(debugTools).toHaveProperty('simulateDuplicate');
      expect(debugTools).toHaveProperty('testValidation');
      expect(debugTools).toHaveProperty('forceError');
      expect(debugTools).toHaveProperty('getSummary');
      expect(debugTools).toHaveProperty('export');
      
      expect(typeof debugTools.simulateDuplicate).toBe('function');
      expect(typeof debugTools.testValidation).toBe('function');
      expect(typeof debugTools.forceError).toBe('function');
      expect(typeof debugTools.getSummary).toBe('function');
      expect(typeof debugTools.export).toBe('function');
    });

    it('should simulate duplicate detection', () => {
      const debugTools = duplicateUploadDebugger.createDebuggingTools();
      
      debugTools.simulateDuplicate('test-file.jpg');
      
      const events = duplicateUploadDebugger.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('detection');
      expect(events[0].data.uploadedFile.originalName).toBe('test-file.jpg');
    });

    it('should force errors for testing', () => {
      const debugTools = duplicateUploadDebugger.createDebuggingTools();
      
      debugTools.forceError('render_error');
      
      const errors = duplicateUploadDebugger.getRecentErrors(10);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('render_error');
      expect(errors[0].message).toContain('Forced error for testing');
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize sensitive data', () => {
      const sensitiveData = {
        username: 'testuser',
        password: 'secret123',
        token: 'abc123',
        normalField: 'normal value'
      };

      duplicateUploadDebugger.logEvent('processing', sensitiveData);
      
      const events = duplicateUploadDebugger.getRecentEvents(1);
      expect(events[0].data.password).toBe('[REDACTED]');
      expect(events[0].data.token).toBe('[REDACTED]');
      expect(events[0].data.normalField).toBe('normal value');
      expect(events[0].data.username).toBe('testuser');
    });

    it('should handle circular references', () => {
      const circularData: any = { name: 'test' };
      circularData.self = circularData;

      expect(() => {
        duplicateUploadDebugger.logEvent('processing', circularData);
      }).not.toThrow();
      
      const events = duplicateUploadDebugger.getRecentEvents(1);
      // The data should be sanitized and the circular reference handled
      expect(events[0].data).toBeDefined();
      expect(typeof events[0].data).toBe('object');
      // Circular reference should be handled gracefully without throwing
    });
  });
});