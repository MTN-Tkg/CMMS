import { useState, useEffect, useCallback } from "react";
import { offlineDataManager, networkMonitor } from "@/utils/pwa";

export interface OfflineStorageOptions {
  autoSync?: boolean;
  syncOnMount?: boolean;
  storeName: string;
}

export interface OfflineStorageState<T> {
  data: T[];
  isLoading: boolean;
  isOnline: boolean;
  lastSync: Date | null;
  hasUnsyncedData: boolean;
  error: string | null;
}

export function useOfflineStorage<T extends { id: string }>(
  options: OfflineStorageOptions,
): {
  state: OfflineStorageState<T>;
  save: (item: T) => Promise<void>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  sync: () => Promise<void>;
  clear: () => Promise<void>;
  getUnsyncedData: () => Promise<T[]>;
} {
  const { storeName, autoSync = true, syncOnMount = true } = options;

  const [state, setState] = useState<OfflineStorageState<T>>({
    data: [],
    isLoading: true,
    isOnline: navigator.onLine,
    lastSync: null,
    hasUnsyncedData: false,
    error: null,
  });

  // Load data from offline storage
  const loadData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const offlineData = await offlineDataManager.getOfflineData(storeName);
      const unsyncedData = await offlineDataManager.getUnsyncedData(storeName);

      setState((prev) => ({
        ...prev,
        data: offlineData,
        hasUnsyncedData: unsyncedData.length > 0,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to load offline data:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to load data",
        isLoading: false,
      }));
    }
  }, [storeName]);

  // Save item to offline storage
  const save = useCallback(
    async (item: T) => {
      try {
        await offlineDataManager.saveOfflineData(storeName, item);
        await loadData();

        // If online and auto-sync enabled, try to sync immediately
        if (state.isOnline && autoSync) {
          await sync();
        }
      } catch (error) {
        console.error("Failed to save data:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to save data",
        }));
      }
    },
    [storeName, autoSync, state.isOnline, loadData],
  );

  // Update existing item
  const update = useCallback(
    async (id: string, updates: Partial<T>) => {
      try {
        // Get existing item
        const existingData = await offlineDataManager.getOfflineData(storeName);
        const existingItem = existingData.find((item: T) => item.id === id);

        if (existingItem) {
          const updatedItem = { ...existingItem, ...updates };
          await offlineDataManager.saveOfflineData(storeName, updatedItem);
          await loadData();

          if (state.isOnline && autoSync) {
            await sync();
          }
        }
      } catch (error) {
        console.error("Failed to update data:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to update data",
        }));
      }
    },
    [storeName, autoSync, state.isOnline, loadData],
  );

  // Remove item from offline storage
  const remove = useCallback(
    async (id: string) => {
      try {
        await offlineDataManager.deleteOfflineData(storeName, id);
        await loadData();

        if (state.isOnline && autoSync) {
          await sync();
        }
      } catch (error) {
        console.error("Failed to remove data:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to remove data",
        }));
      }
    },
    [storeName, autoSync, state.isOnline, loadData],
  );

  // Sync data with server
  const sync = useCallback(async () => {
    if (!state.isOnline) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, error: null }));

      // Get unsynced data
      const unsyncedData = await offlineDataManager.getUnsyncedData(storeName);

      // Sync each item
      for (const item of unsyncedData) {
        try {
          // Make API call to sync data
          const response = await fetch(`/api/${storeName}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          });

          if (response.ok) {
            // Mark as synced
            await offlineDataManager.markAsSynced(storeName, item.id);
          }
        } catch (error) {
          console.warn(`Failed to sync item ${item.id}:`, error);
        }
      }

      // Update state
      setState((prev) => ({
        ...prev,
        lastSync: new Date(),
        hasUnsyncedData: false,
      }));

      // Reload data
      await loadData();
    } catch (error) {
      console.error("Sync failed:", error);
      setState((prev) => ({
        ...prev,
        error: "Sync failed",
      }));
    }
  }, [storeName, state.isOnline, loadData]);

  // Clear all data
  const clear = useCallback(async () => {
    try {
      await offlineDataManager.clearOfflineData(storeName);
      await loadData();
    } catch (error) {
      console.error("Failed to clear data:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to clear data",
      }));
    }
  }, [storeName, loadData]);

  // Get unsynced data
  const getUnsyncedData = useCallback(async (): Promise<T[]> => {
    try {
      return await offlineDataManager.getUnsyncedData(storeName);
    } catch (error) {
      console.error("Failed to get unsynced data:", error);
      return [];
    }
  }, [storeName]);

  // Initialize and handle network changes
  useEffect(() => {
    // Load initial data
    loadData();

    // Listen for network changes
    const unsubscribe = networkMonitor.onStatusChange((isOnline) => {
      setState((prev) => ({ ...prev, isOnline }));

      // Auto-sync when coming back online
      if (isOnline && autoSync) {
        sync();
      }
    });

    return unsubscribe;
  }, [loadData, autoSync, sync]);

  // Auto-sync on mount if online
  useEffect(() => {
    if (syncOnMount && state.isOnline && autoSync) {
      sync();
    }
  }, [syncOnMount, state.isOnline, autoSync, sync]);

  return {
    state,
    save,
    update,
    remove,
    sync,
    clear,
    getUnsyncedData,
  };
}

// Hook for managing offline work orders
export function useOfflineWorkOrders() {
  return useOfflineStorage<{
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    assignee: string;
    createdDate: string;
    dueDate?: string;
  }>({
    storeName: "work-orders",
    autoSync: true,
    syncOnMount: true,
  });
}

// Hook for managing offline assets
export function useOfflineAssets() {
  return useOfflineStorage<{
    id: string;
    name: string;
    category: string;
    location: string;
    status: string;
    purchaseDate?: string;
    warranty?: string;
  }>({
    storeName: "assets",
    autoSync: true,
    syncOnMount: true,
  });
}

// Hook for managing offline parts
export function useOfflineParts() {
  return useOfflineStorage<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    unitPrice: number;
    supplier: string;
    location: string;
  }>({
    storeName: "parts",
    autoSync: true,
    syncOnMount: true,
  });
}

// Hook for managing offline maintenance records
export function useOfflineMaintenance() {
  return useOfflineStorage<{
    id: string;
    assetId: string;
    type: string;
    description: string;
    completedDate: string;
    technician: string;
    cost: number;
  }>({
    storeName: "maintenance",
    autoSync: true,
    syncOnMount: true,
  });
}

// Generic hook for sync status across all stores
export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    lastSync: null as Date | null,
    isSyncing: false,
    totalUnsynced: 0,
  });

  const checkUnsyncedData = useCallback(async () => {
    try {
      const stores = ["work-orders", "assets", "parts", "maintenance"];
      let totalUnsynced = 0;

      for (const store of stores) {
        const unsyncedData = await offlineDataManager.getUnsyncedData(store);
        totalUnsynced += unsyncedData.length;
      }

      setSyncStatus((prev) => ({ ...prev, totalUnsynced }));
    } catch (error) {
      console.error("Failed to check unsynced data:", error);
    }
  }, []);

  const syncAll = useCallback(async () => {
    if (!syncStatus.isOnline) {
      return;
    }

    setSyncStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      const stores = ["work-orders", "assets", "parts", "maintenance"];

      for (const store of stores) {
        const unsyncedData = await offlineDataManager.getUnsyncedData(store);

        for (const item of unsyncedData) {
          try {
            const response = await fetch(`/api/${store}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(item),
            });

            if (response.ok) {
              await offlineDataManager.markAsSynced(store, item.id);
            }
          } catch (error) {
            console.warn(`Failed to sync ${store} item ${item.id}:`, error);
          }
        }
      }

      setSyncStatus((prev) => ({
        ...prev,
        lastSync: new Date(),
        totalUnsynced: 0,
      }));
    } catch (error) {
      console.error("Global sync failed:", error);
    } finally {
      setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [syncStatus.isOnline]);

  useEffect(() => {
    // Check unsynced data on mount
    checkUnsyncedData();

    // Listen for network changes
    const unsubscribe = networkMonitor.onStatusChange((isOnline) => {
      setSyncStatus((prev) => ({ ...prev, isOnline }));

      // Auto-sync when coming back online
      if (isOnline) {
        syncAll();
      }
    });

    return unsubscribe;
  }, [checkUnsyncedData, syncAll]);

  return {
    ...syncStatus,
    syncAll,
    checkUnsyncedData,
  };
}
