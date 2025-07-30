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

interface VersionComparisonProps {
  onClose?: () => void;
}

interface ComparisonData {
  section: string;
  field: string;
  leftValue: any;
  rightValue: any;
  isDifferent: boolean;
}

export const VersionComparison: React.FC<VersionComparisonProps> = ({ onClose }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leftVersionId, setLeftVersionId] = useState<string>('');
  const [rightVersionId, setRightVersionId] = useState<string>('');
  const [leftContent, setLeftContent] = useState<HomepageData | null>(null);
  const [rightContent, setRightContent] = useState<HomepageData | null>(null);
  const [comparison, setComparison] = useState<ComparisonData[]>([]);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const versionList = await homepageAPI.getVersions(20);
      setVersions(versionList);
      
      // Auto-select current version as left side
      const activeVersion = versionList.find(v => v.isActive);
      if (activeVersion) {
        setLeftVersionId(activeVersion.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const loadVersionContent = async (versionId: string): Promise<HomepageData | null> => {
    try {
      const versionData = await homepageAPI.getVersion(versionId);
      return versionData.parsedContent;
    } catch (err) {
      console.error('Failed to load version content:', err);
      return null;
    }
  };

  const compareVersions = async () => {
    if (!leftVersionId || !rightVersionId) {
      setError('Please select both versions to compare');
      return;
    }

    if (leftVersionId === rightVersionId) {
      setError('Please select different versions to compare');
      return;
    }

    try {
      setComparing(true);
      setError(null);

      const [leftData, rightData] = await Promise.all([
        loadVersionContent(leftVersionId),
        loadVersionContent(rightVersionId)
      ]);

      if (!leftData || !rightData) {
        setError('Failed to load version content for comparison');
        return;
      }

      setLeftContent(leftData);
      setRightContent(rightData);

      // Generate comparison data
      const comparisonData = generateComparison(leftData, rightData);
      setComparison(comparisonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare versions');
    } finally {
      setComparing(false);
    }
  };

  const generateComparison = (left: HomepageData, right: HomepageData): ComparisonData[] => {
    const comparisons: ComparisonData[] = [];

    // Helper function to compare values
    const compareValues = (section: string, field: string, leftVal: any, rightVal: any) => {
      const leftStr = typeof leftVal === 'object' ? JSON.stringify(leftVal) : String(leftVal);
      const rightStr = typeof rightVal === 'object' ? JSON.stringify(rightVal) : String(rightVal);
      
      comparisons.push({
        section,
        field,
        leftValue: leftVal,
        rightValue: rightVal,
        isDifferent: leftStr !== rightStr
      });
    };

    // Compare Hero section
    compareValues('Hero', 'Title', left.hero.title, right.hero.title);
    compareValues('Hero', 'Description', left.hero.description, right.hero.description);
    compareValues('Hero', 'Video URL', left.hero.videoUrl, right.hero.videoUrl);

    // Compare Brands section
    compareValues('Brands', 'Title', left.brands.title, right.brands.title);
    compareValues('Brands', 'Logos Count', left.brands.logos.length, right.brands.logos.length);
    compareValues('Brands', 'Logos', left.brands.logos, right.brands.logos);

    // Compare Services section
    compareValues('Services', 'Title', left.services.title, right.services.title);
    compareValues('Services', 'Description', left.services.description, right.services.description);
    compareValues('Services', 'Services Count', left.services.services.length, right.services.services.length);
    compareValues('Services', 'Services', left.services.services, right.services.services);

    // Compare Work section
    compareValues('Work', 'Title', left.work.title, right.work.title);
    compareValues('Work', 'Description', left.work.description, right.work.description);
    compareValues('Work', 'Link Text', left.work.linkText, right.work.linkText);
    compareValues('Work', 'Link URL', left.work.linkUrl, right.work.linkUrl);

    // Compare Offer section
    compareValues('Offer', 'Title', left.offer.title, right.offer.title);
    compareValues('Offer', 'Points Count', left.offer.points.length, right.offer.points.length);
    compareValues('Offer', 'Points', left.offer.points, right.offer.points);

    // Compare Testimonials section
    compareValues('Testimonials', 'Count', left.testimonials.testimonials.length, right.testimonials.testimonials.length);
    compareValues('Testimonials', 'Testimonials', left.testimonials.testimonials, right.testimonials.testimonials);

    // Compare Footer section
    compareValues('Footer', 'Title', left.footer.title, right.footer.title);
    compareValues('Footer', 'Email', left.footer.email, right.footer.email);
    compareValues('Footer', 'Copyright', left.footer.copyright, right.footer.copyright);
    compareValues('Footer', 'Links', left.footer.links, right.footer.links);

    return comparisons;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'None';
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `Array (${value.length} items)`;
      }
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const formatVersionName = (version: Version) => {
    return version.versionName || `Version ${new Date(version.createdAt).toLocaleString()}`;
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
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Version Comparison</h2>
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

        <div className="p-6">
          {/* Version Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version de Base
              </label>
              <select
                value={leftVersionId}
                onChange={(e) => setLeftVersionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Sélectionner une version...</option>
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {formatVersionName(version)}
                    {version.isActive ? ' (Actuelle)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version à Comparer
              </label>
              <select
                value={rightVersionId}
                onChange={(e) => setRightVersionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Sélectionner une version...</option>
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {formatVersionName(version)}
                    {version.isActive ? ' (Actuelle)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={compareVersions}
              disabled={!leftVersionId || !rightVersionId || comparing}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {comparing ? 'Comparaison...' : 'Comparer les Versions'}
            </button>
          </div>

          {/* Comparison Results */}
          {comparison.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="text-lg font-medium">Comparison Results</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {comparison.filter(c => c.isDifferent).length} differences found out of {comparison.length} fields
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Field
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Left Version
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Right Version
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comparison.map((item, index) => (
                      <tr
                        key={index}
                        className={item.isDifferent ? 'bg-yellow-50' : ''}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.section}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.field}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={formatValue(item.leftValue)}>
                            {formatValue(item.leftValue)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={formatValue(item.rightValue)}>
                            {formatValue(item.rightValue)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {item.isDifferent ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Different
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Same
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};