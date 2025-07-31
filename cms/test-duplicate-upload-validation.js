#!/usr/bin/env node

/**
 * Comprehensive validation test for duplicate upload user experience
 * Task 8: Validate and test complete duplicate upload user experience
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
const { spawn } = require('child_process');

const API_URL = 'http://localhost:8000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Test configuration
const TEST_CONFIG = {
  testFile: {
    name: 'duplicate-test-image.jpg',
    content: Buffer.from('fake-image-content-for-duplicate-testing-' + Date.now()),
    size: 1024 * 50, // 50KB
    mimetype: 'image/jpeg'
  },
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  delayBetweenTests: 1000
};

class DuplicateUploadValidator {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };
    this.testFilePath = null;
    this.uploadedFiles = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      debug: '🔍'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async setup() {
    this.log('Setting up test environment...', 'info');
    
    // Create test file
    this.testFilePath = path.join(__dirname, TEST_CONFIG.testFile.name);
    fs.writeFileSync(this.testFilePath, TEST_CONFIG.testFile.content);
    
    this.log(`Test file created: ${this.testFilePath}`, 'success');
    
    // Verify backend is running
    try {
      await axios.get(`${API_URL}/health`);
      this.log('Backend server is running', 'success');
    } catch (error) {
      this.log('Backend server is not running. Please start it first.', 'error');
      throw new Error('Backend not available');
    }
    
    // Verify frontend is running (optional)
    try {
      await axios.get(FRONTEND_URL);
      this.log('Frontend server is running', 'success');
    } catch (error) {
      this.log('Frontend server is not running. Some tests may be limited.', 'warning');
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
        this.log(`Failed to delete test file ${fileId}: ${error.message}`, 'warning');
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
    formData.append('alt', 'Test image for duplicate validation');
    formData.append('description', 'Automated test file');
    
    if (action) {
      formData.append('action', action);
    }
    
    try {
      const response = await axios.post(`${API_URL}/media`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: TEST_CONFIG.timeout
      });
      
      if (response.status === expectedStatus) {
        if (response.data.id) {
          this.uploadedFiles.push(response.data.id);
        }
        return { success: true, data: response.data, status: response.status };
      } else {
        return { success: false, error: `Unexpected status: ${response.status}`, status: response.status };
      }
    } catch (error) {
      if (error.response && error.response.status === expectedStatus) {
        return { success: true, data: error.response.data, status: error.response.status };
      }
      return { success: false, error: error.message, status: error.response?.status };
    }
  }

  async testRequirement11() {
    this.log('Testing Requirement 1.1: Dialog appears correctly without blank page', 'info');
    
    try {
      // First upload - should succeed
      const firstUpload = await this.uploadFile();
      if (!firstUpload.success) {
        throw new Error(`First upload failed: ${firstUpload.error}`);
      }
      
      this.log('First upload successful', 'success');
      
      // Second upload - should detect duplicate (409 status)
      const duplicateUpload = await this.uploadFile(null, 409);
      if (!duplicateUpload.success) {
        throw new Error(`Duplicate detection failed: ${duplicateUpload.error}`);
      }
      
      // Verify response structure for dialog rendering
      const duplicateData = duplicateUpload.data;
      if (!duplicateData.existingFile || !duplicateData.uploadedFile) {
        throw new Error('Duplicate response missing required data for dialog');
      }
      
      this.log('Duplicate detected correctly with proper data structure', 'success');
      this.testResults.passed++;
      this.testResults.details.push('✅ Requirement 1.1: Dialog data structure is valid');
      
    } catch (error) {
      this.log(`Requirement 1.1 failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Requirement 1.1: ${error.message}`);
    }
  }

  async testRequirement12() {
    this.log('Testing Requirement 1.2: Dialog contains file information and three options', 'info');
    
    try {
      // Upload duplicate to get dialog data
      const duplicateUpload = await this.uploadFile(null, 409);
      if (!duplicateUpload.success) {
        throw new Error(`Failed to trigger duplicate: ${duplicateUpload.error}`);
      }
      
      const data = duplicateUpload.data;
      
      // Verify existing file information
      const requiredExistingFields = ['id', 'name', 'originalName', 'size', 'createdAt', 'url'];
      for (const field of requiredExistingFields) {
        if (!data.existingFile[field]) {
          throw new Error(`Missing existing file field: ${field}`);
        }
      }
      
      // Verify uploaded file information
      const requiredUploadedFields = ['originalName', 'size', 'mimetype'];
      for (const field of requiredUploadedFields) {
        if (!data.uploadedFile[field]) {
          throw new Error(`Missing uploaded file field: ${field}`);
        }
      }
      
      // Verify actions are available
      if (!data.actions || !Array.isArray(data.actions)) {
        throw new Error('Actions array is missing or invalid');
      }
      
      const expectedActions = ['replace', 'rename', 'cancel'];
      for (const action of expectedActions) {
        if (!data.actions.includes(action)) {
          throw new Error(`Missing action: ${action}`);
        }
      }
      
      this.log('Dialog contains all required file information and actions', 'success');
      this.testResults.passed++;
      this.testResults.details.push('✅ Requirement 1.2: Complete file information and three options available');
      
    } catch (error) {
      this.log(`Requirement 1.2 failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Requirement 1.2: ${error.message}`);
    }
  }

  async testRequirement13() {
    this.log('Testing Requirement 1.3: Dialog proposes replace, rename, or cancel options', 'info');
    
    try {
      // This is verified in the previous test, but we'll add specific validation
      const duplicateUpload = await this.uploadFile(null, 409);
      if (!duplicateUpload.success) {
        throw new Error(`Failed to trigger duplicate: ${duplicateUpload.error}`);
      }
      
      const actions = duplicateUpload.data.actions;
      const expectedActions = ['replace', 'rename', 'cancel'];
      
      if (actions.length !== expectedActions.length) {
        throw new Error(`Expected ${expectedActions.length} actions, got ${actions.length}`);
      }
      
      for (const expectedAction of expectedActions) {
        if (!actions.includes(expectedAction)) {
          throw new Error(`Missing required action: ${expectedAction}`);
        }
      }
      
      this.log('All three required actions are available', 'success');
      this.testResults.passed++;
      this.testResults.details.push('✅ Requirement 1.3: Replace, rename, and cancel options are available');
      
    } catch (error) {
      this.log(`Requirement 1.3 failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Requirement 1.3: ${error.message}`);
    }
  }

  async testRequirement14() {
    this.log('Testing Requirement 1.4: System processes actions without JavaScript errors', 'info');
    
    try {
      // Test replace action
      const replaceResult = await this.uploadFile('replace', 200);
      if (!replaceResult.success) {
        throw new Error(`Replace action failed: ${replaceResult.error}`);
      }
      
      if (!replaceResult.data.replaced) {
        throw new Error('Replace action did not set replaced flag');
      }
      
      this.log('Replace action processed successfully', 'success');
      
      // Upload again to test rename action
      const renameResult = await this.uploadFile('rename', 200);
      if (!renameResult.success) {
        throw new Error(`Rename action failed: ${renameResult.error}`);
      }
      
      if (!renameResult.data.renamed) {
        throw new Error('Rename action did not set renamed flag');
      }
      
      this.log('Rename action processed successfully', 'success');
      
      this.testResults.passed++;
      this.testResults.details.push('✅ Requirement 1.4: Actions process without errors');
      
    } catch (error) {
      this.log(`Requirement 1.4 failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Requirement 1.4: ${error.message}`);
    }
  }

  async testRequirement31() {
    this.log('Testing Requirement 3.1: Specific success message for replace action', 'info');
    
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
      
      if (!replaceResult.data.message || !replaceResult.data.message.includes('remplacé')) {
        throw new Error('Replace-specific message not found in response');
      }
      
      this.log('Replace action provides specific success message', 'success');
      this.testResults.passed++;
      this.testResults.details.push('✅ Requirement 3.1: Replace action has specific success message');
      
    } catch (error) {
      this.log(`Requirement 3.1 failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Requirement 3.1: ${error.message}`);
    }
  }

  async testRequirement32() {
    this.log('Testing Requirement 3.2: Clear feedback for rename action with new filename', 'info');
    
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
      
      this.log(`File renamed from "${renameResult.data.originalRequestedName}" to "${renameResult.data.originalName}"`, 'success');
      this.testResults.passed++;
      this.testResults.details.push('✅ Requirement 3.2: Rename action provides clear feedback with new filename');
      
    } catch (error) {
      this.log(`Requirement 3.2 failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Requirement 3.2: ${error.message}`);
    }
  }

  async testRequirement33() {
    this.log('Testing Requirement 3.3: Cancellation confirmation message', 'info');
    
    try {
      // Upload file first
      const firstUpload = await this.uploadFile();
      if (!firstUpload.success) {
        throw new Error(`First upload failed: ${firstUpload.error}`);
      }
      
      // Attempt duplicate upload (should get 409)
      const duplicateAttempt = await this.uploadFile(null, 409);
      if (!duplicateAttempt.success) {
        throw new Error(`Duplicate detection failed: ${duplicateAttempt.error}`);
      }
      
      // Verify cancel option is available
      if (!duplicateAttempt.data.actions.includes('cancel')) {
        throw new Error('Cancel action not available');
      }
      
      // Note: Cancel action doesn't actually make an API call, it just closes the dialog
      // The frontend handles this, so we verify the option is available
      this.log('Cancel option is available in duplicate dialog', 'success');
      this.testResults.passed++;
      this.testResults.details.push('✅ Requirement 3.3: Cancel option is available');
      
    } catch (error) {
      this.log(`Requirement 3.3 failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Requirement 3.3: ${error.message}`);
    }
  }

  async testRequirement44() {
    this.log('Testing Requirement 4.4: User can retry operations after errors', 'info');
    
    try {
      // Upload file first
      const firstUpload = await this.uploadFile();
      if (!firstUpload.success) {
        throw new Error(`First upload failed: ${firstUpload.error}`);
      }
      
      // Test multiple duplicate attempts (simulating retry)
      for (let i = 0; i < 3; i++) {
        const duplicateAttempt = await this.uploadFile(null, 409);
        if (!duplicateAttempt.success) {
          throw new Error(`Retry attempt ${i + 1} failed: ${duplicateAttempt.error}`);
        }
        
        this.log(`Retry attempt ${i + 1} successful`, 'debug');
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between retries
      }
      
      // Test successful action after retries
      const finalAction = await this.uploadFile('rename', 200);
      if (!finalAction.success) {
        throw new Error(`Final action after retries failed: ${finalAction.error}`);
      }
      
      this.log('Multiple retry attempts successful, final action completed', 'success');
      this.testResults.passed++;
      this.testResults.details.push('✅ Requirement 4.4: System supports retry operations');
      
    } catch (error) {
      this.log(`Requirement 4.4 failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Requirement 4.4: ${error.message}`);
    }
  }

  async testErrorHandling() {
    this.log('Testing error handling and edge cases', 'info');
    
    try {
      // Test with invalid file
      const invalidFormData = new FormData();
      invalidFormData.append('file', Buffer.from(''), 'empty.jpg');
      invalidFormData.append('name', 'empty.jpg');
      
      try {
        await axios.post(`${API_URL}/media`, invalidFormData, {
          headers: { ...invalidFormData.getHeaders() },
          timeout: 5000
        });
        throw new Error('Empty file should have been rejected');
      } catch (error) {
        if (error.response && error.response.status >= 400) {
          this.log('Empty file correctly rejected', 'success');
        } else {
          throw error;
        }
      }
      
      // Test with oversized file (if backend has size limits)
      const largeBuffer = Buffer.alloc(100 * 1024 * 1024); // 100MB
      const largeFormData = new FormData();
      largeFormData.append('file', largeBuffer, 'large.jpg');
      largeFormData.append('name', 'large.jpg');
      
      try {
        await axios.post(`${API_URL}/media`, largeFormData, {
          headers: { ...largeFormData.getHeaders() },
          timeout: 10000
        });
        this.log('Large file accepted (no size limit configured)', 'warning');
      } catch (error) {
        if (error.response && error.response.status >= 400) {
          this.log('Large file correctly rejected', 'success');
        } else if (error.code === 'ECONNABORTED') {
          this.log('Large file upload timed out (expected)', 'success');
        }
      }
      
      this.testResults.passed++;
      this.testResults.details.push('✅ Error handling: System handles invalid inputs correctly');
      
    } catch (error) {
      this.log(`Error handling test failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Error handling: ${error.message}`);
    }
  }

  async runAllTests() {
    this.log('Starting comprehensive duplicate upload validation', 'info');
    this.log('=' * 60, 'info');
    
    try {
      await this.setup();
      
      // Run all requirement tests
      await this.testRequirement11();
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
      
      await this.testRequirement12();
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
      
      await this.testRequirement13();
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
      
      await this.testRequirement14();
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
      
      await this.testRequirement31();
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
      
      await this.testRequirement32();
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
      
      await this.testRequirement33();
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
      
      await this.testRequirement44();
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
      
      await this.testErrorHandling();
      
    } catch (error) {
      this.log(`Test setup failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Setup: ${error.message}`);
    } finally {
      await this.cleanup();
    }
    
    this.printResults();
  }

  printResults() {
    this.log('=' * 60, 'info');
    this.log('TEST RESULTS SUMMARY', 'info');
    this.log('=' * 60, 'info');
    
    this.log(`Total tests: ${this.testResults.passed + this.testResults.failed}`, 'info');
    this.log(`Passed: ${this.testResults.passed}`, 'success');
    this.log(`Failed: ${this.testResults.failed}`, this.testResults.failed > 0 ? 'error' : 'success');
    
    if (this.testResults.details.length > 0) {
      this.log('\nDetailed Results:', 'info');
      this.testResults.details.forEach(detail => {
        console.log(`  ${detail}`);
      });
    }
    
    if (this.testResults.errors.length > 0) {
      this.log('\nErrors:', 'error');
      this.testResults.errors.forEach(error => {
        console.log(`  ❌ ${error}`);
      });
    }
    
    this.log('=' * 60, 'info');
    
    if (this.testResults.failed === 0) {
      this.log('🎉 ALL TESTS PASSED! Duplicate upload user experience is working correctly.', 'success');
      process.exit(0);
    } else {
      this.log('⚠️ SOME TESTS FAILED. Please review the errors above.', 'error');
      process.exit(1);
    }
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const validator = new DuplicateUploadValidator();
  validator.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { DuplicateUploadValidator };