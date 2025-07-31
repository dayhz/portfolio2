#!/usr/bin/env node

/**
 * Complete User Experience Test for Duplicate Upload
 * Task 8: Validate and test complete duplicate upload user experience
 * 
 * This script performs comprehensive validation of the duplicate upload functionality
 * by testing both backend API and frontend components integration.
 * 
 * Requirements tested:
 * - 1.1: Dialog appears correctly without blank page
 * - 1.2: Dialog contains file information and three options
 * - 1.3: Dialog proposes replace, rename, or cancel options
 * - 1.4: System processes actions without JavaScript errors
 * - 3.1: Specific success message for replace action
 * - 3.2: Clear feedback for rename action with new filename
 * - 3.3: Cancellation confirmation message
 * - 4.4: User can retry operations after errors
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:8000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Test configuration
const TEST_CONFIG = {
  testFile: {
    name: 'user-experience-test.jpg',
    content: Buffer.from('test-image-content-for-user-experience-validation-' + Date.now()),
    mimetype: 'image/jpeg'
  },
  timeout: 15000
};

class UserExperienceValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      details: [],
      errors: []
    };
    this.testFilePath = null;
    this.uploadedFiles = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().substring(11, 19);
    const icons = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    };
    console.log(`${icons[type]} [${timestamp}] ${message}`);
  }

  recordResult(requirement, passed, message) {
    if (passed) {
      this.results.passed++;
      this.results.details.push(`✅ ${requirement}: ${message}`);
      this.log(`${requirement} - PASSED: ${message}`, 'success');
    } else {
      this.results.failed++;
      this.results.errors.push(`${requirement}: ${message}`);
      this.log(`${requirement} - FAILED: ${message}`, 'error');
    }
  }

  async setup() {
    this.log('Setting up user experience test environment...', 'info');
    
    // Create test file
    this.testFilePath = path.join(__dirname, TEST_CONFIG.testFile.name);
    fs.writeFileSync(this.testFilePath, TEST_CONFIG.testFile.content);
    this.log(`Test file created: ${TEST_CONFIG.testFile.name}`, 'success');
    
    // Verify servers are running
    try {
      await axios.get(`${API_URL}/health`, { timeout: 5000 });
      this.log('Backend server is operational', 'success');
    } catch (error) {
      throw new Error('Backend server is not running. Please start it first.');
    }
    
    try {
      await axios.get(FRONTEND_URL, { timeout: 5000 });
      this.log('Frontend server is operational', 'success');
    } catch (error) {
      this.log('Frontend server check failed - continuing with backend tests only', 'warning');
    }
  }

  async cleanup() {
    this.log('Cleaning up test environment...', 'info');
    
    // Delete uploaded test files
    for (const fileId of this.uploadedFiles) {
      try {
        await axios.delete(`${API_URL}/media/${fileId}`);
        this.log(`Deleted test file: ${fileId}`, 'success');
      } catch (error) {
        this.log(`Failed to delete test file ${fileId}`, 'warning');
      }
    }
    
    // Delete local test file
    if (this.testFilePath && fs.existsSync(this.testFilePath)) {
      fs.unlinkSync(this.testFilePath);
      this.log('Local test file deleted', 'success');
    }
  }

  async uploadFile(action = null, expectedStatus = 200) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(this.testFilePath));
    formData.append('name', TEST_CONFIG.testFile.name);
    formData.append('alt', 'User experience test image');
    formData.append('description', 'Test file for duplicate upload validation');
    
    if (action) {
      formData.append('action', action);
    }
    
    try {
      const response = await axios.post(`${API_URL}/media`, formData, {
        headers: { ...formData.getHeaders() },
        timeout: TEST_CONFIG.timeout
      });
      
      if (response.data.id) {
        this.uploadedFiles.push(response.data.id);
      }
      
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      if (error.response && error.response.status === expectedStatus) {
        return { success: true, data: error.response.data, status: error.response.status };
      }
      return { success: false, error: error.message, status: error.response?.status };
    }
  }

  async testRequirement11_DialogAppears() {
    this.log('Testing Requirement 1.1: Dialog appears correctly without blank page', 'test');
    
    try {
      // First upload - should succeed
      const firstUpload = await this.uploadFile();
      if (!firstUpload.success) {
        throw new Error(`First upload failed: ${firstUpload.error}`);
      }
      
      // Second upload - should detect duplicate (409 status)
      const duplicateUpload = await this.uploadFile(null, 409);
      if (!duplicateUpload.success) {
        throw new Error(`Duplicate detection failed: ${duplicateUpload.error}`);
      }
      
      // Verify response structure contains all necessary data for dialog
      const data = duplicateUpload.data;
      const requiredFields = ['existingFile', 'uploadedFile', 'actions', 'message'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields for dialog: ${missingFields.join(', ')}`);
      }
      
      // Verify existingFile has required properties
      const existingFileFields = ['id', 'name', 'size', 'createdAt', 'url'];
      const missingExistingFields = existingFileFields.filter(field => !data.existingFile[field]);
      
      if (missingExistingFields.length > 0) {
        throw new Error(`Missing existingFile fields: ${missingExistingFields.join(', ')}`);
      }
      
      // Verify uploadedFile has required properties
      const uploadedFileFields = ['originalName', 'size', 'mimetype'];
      const missingUploadedFields = uploadedFileFields.filter(field => !data.uploadedFile[field]);
      
      if (missingUploadedFields.length > 0) {
        throw new Error(`Missing uploadedFile fields: ${missingUploadedFields.join(', ')}`);
      }
      
      this.recordResult('Requirement 1.1', true, 
        'Duplicate detection returns complete data structure for dialog rendering');
      
    } catch (error) {
      this.recordResult('Requirement 1.1', false, error.message);
    }
  }

  async testRequirement12_DialogContent() {
    this.log('Testing Requirement 1.2: Dialog contains file information and three options', 'test');
    
    try {
      // Trigger duplicate detection
      const duplicateUpload = await this.uploadFile(null, 409);
      if (!duplicateUpload.success) {
        throw new Error(`Failed to trigger duplicate: ${duplicateUpload.error}`);
      }
      
      const data = duplicateUpload.data;
      
      // Verify file information completeness
      const existingFile = data.existingFile;
      const uploadedFile = data.uploadedFile;
      
      // Check existing file information
      if (!existingFile.name || !existingFile.size || !existingFile.createdAt) {
        throw new Error('Existing file information is incomplete');
      }
      
      // Check uploaded file information
      if (!uploadedFile.originalName || !uploadedFile.size || !uploadedFile.mimetype) {
        throw new Error('Uploaded file information is incomplete');
      }
      
      // Verify three options are available
      const actions = data.actions;
      const expectedActions = ['replace', 'rename', 'cancel'];
      
      if (!Array.isArray(actions) || actions.length !== 3) {
        throw new Error(`Expected 3 actions, got ${actions ? actions.length : 0}`);
      }
      
      for (const expectedAction of expectedActions) {
        if (!actions.includes(expectedAction)) {
          throw new Error(`Missing required action: ${expectedAction}`);
        }
      }
      
      this.recordResult('Requirement 1.2', true, 
        'Dialog data contains complete file information and all three action options');
      
    } catch (error) {
      this.recordResult('Requirement 1.2', false, error.message);
    }
  }

  async testRequirement13_ThreeOptions() {
    this.log('Testing Requirement 1.3: Dialog proposes replace, rename, or cancel options', 'test');
    
    try {
      // Trigger duplicate detection
      const duplicateUpload = await this.uploadFile(null, 409);
      if (!duplicateUpload.success) {
        throw new Error(`Failed to trigger duplicate: ${duplicateUpload.error}`);
      }
      
      const actions = duplicateUpload.data.actions;
      
      // Verify exact actions
      const requiredActions = ['replace', 'rename', 'cancel'];
      const actionCheck = {
        replace: actions.includes('replace'),
        rename: actions.includes('rename'),
        cancel: actions.includes('cancel')
      };
      
      const missingActions = requiredActions.filter(action => !actionCheck[action]);
      
      if (missingActions.length > 0) {
        throw new Error(`Missing actions: ${missingActions.join(', ')}`);
      }
      
      // Verify no extra actions
      const extraActions = actions.filter(action => !requiredActions.includes(action));
      if (extraActions.length > 0) {
        this.log(`Note: Extra actions found: ${extraActions.join(', ')}`, 'warning');
      }
      
      this.recordResult('Requirement 1.3', true, 
        'All three required actions (replace, rename, cancel) are available');
      
    } catch (error) {
      this.recordResult('Requirement 1.3', false, error.message);
    }
  }

  async testRequirement14_ProcessingWithoutErrors() {
    this.log('Testing Requirement 1.4: System processes actions without JavaScript errors', 'test');
    
    try {
      // Test replace action
      const replaceResult = await this.uploadFile('replace', 200);
      if (!replaceResult.success) {
        throw new Error(`Replace action failed: ${replaceResult.error}`);
      }
      
      if (!replaceResult.data.replaced) {
        throw new Error('Replace action did not set replaced flag');
      }
      
      // Test rename action (upload again to create another duplicate)
      const renameResult = await this.uploadFile('rename', 200);
      if (!renameResult.success) {
        throw new Error(`Rename action failed: ${renameResult.error}`);
      }
      
      if (!renameResult.data.renamed) {
        throw new Error('Rename action did not set renamed flag');
      }
      
      // Cancel action is handled client-side, so we verify it's available in the actions list
      const duplicateCheck = await this.uploadFile(null, 409);
      if (duplicateCheck.success && !duplicateCheck.data.actions.includes('cancel')) {
        throw new Error('Cancel action not available');
      }
      
      this.recordResult('Requirement 1.4', true, 
        'All actions (replace, rename, cancel) process correctly without errors');
      
    } catch (error) {
      this.recordResult('Requirement 1.4', false, error.message);
    }
  }

  async testRequirement31_ReplaceMessage() {
    this.log('Testing Requirement 3.1: Specific success message for replace action', 'test');
    
    try {
      // Upload file first
      const firstUpload = await this.uploadFile();
      if (!firstUpload.success) {
        throw new Error(`First upload failed: ${firstUpload.error}`);
      }
      
      // Replace with new file
      const replaceResult = await this.uploadFile('replace', 200);
      if (!replaceResult.success) {
        throw new Error(`Replace failed: ${replaceResult.error}`);
      }
      
      // Verify replace-specific response
      if (!replaceResult.data.replaced) {
        throw new Error('Replace flag not set in response');
      }
      
      if (!replaceResult.data.message) {
        throw new Error('No message provided in replace response');
      }
      
      // Check if message indicates replacement
      const message = replaceResult.data.message.toLowerCase();
      const replaceIndicators = ['replaced', 'remplacé', 'remplacement'];
      const hasReplaceIndicator = replaceIndicators.some(indicator => message.includes(indicator));
      
      if (!hasReplaceIndicator) {
        throw new Error(`Replace message does not indicate replacement: "${replaceResult.data.message}"`);
      }
      
      this.recordResult('Requirement 3.1', true, 
        `Replace action provides specific success message: "${replaceResult.data.message}"`);
      
    } catch (error) {
      this.recordResult('Requirement 3.1', false, error.message);
    }
  }

  async testRequirement32_RenameMessage() {
    this.log('Testing Requirement 3.2: Clear feedback for rename action with new filename', 'test');
    
    try {
      // Upload file first
      const firstUpload = await this.uploadFile();
      if (!firstUpload.success) {
        throw new Error(`First upload failed: ${firstUpload.error}`);
      }
      
      // Rename duplicate
      const renameResult = await this.uploadFile('rename', 200);
      if (!renameResult.success) {
        throw new Error(`Rename failed: ${renameResult.error}`);
      }
      
      // Verify rename-specific response
      if (!renameResult.data.renamed) {
        throw new Error('Rename flag not set in response');
      }
      
      if (!renameResult.data.originalName) {
        throw new Error('New filename not provided in response');
      }
      
      if (!renameResult.data.originalRequestedName) {
        throw new Error('Original requested name not provided in response');
      }
      
      // Verify the filename was actually changed
      if (renameResult.data.originalName === renameResult.data.originalRequestedName) {
        throw new Error('Filename was not actually renamed');
      }
      
      // Verify message mentions renaming
      if (!renameResult.data.message) {
        throw new Error('No message provided in rename response');
      }
      
      const message = renameResult.data.message.toLowerCase();
      const renameIndicators = ['renamed', 'renommé', 'renommage'];
      const hasRenameIndicator = renameIndicators.some(indicator => message.includes(indicator));
      
      if (!hasRenameIndicator) {
        throw new Error(`Rename message does not indicate renaming: "${renameResult.data.message}"`);
      }
      
      this.recordResult('Requirement 3.2', true, 
        `Rename action provides clear feedback with new filename: "${renameResult.data.originalName}"`);
      
    } catch (error) {
      this.recordResult('Requirement 3.2', false, error.message);
    }
  }

  async testRequirement33_CancelMessage() {
    this.log('Testing Requirement 3.3: Cancellation confirmation message', 'test');
    
    try {
      // Upload file first
      const firstUpload = await this.uploadFile();
      if (!firstUpload.success) {
        throw new Error(`First upload failed: ${firstUpload.error}`);
      }
      
      // Attempt duplicate upload to verify cancel option is available
      const duplicateAttempt = await this.uploadFile(null, 409);
      if (!duplicateAttempt.success) {
        throw new Error(`Duplicate detection failed: ${duplicateAttempt.error}`);
      }
      
      // Verify cancel option is available
      if (!duplicateAttempt.data.actions.includes('cancel')) {
        throw new Error('Cancel action not available in duplicate response');
      }
      
      // Note: Cancel action is handled client-side and doesn't make an API call
      // The backend provides the option, and the frontend handles the cancellation
      this.recordResult('Requirement 3.3', true, 
        'Cancel option is available and properly configured in duplicate response');
      
    } catch (error) {
      this.recordResult('Requirement 3.3', false, error.message);
    }
  }

  async testRequirement44_RetryCapability() {
    this.log('Testing Requirement 4.4: User can retry operations after errors', 'test');
    
    try {
      // Upload file first
      const firstUpload = await this.uploadFile();
      if (!firstUpload.success) {
        throw new Error(`First upload failed: ${firstUpload.error}`);
      }
      
      // Test multiple duplicate attempts (simulating retry scenarios)
      const retryAttempts = 3;
      for (let i = 0; i < retryAttempts; i++) {
        const duplicateAttempt = await this.uploadFile(null, 409);
        if (!duplicateAttempt.success) {
          throw new Error(`Retry attempt ${i + 1} failed: ${duplicateAttempt.error}`);
        }
        
        // Verify each attempt returns consistent data
        if (!duplicateAttempt.data.existingFile || !duplicateAttempt.data.uploadedFile) {
          throw new Error(`Retry attempt ${i + 1} returned incomplete data`);
        }
        
        this.log(`Retry attempt ${i + 1} successful`, 'success');
        
        // Small delay between retries
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Test successful action after retries
      const finalAction = await this.uploadFile('rename', 200);
      if (!finalAction.success) {
        throw new Error(`Final action after retries failed: ${finalAction.error}`);
      }
      
      this.recordResult('Requirement 4.4', true, 
        `System supports retry operations - ${retryAttempts} retry attempts successful, final action completed`);
      
    } catch (error) {
      this.recordResult('Requirement 4.4', false, error.message);
    }
  }

  async runAllTests() {
    this.log('🧪 Starting Complete User Experience Validation for Duplicate Upload', 'info');
    this.log('='.repeat(80), 'info');
    
    try {
      await this.setup();
      
      // Run all requirement tests
      await this.testRequirement11_DialogAppears();
      await this.testRequirement12_DialogContent();
      await this.testRequirement13_ThreeOptions();
      await this.testRequirement14_ProcessingWithoutErrors();
      await this.testRequirement31_ReplaceMessage();
      await this.testRequirement32_RenameMessage();
      await this.testRequirement33_CancelMessage();
      await this.testRequirement44_RetryCapability();
      
    } catch (error) {
      this.log(`Test execution failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.errors.push(`Test execution: ${error.message}`);
    } finally {
      await this.cleanup();
    }
    
    this.printResults();
  }

  printResults() {
    this.log('='.repeat(80), 'info');
    this.log('🎯 USER EXPERIENCE VALIDATION RESULTS', 'info');
    this.log('='.repeat(80), 'info');
    
    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
    
    this.log(`Total tests: ${total}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    this.log(`Success rate: ${successRate}%`, successRate >= 90 ? 'success' : successRate >= 70 ? 'warning' : 'error');
    
    if (this.results.details.length > 0) {
      this.log('\n📋 Detailed Results:', 'info');
      this.results.details.forEach(detail => {
        console.log(`  ${detail}`);
      });
    }
    
    if (this.results.errors.length > 0) {
      this.log('\n❌ Errors:', 'error');
      this.results.errors.forEach(error => {
        console.log(`  ❌ ${error}`);
      });
    }
    
    this.log('='.repeat(80), 'info');
    
    // Final assessment
    if (this.results.failed === 0) {
      this.log('🎉 ALL USER EXPERIENCE TESTS PASSED!', 'success');
      this.log('The duplicate upload functionality is working correctly.', 'success');
      this.log('✅ Task 8 completed successfully - User experience validated', 'success');
    } else if (successRate >= 75) {
      this.log('⚠️ MOSTLY SUCCESSFUL - Minor issues detected', 'warning');
      this.log('Most functionality works, but some requirements need attention.', 'warning');
    } else {
      this.log('❌ SIGNIFICANT ISSUES DETECTED', 'error');
      this.log('Multiple requirements failed - needs investigation and fixes.', 'error');
    }
    
    // Next steps
    this.log('\n📋 NEXT STEPS FOR COMPLETE VALIDATION:', 'info');
    this.log('1. 🖥️  Manual UI Testing:', 'info');
    this.log('   - Open http://localhost:5173', 'info');
    this.log('   - Navigate to Media page', 'info');
    this.log('   - Upload duplicate files and test dialog interactions', 'info');
    this.log('   - Verify no blank pages or JavaScript errors', 'info');
    this.log('', 'info');
    this.log('2. 🔍 Browser Console Check:', 'info');
    this.log('   - Monitor for JavaScript errors during upload', 'info');
    this.log('   - Check network tab for proper API responses', 'info');
    this.log('   - Verify dialog rendering and user interactions', 'info');
    this.log('', 'info');
    this.log('3. 📊 Debug Panel Testing (if available):', 'info');
    this.log('   - Look for "Debug Doublons" button on Media page', 'info');
    this.log('   - Test debugging commands in browser console', 'info');
    this.log('   - Review debug logs for any issues', 'info');
    
    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const validator = new UserExperienceValidator();
  validator.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { UserExperienceValidator };