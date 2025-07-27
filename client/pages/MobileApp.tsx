import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  FileText,
  BarChart3,
  Settings,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Layers,
} from 'lucide-react';

import MarkdownViewer from '@/components/MarkdownViewer';
import { enhancedOfflineStorage, type StorageStats } from '@/utils/enhanced-offline-storage';
import { dataIntegrityValidator, type IntegrityReport, integrityUtils } from '@/utils/data-integrity';
import { usePerformanceMetrics, useOfflineOptimization, performanceOptimizer } from '@/utils/performance-optimizer';
import { useToast } from '@/hooks/use-toast';

const sampleMarkdown = `---
title: "CMMS Mobile App Documentation"
description: "Comprehensive mobile application with offline capabilities"
tags: ["mobile", "offline", "PWA", "CMMS"]
---

# CMMS Mobile Pro

A comprehensive **Computerized Maintenance Management System** designed for mobile devices with full offline functionality.

## Features

### Core Capabilities
- ✅ **Offline-first architecture** with local data storage
- ✅ **Real-time synchronization** with conflict resolution
- ✅ **Progressive Web App** capabilities
- ✅ **Data compression** and optimization
- ✅ **Background sync** services
- ✅ **Incremental updates** for bandwidth efficiency

### Data Management

<!-- table-meta: {"sortable": true, "filterable": true, "exportable": true} -->
| Feature | Status | Performance | Notes |
|---------|--------|-------------|-------|
| Local Storage | ✅ Active | 95% | IndexedDB with compression |
| Data RefreshCw | ✅ Active | 87% | Conflict resolution enabled |
| Cache Management | ✅ Active | 92% | LRU with TTL support |
| Integrity Validation | ✅ Active | 89% | Schema + checksum validation |
| Background RefreshCw | ✅ Active | 91% | Service worker integration |

### Performance Metrics

The application maintains high performance across all devices:

\`\`\`javascript
const performanceConfig = {
  renderTime: "< 16ms",
  memoryUsage: "< 50MB",
  cacheHitRate: "> 85%",
  syncLatency: "< 200ms"
};
\`\`\`

## Architecture

### Offline Storage Layer
- **Enhanced IndexedDB** with automatic compression
- **Data integrity** validation with checksums
- **Conflict resolution** for sync operations
- **TTL-based cache** management

### RefreshCwhronization Engine
- **Incremental sync** to minimize bandwidth
- **Background processing** via service workers
- **Retry mechanisms** with exponential backoff
- **Network-aware** optimization

> **Note**: All data is encrypted at rest and in transit for maximum security.

## Getting Started

1. **Install** the PWA from your browser
2. **Configure** your server connection
3. **RefreshCw** your initial data
4. **Work offline** seamlessly

The app automatically handles all synchronization when connectivity is restored.
`;

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('overview');
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [integrityReport, setIntegrityReport] = useState<Map<string, IntegrityReport> | null>(null);
  const [testData, setTestData] = useState('');
  const [syncStatus, setRefreshCwStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  const performanceMetrics = usePerformanceMetrics();
  const { isOnline, queueSize, optimizedFetch } = useOfflineOptimization();
  const { toast } = useToast();

  // Load storage statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await enhancedOfflineStorage.getStorageStats();
        setStorageStats(stats);
      } catch (error) {
        console.error('Failed to load storage stats:', error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load integrity reports
  useEffect(() => {
    const loadIntegrityReports = async () => {
      try {
        const reports = await dataIntegrityValidator.validateAllStores();
        setIntegrityReport(reports);
      } catch (error) {
        console.error('Failed to load integrity reports:', error);
      }
    };

    loadIntegrityReports();
    const interval = setInterval(loadIntegrityReports, 30000);
    return () => clearInterval(interval);
  }, []);

  // Test offline storage
  const handleTestStorage = async () => {
    if (!testData.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some test data',
        variant: 'destructive',
      });
      return;
    }

    try {
      const testId = `test-${Date.now()}`;
      await enhancedOfflineStorage.saveData('test-store', testId, {
        content: testData,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: 'Success',
        description: 'Test data saved to offline storage',
      });

      setTestData('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save test data',
        variant: 'destructive',
      });
    }
  };

  // Test synchronization
  const handleTestRefreshCw = async () => {
    setRefreshCwStatus('syncing');
    
    try {
      const result = await enhancedOfflineStorage.syncWithServer('/api/test-sync', {
        batchSize: 5,
        conflictResolution: 'local',
      });

      if (result.success) {
        setRefreshCwStatus('success');
        toast({
          title: 'RefreshCw Complete',
          description: `RefreshCwed ${result.synced} items successfully`,
        });
      } else {
        setRefreshCwStatus('error');
        toast({
          title: 'RefreshCw Issues',
          description: `${result.failed} items failed to sync`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      setRefreshCwStatus('error');
      toast({
        title: 'RefreshCw Failed',
        description: 'Unable to connect to server',
        variant: 'destructive',
      });
    }

    setTimeout(() => setRefreshCwStatus('idle'), 3000);
  };

  // Export data
  const handleExportData = async () => {
    try {
      const data = await enhancedOfflineStorage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cmms-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: 'Data exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Unable to export data',
        variant: 'destructive',
      });
    }
  };

  // Run integrity check
  const handleIntegrityCheck = async () => {
    try {
      const reports = await dataIntegrityValidator.validateAllStores();
      setIntegrityReport(reports);
      
      const summary = integrityUtils.generateSummary(reports);
      toast({
        title: 'Integrity Check Complete',
        description: `${summary.healthyStores}/${summary.totalStores} stores healthy`,
      });
    } catch (error) {
      toast({
        title: 'Integrity Check Failed',
        description: 'Unable to validate data integrity',
        variant: 'destructive',
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Smartphone className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">CMMS Mobile Pro</h1>
              <p className="text-muted-foreground">Comprehensive Mobile Application</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? 'default' : 'destructive'} className="flex items-center gap-1">
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            
            {queueSize > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {queueSize} queued
              </Badge>
            )}
          </div>
        </div>

        {/* Performance Metrics Bar */}
        {performanceMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <div>
                  <div className="text-sm font-medium">Render Time</div>
                  <div className="text-xs text-muted-foreground">
                    {performanceMetrics.renderTime.toFixed(1)}ms
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">Memory</div>
                  <div className="text-xs text-muted-foreground">
                    {(performanceMetrics.memoryUsage * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-sm font-medium">Latency</div>
                  <div className="text-xs text-muted-foreground">
                    {performanceMetrics.networkLatency.toFixed(0)}ms
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-sm font-medium">Cache Hit</div>
                  <div className="text-xs text-muted-foreground">
                    {(performanceMetrics.cacheHitRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="sync">RefreshCw</TabsTrigger>
          <TabsTrigger value="integrity">Integrity</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Offline Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                {storageStats ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Items:</span>
                      <span className="font-medium">{storageStats.totalItems}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Storage Size:</span>
                      <span className="font-medium">{formatBytes(storageStats.totalSize)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Compression:</span>
                      <span className="font-medium">
                        {(storageStats.compressionRatio * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={storageStats.compressionRatio * 100} 
                      className="h-2"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  RefreshCwhronization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={isOnline ? 'default' : 'secondary'}>
                      {isOnline ? 'Ready' : 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Queue Size:</span>
                    <span className="font-medium">{queueSize}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Unsynced:</span>
                    <span className="font-medium">
                      {storageStats?.unsyncedItems || 0}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={handleTestRefreshCw}
                    disabled={syncStatus === 'syncing'}
                  >
                    {syncStatus === 'syncing' ? 'RefreshCwing...' : 'Test RefreshCw'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Data Integrity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {integrityReport ? (
                  <div className="space-y-2">
                    {(() => {
                      const summary = integrityUtils.generateSummary(integrityReport);
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Healthy:</span>
                            <span className="font-medium text-green-600">
                              {summary.healthyStores}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Issues:</span>
                            <span className="font-medium text-red-600">
                              {summary.totalIssues}
                            </span>
                          </div>
                          <Progress 
                            value={(summary.healthyStores / summary.totalStores) * 100} 
                            className="h-2"
                          />
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                )}
                <Button 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={handleIntegrityCheck}
                >
                  Run Check
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Data</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input type="file" accept=".json" />
                      <Button className="w-full">Import</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline"
                  onClick={() => enhancedOfflineStorage.cleanup()}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Cleanup
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => performanceOptimizer.cleanup()}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Reset Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Offline Storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter test data to save offline..."
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                rows={4}
              />
              <Button onClick={handleTestStorage} disabled={!testData.trim()}>
                Save to Offline Storage
              </Button>
            </CardContent>
          </Card>

          {storageStats && (
            <Card>
              <CardHeader>
                <CardTitle>Storage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <span className="font-medium">{storageStats.totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Size:</span>
                      <span className="font-medium">{formatBytes(storageStats.totalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compressed Size:</span>
                      <span className="font-medium">{formatBytes(storageStats.compressedSize)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Compression Ratio:</span>
                      <span className="font-medium">
                        {(storageStats.compressionRatio * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unsynced Items:</span>
                      <span className="font-medium">{storageStats.unsyncedItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Update:</span>
                      <span className="font-medium">
                        {new Date(storageStats.newestItem).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                RefreshCwhronization Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {isOnline 
                      ? 'Connected to server. RefreshCw operations available.'
                      : 'Offline mode. Changes will sync when connection is restored.'
                    }
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={handleTestRefreshCw}
                    disabled={syncStatus === 'syncing'}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    {syncStatus === 'syncing' ? 'RefreshCwing...' : 'Test RefreshCw'}
                  </Button>
                  
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    RefreshCw Settings
                  </Button>
                </div>

                {syncStatus !== 'idle' && (
                  <Alert>
                    {syncStatus === 'success' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {syncStatus === 'success' 
                        ? 'RefreshCwhronization completed successfully'
                        : syncStatus === 'error'
                        ? 'RefreshCwhronization failed. Will retry automatically.'
                        : 'RefreshCwhronization in progress...'
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Integrity Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {integrityReport ? (
                <div className="space-y-4">
                  {Array.from(integrityReport.entries()).map(([storeName, report]) => (
                    <Card key={storeName}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>{storeName}</span>
                          <Badge 
                            variant={
                              report.overallStatus === 'healthy' ? 'default' :
                              report.overallStatus === 'degraded' ? 'secondary' : 'destructive'
                            }
                          >
                            {report.overallStatus}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-green-600">{report.passed}</div>
                            <div className="text-muted-foreground">Passed</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-yellow-600">{report.warnings}</div>
                            <div className="text-muted-foreground">Warnings</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-red-600">{report.failed}</div>
                            <div className="text-muted-foreground">Failed</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No integrity reports available. Click "Run Check" to generate reports.
                </div>
              )}
              
              <Button onClick={handleIntegrityCheck} className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Run Integrity Check
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownViewer 
                content={sampleMarkdown}
                showMetadata={true}
                showTOC={true}
                enableTableFeatures={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}