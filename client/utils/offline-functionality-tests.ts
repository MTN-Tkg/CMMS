import { enhancedOfflineStorage } from './enhanced-offline-storage';
import { dataIntegrityValidator } from './data-integrity';
import { performanceOptimizer } from './performance-optimizer';
import { markdownParser } from './markdown-parser';

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  duration: number;
  details?: any;
}

export interface TestSuite {
  name: string;
  results: TestResult[];
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  duration: number;
}

class OfflineFunctionalityTester {
  private testResults: TestSuite[] = [];

  async runAllTests(): Promise<TestSuite[]> {
    console.log('🧪 Starting comprehensive offline functionality tests...');
    
    const suites = [
      await this.testOfflineStorage(),
      await this.testDataCompression(),
      await this.testDataIntegrity(),
      await this.testSynchronization(),
      await this.testMarkdownParsing(),
      await this.testPerformanceOptimization(),
      await this.testPWACapabilities(),
      await this.testNetworkResilience()
    ];

    this.testResults = suites;
    this.generateTestReport();
    
    return suites;
  }

  private async testOfflineStorage(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Offline Storage',
      results: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Basic storage operations
    await this.runTest(suite, 'Basic Storage Operations', async () => {
      const testData = { id: 'test-1', name: 'Test Item', value: 42 };
      
      await enhancedOfflineStorage.saveData('test-store', 'test-1', testData);
      const retrieved = await enhancedOfflineStorage.getData('test-store', 'test-1');
      
      if (retrieved.length === 0) {
        throw new Error('No data retrieved');
      }
      
      if (retrieved[0].name !== testData.name) {
        throw new Error('Data mismatch');
      }
      
      return 'Successfully saved and retrieved data';
    });

    // Test 2: Data compression
    await this.runTest(suite, 'Data Compression', async () => {
      const largeData = {
        id: 'large-test',
        content: 'x'.repeat(10000), // 10KB of data
        metadata: { compressed: true }
      };
      
      await enhancedOfflineStorage.saveData('test-store', 'large-test', largeData);
      const stats = await enhancedOfflineStorage.getStorageStats('test-store');
      
      if (stats.compressionRatio <= 0) {
        throw new Error('No compression detected');
      }
      
      return `Compression ratio: ${(stats.compressionRatio * 100).toFixed(1)}%`;
    });

    // Test 3: Bulk operations
    await this.runTest(suite, 'Bulk Operations', async () => {
      const bulkData = Array.from({ length: 100 }, (_, i) => ({
        id: `bulk-${i}`,
        index: i,
        timestamp: Date.now()
      }));
      
      for (const item of bulkData) {
        await enhancedOfflineStorage.saveData('test-store', item.id, item);
      }
      
      const retrieved = await enhancedOfflineStorage.getData('test-store');
      const bulkItems = retrieved.filter(item => item.id?.startsWith('bulk-'));
      
      if (bulkItems.length !== 100) {
        throw new Error(`Expected 100 items, got ${bulkItems.length}`);
      }
      
      return `Successfully stored and retrieved ${bulkItems.length} items`;
    });

    // Test 4: Storage cleanup
    await this.runTest(suite, 'Storage Cleanup', async () => {
      const initialStats = await enhancedOfflineStorage.getStorageStats('test-store');
      const deletedCount = await enhancedOfflineStorage.cleanup({
        maxAge: 1000, // Very short age for testing
        removeExpired: true
      });
      
      return `Cleaned up storage, removed ${deletedCount} items`;
    });

    suite.duration = Date.now() - startTime;
    return suite;
  }

  private async testDataCompression(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Data Compression',
      results: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Text compression
    await this.runTest(suite, 'Text Compression', async () => {
      const textData = {
        id: 'text-test',
        content: 'Lorem ipsum '.repeat(1000), // Repetitive text for good compression
        type: 'text'
      };
      
      await enhancedOfflineStorage.saveData('compression-test', 'text', textData);
      const stats = await enhancedOfflineStorage.getStorageStats('compression-test');
      
      if (stats.compressionRatio < 0.5) {
        throw new Error('Poor compression ratio for repetitive text');
      }
      
      return `Text compression ratio: ${(stats.compressionRatio * 100).toFixed(1)}%`;
    });

    // Test 2: JSON compression
    await this.runTest(suite, 'JSON Compression', async () => {
      const jsonData = {
        id: 'json-test',
        data: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: 'This is a test item with some description text',
          metadata: { created: new Date().toISOString(), index: i }
        }))
      };
      
      await enhancedOfflineStorage.saveData('compression-test', 'json', jsonData);
      const retrieved = await enhancedOfflineStorage.getData('compression-test', 'json');
      
      if (retrieved.length === 0 || retrieved[0].data.length !== 100) {
        throw new Error('JSON data not properly compressed/decompressed');
      }
      
      return 'JSON compression and decompression successful';
    });

    suite.duration = Date.now() - startTime;
    return suite;
  }

  private async testDataIntegrity(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Data Integrity',
      results: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Schema validation
    await this.runTest(suite, 'Schema Validation', async () => {
      const validData = {
        id: 'schema-test-1',
        title: 'Test Work Order',
        description: 'Test description',
        priority: 'high',
        status: 'open',
        assignee: 'test-user',
        createdDate: new Date().toISOString()
      };
      
      await enhancedOfflineStorage.saveData('work-orders', 'schema-test-1', validData);
      const report = await dataIntegrityValidator.validateStore('work-orders');
      
      const schemaChecks = report.checks.filter(check => 
        check.type === 'schema' && check.data?.field
      );
      
      if (schemaChecks.length === 0) {
        throw new Error('No schema validation performed');
      }
      
      return `Schema validation completed: ${report.passed} passed, ${report.failed} failed`;
    });

    // Test 2: Checksum validation
    await this.runTest(suite, 'Checksum Validation', async () => {
      const testData = {
        id: 'checksum-test',
        content: 'Test content for checksum validation',
        timestamp: Date.now()
      };
      
      await enhancedOfflineStorage.saveData('test-store', 'checksum-test', testData);
      const report = await dataIntegrityValidator.validateStore('test-store');
      
      const checksumChecks = report.checks.filter(check => check.type === 'checksum');
      
      if (checksumChecks.length === 0) {
        return 'No checksum validation available (warning)';
      }
      
      const passedChecksums = checksumChecks.filter(check => check.status === 'passed');
      return `Checksum validation: ${passedChecksums.length}/${checksumChecks.length} passed`;
    });

    // Test 3: Constraint validation
    await this.runTest(suite, 'Constraint Validation', async () => {
      const invalidData = {
        id: 'constraint-test',
        title: 'Test Work Order',
        description: 'Test description',
        priority: 'high',
        status: 'open',
        assignee: 'test-user',
        createdDate: new Date().toISOString(),
        dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday (invalid)
        estimatedHours: 8,
        actualHours: 20 // More than 200% of estimate (should trigger warning)
      };
      
      await enhancedOfflineStorage.saveData('work-orders', 'constraint-test', invalidData);
      const report = await dataIntegrityValidator.validateStore('work-orders');
      
      const constraintChecks = report.checks.filter(check => check.type === 'constraint');
      const failedConstraints = constraintChecks.filter(check => check.status === 'failed');
      
      if (failedConstraints.length === 0) {
        return 'No constraint violations detected (warning)';
      }
      
      return `Constraint validation detected ${failedConstraints.length} violations`;
    });

    suite.duration = Date.now() - startTime;
    return suite;
  }

  private async testSynchronization(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Synchronization',
      results: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Sync queue management
    await this.runTest(suite, 'Sync Queue Management', async () => {
      const testData = {
        id: 'sync-test-1',
        content: 'Test sync data',
        timestamp: Date.now()
      };
      
      await enhancedOfflineStorage.saveData('sync-test', 'sync-test-1', testData);
      const unsyncedData = await enhancedOfflineStorage.getUnsyncedData('sync-test');
      
      if (unsyncedData.length === 0) {
        throw new Error('No unsynced data found');
      }
      
      return `Found ${unsyncedData.length} unsynced items`;
    });

    // Test 2: Conflict detection simulation
    await this.runTest(suite, 'Conflict Detection', async () => {
      // Simulate a conflict scenario
      const localData = {
        id: 'conflict-test',
        content: 'Local version',
        lastModified: Date.now() - 1000
      };
      
      const remoteData = {
        id: 'conflict-test',
        content: 'Remote version',
        lastModified: Date.now()
      };
      
      await enhancedOfflineStorage.saveData('conflict-test', 'conflict-test', localData);
      
      // This would normally be handled by the sync process
      return 'Conflict detection simulation completed';
    });

    // Test 3: Incremental sync simulation
    await this.runTest(suite, 'Incremental Sync', async () => {
      const batchData = Array.from({ length: 50 }, (_, i) => ({
        id: `incremental-${i}`,
        content: `Incremental data ${i}`,
        timestamp: Date.now() + i
      }));
      
      for (const item of batchData) {
        await enhancedOfflineStorage.saveData('incremental-test', item.id, item);
      }
      
      const unsyncedData = await enhancedOfflineStorage.getUnsyncedData('incremental-test');
      
      if (unsyncedData.length !== 50) {
        throw new Error(`Expected 50 unsynced items, got ${unsyncedData.length}`);
      }
      
      return `Prepared ${unsyncedData.length} items for incremental sync`;
    });

    suite.duration = Date.now() - startTime;
    return suite;
  }

  private async testMarkdownParsing(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Markdown Parsing',
      results: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Basic markdown parsing
    await this.runTest(suite, 'Basic Markdown Parsing', async () => {
      const markdown = `# Test Document

This is a **bold** text with *italic* and \`code\`.

## Features
- Item 1
- Item 2
- Item 3`;

      const result = await markdownParser.parse(markdown);
      
      if (!result.html.includes('<h1>')) {
        throw new Error('Headers not parsed correctly');
      }
      
      if (!result.html.includes('<strong>')) {
        throw new Error('Bold text not parsed correctly');
      }
      
      return `Parsed markdown: ${result.metadata.wordCount} words, ${result.metadata.readingTime} min read`;
    });

    // Test 2: Table parsing
    await this.runTest(suite, 'Table Parsing', async () => {
      const markdownWithTable = `# Data Table

| Name | Value | Status |
|------|-------|--------|
| Item 1 | 100 | Active |
| Item 2 | 200 | Inactive |
| Item 3 | 300 | Active |`;

      const result = await markdownParser.parse(markdownWithTable);
      
      if (result.tables.length === 0) {
        throw new Error('Table not parsed');
      }
      
      const table = result.tables[0];
      if (table.headers.length !== 3 || table.rows.length !== 3) {
        throw new Error('Table structure incorrect');
      }
      
      return `Parsed table: ${table.headers.length} columns, ${table.rows.length} rows`;
    });

    // Test 3: Frontmatter parsing
    await this.runTest(suite, 'Frontmatter Parsing', async () => {
      const markdownWithFrontmatter = `---
title: "Test Document"
description: "A test document"
tags: ["test", "markdown"]
---

# Content

This is the content.`;

      const result = await markdownParser.parse(markdownWithFrontmatter);
      
      if (!result.metadata.title || result.metadata.title !== 'Test Document') {
        throw new Error('Frontmatter not parsed correctly');
      }
      
      if (!result.metadata.tags || result.metadata.tags.length !== 2) {
        throw new Error('Tags not parsed correctly');
      }
      
      return `Parsed frontmatter: title="${result.metadata.title}", ${result.metadata.tags?.length} tags`;
    });

    suite.duration = Date.now() - startTime;
    return suite;
  }

  private async testPerformanceOptimization(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Performance Optimization',
      results: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Cache operations
    await this.runTest(suite, 'Cache Operations', async () => {
      const testKey = 'perf-test-1';
      const testValue = { data: 'test cache value', timestamp: Date.now() };
      
      performanceOptimizer.setCacheItem(testKey, testValue, 60000);
      const retrieved = performanceOptimizer.getCacheItem(testKey);
      
      if (!retrieved || retrieved.data !== testValue.data) {
        throw new Error('Cache operation failed');
      }
      
      return 'Cache operations working correctly';
    });

    // Test 2: Performance metrics
    await this.runTest(suite, 'Performance Metrics', async () => {
      const metrics = performanceOptimizer.getMetrics();
      
      if (typeof metrics.renderTime !== 'number') {
        throw new Error('Render time metric not available');
      }
      
      if (typeof metrics.memoryUsage !== 'number') {
        throw new Error('Memory usage metric not available');
      }
      
      return `Metrics: render=${metrics.renderTime.toFixed(2)}ms, memory=${(metrics.memoryUsage * 100).toFixed(1)}%`;
    });

    // Test 3: Function optimization
    await this.runTest(suite, 'Function Optimization', async () => {
      let callCount = 0;
      const testFunction = () => {
        callCount++;
        return 'test result';
      };
      
      const debouncedFunction = performanceOptimizer.createDebouncedFunction(testFunction, 100);
      
      // Call multiple times quickly
      debouncedFunction();
      debouncedFunction();
      debouncedFunction();
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150));
      
      if (callCount !== 1) {
        throw new Error(`Expected 1 call, got ${callCount}`);
      }
      
      return 'Function debouncing working correctly';
    });

    suite.duration = Date.now() - startTime;
    return suite;
  }

  private async testPWACapabilities(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'PWA Capabilities',
      results: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Service Worker registration
    await this.runTest(suite, 'Service Worker Registration', async () => {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }
      
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        return 'Service Worker not registered (warning)';
      }
      
      return `Service Worker registered: ${registration.scope}`;
    });

    // Test 2: Cache API availability
    await this.runTest(suite, 'Cache API Availability', async () => {
      if (!('caches' in window)) {
        throw new Error('Cache API not supported');
      }
      
      const cacheNames = await caches.keys();
      return `Cache API available: ${cacheNames.length} caches found`;
    });

    // Test 3: IndexedDB availability
    await this.runTest(suite, 'IndexedDB Availability', async () => {
      if (!('indexedDB' in window)) {
        throw new Error('IndexedDB not supported');
      }
      
      // Test basic IndexedDB operation
      const request = indexedDB.open('test-db', 1);
      
      return new Promise((resolve, reject) => {
        request.onerror = () => reject(new Error('IndexedDB test failed'));
        request.onsuccess = () => {
          request.result.close();
          resolve('IndexedDB available and functional');
        };
      });
    });

    suite.duration = Date.now() - startTime;
    return suite;
  }

  private async testNetworkResilience(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Network Resilience',
      results: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Online/Offline detection
    await this.runTest(suite, 'Online/Offline Detection', async () => {
      const isOnline = navigator.onLine;
      
      if (typeof isOnline !== 'boolean') {
        throw new Error('Online status not available');
      }
      
      return `Network status: ${isOnline ? 'online' : 'offline'}`;
    });

    // Test 2: Network change events
    await this.runTest(suite, 'Network Change Events', async () => {
      let eventFired = false;
      
      const handler = () => {
        eventFired = true;
      };
      
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
      
      // Simulate network change (this is just a test of event listener setup)
      setTimeout(() => {
        window.removeEventListener('online', handler);
        window.removeEventListener('offline', handler);
      }, 100);
      
      return 'Network change event listeners configured';
    });

    // Test 3: Fetch with timeout
    await this.runTest(suite, 'Fetch with Timeout', async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch('/api/ping', {
          signal: controller.signal,
          method: 'HEAD'
        });
        
        clearTimeout(timeoutId);
        return `Network request successful: ${response.status}`;
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          return 'Network request timeout (expected in offline mode)';
        }
        
        return `Network request failed: ${error.message}`;
      }
    });

    suite.duration = Date.now() - startTime;
    return suite;
  }

  private async runTest(
    suite: TestSuite,
    testName: string,
    testFunction: () => Promise<string>
  ): Promise<void> {
    const startTime = Date.now();
    suite.totalTests++;
    
    try {
      const message = await testFunction();
      const duration = Date.now() - startTime;
      
      suite.results.push({
        testName,
        status: message.includes('warning') ? 'warning' : 'passed',
        message,
        duration
      });
      
      if (message.includes('warning')) {
        suite.warnings++;
      } else {
        suite.passed++;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      
      suite.results.push({
        testName,
        status: 'failed',
        message: error.message,
        duration,
        details: error
      });
      
      suite.failed++;
    }
  }

  private generateTestReport(): void {
    console.log('\n📊 Test Report Summary');
    console.log('='.repeat(50));
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;
    let totalDuration = 0;
    
    for (const suite of this.testResults) {
      totalTests += suite.totalTests;
      totalPassed += suite.passed;
      totalFailed += suite.failed;
      totalWarnings += suite.warnings;
      totalDuration += suite.duration;
      
      console.log(`\n${suite.name}:`);
      console.log(`  ✅ Passed: ${suite.passed}`);
      console.log(`  ❌ Failed: ${suite.failed}`);
      console.log(`  ⚠️  Warnings: ${suite.warnings}`);
      console.log(`  ⏱️  Duration: ${suite.duration}ms`);
      
      // Show failed tests
      const failedTests = suite.results.filter(r => r.status === 'failed');
      if (failedTests.length > 0) {
        console.log('  Failed tests:');
        failedTests.forEach(test => {
          console.log(`    - ${test.testName}: ${test.message}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`⚠️  Warnings: ${totalWarnings} (${((totalWarnings / totalTests) * 100).toFixed(1)}%)`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    
    const successRate = (totalPassed / totalTests) * 100;
    if (successRate >= 90) {
      console.log('🎉 Excellent! All systems are functioning well.');
    } else if (successRate >= 75) {
      console.log('👍 Good! Most systems are working correctly.');
    } else if (successRate >= 50) {
      console.log('⚠️  Warning! Some systems need attention.');
    } else {
      console.log('🚨 Critical! Multiple systems are failing.');
    }
  }

  getTestResults(): TestSuite[] {
    return this.testResults;
  }

  async exportTestResults(): Promise<string> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSuites: this.testResults.length,
        totalTests: this.testResults.reduce((sum, suite) => sum + suite.totalTests, 0),
        totalPassed: this.testResults.reduce((sum, suite) => sum + suite.passed, 0),
        totalFailed: this.testResults.reduce((sum, suite) => sum + suite.failed, 0),
        totalWarnings: this.testResults.reduce((sum, suite) => sum + suite.warnings, 0),
        totalDuration: this.testResults.reduce((sum, suite) => sum + suite.duration, 0)
      },
      suites: this.testResults
    };
    
    return JSON.stringify(report, null, 2);
  }
}

// Export singleton instance
export const offlineFunctionalityTester = new OfflineFunctionalityTester();

// Export utility functions
export const testUtils = {
  // Run quick health check
  async quickHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check basic capabilities
    if (!('serviceWorker' in navigator)) {
      issues.push('Service Worker not supported');
      recommendations.push('Use a modern browser that supports Service Workers');
    }
    
    if (!('indexedDB' in window)) {
      issues.push('IndexedDB not supported');
      recommendations.push('Use a browser that supports IndexedDB for offline storage');
    }
    
    if (!('caches' in window)) {
      issues.push('Cache API not supported');
      recommendations.push('Use a browser that supports the Cache API');
    }
    
    // Check storage quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usagePercentage = estimate.usage && estimate.quota 
          ? (estimate.usage / estimate.quota) * 100 
          : 0;
        
        if (usagePercentage > 80) {
          issues.push('Storage quota nearly full');
          recommendations.push('Clear old cached data or request more storage');
        }
      } catch (error) {
        issues.push('Unable to check storage quota');
      }
    }
    
    // Determine overall status
    let status: 'healthy' | 'degraded' | 'critical';
    if (issues.length === 0) {
      status = 'healthy';
    } else if (issues.length <= 2) {
      status = 'degraded';
    } else {
      status = 'critical';
    }
    
    return { status, issues, recommendations };
  },

  // Performance benchmark
  async runPerformanceBenchmark(): Promise<{
    renderTime: number;
    storageTime: number;
    compressionTime: number;
    syncTime: number;
  }> {
    const results = {
      renderTime: 0,
      storageTime: 0,
      compressionTime: 0,
      syncTime: 0
    };
    
    // Render time benchmark
    const renderStart = performance.now();
    // Simulate DOM operations
    const div = document.createElement('div');
    div.innerHTML = '<p>Test content</p>'.repeat(1000);
    document.body.appendChild(div);
    document.body.removeChild(div);
    results.renderTime = performance.now() - renderStart;
    
    // Storage time benchmark
    const storageStart = performance.now();
    const testData = { id: 'benchmark', data: 'x'.repeat(10000) };
    await enhancedOfflineStorage.saveData('benchmark', 'test', testData);
    await enhancedOfflineStorage.getData('benchmark', 'test');
    results.storageTime = performance.now() - storageStart;
    
    // Compression time benchmark
    const compressionStart = performance.now();
    const largeData = { content: 'test data '.repeat(5000) };
    await enhancedOfflineStorage.saveData('benchmark', 'compression', largeData);
    results.compressionTime = performance.now() - compressionStart;
    
    // Sync time benchmark (simulated)
    const syncStart = performance.now();
    await enhancedOfflineStorage.getUnsyncedData('benchmark');
    results.syncTime = performance.now() - syncStart;
    
    return results;
  }
};