import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useNotificationSystem } from '../../hooks/useNotificationSystem';
import { ValidationError } from '../../../../shared/types/services';

// Mock the notification context
const mockAddNotification = vi.fn();
const mockShowToast = vi.fn();

vi.mock('@/contexts/NotificationContext', () => ({
  useNotifications: () => ({
    addNotification: mockAddNotification,
    showToast: mockShowToast
  })
}));

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn()
});

describe('useNotificationSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddNotification.mockReturnValue('notification-id');
  });

  describe('Basic Notifications', () => {
    it('creates success notifications with correct parameters', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifySuccess('Test Success', 'Success message');
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'success',
        'Test Success',
        'Success message',
        {
          autoDelete: true,
          expiresIn: 5000,
          showToast: true
        }
      );
    });

    it('creates error notifications with correct parameters', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyError('Test Error', 'Error message');
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'error',
        'Test Error',
        'Error message',
        {
          autoDelete: false,
          showToast: true
        }
      );
    });

    it('creates warning notifications with correct parameters', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyWarning('Test Warning', 'Warning message');
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'warning',
        'Test Warning',
        'Warning message',
        {
          autoDelete: true,
          expiresIn: 8000,
          showToast: true
        }
      );
    });

    it('creates info notifications with correct parameters', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyInfo('Test Info', 'Info message');
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'info',
        'Test Info',
        'Info message',
        {
          autoDelete: true,
          expiresIn: 6000,
          showToast: true
        }
      );
    });
  });

  describe('Save Operation Notifications', () => {
    it('creates save start notification', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifySaveStart('hero');
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'info',
        'Sauvegarde - Section Hero',
        'Opération en cours...',
        expect.objectContaining({
          autoDelete: false,
          showToast: false
        })
      );
    });

    it('creates save success notification', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifySaveSuccess('services');
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'success',
        'Sauvegarde - Grille des Services',
        'Opération terminée avec succès',
        expect.objectContaining({
          autoDelete: true,
          expiresIn: 4000
        })
      );
    });

    it('creates auto-save success notification with shorter duration', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifySaveSuccess('skills', true);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'success',
        'Sauvegarde automatique - Compétences & Vidéo',
        'Opération terminée avec succès',
        expect.objectContaining({
          expiresIn: 2000
        })
      );
    });

    it('creates save error notification', () => {
      const error = new Error('Save failed');
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifySaveError('approach', error);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'error',
        'Erreur - Sauvegarde - Processus de Travail',
        'Save failed',
        expect.objectContaining({
          autoDelete: false,
          actionButton: expect.objectContaining({
            text: 'Réessayer'
          })
        })
      );
    });

    it('handles string errors in save error notification', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifySaveError('testimonials', 'String error message');
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'error',
        'Erreur - Sauvegarde - Témoignages',
        'String error message',
        expect.any(Object)
      );
    });
  });

  describe('Publish Operation Notifications', () => {
    it('creates publish start notification', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyPublishStart();
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'info',
        'Publication',
        'Opération en cours...',
        expect.objectContaining({
          showProgress: true,
          showToast: true
        })
      );
    });

    it('creates publish success notification with action button', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyPublishSuccess();
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'success',
        'Publication',
        'Opération terminée avec succès',
        expect.objectContaining({
          expiresIn: 6000,
          actionButton: expect.objectContaining({
            text: 'Voir la page'
          })
        })
      );
    });

    it('creates publish error notification', () => {
      const error = new Error('Publish failed');
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyPublishError(error);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'error',
        'Erreur - Publication',
        'Publish failed',
        expect.any(Object)
      );
    });
  });

  describe('Validation Notifications', () => {
    const mockValidationErrors: ValidationError[] = [
      {
        field: 'title',
        section: 'hero',
        message: 'Title is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      },
      {
        field: 'description',
        section: 'hero',
        message: 'Description is too short',
        severity: 'warning',
        code: 'MIN_LENGTH_WARNING'
      }
    ];

    it('creates validation error notification with correct counts', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyValidationErrors(mockValidationErrors, 'hero');
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'warning',
        'Problèmes de validation - Section Hero',
        '1 erreur et 1 avertissement détectés',
        expect.objectContaining({
          autoDelete: false,
          actionButton: expect.objectContaining({
            text: 'Voir les détails'
          })
        })
      );
    });

    it('handles only errors in validation notification', () => {
      const errorsOnly = mockValidationErrors.filter(e => e.severity === 'error');
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyValidationErrors(errorsOnly);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'warning',
        'Problèmes de validation',
        '1 erreur détectée',
        expect.any(Object)
      );
    });

    it('handles only warnings in validation notification', () => {
      const warningsOnly = mockValidationErrors.filter(e => e.severity === 'warning');
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyValidationErrors(warningsOnly);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'warning',
        'Problèmes de validation',
        '1 avertissement détecté',
        expect.any(Object)
      );
    });

    it('does not create notification for empty errors array', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyValidationErrors([]);
      });

      expect(mockAddNotification).not.toHaveBeenCalled();
    });

    it('handles plural forms correctly', () => {
      const multipleErrors: ValidationError[] = [
        ...mockValidationErrors,
        {
          field: 'color',
          section: 'services',
          message: 'Invalid color',
          severity: 'error',
          code: 'INVALID_COLOR'
        }
      ];

      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyValidationErrors(multipleErrors);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'warning',
        'Problèmes de validation',
        '2 erreurs et 1 avertissement détectés',
        expect.any(Object)
      );
    });
  });

  describe('Auto-save Notifications', () => {
    it('creates auto-save toast notification', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyAutoSave('clients');
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        'info',
        'Sauvegarde automatique',
        {
          description: 'Liste des Clients sauvegardé automatiquement'
        }
      );
    });
  });

  describe('Connection Status Notifications', () => {
    it('creates connection lost notification', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyConnectionLost();
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'error',
        'Connexion perdue',
        'La connexion au serveur a été perdue. Vos modifications sont sauvegardées localement.',
        expect.objectContaining({
          persistent: true,
          autoDelete: false
        })
      );
    });

    it('creates connection restored notification', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyConnectionRestored();
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'success',
        'Connexion rétablie',
        'La connexion au serveur a été rétablie. Synchronisation en cours...',
        expect.objectContaining({
          expiresIn: 3000
        })
      );
    });
  });

  describe('Batch Operations', () => {
    it('creates progress notification for ongoing batch operation', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyBatchOperation('Suppression', 10, 5, 0);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'info',
        'Suppression en lot',
        '5/10 éléments traités (50%)',
        expect.objectContaining({
          autoDelete: false,
          showToast: false
        })
      );
    });

    it('creates success notification for completed batch operation without errors', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyBatchOperation('Upload', 5, 5, 0);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'success',
        'Upload en lot',
        'Tous les éléments ont été traités avec succès',
        expect.any(Object)
      );
    });

    it('creates warning notification for completed batch operation with errors', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyBatchOperation('Validation', 10, 10, 3);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'warning',
        'Validation en lot',
        '7 éléments traités, 3 erreurs',
        expect.any(Object)
      );
    });

    it('includes error count in progress message when errors exist', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyBatchOperation('Processing', 8, 6, 2);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'info',
        'Processing en lot',
        '6/8 éléments traités (75%) - 2 erreurs',
        expect.any(Object)
      );
    });
  });

  describe('Section Display Names', () => {
    it('maps section keys to display names correctly', () => {
      const { result } = renderHook(() => useNotificationSystem());

      const sections = [
        { key: 'hero', expected: 'Section Hero' },
        { key: 'services', expected: 'Grille des Services' },
        { key: 'skills', expected: 'Compétences & Vidéo' },
        { key: 'approach', expected: 'Processus de Travail' },
        { key: 'testimonials', expected: 'Témoignages' },
        { key: 'clients', expected: 'Liste des Clients' }
      ];

      sections.forEach(({ key, expected }) => {
        act(() => {
          result.current.notifySaveStart(key as any);
        });

        expect(mockAddNotification).toHaveBeenCalledWith(
          'info',
          `Sauvegarde - ${expected}`,
          expect.any(String),
          expect.any(Object)
        );

        vi.clearAllMocks();
      });
    });
  });

  describe('Custom Options', () => {
    it('allows overriding default notification options', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifySuccess('Custom Success', 'Message', {
          autoDelete: false,
          expiresIn: 10000,
          showToast: false
        });
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'success',
        'Custom Success',
        'Message',
        {
          autoDelete: false,
          expiresIn: 10000,
          showToast: false
        }
      );
    });

    it('merges custom options with defaults', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyError('Custom Error', 'Message', {
          expiresIn: 5000 // Override default, but keep other defaults
        });
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'error',
        'Custom Error',
        'Message',
        {
          autoDelete: false, // Default
          showToast: true,    // Default
          expiresIn: 5000     // Custom
        }
      );
    });
  });

  describe('Action Buttons', () => {
    it('includes action buttons in notifications when provided', () => {
      const { result } = renderHook(() => useNotificationSystem());
      const mockAction = vi.fn();

      act(() => {
        result.current.notifyWarning('Test Warning', 'Message', {
          actionButton: {
            text: 'Custom Action',
            action: mockAction
          }
        });
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        'warning',
        'Test Warning',
        'Message',
        expect.objectContaining({
          actionButton: {
            text: 'Custom Action',
            action: mockAction
          }
        })
      );
    });

    it('creates action button for publish success that opens new window', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notifyPublishSuccess();
      });

      const call = mockAddNotification.mock.calls[0];
      const options = call[3];
      
      // Test the action button function
      act(() => {
        options.actionButton.action();
      });

      expect(window.open).toHaveBeenCalledWith('/services.html', '_blank');
    });
  });

  describe('Cleanup', () => {
    it('provides cleanup function', () => {
      const { result } = renderHook(() => useNotificationSystem());

      expect(typeof result.current.cleanup).toBe('function');
      
      // Should not throw when called
      act(() => {
        result.current.cleanup();
      });
    });
  });
});