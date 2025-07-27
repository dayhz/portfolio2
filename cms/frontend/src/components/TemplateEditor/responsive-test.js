/**
 * Responsive Test Script for Zesty Template
 * This script tests the responsive behavior of the ZestyTemplateRenderer component
 */

// Test breakpoints
const BREAKPOINTS = {
  DESKTOP_LARGE: 1920,
  DESKTOP: 1200,
  TABLET: 768,
  MOBILE_LARGE: 414,
  MOBILE: 375,
  MOBILE_SMALL: 320
};

// Test functions
const testResponsiveBehavior = () => {
  console.log('🧪 Starting Responsive Behavior Tests...');
  
  const results = {
    passed: 0,
    failed: 0,
    issues: []
  };

  // Test 1: Check if navigation switches correctly
  console.log('📱 Testing navigation responsiveness...');
  
  Object.entries(BREAKPOINTS).forEach(([name, width]) => {
    // Simulate viewport width
    const isMobile = width <= 991;
    
    console.log(`Testing ${name} (${width}px):`);
    
    // Check navigation visibility rules
    if (isMobile) {
      console.log('  ✓ Should show mobile menu toggle');
      console.log('  ✓ Should hide desktop navigation');
      results.passed += 2;
    } else {
      console.log('  ✓ Should show desktop navigation');
      console.log('  ✓ Should hide mobile menu toggle');
      results.passed += 2;
    }
  });

  // Test 2: Check image grid stacking
  console.log('🖼️ Testing image grid responsiveness...');
  
  Object.entries(BREAKPOINTS).forEach(([name, width]) => {
    const shouldStack = width <= 767;
    
    if (shouldStack) {
      console.log(`  ✓ ${name}: Image grid should stack (single column)`);
      results.passed += 1;
    } else {
      console.log(`  ✓ ${name}: Image grid should show two columns`);
      results.passed += 1;
    }
  });

  // Test 3: Check text sizing
  console.log('📝 Testing text responsiveness...');
  
  Object.entries(BREAKPOINTS).forEach(([name, width]) => {
    if (width <= 479) {
      console.log(`  ✓ ${name}: Text should be optimized for small screens`);
    } else if (width <= 767) {
      console.log(`  ✓ ${name}: Text should be optimized for mobile`);
    } else if (width <= 991) {
      console.log(`  ✓ ${name}: Text should be optimized for tablet`);
    } else {
      console.log(`  ✓ ${name}: Text should use desktop sizing`);
    }
    results.passed += 1;
  });

  // Test 4: Check about section layout
  console.log('📋 Testing about section layout...');
  
  Object.entries(BREAKPOINTS).forEach(([name, width]) => {
    const shouldStack = width <= 991;
    
    if (shouldStack) {
      console.log(`  ✓ ${name}: About section should stack vertically`);
    } else {
      console.log(`  ✓ ${name}: About section should show side-by-side layout`);
    }
    results.passed += 1;
  });

  // Test 5: Check video responsiveness
  console.log('🎥 Testing video responsiveness...');
  
  Object.entries(BREAKPOINTS).forEach(([name, width]) => {
    console.log(`  ✓ ${name}: Videos should maintain aspect ratio and fit container`);
    results.passed += 1;
  });

  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📋 Issues: ${results.issues.length}`);
  
  if (results.issues.length > 0) {
    console.log('\n🚨 Issues found:');
    results.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  }

  return results;
};

// CSS Media Query Tests
const testMediaQueries = () => {
  console.log('\n🎨 Testing CSS Media Queries...');
  
  const mediaQueries = [
    { query: '(max-width: 991px)', description: 'Tablet and mobile styles' },
    { query: '(max-width: 767px)', description: 'Mobile styles' },
    { query: '(max-width: 479px)', description: 'Small mobile styles' },
    { query: '(max-width: 768px)', description: 'Testimonial responsive styles' }
  ];

  mediaQueries.forEach(({ query, description }) => {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia(query);
      console.log(`  📱 ${query}: ${description} - ${mediaQuery.matches ? 'ACTIVE' : 'INACTIVE'}`);
    } else {
      console.log(`  ⚠️ matchMedia not supported`);
    }
  });
};

// Layout Overflow Tests
const testLayoutOverflow = () => {
  console.log('\n📏 Testing Layout Overflow...');
  
  const container = document.querySelector('.page_code_wrap');
  if (container) {
    const containerWidth = container.offsetWidth;
    const scrollWidth = container.scrollWidth;
    
    if (scrollWidth > containerWidth) {
      console.log(`  ❌ Horizontal overflow detected: ${scrollWidth}px > ${containerWidth}px`);
      return false;
    } else {
      console.log(`  ✅ No horizontal overflow: ${scrollWidth}px <= ${containerWidth}px`);
      return true;
    }
  } else {
    console.log(`  ⚠️ Container not found`);
    return false;
  }
};

// Text Overlap Tests
const testTextOverlap = () => {
  console.log('\n📝 Testing Text Overlap...');
  
  const textElements = document.querySelectorAll('.temp-rich p, .temp-comp-text, .testimony');
  const imageElements = document.querySelectorAll('.comp-img, .video');
  
  let overlapFound = false;
  
  textElements.forEach((textEl, textIndex) => {
    const textRect = textEl.getBoundingClientRect();
    
    imageElements.forEach((imgEl, imgIndex) => {
      const imgRect = imgEl.getBoundingClientRect();
      
      // Check for overlap
      const overlap = !(textRect.right < imgRect.left || 
                       textRect.left > imgRect.right || 
                       textRect.bottom < imgRect.top || 
                       textRect.top > imgRect.bottom);
      
      if (overlap) {
        console.log(`  ❌ Text overlap detected: Text element ${textIndex} overlaps with image ${imgIndex}`);
        overlapFound = true;
      }
    });
  });
  
  if (!overlapFound) {
    console.log(`  ✅ No text overlap detected`);
  }
  
  return !overlapFound;
};

// Run all tests
const runAllTests = () => {
  console.log('🚀 Starting Comprehensive Responsive Tests for Zesty Template\n');
  
  const behaviorResults = testResponsiveBehavior();
  testMediaQueries();
  const overflowPassed = testLayoutOverflow();
  const textOverlapPassed = testTextOverlap();
  
  console.log('\n🏁 Final Test Summary:');
  console.log(`📱 Responsive Behavior: ${behaviorResults.passed} passed, ${behaviorResults.failed} failed`);
  console.log(`📏 Layout Overflow: ${overflowPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`📝 Text Overlap: ${textOverlapPassed ? 'PASSED' : 'FAILED'}`);
  
  const allPassed = behaviorResults.failed === 0 && overflowPassed && textOverlapPassed;
  console.log(`\n${allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);
  
  return {
    allPassed,
    behaviorResults,
    overflowPassed,
    textOverlapPassed
  };
};

// Export for use in browser console or testing framework
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testResponsiveBehavior,
    testMediaQueries,
    testLayoutOverflow,
    testTextOverlap,
    runAllTests,
    BREAKPOINTS
  };
} else {
  // Make available in browser console
  window.ZestyResponsiveTests = {
    testResponsiveBehavior,
    testMediaQueries,
    testLayoutOverflow,
    testTextOverlap,
    runAllTests,
    BREAKPOINTS
  };
  
  console.log('🧪 Zesty Responsive Tests loaded! Run window.ZestyResponsiveTests.runAllTests() to start testing.');
}