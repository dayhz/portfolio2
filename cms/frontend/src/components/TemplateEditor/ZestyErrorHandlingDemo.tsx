import React, { useState } from 'react';
import { ZestyTemplateRenderer } from './ZestyTemplateRenderer';

// Test data scenarios for error handling
const testScenarios = {
  complete: {
    title: 'Complete Test Project',
    heroImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/686d8163cffedff40b473869_header-zesty-v2.png',
    challenge: 'This is a complete project with all data filled.',
    approach: 'Testing with complete data to ensure normal rendering works.',
    client: 'Test Client',
    year: '2025',
    duration: '8 weeks',
    type: 'Web',
    industry: 'Technology',
    scope: ['Design', 'Development', 'Testing'],
    image1: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139737de2349a3da35fc70_case-zesty02.avif',
    textSection1: 'This is a test text section.',
    image2: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813978dd56d1a8ae684d995_case-zesty03.avif',
    image3: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/682b59317324c9d5a41cbbb9_case-zesty04.png',
    image4: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/682b5923845e7ec8eb928654_case-zesty05.png',
    video1: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-app-motion.mp4',
    video1Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
    video2: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-colors.mp4',
    video2Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
    video3: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-topbar.mp4',
    video3Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
    testimonialQuote: 'This is a test testimonial quote.',
    testimonialAuthor: 'Test Author',
    testimonialRole: 'Test Role',
    testimonialImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6824e55a01623e0153c6d876_img-victor.png',
    finalImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139823634589c669ae445c_case-zesty-screens.avif',
    textSection2: 'This is another test text section.',
    finalImage1: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813992c3669562e4c3a141a_case-zesty-components.avif',
    finalImage2: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139961925821195762c826_case-zesty-stickers.avif',
  },
  
  empty: {} as any,
  
  null: null as any,
  
  partial: {
    title: 'Partial Project',
    client: 'Partial Client',
    challenge: 'Only some fields are filled.',
    // Missing most other fields
  } as any,
  
  invalidTypes: {
    title: 123, // Should be string
    client: null, // Should be string
    scope: 'not an array', // Should be array
    year: ['2025'], // Should be string
  } as any,
  
  brokenImages: {
    title: 'Broken Images Test',
    heroImage: 'https://invalid-url.com/broken.jpg',
    challenge: 'Testing with broken image URLs.',
    approach: 'All images should fall back to defaults.',
    client: 'Broken Images Client',
    year: '2025',
    duration: '8 weeks',
    type: 'Web',
    industry: 'Technology',
    scope: ['Testing'],
    image1: 'https://broken-url.com/image1.jpg',
    textSection1: 'Testing broken images.',
    image2: 'https://broken-url.com/image2.jpg',
    image3: 'https://broken-url.com/image3.jpg',
    image4: 'https://broken-url.com/image4.jpg',
    video1: 'https://broken-url.com/video1.mp4',
    video1Poster: 'https://broken-url.com/poster1.jpg',
    video2: 'https://broken-url.com/video2.mp4',
    video2Poster: 'https://broken-url.com/poster2.jpg',
    video3: 'https://broken-url.com/video3.mp4',
    video3Poster: 'https://broken-url.com/poster3.jpg',
    testimonialQuote: 'Testing with broken images.',
    testimonialAuthor: 'Test Author',
    testimonialRole: 'Test Role',
    testimonialImage: 'https://broken-url.com/testimonial.jpg',
    finalImage: 'https://broken-url.com/final.jpg',
    textSection2: 'All images should show fallbacks.',
    finalImage1: 'https://broken-url.com/final1.jpg',
    finalImage2: 'https://broken-url.com/final2.jpg',
  },
  
  malicious: {
    title: '<script>alert("XSS")</script>Safe Title',
    challenge: 'javascript:alert("XSS") This tests XSS protection.',
    approach: '<img src="x" onerror="alert(\'XSS\')" /> Safe approach text.',
    client: 'Safe Client',
    year: '2025',
    duration: '8 weeks',
    type: 'Web',
    industry: 'Technology',
    scope: ['Security Testing'],
    image1: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139737de2349a3da35fc70_case-zesty02.avif',
    textSection1: 'Testing XSS protection in content.',
    image2: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813978dd56d1a8ae684d995_case-zesty03.avif',
    image3: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/682b59317324c9d5a41cbbb9_case-zesty04.png',
    image4: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/682b5923845e7ec8eb928654_case-zesty05.png',
    video1: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-app-motion.mp4',
    video1Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
    video2: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-colors.mp4',
    video2Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
    video3: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-topbar.mp4',
    video3Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
    testimonialQuote: 'Testing XSS protection in testimonials.',
    testimonialAuthor: 'Test Author',
    testimonialRole: 'Test Role',
    testimonialImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6824e55a01623e0153c6d876_img-victor.png',
    finalImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139823634589c669ae445c_case-zesty-screens.avif',
    textSection2: 'XSS protection should sanitize dangerous content.',
    finalImage1: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813992c3669562e4c3a141a_case-zesty-components.avif',
    finalImage2: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139961925821195762c826_case-zesty-stickers.avif',
  },
};

export const ZestyErrorHandlingDemo: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof testScenarios>('complete');
  const [showConsole, setShowConsole] = useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Zesty Template Error Handling Demo
        </h2>
        
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          This demo tests various error scenarios for the ZestyTemplateRenderer component.
          Open the browser console to see error handling logs.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Test Scenario:
          </label>
          <select 
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value as keyof typeof testScenarios)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginRight: '1rem'
            }}
          >
            <option value="complete">Complete Data (Normal)</option>
            <option value="empty">Empty Object</option>
            <option value="null">Null Data</option>
            <option value="partial">Partial Data</option>
            <option value="invalidTypes">Invalid Data Types</option>
            <option value="brokenImages">Broken Image URLs</option>
            <option value="malicious">Malicious Content (XSS Test)</option>
          </select>
          
          <button
            onClick={() => setShowConsole(!showConsole)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showConsole ? 'Hide' : 'Show'} Console Info
          </button>
        </div>

        {showConsole && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f1f3f4',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            marginBottom: '1rem'
          }}>
            <strong>Current Test Data:</strong>
            <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(testScenarios[selectedScenario], null, 2)}
            </pre>
          </div>
        )}

        <div style={{
          padding: '1rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>Expected Behavior:</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            {selectedScenario === 'complete' && (
              <li>Should render normally with all provided data</li>
            )}
            {selectedScenario === 'empty' && (
              <>
                <li>Should fall back to default Zesty content</li>
                <li>Should log validation warnings in console</li>
              </>
            )}
            {selectedScenario === 'null' && (
              <>
                <li>Should fall back to default Zesty content</li>
                <li>Should not crash or show error boundary</li>
              </>
            )}
            {selectedScenario === 'partial' && (
              <>
                <li>Should use provided data where available</li>
                <li>Should fall back to defaults for missing fields</li>
              </>
            )}
            {selectedScenario === 'invalidTypes' && (
              <>
                <li>Should handle invalid data types gracefully</li>
                <li>Should log validation warnings in console</li>
                <li>Should fall back to defaults for invalid fields</li>
              </>
            )}
            {selectedScenario === 'brokenImages' && (
              <>
                <li>Should show loading placeholders initially</li>
                <li>Should fall back to default images when URLs fail</li>
                <li>Should show error placeholders if all attempts fail</li>
              </>
            )}
            {selectedScenario === 'malicious' && (
              <>
                <li>Should strip script tags and javascript: URLs</li>
                <li>Should preserve safe content</li>
                <li>Should not execute any malicious code</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Render the template with selected test data */}
      <div style={{ border: '2px solid #e9ecef', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: '#e9ecef', 
          fontWeight: 'bold',
          fontSize: '0.875rem'
        }}>
          Template Output ({selectedScenario} scenario):
        </div>
        <ZestyTemplateRenderer projectData={testScenarios[selectedScenario]} />
      </div>
    </div>
  );
};