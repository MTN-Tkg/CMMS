# CMMS Mobile Pro - Comprehensive Mobile Application Documentation

## Overview

CMMS Mobile Pro is a comprehensive mobile application that parses and processes Markdown files with embedded data tables, implementing full offline functionality with local data storage. The application provides seamless offline access, automatic synchronization with remote servers, data conflict resolution, progressive web app capabilities, and optimized performance.

## 🚀 Key Features

### Core Capabilities
- **📱 Mobile-First Design**: Responsive UI optimized for mobile devices
- **🔄 Offline-First Architecture**: Full functionality without internet connection
- **📊 Markdown Processing**: Advanced parsing with embedded data table support
- **💾 Local Data Storage**: Compressed storage with integrity validation
- **🔄 Smart Synchronization**: Conflict resolution and incremental updates
- **⚡ Performance Optimization**: Efficient caching and rendering
- **🛡️ Data Integrity**: Comprehensive validation and error handling
- **📱 PWA Support**: Installable with native app-like experience

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Installation & Setup](#installation--setup)
3. [Core Components](#core-components)
4. [Offline Storage System](#offline-storage-system)
5. [Synchronization Engine](#synchronization-engine)
6. [Markdown Processing](#markdown-processing)
7. [Performance Optimization](#performance-optimization)
8. [Data Integrity](#data-integrity)
9. [PWA Features](#pwa-features)
10. [API Reference](#api-reference)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CMMS Mobile Pro                          │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React Components)                               │
│  ├── MobileApp.tsx (Main Interface)                        │
│  ├── MarkdownViewer.tsx (Document Display)                 │
│  └── PWAInstall.tsx (Installation UI)                      │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                      │
│  ├── Enhanced Offline Storage                              │
│  ├── Data Integrity Validator                              │
│  ├── Performance Optimizer                                 │
│  └── Markdown Parser                                       │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ├── IndexedDB (Primary Storage)                           │
│  ├── Cache API (Resource Caching)                          │
│  └── Service Worker (Background Processing)                │
├─────────────────────────────────────────────────────────────┤
│  Network Layer                                             │
│  ├── Sync Engine (Conflict Resolution)                     │
│  ├── Background Sync (Service Worker)                      │
│  └── Network Monitoring                                    │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Storage**: IndexedDB, Dexie.js, LZ-String compression
- **PWA**: Service Workers, Cache API, Web App Manifest
- **Markdown**: Marked.js with custom extensions
- **Build**: Vite, SWC
- **Testing**: Vitest, Custom test suite

## Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern browser with PWA support

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd cmms-mobile-pro

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://your-api-server.com
VITE_ENABLE_PWA=true
VITE_ENABLE_COMPRESSION=true
VITE_CACHE_TTL=300000
```

## Core Components

### 1. MobileApp Component (`client/pages/MobileApp.tsx`)

The main application interface providing:
- **Dashboard Overview**: System status and metrics
- **Storage Management**: Data storage and compression stats
- **Synchronization Control**: Manual and automatic sync
- **Integrity Monitoring**: Data validation and health checks
- **Documentation Viewer**: Integrated markdown display

```typescript
import MobileApp from '@/pages/MobileApp';

// Usage in routing
<Route path="/mobile-app" component={MobileApp} />
```

### 2. MarkdownViewer Component (`client/components/MarkdownViewer.tsx`)

Advanced markdown rendering with:
- **Table Enhancement**: Sortable, filterable, exportable tables
- **Metadata Display**: Document information and statistics
- **Table of Contents**: Auto-generated navigation
- **Code Highlighting**: Syntax highlighting for code blocks

```typescript
import MarkdownViewer from '@/components/MarkdownViewer';

<MarkdownViewer 
  content={markdownContent}
  showMetadata={true}
  showTOC={true}
  enableTableFeatures={true}
/>
```

### 3. PWAInstall Component (`client/components/PWAInstall.tsx`)

Progressive Web App installation:
- **Installation Prompts**: Smart installation banners
- **Platform Detection**: iOS/Android specific instructions
- **Notification Setup**: Push notification permissions
- **Status Indicators**: Installation and network status

## Offline Storage System

### Enhanced Offline Storage (`client/utils/enhanced-offline-storage.ts`)

#### Key Features

- **Data Compression**: Automatic LZ-String compression for large data
- **Integrity Validation**: Checksum verification for all stored data
- **TTL Support**: Time-to-live for automatic data expiration
- **Conflict Resolution**: Sophisticated merge strategies
- **Batch Operations**: Efficient bulk data processing

#### Basic Usage

```typescript
import { enhancedOfflineStorage } from '@/utils/enhanced-offline-storage';

// Save data with compression
await enhancedOfflineStorage.saveData('work-orders', 'wo-123', {
  title: 'Repair Equipment',
  description: 'Fix broken conveyor belt',
  priority: 'high'
});

// Retrieve data
const workOrders = await enhancedOfflineStorage.getData('work-orders');

// Update existing data
await enhancedOfflineStorage.updateData('work-orders', 'wo-123', {
  status: 'completed'
});

// Get storage statistics
const stats = await enhancedOfflineStorage.getStorageStats();
console.log(`Compression ratio: ${stats.compressionRatio * 100}%`);
```

#### Advanced Configuration

```typescript
// Configure storage options
const config = {
  compressionThreshold: 1024, // Compress data > 1KB
  maxSyncAttempts: 3,
  cleanupInterval: 3600000, // 1 hour
  maxAge: 2592000000 // 30 days
};

// Custom conflict resolution
enhancedOfflineStorage.registerConflictResolver('work-orders', async (conflict) => {
  // Custom merge logic
  return {
    ...conflict.localData,
    ...conflict.remoteData,
    mergedAt: new Date().toISOString()
  };
});
```

### Storage Schema

```typescript
interface OfflineDataItem {
  id: string;
  data: any;
  timestamp: number;
  lastModified: number;
  synced: boolean;
  syncAttempts: number;
  version: number;
  checksum: string;
  compressed: boolean;
  size: number;
  metadata?: {
    source?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    expiresAt?: number;
  };
}
```

## Synchronization Engine

### Sync Process Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Data    │    │  Sync Engine    │    │  Remote Server  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Unsynced    │ │───▶│ │ Batch       │ │───▶│ │ API         │ │
│ │ Items       │ │    │ │ Processing  │ │    │ │ Endpoints   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │        │        │    │        │        │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Conflict    │ │◀───│ │ Conflict    │ │◀───│ │ Version     │ │
│ │ Resolution  │ │    │ │ Detection   │ │    │ │ Control     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Sync Configuration

```typescript
// Automatic synchronization
const syncResult = await enhancedOfflineStorage.syncWithServer('/api/sync', {
  batchSize: 10,
  maxRetries: 3,
  conflictResolution: 'manual' // 'local', 'remote', or 'manual'
});

// Monitor sync status
enhancedOfflineStorage.onSync((result) => {
  console.log(`Synced: ${result.synced}, Failed: ${result.failed}`);
  
  if (result.conflicts.length > 0) {
    // Handle conflicts
    result.conflicts.forEach(conflict => {
      console.log('Conflict detected:', conflict);
    });
  }
});
```

### Background Sync

The enhanced service worker (`public/enhanced-sw.js`) provides:

- **Automatic Retry**: Failed requests are queued and retried
- **Network Detection**: Sync triggers when connectivity is restored
- **Incremental Updates**: Only changed data is synchronized
- **Bandwidth Optimization**: Compression and batching

```javascript
// Register background sync
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then(registration => {
    return registration.sync.register('background-sync-offline-data');
  });
}
```

## Markdown Processing

### Markdown Parser (`client/utils/markdown-parser.ts`)

#### Features

- **GitHub Flavored Markdown**: Full GFM support
- **Table Enhancement**: Interactive data tables
- **Code Highlighting**: Prism.js integration
- **Frontmatter Support**: YAML metadata parsing
- **Table of Contents**: Auto-generated navigation
- **Custom Extensions**: Extensible renderer system

#### Basic Usage

```typescript
import { markdownParser } from '@/utils/markdown-parser';

const markdown = `---
title: "Equipment Manual"
tags: ["maintenance", "equipment"]
---

# Equipment Maintenance Guide

## Maintenance Schedule

| Equipment | Frequency | Last Service |
|-----------|-----------|--------------|
| Pump A    | Monthly   | 2024-01-15   |
| Motor B   | Quarterly | 2024-01-10   |
`;

const result = await markdownParser.parse(markdown);

console.log('HTML:', result.html);
console.log('Tables:', result.tables);
console.log('Metadata:', result.metadata);
console.log('TOC:', result.toc);
```

#### Advanced Table Features

Tables support metadata for enhanced functionality:

```markdown
<!-- table-meta: {"sortable": true, "filterable": true, "exportable": true, "pagination": true} -->
| Name | Value | Status |
|------|-------|--------|
| Item 1 | 100 | Active |
| Item 2 | 200 | Inactive |
```

#### Custom Renderers

```typescript
markdownParser.addCustomRenderer((renderer) => {
  renderer.link = (href, title, text) => {
    return `<a href="${href}" title="${title}" target="_blank" rel="noopener">${text}</a>`;
  };
});
```

## Performance Optimization

### Performance Optimizer (`client/utils/performance-optimizer.ts`)

#### Monitoring & Metrics

```typescript
import { usePerformanceMetrics, performanceOptimizer } from '@/utils/performance-optimizer';

// React hook for performance monitoring
const metrics = usePerformanceMetrics();

// Manual performance measurement
const endMeasurement = performanceOptimizer.startRenderMeasurement('MyComponent');
// ... component rendering
endMeasurement();

// Get component metrics
const componentStats = performanceOptimizer.getComponentMetrics('MyComponent');
```

#### Optimization Techniques

**1. Virtual Scrolling**
```typescript
import { useVirtualList } from '@/utils/performance-optimizer';

const { virtualItems, visibleItems, handleScroll } = useVirtualList(
  items,
  containerHeight,
  itemHeight
);
```

**2. Lazy Loading**
```typescript
import { useLazyLoading } from '@/utils/performance-optimizer';

const { elementRef, isVisible, isLoaded } = useLazyLoading(0.1);

return (
  <div ref={elementRef}>
    {isVisible && <ExpensiveComponent />}
  </div>
);
```

**3. Optimized State Management**
```typescript
import { useOptimizedState } from '@/utils/performance-optimizer';

const [state, setState] = useOptimizedState(initialValue, {
  debounce: true,
  debounceDelay: 300,
  cache: true,
  cacheKey: 'my-state'
});
```

#### Cache Management

```typescript
// Set cache item with TTL
performanceOptimizer.setCacheItem('user-data', userData, 300000); // 5 minutes

// Get cached item
const cachedData = performanceOptimizer.getCacheItem('user-data');

// Cache hit rate monitoring
performanceOptimizer.updateCacheHitRate(true); // Cache hit
performanceOptimizer.updateCacheHitRate(false); // Cache miss
```

## Data Integrity

### Data Integrity Validator (`client/utils/data-integrity.ts`)

#### Schema Validation

```typescript
import { dataIntegrityValidator } from '@/utils/data-integrity';

// Register schema for validation
dataIntegrityValidator.registerSchema('work-orders', {
  id: { type: 'string', required: true },
  title: { type: 'string', required: true },
  priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
  dueDate: { type: 'string', format: 'date' },
  estimatedHours: { type: 'number', min: 0 }
});

// Validate data store
const report = await dataIntegrityValidator.validateStore('work-orders');
console.log(`Status: ${report.overallStatus}`);
console.log(`Passed: ${report.passed}, Failed: ${report.failed}`);
```

#### Reference Integrity

```typescript
// Register reference rules
dataIntegrityValidator.registerReferenceRules('work-orders', [
  { 
    field: 'assetId', 
    referencedStore: 'assets', 
    referencedField: 'id',
    required: false 
  }
]);
```

#### Custom Constraints

```typescript
// Register custom validation rules
dataIntegrityValidator.registerConstraintRules('work-orders', [
  {
    field: 'dueDate',
    constraint: (dueDate, workOrder) => {
      if (!dueDate) return true;
      return new Date(dueDate) >= new Date(workOrder.createdDate);
    },
    message: 'Due date cannot be before creation date'
  }
]);
```

#### Integrity Reports

```typescript
// Generate comprehensive report
const reports = await dataIntegrityValidator.validateAllStores();

// Get summary statistics
const summary = integrityUtils.generateSummary(reports);
console.log(`Healthy stores: ${summary.healthyStores}/${summary.totalStores}`);

// Schedule periodic validation
const stopValidation = integrityUtils.scheduleValidation(3600000); // Every hour
```

## PWA Features

### Service Worker Registration

The application automatically registers an enhanced service worker with:

- **Caching Strategies**: Cache-first, network-first, stale-while-revalidate
- **Background Sync**: Automatic data synchronization
- **Push Notifications**: Real-time updates
- **Offline Fallbacks**: Graceful degradation

### Installation

```typescript
import { PWAInstall } from '@/components/PWAInstall';

// Installation component
<PWAInstall 
  showBanner={true}
  autoShow={false}
/>

// Programmatic installation
import { pwaManager } from '@/utils/pwa';

const installed = await pwaManager.promptInstall();
if (installed) {
  console.log('PWA installed successfully');
}
```

### Manifest Configuration

The app manifest (`public/manifest.json`) includes:

- **App Identity**: Name, description, icons
- **Display Mode**: Standalone app experience
- **Shortcuts**: Quick actions from home screen
- **Screenshots**: App store presentation

## API Reference

### Enhanced Offline Storage API

#### Core Methods

```typescript
// Data operations
saveData(storeName: string, id: string, data: any, metadata?: object): Promise<void>
getData(storeName: string, id?: string): Promise<any[]>
updateData(storeName: string, id: string, updates: any, metadata?: object): Promise<void>
deleteData(storeName: string, id: string): Promise<void>

// Synchronization
syncWithServer(apiEndpoint: string, options?: SyncOptions): Promise<SyncResult>
getUnsyncedData(storeName?: string): Promise<any[]>
markAsSynced(id: string, remoteVersion?: number): Promise<void>

// Management
getStorageStats(storeName?: string): Promise<StorageStats>
cleanup(options?: CleanupOptions): Promise<number>
exportData(storeName?: string): Promise<string>
importData(jsonData: string, storeName: string): Promise<number>
```

#### Event Handlers

```typescript
// Sync events
onSync(callback: (result: SyncResult) => void): () => void

// Conflict resolution
registerConflictResolver(itemId: string, resolver: (conflict: SyncConflict) => Promise<any>): void
```

### Markdown Parser API

```typescript
// Parsing
parse(markdown: string): Promise<MarkdownContent>
validateMarkdown(markdown: string): { isValid: boolean; errors: string[] }

// Configuration
updateOptions(options: Partial<MarkdownParserOptions>): void
addCustomRenderer(rendererFn: (renderer: Renderer) => void): void
```

### Performance Optimizer API

```typescript
// Monitoring
startRenderMeasurement(componentName: string): () => void
getMetrics(): PerformanceMetrics
getComponentMetrics(componentName: string): ComponentMetrics

// Optimization
createDebouncedFunction<T>(func: T, delay?: number): T
createThrottledFunction<T>(func: T, delay?: number): T
createIntersectionObserver(callback: IntersectionObserverCallback): IntersectionObserver

// Cache management
setCacheItem(key: string, value: any, ttl?: number): void
getCacheItem(key: string): any
updateCacheHitRate(hit: boolean): void
```

## Testing

### Comprehensive Test Suite (`client/utils/offline-functionality-tests.ts`)

#### Running Tests

```typescript
import { offlineFunctionalityTester } from '@/utils/offline-functionality-tests';

// Run all tests
const results = await offlineFunctionalityTester.runAllTests();

// Quick health check
const health = await testUtils.quickHealthCheck();
console.log(`System status: ${health.status}`);

// Performance benchmark
const benchmark = await testUtils.runPerformanceBenchmark();
console.log(`Storage time: ${benchmark.storageTime}ms`);
```

#### Test Categories

1. **Offline Storage Tests**
   - Basic CRUD operations
   - Data compression
   - Bulk operations
   - Storage cleanup

2. **Data Integrity Tests**
   - Schema validation
   - Checksum verification
   - Constraint validation

3. **Synchronization Tests**
   - Sync queue management
   - Conflict detection
   - Incremental sync

4. **Markdown Processing Tests**
   - Basic parsing
   - Table extraction
   - Frontmatter parsing

5. **Performance Tests**
   - Cache operations
   - Metrics collection
   - Function optimization

6. **PWA Tests**
   - Service worker registration
   - Cache API availability
   - IndexedDB functionality

7. **Network Resilience Tests**
   - Online/offline detection
   - Network change events
   - Request timeout handling

#### Test Results

```typescript
interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  duration: number;
  details?: any;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  duration: number;
}
```

## Deployment

### Build Configuration

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT=30000

# PWA Configuration
VITE_ENABLE_PWA=true
VITE_SW_UPDATE_INTERVAL=3600000

# Storage Configuration
VITE_ENABLE_COMPRESSION=true
VITE_COMPRESSION_THRESHOLD=1024
VITE_CACHE_TTL=300000
VITE_MAX_CACHE_SIZE=1000

# Performance Configuration
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_DEBOUNCE_DELAY=300
VITE_THROTTLE_DELAY=100
```

### Server Configuration

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/cmms-mobile-pro/dist;
    index index.html;
    
    # PWA Support
    location /manifest.json {
        add_header Cache-Control "public, max-age=86400";
    }
    
    location /sw.js {
        add_header Cache-Control "no-cache";
    }
    
    # API Proxy
    location /api/ {
        proxy_pass http://your-api-server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # SPA Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/cmms-mobile-pro/dist
    
    # PWA Headers
    <Files "manifest.json">
        Header set Cache-Control "public, max-age=86400"
    </Files>
    
    <Files "sw.js">
        Header set Cache-Control "no-cache"
    </Files>
    
    # SPA Fallback
    <Directory "/var/www/cmms-mobile-pro/dist">
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

## Troubleshooting

### Common Issues

#### 1. Service Worker Not Registering

**Problem**: PWA features not working
**Solution**:
```javascript
// Check service worker support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => console.log('SW registered'))
    .catch(error => console.error('SW registration failed:', error));
}
```

#### 2. IndexedDB Quota Exceeded

**Problem**: Storage operations failing
**Solution**:
```typescript
// Check storage quota
if ('storage' in navigator && 'estimate' in navigator.storage) {
  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage / estimate.quota;
  
  if (usage > 0.8) {
    await enhancedOfflineStorage.cleanup();
  }
}
```

#### 3. Sync Conflicts

**Problem**: Data conflicts during synchronization
**Solution**:
```typescript
// Register conflict resolver
enhancedOfflineStorage.registerConflictResolver('data-type', async (conflict) => {
  // Custom merge strategy
  return {
    ...conflict.localData,
    ...conflict.remoteData,
    resolvedAt: new Date().toISOString()
  };
});
```

#### 4. Performance Issues

**Problem**: Slow rendering or high memory usage
**Solution**:
```typescript
// Enable performance monitoring
const metrics = performanceOptimizer.getMetrics();
console.log('Memory usage:', metrics.memoryUsage);

// Use virtual scrolling for large lists
const { visibleItems } = useVirtualList(items, containerHeight, itemHeight);

// Implement lazy loading
const { isVisible } = useLazyLoading();
```

### Debug Mode

Enable debug logging:

```typescript
// Enable debug mode
localStorage.setItem('cmms-debug', 'true');

// Check debug logs
console.log('Storage stats:', await enhancedOfflineStorage.getStorageStats());
console.log('Performance metrics:', performanceOptimizer.getMetrics());
console.log('Integrity report:', await dataIntegrityValidator.validateAllStores());
```

### Health Check

```typescript
import { testUtils } from '@/utils/offline-functionality-tests';

// Quick system health check
const health = await testUtils.quickHealthCheck();
console.log('System status:', health.status);
console.log('Issues:', health.issues);
console.log('Recommendations:', health.recommendations);
```

## Performance Benchmarks

### Expected Performance Metrics

| Metric | Target | Excellent | Good | Needs Improvement |
|--------|--------|-----------|------|-------------------|
| Render Time | < 16ms | < 10ms | < 16ms | > 16ms |
| Memory Usage | < 50MB | < 30MB | < 50MB | > 50MB |
| Storage Time | < 100ms | < 50ms | < 100ms | > 100ms |
| Sync Time | < 500ms | < 200ms | < 500ms | > 500ms |
| Cache Hit Rate | > 85% | > 95% | > 85% | < 85% |
| Compression Ratio | > 30% | > 50% | > 30% | < 30% |

### Optimization Checklist

- [ ] Service Worker registered and active
- [ ] IndexedDB storage configured
- [ ] Data compression enabled
- [ ] Cache strategies implemented
- [ ] Performance monitoring active
- [ ] Integrity validation scheduled
- [ ] Background sync configured
- [ ] PWA manifest valid
- [ ] Offline fallbacks working
- [ ] Network resilience tested

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Run tests: `npm test`
6. Build for production: `npm run build`

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Testing**: Comprehensive test coverage
- **Documentation**: JSDoc comments for all public APIs

### Pull Request Process

1. Ensure all tests pass
2. Update documentation
3. Add changelog entry
4. Request code review
5. Merge after approval

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- **Documentation**: This README and inline code comments
- **Issues**: GitHub Issues for bug reports and feature requests
- **Testing**: Use the built-in test suite for validation

---

**CMMS Mobile Pro** - A comprehensive mobile application with full offline capabilities, advanced markdown processing, and intelligent synchronization. Built with modern web technologies for maximum performance and reliability.