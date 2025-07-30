import React, { useState, useEffect } from 'react';
import { homepageAPI } from '../../api/homepage';
import { HomepageData } from '../../../../shared/types/homepage';

interface Version {
  id: string;
  versionName: string | null;
  contentSnapshot: string;
  isActive: boolean;
  createdAt: string;
}

interface VersionHistoryProps {
  onVersionRestore?: (restoredContent: HomepageData) => void;
  onClose?: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  onVersionRestore,
  onClose
}) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<HomepageData | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const versionList = await homepageAPI.getVersions(20);
      setVersions(versionList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = async (versionId: string) => {
    try {
      setSelectedVersion(versionId);
      const versionData = await homepageAPI.getVersion(versionId);
      setPreviewContent(versionData.parsedContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load version details');
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will create a backup of the current state.')) {
      return;
    }

    try {
      setRestoring(versionId);
      setError(null);
      const result = await homepageAPI.restoreVersion(versionId);
      
      // Refresh versions list
      await loadVersions();
      
      // Notify parent component
      if (onVersionRestore) {
        onVersionRestore(result.currentContent);
      }
      
      alert('Version restored successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore version');
    } finally {
      setRestoring(null);
    }
  };

  const handleCreateVersion = async () => {
    try {
      setCreating(true);
      setError(null);
      await homepageAPI.createVersion(newVersionName.trim() || undefined);
      setNewVersionName('');
      await loadVersions();
      alert('Version created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create version');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteVersion = async (versionId: string, versionName: string | null) => {
    if (!confirm(`Are you sure you want to delete version "${versionName || 'Unnamed'}"?`)) {
      return;
    }

    try {
      setError(null);
      await homepageAPI.deleteVersion(versionId);
      await loadVersions();
      if (selectedVersion === versionId) {
        setSelectedVersion(null);
        setPreviewContent(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete version');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatVersionName = (version: Version) => {
    return version.versionName || `Version ${formatDate(version.createdAt)}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading versions...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Version History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex h-[calc(90vh-120px)]">
          {/* Version List */}
          <div className="w-1/3 border-r overflow-y-auto">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-medium mb-3">Créer une Version</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Nom de version (optionnel)"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={handleCreateVersion}
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {creating ? 'Création...' : 'Créer'}
                </button>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-medium mb-3">Historique des Versions</h3>
              {versions.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucune version trouvée</p>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedVersion === version.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${version.isActive ? 'ring-2 ring-green-500' : ''}`}
                      onClick={() => handleVersionSelect(version.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {formatVersionName(version)}
                            {version.isActive && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Actuelle
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(version.createdAt)}
                          </p>
                        </div>
                        {!version.isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVersion(version.id, version.versionName);
                            }}
                            className="ml-2 text-red-400 hover:text-red-600 flex-shrink-0"
                            title="Supprimer la version"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Version Preview */}
          <div className="flex-1 overflow-y-auto">
            {selectedVersion && previewContent ? (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h3 className="text-lg font-medium">Aperçu de la Version</h3>
                  <button
                    onClick={() => handleRestoreVersion(selectedVersion)}
                    disabled={restoring === selectedVersion || versions.find(v => v.id === selectedVersion)?.isActive}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                  >
                    {restoring === selectedVersion ? 'Restauration...' : 'Restaurer cette Version'}
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Hero Section Preview */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Hero Section</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Title:</strong> {previewContent.hero.title}</p>
                      <p><strong>Description:</strong> {previewContent.hero.description}</p>
                      <p><strong>Video URL:</strong> {previewContent.hero.videoUrl || 'None'}</p>
                    </div>
                  </div>

                  {/* Brands Section Preview */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Brands Section</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Title:</strong> {previewContent.brands.title}</p>
                      <p><strong>Logos:</strong> {previewContent.brands.logos.length} logos</p>
                    </div>
                  </div>

                  {/* Services Section Preview */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Services Section</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Title:</strong> {previewContent.services.title}</p>
                      <p><strong>Description:</strong> {previewContent.services.description}</p>
                      <p><strong>Services:</strong> {previewContent.services.services.length} services</p>
                    </div>
                  </div>

                  {/* Work Section Preview */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Work Section</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Title:</strong> {previewContent.work.title}</p>
                      <p><strong>Description:</strong> {previewContent.work.description}</p>
                      <p><strong>Link:</strong> {previewContent.work.linkText} → {previewContent.work.linkUrl}</p>
                    </div>
                  </div>

                  {/* Offer Section Preview */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Offer Section</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Title:</strong> {previewContent.offer.title}</p>
                      <p><strong>Points:</strong> {previewContent.offer.points.length} points</p>
                    </div>
                  </div>

                  {/* Testimonials Section Preview */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Testimonials Section</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Testimonials:</strong> {previewContent.testimonials.testimonials.length} testimonials</p>
                    </div>
                  </div>

                  {/* Footer Section Preview */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Footer Section</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Title:</strong> {previewContent.footer.title}</p>
                      <p><strong>Email:</strong> {previewContent.footer.email}</p>
                      <p><strong>Copyright:</strong> {previewContent.footer.copyright}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Select a version to preview its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};