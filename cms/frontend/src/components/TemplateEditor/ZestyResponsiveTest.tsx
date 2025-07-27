import React, { useState, useEffect } from 'react';
import { ZestyTemplateRenderer } from './ZestyTemplateRenderer';
import { ResponsivePreview } from './ResponsivePreview';

// Test data for responsive testing
const testProjectData = {
  title: 'Responsive Test Project with Very Long Title That Should Wrap Properly',
  heroImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/686d8163cffedff40b473869_header-zesty-v2.png',
  challenge: 'This is a very long challenge description that should wrap properly on all screen sizes without overlapping images or other elements. It contains multiple sentences to test text wrapping behavior.',
  approach: 'This approach section also contains a lot of text to test how it behaves on different screen sizes. We want to ensure that text never overlaps with images and maintains proper readability across all devices.',
  client: 'Test Client',
  year: '2025',
  duration: '12 weeks',
  type: 'Mobile App',
  industry: 'Technology',
  scope: ['UI/UX Design', 'Responsive Development', 'Mobile Optimization', 'Performance Testing', 'Accessibility'],
  image1: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139737de2349a3da35fc70_case-zesty02.avif',
  textSection1: 'This is a text section that should be properly spaced and readable on all devices. It should not overlap with any images above or below it.',
  image2: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813978dd56d1a8ae684d995_case-zesty03.avif',
  image3: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/682b59317324c9d5a41cbbb9_case-zesty04.png',
  image4: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/682b5923845e7ec8eb928654_case-zesty05.png',
  video1: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-app-motion.mp4',
  video1Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
  video2: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-colors.mp4',
  video2Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
  video3: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-topbar.mp4',
  video3Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
  testimonialQuote: 'This is a testimonial quote that should display properly on all screen sizes and maintain good readability.',
  testimonialAuthor: 'Test Author',
  testimonialRole: 'Senior Designer',
  testimonialImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6824e55a01623e0153c6d876_img-victor.png',
  finalImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139823634589c669ae445c_case-zesty-screens.avif',
  textSection2: 'This is another text section that should maintain proper spacing and readability across all devices.',
  finalImage1: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813992c3669562e4c3a141a_case-zesty-components.avif',
  finalImage2: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139961925821195762c826_case-zesty-stickers.avif'
};

interface ResponsiveTestResult {
  device: string;
  width: number;
  issues: string[];
  passed: boolean;
}

export const ZestyResponsiveTest: React.FC = () => {
  const [testResults, setTestResults] = useState<ResponsiveTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const testBreakpoints = [
    { name: 'Desktop Large', width: 1920 },
    { name: 'Desktop', width: 1200 },
    { name: 'Tablet', width: 768 },
    { name: 'Mobile Large', width: 414 },
    { name: 'Mobile', width: 375 },
    { name: 'Mobile Small', width: 320 }
  ];

  const runResponsiveTests = async () => {
    setIsRunningTests(true);
    const results: ResponsiveTestResult[] = [];

    for (const breakpoint of testBreakpoints) {
      const issues: string[] = [];
      
      // Simulate viewport resize
      const testContainer = document.createElement('div');
      testContainer.style.width = `${breakpoint.width}px`;
      testContainer.style.height = '800px';
      testContainer.style.overflow = 'hidden';
      testContainer.style.position = 'absolute';
      testContainer.style.top = '-9999px';
      testContainer.style.left = '-9999px';
      
      document.body.appendChild(testContainer);

      // Test for common responsive issues
      try {
        // Check if text overlaps images
        const textElements = testContainer.querySelectorAll('.temp-rich p, .temp-comp-text, .testimony');
        const imageElements = testContainer.querySelectorAll('.comp-img, .video');
        
        // Check for horizontal overflow
        if (testContainer.scrollWidth > breakpoint.width) {
          issues.push('Horizontal overflow detected');
        }

        // Check navigation visibility
        if (breakpoint.width <= 991) {
          const desktopNav = testContainer.querySelector('.navbar_links_wrp:not(.is-mobile)');
          const mobileToggle = testContainer.querySelector('.toggle-menu, .menu_mobile');
          
          if (desktopNav && window.getComputedStyle(desktopNav).display !== 'none') {
            issues.push('Desktop navigation should be hidden on mobile');
          }
          
          if (!mobileToggle || window.getComputedStyle(mobileToggle).display === 'none') {
            issues.push('Mobile menu toggle should be visible');
          }
        }

        // Check image grid stacking
        if (breakpoint.width <= 767) {
          const imageGrid = testContainer.querySelector('.temp-comp-img_grid');
          if (imageGrid) {
            const gridColumns = window.getComputedStyle(imageGrid).gridTemplateColumns;
            if (gridColumns.includes('1fr 1fr')) {
              issues.push('Image grid should stack on mobile');
            }
          }
        }

        // Check text readability
        textElements.forEach((element) => {
          const styles = window.getComputedStyle(element);
          const fontSize = parseFloat(styles.fontSize);
          
          if (breakpoint.width <= 479 && fontSize < 14) {
            issues.push('Text too small on mobile devices');
          }
        });

      } catch (error) {
        issues.push(`Test error: ${error}`);
      }

      document.body.removeChild(testContainer);

      results.push({
        device: breakpoint.name,
        width: breakpoint.width,
        issues,
        passed: issues.length === 0
      });

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Zesty Template Responsive Test</h2>
      
      <div className="mb-6">
        <button
          onClick={runResponsiveTests}
          disabled={isRunningTests}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunningTests ? 'Running Tests...' : 'Run Responsive Tests'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {result.device} ({result.width}px)
                  </span>
                  <span className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {result.passed ? '✓ PASSED' : '✗ FAILED'}
                  </span>
                </div>
                {result.issues.length > 0 && (
                  <ul className="mt-2 text-sm text-red-600">
                    {result.issues.map((issue, issueIndex) => (
                      <li key={issueIndex}>• {issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <h3 className="text-lg font-semibold p-4 bg-gray-50 border-b">
          Responsive Preview
        </h3>
        <div style={{ height: '800px' }}>
          <ResponsivePreview>
            <ZestyTemplateRenderer projectData={testProjectData} />
          </ResponsivePreview>
        </div>
      </div>
    </div>
  );
};