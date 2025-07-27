import { compress, decompress } from 'lz-string';
import Dexie, { Table } from 'dexie';

// Enhanced offline data interfaces
export interface OfflineDataItem {
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

export interface SyncConflict {
  id: string;
  localData: any;
  remoteData: any;
  localTimestamp: number;
  remoteTimestamp: number;
  conflictType: 'update' | 'delete' | 'create';
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: SyncConflict[];
  errors: string[];
}

export interface StorageStats {
  totalItems: number;
  totalSize: number;
  compressedSize: number;
  compressionRatio: number;
  unsyncedItems: number;
  oldestItem: number;
  newestItem: number;
}

// Enhanced IndexedDB database
class EnhancedOfflineDB extends Dexie {
  offlineData!: Table<OfflineDataItem>;
  syncQueue!: Table<{ id: string; operation: 'create' | 'update' | 'delete'; data: any; timestamp: number }>;
  conflicts!: Table<SyncConflict & { id: string; resolvedAt?: number }>;
  metadata!: Table<{ key: string; value: any; timestamp: number }>;

  constructor() {
    super('EnhancedOfflineDB');
    
    this.version(1).stores({
      offlineData: 'id, timestamp, lastModified, synced, syncAttempts, version, metadata.priority, metadata.expiresAt',
      syncQueue: '++id, operation, timestamp',
      conflicts: '++id, conflictType, localTimestamp, remoteTimestamp',
      metadata: 'key, timestamp'
    });
  }
}

export class EnhancedOfflineStorage {
  private db: EnhancedOfflineDB;
  private compressionThreshold: number = 1024; // Compress data larger than 1KB
  private maxSyncAttempts: number = 3;
  private syncCallbacks: ((result: SyncResult) => void)[] = [];
  private conflictResolvers: Map<string, (conflict: SyncConflict) => Promise<any>> = new Map();

  constructor() {
    this.db = new EnhancedOfflineDB();
    this.setupCleanupSchedule();
  }

  // Data compression utilities
  private compressData(data: any): { compressed: string; originalSize: number; compressedSize: number } {
    const jsonString = JSON.stringify(data);
    const originalSize = new Blob([jsonString]).size;
    
    if (originalSize < this.compressionThreshold) {
      return {
        compressed: jsonString,
        originalSize,
        compressedSize: originalSize
      };
    }

    const compressed = compress(jsonString);
    const compressedSize = new Blob([compressed]).size;
    
    return {
      compressed,
      originalSize,
      compressedSize
    };
  }

  private decompressData(compressedData: string, wasCompressed: boolean): any {
    if (!wasCompressed) {
      return JSON.parse(compressedData);
    }
    
    const decompressed = decompress(compressedData);
    return JSON.parse(decompressed || '{}');
  }

  // Checksum calculation for data integrity
  private calculateChecksum(data: any): string {
    const jsonString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Save data with compression and metadata
  async saveData(
    storeName: string,
    id: string,
    data: any,
    metadata?: OfflineDataItem['metadata']
  ): Promise<void> {
    const { compressed, originalSize, compressedSize } = this.compressData(data);
    const checksum = this.calculateChecksum(data);
    const now = Date.now();

    const item: OfflineDataItem = {
      id: `${storeName}:${id}`,
      data: compressed,
      timestamp: now,
      lastModified: now,
      synced: false,
      syncAttempts: 0,
      version: 1,
      checksum,
      compressed: compressedSize < originalSize,
      size: originalSize,
      metadata: {
        source: storeName,
        priority: 'medium',
        ...metadata
      }
    };

    await this.db.offlineData.put(item);
    
    // Add to sync queue
    await this.db.syncQueue.add({
      id: item.id,
      operation: 'create',
      data: data,
      timestamp: now
    });
  }

  // Get data with decompression
  async getData(storeName: string, id?: string): Promise<any[]> {
    const prefix = id ? `${storeName}:${id}` : `${storeName}:`;
    
    let items: OfflineDataItem[];
    if (id) {
      const item = await this.db.offlineData.get(prefix);
      items = item ? [item] : [];
    } else {
      items = await this.db.offlineData
        .where('id')
        .startsWith(prefix)
        .toArray();
    }

    return items.map(item => {
      const decompressed = this.decompressData(item.data, item.compressed);
      
      // Verify data integrity
      const currentChecksum = this.calculateChecksum(decompressed);
      if (currentChecksum !== item.checksum) {
        console.warn(`Data integrity check failed for ${item.id}`);
      }
      
      return {
        ...decompressed,
        _metadata: {
          id: item.id,
          timestamp: item.timestamp,
          lastModified: item.lastModified,
          synced: item.synced,
          version: item.version,
          size: item.size,
          compressed: item.compressed,
          ...item.metadata
        }
      };
    });
  }

  // Update existing data
  async updateData(
    storeName: string,
    id: string,
    updates: any,
    metadata?: Partial<OfflineDataItem['metadata']>
  ): Promise<void> {
    const fullId = `${storeName}:${id}`;
    const existing = await this.db.offlineData.get(fullId);
    
    if (!existing) {
      throw new Error(`Item ${fullId} not found`);
    }

    const existingData = this.decompressData(existing.data, existing.compressed);
    const updatedData = { ...existingData, ...updates };
    
    const { compressed, originalSize } = this.compressData(updatedData);
    const checksum = this.calculateChecksum(updatedData);
    const now = Date.now();

    await this.db.offlineData.update(fullId, {
      data: compressed,
      lastModified: now,
      synced: false,
      syncAttempts: 0,
      version: existing.version + 1,
      checksum,
      compressed: compressed.length < JSON.stringify(updatedData).length,
      size: originalSize,
      metadata: {
        ...existing.metadata,
        ...metadata
      }
    });

    // Add to sync queue
    await this.db.syncQueue.add({
      id: fullId,
      operation: 'update',
      data: updatedData,
      timestamp: now
    });
  }

  // Delete data
  async deleteData(storeName: string, id: string): Promise<void> {
    const fullId = `${storeName}:${id}`;
    const existing = await this.db.offlineData.get(fullId);
    
    if (existing) {
      await this.db.offlineData.delete(fullId);
      
      // Add to sync queue
      await this.db.syncQueue.add({
        id: fullId,
        operation: 'delete',
        data: null,
        timestamp: Date.now()
      });
    }
  }

  // Get unsynced data
  async getUnsyncedData(storeName?: string): Promise<any[]> {
    let items: OfflineDataItem[];
    
    if (storeName) {
      items = await this.db.offlineData
        .filter(item => !item.synced && item.id.startsWith(`${storeName}:`))
        .toArray();
    } else {
      items = await this.db.offlineData
        .filter(item => !item.synced)
        .toArray();
    }
    
    return items.map(item => ({
      id: item.id,
      data: this.decompressData(item.data, item.compressed),
      metadata: item.metadata,
      syncAttempts: item.syncAttempts,
      lastModified: item.lastModified
    }));
  }

  // Mark data as synced
  async markAsSynced(id: string, remoteVersion?: number): Promise<void> {
    await this.db.offlineData.update(id, {
      synced: true,
      syncAttempts: 0,
      version: remoteVersion || undefined
    });
  }

  // Comprehensive sync with conflict resolution
  async syncWithServer(
    apiEndpoint: string,
    options: {
      batchSize?: number;
      maxRetries?: number;
      conflictResolution?: 'local' | 'remote' | 'manual';
    } = {}
  ): Promise<SyncResult> {
    const { batchSize = 10, maxRetries = 3, conflictResolution = 'manual' } = options;
    
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      conflicts: [],
      errors: []
    };

    try {
      // Get unsynced items
      const unsyncedItems = await this.getUnsyncedData();
      
      // Process in batches
      for (let i = 0; i < unsyncedItems.length; i += batchSize) {
        const batch = unsyncedItems.slice(i, i + batchSize);
        
        for (const item of batch) {
          try {
            const syncSuccess = await this.syncSingleItem(item, apiEndpoint, conflictResolution);
            
            if (syncSuccess) {
              result.synced++;
            } else {
              result.failed++;
            }
          } catch (error) {
            result.failed++;
            result.errors.push(`Failed to sync ${item.id}: ${error.message}`);
            
            // Increment sync attempts
            await this.db.offlineData.update(item.id, {
              syncAttempts: item.syncAttempts + 1
            });
          }
        }
      }

      // Get conflicts
      result.conflicts = await this.db.conflicts.toArray();
      
      // Notify callbacks
      this.syncCallbacks.forEach(callback => callback(result));
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }

    return result;
  }

  // Sync single item with conflict detection
  private async syncSingleItem(
    item: any,
    apiEndpoint: string,
    conflictResolution: 'local' | 'remote' | 'manual'
  ): Promise<boolean> {
    try {
      const response = await fetch(`${apiEndpoint}/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'If-Match': item.metadata?.version?.toString() || '1'
        },
        body: JSON.stringify(item.data)
      });

      if (response.ok) {
        await this.markAsSynced(item.id);
        return true;
      }

      // Handle conflicts (409 status)
      if (response.status === 409) {
        const remoteData = await response.json();
        const conflict: SyncConflict = {
          id: item.id,
          localData: item.data,
          remoteData: remoteData,
          localTimestamp: item.lastModified,
          remoteTimestamp: remoteData.lastModified || Date.now(),
          conflictType: 'update'
        };

        await this.handleConflict(conflict, conflictResolution);
        return false;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      throw error;
    }
  }

  // Handle sync conflicts
  private async handleConflict(
    conflict: SyncConflict,
    resolution: 'local' | 'remote' | 'manual'
  ): Promise<void> {
    // Store conflict for manual resolution if needed
    await this.db.conflicts.add({
      ...conflict,
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    switch (resolution) {
      case 'local':
        // Keep local version, mark as synced
        await this.markAsSynced(conflict.id);
        break;
        
      case 'remote':
        // Accept remote version
        const [storeName, id] = conflict.id.split(':', 2);
        await this.saveData(storeName, id, conflict.remoteData);
        await this.markAsSynced(conflict.id);
        break;
        
      case 'manual':
        // Let user resolve manually
        const resolver = this.conflictResolvers.get(conflict.id);
        if (resolver) {
          try {
            const resolvedData = await resolver(conflict);
            const [storeName, id] = conflict.id.split(':', 2);
            await this.saveData(storeName, id, resolvedData);
            await this.markAsSynced(conflict.id);
          } catch (error) {
            console.error('Manual conflict resolution failed:', error);
          }
        }
        break;
    }
  }

  // Register conflict resolver
  registerConflictResolver(
    itemId: string,
    resolver: (conflict: SyncConflict) => Promise<any>
  ): void {
    this.conflictResolvers.set(itemId, resolver);
  }

  // Get storage statistics
  async getStorageStats(storeName?: string): Promise<StorageStats> {
    let query = this.db.offlineData.toCollection();
    
    if (storeName) {
      query = query.filter(item => item.id.startsWith(`${storeName}:`));
    }
    
    const items = await query.toArray();
    
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);
    const compressedSize = items.reduce((sum, item) => {
      return sum + (item.compressed ? new Blob([item.data]).size : item.size);
    }, 0);
    
    const timestamps = items.map(item => item.timestamp);
    
    return {
      totalItems: items.length,
      totalSize,
      compressedSize,
      compressionRatio: totalSize > 0 ? (totalSize - compressedSize) / totalSize : 0,
      unsyncedItems: items.filter(item => !item.synced).length,
      oldestItem: Math.min(...timestamps),
      newestItem: Math.max(...timestamps)
    };
  }

  // Clean up expired and old data
  async cleanup(options: {
    maxAge?: number; // milliseconds
    maxItems?: number;
    removeExpired?: boolean;
  } = {}): Promise<number> {
    const { maxAge = 30 * 24 * 60 * 60 * 1000, maxItems = 10000, removeExpired = true } = options;
    const now = Date.now();
    let deletedCount = 0;

    // Remove expired items
    if (removeExpired) {
      const expiredItems = await this.db.offlineData
        .where('metadata.expiresAt')
        .below(now)
        .toArray();
      
      for (const item of expiredItems) {
        await this.db.offlineData.delete(item.id);
        deletedCount++;
      }
    }

    // Remove old items if over limit
    const totalItems = await this.db.offlineData.count();
    if (totalItems > maxItems) {
      const oldItems = await this.db.offlineData
        .orderBy('timestamp')
        .limit(totalItems - maxItems)
        .toArray();
      
      for (const item of oldItems) {
        if (item.synced) { // Only delete synced items
          await this.db.offlineData.delete(item.id);
          deletedCount++;
        }
      }
    }

    // Remove very old items
    const cutoffTime = now - maxAge;
    const oldItems = await this.db.offlineData
      .where('timestamp')
      .below(cutoffTime)
      .and(item => item.synced)
      .toArray();
    
    for (const item of oldItems) {
      await this.db.offlineData.delete(item.id);
      deletedCount++;
    }

    return deletedCount;
  }

  // Setup automatic cleanup
  private setupCleanupSchedule(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanup().catch(error => {
        console.error('Automatic cleanup failed:', error);
      });
    }, 60 * 60 * 1000);
  }

  // Subscribe to sync events
  onSync(callback: (result: SyncResult) => void): () => void {
    this.syncCallbacks.push(callback);
    
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  // Export data for backup
  async exportData(storeName?: string): Promise<string> {
    const data = await this.getData(storeName || '');
    return JSON.stringify(data, null, 2);
  }

  // Import data from backup
  async importData(jsonData: string, storeName: string): Promise<number> {
    try {
      const data = JSON.parse(jsonData);
      let importedCount = 0;
      
      for (const item of data) {
        const { _metadata, ...itemData } = item;
        await this.saveData(storeName, _metadata?.id || `import_${Date.now()}_${importedCount}`, itemData);
        importedCount++;
      }
      
      return importedCount;
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export const enhancedOfflineStorage = new EnhancedOfflineStorage();

// Export utility functions
export const offlineStorageUtils = {
  // Calculate storage usage
  async getStorageUsage(): Promise<{ used: number; available: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const available = estimate.quota || 0;
      const percentage = available > 0 ? (used / available) * 100 : 0;
      
      return { used, available, percentage };
    }
    
    return { used: 0, available: 0, percentage: 0 };
  },

  // Format bytes to human readable
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Check if storage is available
  isStorageAvailable(): boolean {
    try {
      return 'indexedDB' in window && indexedDB !== null;
    } catch {
      return false;
    }
  }
};