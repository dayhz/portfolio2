import React, { useState, useEffect } from 'react';
import { homepageAPI } from '../../api/homepage';
import { toast } from 'sonner';

interface SystemHealthProps {
  onClose?: () => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ onClose }) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  useEffect(() => {
    validateContent();
  }, []);

  const validateContent = async () => {
    try {
      setLoading(true);
      const result = await homepageAPI.validateContent();
      setValidation(result);
    } catch (error) {
      console.error('Validation failed:', error);
      toast.error('Failed to validate content');
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async () => {
    if (!confirm('This will attempt to restore from the most recent backup. Continue?')) {
      return;
    }

    try {
      setRecovering(true);
      await homepageAPI.recoverFromError();
      toast.success('Recovery completed successfully');
      await validateContent(); // Re-validate after recovery
    } catch (error) {
      console.error('Recovery failed:', error);
      toast.error('Recovery failed');
    } finally {
      setRecovering(false);
    }
  };

  const handleEmergencyBackup = async () => {
    try {
      setCreatingBackup(true);
      await homepageAPI.createEmergencyBackup();
      toast.success('Emergency backup created successfully');
    } catch (error) {
      console.error('Emergency backup failed:', error);
      toast.error('Failed to create emergency backup');
    } finally {
      setCreatingBackup(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Validating system health...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">System Health Check</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {validation && (
            <div className="space-y-6">
              {/* Overall Status */}
              <div className={`p-4 rounded-lg border ${
                validation.isValid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-3">
                  {validation.isValid ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div>
                    <h3 className={`font-medium ${
                      validation.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validation.isValid ? 'System Healthy' : 'Issues Detected'}
                    </h3>
                    <p className={`text-sm ${
                      validation.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {validation.isValid 
                        ? 'All content validation checks passed'
                        : `${validation.errors.length} issue(s) found`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {!validation.isValid && validation.errors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Issues Found:</h4>
                  <div className="space-y-2">
                    {validation.errors.map((error, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm text-yellow-800">{error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={validateContent}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>Re-validate</span>
                </button>

                <button
                  onClick={handleEmergencyBackup}
                  disabled={creatingBackup}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {creatingBackup ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  )}
                  <span>Emergency Backup</span>
                </button>

                {!validation.isValid && (
                  <button
                    onClick={handleRecovery}
                    disabled={recovering}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {recovering ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    <span>Auto Recovery</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};