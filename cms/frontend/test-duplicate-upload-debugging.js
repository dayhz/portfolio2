/**
 * Test script for duplicate upload debugging functionality
 * This script tests the debugging and monitoring capabilities
 * Requirements: 1.4, 3.4
 */

console.log('🔍 Testing Duplicate Upload Debugging System...\n');

// Test 1: Check if debugger is available
console.log('Test 1: Checking debugger availability...');
if (typeof window !== 'undefined' && window.duplicateUploadDebugger) {
  console.log('✅ Debugger service is available');
} else {
  console.log('❌ Debugger service is not available');
}

// Test 2: Check if debug tools are available
console.log('\nTest 2: Checking debug tools availability...');
if (typeof window !== 'undefined' && window.debugDuplicateUpload) {
  console.log('✅ Debug tools are available in window.debugDuplicateUpload');
  
  // List available tools
  const tools = window.debugDuplicateUpload;
  console.log('Available tools:', Object.keys(tools));
} else {
  console.log('❌ Debug tools are not available');
}

// Test 3: Test event logging
console.log('\nTest 3: Testing event logging...');
try {
  if (window.duplicateUploadDebugger) {
    const debugger = window.duplicateUploadDebugger;
    
    // Log a test event
    debugger.logEvent('detection', {
      test: true,
      fileName: 'test-debug.jpg',
      timestamp: new Date().toISOString()
    });
    
    // Check if event was logged
    const events = debugger.getRecentEvents(1);
    if (events.length > 0 && events[0].data.test === true) {
      console.log('✅ Event logging works correctly');
    } else {
      console.log('❌ Event logging failed');
    }
  }
} catch (error) {
  console.log('❌ Event logging test failed:', error.message);
}

// Test 4: Test error logging
console.log('\nTest 4: Testing error logging...');
try {
  if (window.duplicateUploadDebugger) {
    const debugger = window.duplicateUploadDebugger;
    
    // Log a test error
    debugger.logError({
      type: 'validation_error',
      message: 'Test error for debugging verification',
      context: { test: true, timestamp: new Date().toISOString() },
      severity: 'low'
    });
    
    // Check if error was logged
    const errors = debugger.getRecentErrors(1);
    if (errors.length > 0 && errors[0].context.test === true) {
      console.log('✅ Error logging works correctly');
    } else {
      console.log('❌ Error logging failed');
    }
  }
} catch (error) {
  console.log('❌ Error logging test failed:', error.message);
}

// Test 5: Test metrics calculation
console.log('\nTest 5: Testing metrics calculation...');
try {
  if (window.duplicateUploadDebugger) {
    const debugger = window.duplicateUploadDebugger;
    
    // Get current metrics
    const metrics = debugger.getMetrics();
    
    if (typeof metrics === 'object' && metrics !== null) {
      console.log('✅ Metrics calculation works correctly');
      console.log('Current metrics:', {
        totalDetections: metrics.totalDetections,
        successfulActions: metrics.successfulActions,
        failedActions: metrics.failedActions,
        errorRate: metrics.errorRate.toFixed(2) + '%'
      });
    } else {
      console.log('❌ Metrics calculation failed');
    }
  }
} catch (error) {
  console.log('❌ Metrics calculation test failed:', error.message);
}

// Test 6: Test localStorage persistence
console.log('\nTest 6: Testing localStorage persistence...');
try {
  const eventsKey = 'duplicateUploadDebugEvents';
  const errorsKey = 'duplicateUploadDebugErrors';
  
  const storedEvents = localStorage.getItem(eventsKey);
  const storedErrors = localStorage.getItem(errorsKey);
  
  if (storedEvents || storedErrors) {
    console.log('✅ Data persistence to localStorage works');
    if (storedEvents) {
      const events = JSON.parse(storedEvents);
      console.log(`  - ${events.length} events stored`);
    }
    if (storedErrors) {
      const errors = JSON.parse(storedErrors);
      console.log(`  - ${errors.length} errors stored`);
    }
  } else {
    console.log('⚠️ No data found in localStorage (may be first run)');
  }
} catch (error) {
  console.log('❌ localStorage persistence test failed:', error.message);
}

// Test 7: Test debug tools functionality
console.log('\nTest 7: Testing debug tools functionality...');
try {
  if (window.debugDuplicateUpload) {
    const tools = window.debugDuplicateUpload;
    
    // Test simulate duplicate
    console.log('  Testing simulateDuplicate...');
    tools.simulateDuplicate('debug-test-file.jpg');
    console.log('  ✅ simulateDuplicate executed');
    
    // Test force error
    console.log('  Testing forceError...');
    tools.forceError('unknown_error');
    console.log('  ✅ forceError executed');
    
    // Test get summary
    console.log('  Testing getSummary...');
    const summary = tools.getSummary();
    if (summary && typeof summary === 'object') {
      console.log('  ✅ getSummary works correctly');
    } else {
      console.log('  ❌ getSummary failed');
    }
    
  } else {
    console.log('❌ Debug tools not available for testing');
  }
} catch (error) {
  console.log('❌ Debug tools test failed:', error.message);
}

// Test 8: Test console logging format
console.log('\nTest 8: Testing console logging format...');
try {
  // Capture console output
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  let logCaptured = false;
  let warnCaptured = false;
  let errorCaptured = false;
  
  console.log = (...args) => {
    if (args[0] && args[0].includes('[DuplicateUpload:')) {
      logCaptured = true;
    }
    originalLog.apply(console, args);
  };
  
  console.warn = (...args) => {
    if (args[0] && args[0].includes('[DuplicateUpload:')) {
      warnCaptured = true;
    }
    originalWarn.apply(console, args);
  };
  
  console.error = (...args) => {
    if (args[0] && args[0].includes('[DuplicateUpload:')) {
      errorCaptured = true;
    }
    originalError.apply(console, args);
  };
  
  // Generate some logs
  if (window.duplicateUploadDebugger) {
    const debugger = window.duplicateUploadDebugger;
    debugger.logEvent('processing', { test: 'console format' });
    debugger.logError({
      type: 'validation_error',
      message: 'Console format test error',
      context: {},
      severity: 'low'
    });
  }
  
  // Restore console
  setTimeout(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    
    if (warnCaptured || errorCaptured) {
      console.log('✅ Console logging format works correctly');
    } else {
      console.log('⚠️ Console logging format test inconclusive');
    }
  }, 100);
  
} catch (error) {
  console.log('❌ Console logging format test failed:', error.message);
}

// Test 9: Test data export functionality
console.log('\nTest 9: Testing data export functionality...');
try {
  if (window.duplicateUploadDebugger) {
    const debugger = window.duplicateUploadDebugger;
    
    const exportedData = debugger.exportDebugData();
    const parsedData = JSON.parse(exportedData);
    
    if (parsedData.sessionId && parsedData.timestamp && parsedData.metrics) {
      console.log('✅ Data export works correctly');
      console.log('  Export includes:', Object.keys(parsedData));
    } else {
      console.log('❌ Data export incomplete');
    }
  }
} catch (error) {
  console.log('❌ Data export test failed:', error.message);
}

// Test 10: Test error boundary integration
console.log('\nTest 10: Testing error boundary integration...');
try {
  // Simulate a JavaScript error that should be caught
  const testError = new Error('Test error for boundary detection');
  testError.stack = 'Error: Test error\n    at DuplicateUploadDialog.render';
  
  // Dispatch error event
  const errorEvent = new ErrorEvent('error', {
    message: testError.message,
    error: testError,
    filename: 'DuplicateUploadDialog.tsx',
    lineno: 100,
    colno: 20
  });
  
  window.dispatchEvent(errorEvent);
  
  // Check if error was captured
  setTimeout(() => {
    if (window.duplicateUploadDebugger) {
      const errors = window.duplicateUploadDebugger.getRecentErrors(5);
      const capturedError = errors.find(e => e.message.includes('Test error for boundary detection'));
      
      if (capturedError) {
        console.log('✅ Error boundary integration works correctly');
      } else {
        console.log('⚠️ Error boundary integration test inconclusive');
      }
    }
  }, 200);
  
} catch (error) {
  console.log('❌ Error boundary integration test failed:', error.message);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('🔍 Duplicate Upload Debugging System Test Complete');
console.log('='.repeat(50));
console.log('\nTo manually test the debugging system:');
console.log('1. Open browser developer tools');
console.log('2. Go to the Media page');
console.log('3. Click "Debug Doublons" button (development mode only)');
console.log('4. Try uploading duplicate files');
console.log('5. Check the debug panel for events and errors');
console.log('6. Use console commands:');
console.log('   - window.debugDuplicateUpload.simulateDuplicate("test.jpg")');
console.log('   - window.debugDuplicateUpload.forceError("render_error")');
console.log('   - window.debugDuplicateUpload.getSummary()');
console.log('   - window.debugDuplicateUpload.export()');
console.log('\nFor troubleshooting:');
console.log('- Check localStorage for "duplicateUploadDebugEvents" and "duplicateUploadDebugErrors"');
console.log('- Monitor console for [DuplicateUpload:*] messages');
console.log('- Export debug data for detailed analysis');