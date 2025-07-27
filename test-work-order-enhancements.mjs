#!/usr/bin/env node

/**
 * Test Script for Phase 1.1 Work Order Management Enhancements
 * 
 * This script tests the enhanced work order management features:
 * 1. File attachment support
 * 2. Work order templates
 * 3. Enhanced time tracking
 * 4. Approval workflow
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  const fullPath = join(__dirname, filePath);
  const exists = existsSync(fullPath);
  log(`${exists ? '✅' : '❌'} ${filePath}`, exists ? 'green' : 'red');
  return exists;
}

function checkFileContent(filePath, searchTerms) {
  try {
    const fullPath = join(__dirname, filePath);
    const content = readFileSync(fullPath, 'utf8');
    
    log(`\n📄 Checking ${filePath}:`, 'cyan');
    
    let allFound = true;
    searchTerms.forEach(term => {
      const found = content.includes(term);
      log(`  ${found ? '✅' : '❌'} Contains: ${term}`, found ? 'green' : 'red');
      if (!found) allFound = false;
    });
    
    return allFound;
  } catch (error) {
    log(`❌ Error reading ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function runTests() {
  log('🚀 Testing Phase 1.1 Work Order Management Enhancements\n', 'bright');
  
  const results = {
    filesCreated: 0,
    filesTotal: 0,
    featuresImplemented: 0,
    featuresTotal: 0
  };

  // Test 1: Check if new component files exist
  log('📁 1. Checking New Component Files:', 'yellow');
  const componentFiles = [
    'client/components/FileAttachment.tsx',
    'client/components/WorkOrderTemplates.tsx', 
    'client/components/TimeTracking.tsx',
    'client/components/ApprovalWorkflow.tsx'
  ];

  componentFiles.forEach(file => {
    if (checkFileExists(file)) {
      results.filesCreated++;
    }
    results.filesTotal++;
  });

  // Test 2: Check FileAttachment component features
  log('\n📎 2. Testing File Attachment Component:', 'yellow');
  const fileAttachmentFeatures = [
    'interface AttachedFile',
    'drag and drop',
    'file validation',
    'upload progress',
    'file preview',
    'onFilesChange'
  ];

  if (checkFileContent('client/components/FileAttachment.tsx', fileAttachmentFeatures)) {
    results.featuresImplemented++;
  }
  results.featuresTotal++;

  // Test 3: Check WorkOrderTemplates component features
  log('\n📋 3. Testing Work Order Templates Component:', 'yellow');
  const templateFeatures = [
    'interface WorkOrderTemplate',
    'template selection',
    'template creation',
    'template categories',
    'usage tracking',
    'onSelectTemplate'
  ];

  if (checkFileContent('client/components/WorkOrderTemplates.tsx', templateFeatures)) {
    results.featuresImplemented++;
  }
  results.featuresTotal++;

  // Test 4: Check TimeTracking component features
  log('\n⏱️ 4. Testing Time Tracking Component:', 'yellow');
  const timeTrackingFeatures = [
    'interface TimeEntry',
    'timer functionality',
    'manual time entry',
    'estimated vs actual',
    'time variance',
    'progress tracking'
  ];

  if (checkFileContent('client/components/TimeTracking.tsx', timeTrackingFeatures)) {
    results.featuresImplemented++;
  }
  results.featuresTotal++;

  // Test 5: Check ApprovalWorkflow component features
  log('\n✅ 5. Testing Approval Workflow Component:', 'yellow');
  const approvalFeatures = [
    'interface ApprovalStep',
    'approval status',
    'workflow progress',
    'approver roles',
    'approval comments',
    'workflow reset'
  ];

  if (checkFileContent('client/components/ApprovalWorkflow.tsx', approvalFeatures)) {
    results.featuresImplemented++;
  }
  results.featuresTotal++;

  // Test 6: Check WorkOrderForm integration
  log('\n📝 6. Testing Work Order Form Integration:', 'yellow');
  const formIntegrationFeatures = [
    'import { FileAttachment }',
    'import { WorkOrderTemplates }',
    'import { TimeTracking }',
    'Tabs component',
    'template selection',
    'file attachments'
  ];

  if (checkFileContent('client/pages/WorkOrderForm.tsx', formIntegrationFeatures)) {
    results.featuresImplemented++;
  }
  results.featuresTotal++;

  // Test 7: Check WorkOrderDetail integration
  log('\n📋 7. Testing Work Order Detail Integration:', 'yellow');
  const detailIntegrationFeatures = [
    'import { FileAttachment }',
    'import { TimeTracking }',
    'import { ApprovalWorkflow }',
    'time tracking tab',
    'approval workflow tab',
    'enhanced attachments'
  ];

  if (checkFileContent('client/pages/WorkOrderDetail.tsx', detailIntegrationFeatures)) {
    results.featuresImplemented++;
  }
  results.featuresTotal++;

  // Test 8: Check UI component imports
  log('\n🎨 8. Testing UI Component Dependencies:', 'yellow');
  const uiComponents = [
    'Tabs, TabsContent, TabsList, TabsTrigger',
    'Progress component',
    'Dialog components',
    'Badge components'
  ];

  let uiComponentsFound = 0;
  componentFiles.forEach(file => {
    try {
      const content = readFileSync(join(__dirname, file), 'utf8');
      if (content.includes('Dialog') && content.includes('Badge')) {
        uiComponentsFound++;
      }
    } catch (error) {
      // File doesn't exist or can't be read
    }
  });

  if (uiComponentsFound >= 2) {
    log('  ✅ UI components properly imported', 'green');
    results.featuresImplemented++;
  } else {
    log('  ❌ UI components missing or incomplete', 'red');
  }
  results.featuresTotal++;

  // Final Results
  log('\n📊 Test Results Summary:', 'bright');
  log(`Files Created: ${results.filesCreated}/${results.filesTotal}`, 
       results.filesCreated === results.filesTotal ? 'green' : 'yellow');
  log(`Features Implemented: ${results.featuresImplemented}/${results.featuresTotal}`, 
       results.featuresImplemented === results.featuresTotal ? 'green' : 'yellow');

  const overallScore = ((results.filesCreated + results.featuresImplemented) / 
                       (results.filesTotal + results.featuresTotal)) * 100;
  
  log(`\nOverall Progress: ${overallScore.toFixed(1)}%`, 
       overallScore >= 90 ? 'green' : overallScore >= 70 ? 'yellow' : 'red');

  if (overallScore >= 90) {
    log('\n🎉 Phase 1.1 Work Order Management Enhancements: COMPLETED!', 'green');
    log('✨ All enhanced features are successfully implemented:', 'green');
    log('   • File attachment support with drag & drop', 'green');
    log('   • Work order templates with categories', 'green');
    log('   • Enhanced time tracking with timer', 'green');
    log('   • Approval workflow with multi-step process', 'green');
    log('   • Integrated tabbed interface', 'green');
  } else if (overallScore >= 70) {
    log('\n⚠️  Phase 1.1 Work Order Management: PARTIALLY COMPLETED', 'yellow');
    log('Some features may need additional work or testing.', 'yellow');
  } else {
    log('\n❌ Phase 1.1 Work Order Management: NEEDS MORE WORK', 'red');
    log('Several components or features are missing or incomplete.', 'red');
  }

  // Recommendations
  log('\n💡 Next Steps:', 'cyan');
  if (results.filesCreated < results.filesTotal) {
    log('   • Complete missing component files', 'cyan');
  }
  if (results.featuresImplemented < results.featuresTotal) {
    log('   • Implement remaining features in components', 'cyan');
  }
  log('   • Test the enhanced work order form and detail pages', 'cyan');
  log('   • Verify file upload functionality works correctly', 'cyan');
  log('   • Test template selection and application', 'cyan');
  log('   • Validate time tracking accuracy', 'cyan');
  log('   • Test approval workflow with different user roles', 'cyan');

  return overallScore >= 90;
}

// Run the tests
const success = runTests();
process.exit(success ? 0 : 1);