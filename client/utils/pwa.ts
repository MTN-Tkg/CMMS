// PWA utility functions for service worker and offline functionality

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAInstallationState {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  promptEvent: BeforeInstallPromptEvent | null;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installationStateCallbacks: ((
    state: PWAInstallationState,
  ) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // Register service worker
    this.registerServiceWorker();

    // Listen for install prompt
    window.addEventListener(
      "beforeinstallprompt",
      this.handleBeforeInstallPrompt.bind(this),
    );

    // Listen for app installed
    window.addEventListener("appinstalled", this.handleAppInstalled.bind(this));

    // Check if running in standalone mode
    window.addEventListener(
      "DOMContentLoaded",
      this.checkStandaloneMode.bind(this),
    );
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("Service Worker registered successfully:", registration);

      // Handle service worker updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker installed, show update notification
              this.showUpdateNotification();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }

  private handleBeforeInstallPrompt(event: BeforeInstallPromptEvent) {
    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();

    // Save the event for later use
    this.deferredPrompt = event;

    // Notify listeners about install availability
    this.notifyInstallationStateChange();
  }

  private handleAppInstalled() {
    console.log("PWA was installed");
    this.deferredPrompt = null;
    this.notifyInstallationStateChange();
  }

  private checkStandaloneMode() {
    this.notifyInstallationStateChange();
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      await this.deferredPrompt.prompt();

      // Wait for the user's response
      const choiceResult = await this.deferredPrompt.userChoice;

      console.log("Install prompt result:", choiceResult.outcome);

      // Clean up the prompt
      this.deferredPrompt = null;
      this.notifyInstallationStateChange();

      return choiceResult.outcome === "accepted";
    } catch (error) {
      console.error("Install prompt failed:", error);
      return false;
    }
  }

  getInstallationState(): PWAInstallationState {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    return {
      canInstall: !!this.deferredPrompt,
      isInstalled: isStandalone,
      isStandalone,
      isIOS,
      isAndroid,
      promptEvent: this.deferredPrompt,
    };
  }

  onInstallationStateChange(callback: (state: PWAInstallationState) => void) {
    this.installationStateCallbacks.push(callback);

    // Call immediately with current state
    callback(this.getInstallationState());

    // Return unsubscribe function
    return () => {
      const index = this.installationStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.installationStateCallbacks.splice(index, 1);
      }
    };
  }

  private notifyInstallationStateChange() {
    const state = this.getInstallationState();
    this.installationStateCallbacks.forEach((callback) => callback(state));
  }

  private showUpdateNotification() {
    // Show a custom notification about available update
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("CMMS Mobile Pro - Update Available", {
        body: "A new version is available. Refresh to update.",
        icon: "/icon-192x192.png",
        tag: "app-update",
      });
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return "denied";
    }

    if (Notification.permission === "default") {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  async cacheResources(urls: string[]): Promise<void> {
    if (
      !("serviceWorker" in navigator) ||
      !navigator.serviceWorker.controller
    ) {
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: "CACHE_URLS",
      urls,
    });
  }

  async skipWaiting(): Promise<void> {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }

  async getServiceWorkerVersion(): Promise<string | null> {
    if (
      !("serviceWorker" in navigator) ||
      !navigator.serviceWorker.controller
    ) {
      return null;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();

      channel.port1.onmessage = (event) => {
        if (event.data && event.data.type === "VERSION") {
          resolve(event.data.version);
        } else {
          resolve(null);
        }
      };

      navigator.serviceWorker.controller.postMessage({ type: "GET_VERSION" }, [
        channel.port2,
      ]);
    });
  }
}

// Offline data management using IndexedDB
export class OfflineDataManager {
  private dbName = "CMM SOfflineDB";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for different data types
        const storeNames = [
          "work-orders",
          "assets",
          "parts",
          "users",
          "maintenance",
          "sync-queue",
        ];

        storeNames.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "id" });
            store.createIndex("timestamp", "timestamp", { unique: false });
            store.createIndex("synced", "synced", { unique: false });
          }
        });
      };
    });
  }

  async saveOfflineData(storeName: string, data: any): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      const dataWithMetadata = {
        ...data,
        timestamp: new Date().toISOString(),
        synced: false,
      };

      const request = store.put(dataWithMetadata);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getOfflineData(storeName: string): Promise<any[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteOfflineData(storeName: string, id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearOfflineData(storeName: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getUnsyncedData(storeName: string): Promise<any[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index("synced");
      const request = index.getAll(false);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async markAsSynced(storeName: string, id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve();
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}

// Network status monitoring
export class NetworkMonitor {
  private callbacks: ((isOnline: boolean) => void)[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  private handleOnline() {
    this.isOnline = true;
    this.notifyCallbacks();

    // Trigger background sync when coming back online
    if (
      "serviceWorker" in navigator &&
      "sync" in window.ServiceWorkerRegistration.prototype
    ) {
      navigator.serviceWorker.ready
        .then((registration) => {
          return registration.sync.register("background-sync-offline-data");
        })
        .catch((error) => {
          console.error("Background sync registration failed:", error);
        });
    }
  }

  private handleOffline() {
    this.isOnline = false;
    this.notifyCallbacks();
  }

  private notifyCallbacks() {
    this.callbacks.forEach((callback) => callback(this.isOnline));
  }

  getStatus(): boolean {
    return this.isOnline;
  }

  onStatusChange(callback: (isOnline: boolean) => void): () => void {
    this.callbacks.push(callback);

    // Call immediately with current status
    callback(this.isOnline);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
}

// Export singleton instances
export const pwaManager = new PWAManager();
export const offlineDataManager = new OfflineDataManager();
export const networkMonitor = new NetworkMonitor();

// Initialize offline data manager
offlineDataManager.init().catch((error) => {
  console.error("Failed to initialize offline data manager:", error);
});
