import React from 'react';
import { ZestyTemplateRenderer } from './ZestyTemplateRenderer';

/**
 * Visual Test Component for ZestyTemplateRenderer
 * This component renders the ZestyTemplateRenderer with test data
 * to verify it matches the original zesty.html appearance
 */

// Test data that matches the original Zesty template content
const originalZestyData = {
  title: 'Talk with strangers until the chat resets',
  heroImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/686d8163cffedff40b473869_header-zesty-v2.png',
  challenge: 'The internet is overwhelming and everything it\'s dictated by appearance and who you are. I wanted to bring back the feeling of early 2000s chat rooms, anonymous and fun, but with a twist. No user names, no likes, no photos and the chats reset every 10 minutes to keep things fresh and engaging.',
  approach: 'I started this project by mapping out a simple sitemap, then jumped straight into UI and micro-interactions, since this is a concept project I didn\'t do much research besides what I liked and what I wanted for this project. It\'s always refreshing to work on something on my own and make all the design decisions along the way and I loved how the lemon mascot, Zesty, turned out.',
  client: 'Zesty',
  year: '2025',
  duration: '9 weeks',
  type: 'Mobile',
  industry: 'Messaging',
  scope: ['Concept', 'UI/UX', 'Digital Design', 'Icon Design', 'Motion Prototype'],
  image1: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139737de2349a3da35fc70_case-zesty02.avif',
  textSection1: 'For Zesty, I chose to use a dark UI simply because I thought it looked cool, with no deeper meaning behind it. Since this was a concept project, I had the freedom to do whatever I wanted and the screens were designed with a focus on simplicity and ease of use, keeping the interface clean and the experience fast-paced, with plenty of space for text and emojis.',
  image2: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813978dd56d1a8ae684d995_case-zesty03.avif',
  image3: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/682b59317324c9d5a41cbbb9_case-zesty04.png',
  image4: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/682b5923845e7ec8eb928654_case-zesty05.png',
  video1: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-app-motion.mp4',
  video1Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
  video2: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-colors.mp4',
  video2Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
  video3: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-topbar.mp4',
  video3Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
  textSection2: 'For this project, I also created some fun, playful stickers for Instagram Stories and WhatsApp, adding a bit of personality to the app. In terms of micro-interactions, I focused on making the experience feel smooth and dynamic, with small animations that respond to user actions, keeping things fun without being overwhelming.',
  testimonialQuote: 'Zesty is a little passion project of mine and I would love to built it for real someday. Back in the early 2000\'s it was a lot of fun to talk random things with strangers and that\'s the idea behind this project.',
  testimonialAuthor: 'Lawson Sydney',
  testimonialRole: 'Independent Product Designer',
  testimonialImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6824e55a01623e0153c6d876_img-victor.png',
  finalImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139823634589c669ae445c_case-zesty-screens.avif',
  finalImage1: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813992c3669562e4c3a141a_case-zesty-components.avif',
  finalImage2: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139961925821195762c826_case-zesty-stickers.avif'
};

// Custom data to test dynamic content population
const customTestData = {
  title: 'Custom Project Title - Testing Dynamic Content',
  heroImage: 'https://via.placeholder.com/1200x800/333333/ffffff?text=Custom+Hero+Image',
  challenge: 'This is a custom challenge description to test that dynamic content areas populate correctly with user-provided data instead of falling back to defaults.',
  approach: 'This is a custom approach description that should replace the default content and demonstrate that the template properly handles dynamic data injection.',
  client: 'Custom Client Name',
  year: '2024',
  duration: '12 weeks',
  type: 'Web Application',
  industry: 'E-commerce',
  scope: ['Research', 'Strategy', 'Design', 'Development', 'Testing', 'Launch'],
  image1: 'https://via.placeholder.com/800x600/444444/ffffff?text=Custom+Image+1',
  textSection1: 'This is custom text section 1 content that should appear in the template instead of the default Zesty content.',
  image2: 'https://via.placeholder.com/800x600/555555/ffffff?text=Custom+Image+2',
  image3: 'https://via.placeholder.com/600x400/666666/ffffff?text=Custom+Image+3',
  image4: 'https://via.placeholder.com/600x400/777777/ffffff?text=Custom+Image+4',
  video1: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  video1Poster: 'https://via.placeholder.com/800x450/888888/ffffff?text=Video+1+Poster',
  video2: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  video2Poster: 'https://via.placeholder.com/800x450/999999/ffffff?text=Video+2+Poster',
  video3: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  video3Poster: 'https://via.placeholder.com/800x450/aaaaaa/ffffff?text=Video+3+Poster',
  textSection2: 'This is custom text section 2 content that demonstrates the template can handle different content while maintaining the same visual structure.',
  testimonialQuote: 'This is a custom testimonial quote that should appear in the testimonial section to test dynamic content population.',
  testimonialAuthor: 'Custom Author Name',
  testimonialRole: 'Custom Role Title',
  testimonialImage: 'https://via.placeholder.com/120x120/bbbbbb/ffffff?text=Author',
  finalImage: 'https://via.placeholder.com/1200x800/cccccc/ffffff?text=Custom+Final+Image',
  finalImage1: 'https://via.placeholder.com/800x600/dddddd/ffffff?text=Custom+Final+1',
  finalImage2: 'https://via.placeholder.com/800x600/eeeeee/ffffff?text=Custom+Final+2'
};

export const ZestyTemplateVisualTest: React.FC = () => {
  const [currentData, setCurrentData] = React.useState<'original' | 'custom'>('original');
  const [showPerformanceMetrics, setShowPerformanceMetrics] = React.useState(false);

  const projectData = currentData === 'original' ? originalZestyData : customTestData;

  // Performance monitoring
  React.useEffect(() => {
    if (showPerformanceMetrics) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
        });
      });
      observer.observe({ entryTypes: ['measure', 'navigation'] });

      return () => observer.disconnect();
    }
  }, [showPerformanceMetrics]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Test Controls */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: '14px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Visual Test Controls</h3>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="dataType"
              checked={currentData === 'original'}
              onChange={() => setCurrentData('original')}
            />
            Original Zesty Data
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="dataType"
              checked={currentData === 'custom'}
              onChange={() => setCurrentData('custom')}
            />
            Custom Test Data
          </label>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={showPerformanceMetrics}
            onChange={(e) => setShowPerformanceMetrics(e.target.checked)}
          />
          Show Performance Metrics
        </label>

        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            Use browser dev tools to compare with original zesty.html
          </p>
        </div>
      </div>

      {/* Performance Metrics Display */}
      {showPerformanceMetrics && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 10000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '300px'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Performance Info</h4>
          <div>
            <div>✅ Lazy loading implemented</div>
            <div>✅ React.memo optimization</div>
            <div>✅ Optimized CSS bundle</div>
            <div>✅ Error boundaries active</div>
            <div>✅ Intersection Observer for videos</div>
          </div>
        </div>
      )}

      {/* Main Template Render */}
      <ZestyTemplateRenderer 
        projectData={projectData}
        isPreview={true}
      />

      {/* Visual Comparison Notes */}
      <div style={{
        background: '#f5f5f5',
        padding: '2rem',
        margin: '2rem 0',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        <h3 style={{ marginTop: 0 }}>Visual Comparison Checklist</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4>Layout & Structure</h4>
            <ul>
              <li>✅ Navigation bar with logo and links</li>
              <li>✅ Hero section with title and image</li>
              <li>✅ About section with challenge/approach</li>
              <li>✅ Project info sidebar</li>
              <li>✅ Image sections with proper spacing</li>
              <li>✅ Video sections with autoplay</li>
              <li>✅ Testimonial section</li>
              <li>✅ Final images section</li>
            </ul>
          </div>
          <div>
            <h4>Performance Features</h4>
            <ul>
              <li>✅ Hero image loads immediately (priority)</li>
              <li>✅ Below-fold images lazy load</li>
              <li>✅ Videos pause when out of view</li>
              <li>✅ Memoized components prevent re-renders</li>
              <li>✅ Optimized CSS bundle (reduced size)</li>
              <li>✅ Error boundaries handle failures</li>
              <li>✅ Intersection Observer for performance</li>
              <li>✅ Fallback content for missing data</li>
            </ul>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#e8f4f8', borderRadius: '4px' }}>
          <strong>Testing Instructions:</strong>
          <ol>
            <li>Compare this rendered component with the original zesty.html file</li>
            <li>Check that all dynamic content areas populate correctly</li>
            <li>Test mobile responsiveness by resizing the window</li>
            <li>Verify lazy loading by scrolling and checking network tab</li>
            <li>Test error handling by modifying image URLs to invalid ones</li>
            <li>Switch between original and custom data to verify dynamic population</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ZestyTemplateVisualTest;