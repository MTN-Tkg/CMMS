import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  cacheHitRate: number;
  offlineOperations: number;
  syncQueueSize: number;
  lastUpdate: number;
}

export interface OptimizationConfig {
  enableVirtualization: boolean;
  enableLazyLoading: boolean;
  enableMemoization: boolean;
  enableDebouncing: boolean;
  debounceDelay: number;
  throttleDelay: number;
  maxCacheSize: number;
  preloadThreshold: number;
}

class PerformanceOptimizer {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    cacheHitRate: 0,
    offlineOperations: 0,
    syncQueueSize: 0,
    lastUpdate: Date.now()
  };

  private config: OptimizationConfig = {
    enableVirtualization: true,
    enableLazyLoading: true,
    enableMemoization: true,
    enableDebouncing: true,
    debounceDelay: 300,
    throttleDelay: 100,
    maxCacheSize: 1000,
    preloadThreshold: 0.8
  };

  private renderCache = new Map<string, any>();
  private componentMetrics = new Map<string, number[]>();
  private observers = new Set<IntersectionObserver>();

  // Performance monitoring
  startRenderMeasurement(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Store component render times
      if (!this.componentMetrics.has(componentName)) {
        this.componentMetrics.set(componentName, []);
      }
      
      const times = this.componentMetrics.get(componentName)!;
      times.push(renderTime);
      
      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift();
      }
      
      // Update global metrics
      this.metrics.renderTime = renderTime;
      this.metrics.lastUpdate = Date.now();
    };
  }

  // Memory usage monitoring
  getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.totalJSHeapSize;
    }
    return 0;
  }

  // Network latency measurement
  async measureNetworkLatency(url: string = '/api/ping'): Promise<number> {
    const startTime = performance.now();
    
    try {
      await fetch(url, { method: 'HEAD' });
      const latency = performance.now() - startTime;
      this.metrics.networkLatency = latency;
      return latency;
    } catch (error) {
      return -1; // Offline or error
    }
  }

  // Cache management
  setCacheItem(key: string, value: any, ttl: number = 300000): void {
    if (this.renderCache.size >= this.config.maxCacheSize) {
      // Remove oldest items
      const oldestKey = this.renderCache.keys().next().value;
      this.renderCache.delete(oldestKey);
    }
    
    this.renderCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  getCacheItem(key: string): any {
    const item = this.renderCache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.renderCache.delete(key);
      return null;
    }
    
    return item.value;
  }

  // Calculate cache hit rate
  updateCacheHitRate(hit: boolean): void {
    const currentRate = this.metrics.cacheHitRate;
    const newRate = hit ? currentRate + 0.1 : currentRate - 0.1;
    this.metrics.cacheHitRate = Math.max(0, Math.min(1, newRate));
  }

  // Component optimization utilities
  createOptimizedComponent<T>(
    component: React.ComponentType<T>,
    options: {
      memoize?: boolean;
      virtualizeThreshold?: number;
      lazyLoad?: boolean;
    } = {}
  ): React.ComponentType<T> {
    const { memoize = true, lazyLoad = false } = options;
    
    let OptimizedComponent = component;
    
    if (memoize && this.config.enableMemoization) {
      OptimizedComponent = React.memo(OptimizedComponent) as React.ComponentType<T>;
    }
    
    if (lazyLoad && this.config.enableLazyLoading) {
      OptimizedComponent = React.lazy(() => 
        Promise.resolve({ default: OptimizedComponent })
      ) as React.ComponentType<T>;
    }
    
    return OptimizedComponent;
  }

  // Debounced and throttled functions
  createDebouncedFunction<T extends (...args: any[]) => any>(
    func: T,
    delay?: number
  ): T {
    let timeoutId: NodeJS.Timeout;
    const debouncedFunc = ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay || this.config.debounceDelay);
    }) as T;
    return debouncedFunc;
  }

  createThrottledFunction<T extends (...args: any[]) => any>(
    func: T,
    delay?: number
  ): T {
    let lastCall = 0;
    const throttledFunc = ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= (delay || this.config.throttleDelay)) {
        lastCall = now;
        return func(...args);
      }
    }) as T;
    return throttledFunc;
  }

  // Intersection Observer for lazy loading
  createIntersectionObserver(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, {
      threshold: this.config.preloadThreshold,
      ...options
    });
    
    this.observers.add(observer);
    return observer;
  }

  // Virtual scrolling utilities
  calculateVirtualItems(
    totalItems: number,
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    overscan: number = 5
  ): { startIndex: number; endIndex: number; totalHeight: number } {
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(totalItems - 1, startIndex + visibleItems + overscan * 2);
    const totalHeight = totalItems * itemHeight;
    
    return { startIndex, endIndex, totalHeight };
  }

  // Performance metrics
  getMetrics(): PerformanceMetrics {
    this.metrics.memoryUsage = this.getMemoryUsage();
    return { ...this.metrics };
  }

  getComponentMetrics(componentName: string): {
    averageRenderTime: number;
    minRenderTime: number;
    maxRenderTime: number;
    totalRenders: number;
  } {
    const times = this.componentMetrics.get(componentName) || [];
    
    if (times.length === 0) {
      return {
        averageRenderTime: 0,
        minRenderTime: 0,
        maxRenderTime: 0,
        totalRenders: 0
      };
    }
    
    return {
      averageRenderTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minRenderTime: Math.min(...times),
      maxRenderTime: Math.max(...times),
      totalRenders: times.length
    };
  }

  // Configuration
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  // Cleanup
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.renderCache.clear();
    this.componentMetrics.clear();
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// React hooks for performance optimization
export function usePerformanceMonitor(componentName: string) {
  const endMeasurement = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    endMeasurement.current = performanceOptimizer.startRenderMeasurement(componentName);
    
    return () => {
      if (endMeasurement.current) {
        endMeasurement.current();
      }
    };
  });
  
  return performanceOptimizer.getComponentMetrics(componentName);
}

export function useOptimizedState<T>(
  initialValue: T,
  options: {
    debounce?: boolean;
    debounceDelay?: number;
    cache?: boolean;
    cacheKey?: string;
  } = {}
): [T, (value: T) => void] {
  const { debounce = false, debounceDelay = 300, cache = false, cacheKey } = options;
  
  // Try to get initial value from cache
  const cachedValue = cache && cacheKey ? performanceOptimizer.getCacheItem(cacheKey) : null;
  const [state, setState] = useState<T>(cachedValue || initialValue);
  
  const optimizedSetState = useMemo(() => {
    const setter = (value: T) => {
      setState(value);
      
      // Cache the value if caching is enabled
      if (cache && cacheKey) {
        performanceOptimizer.setCacheItem(cacheKey, value);
      }
    };
    
    return debounce 
      ? performanceOptimizer.createDebouncedFunction(setter, debounceDelay)
      : setter;
  }, [cache, cacheKey, debounce, debounceDelay]);
  
  return [state, optimizedSetState];
}

export function useVirtualList<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const virtualItems = useMemo(() => {
    return performanceOptimizer.calculateVirtualItems(
      items.length,
      containerHeight,
      itemHeight,
      scrollTop,
      overscan
    );
  }, [items.length, containerHeight, itemHeight, scrollTop, overscan]);
  
  const visibleItems = useMemo(() => {
    return items.slice(virtualItems.startIndex, virtualItems.endIndex + 1);
  }, [items, virtualItems.startIndex, virtualItems.endIndex]);
  
  const handleScroll = useCallback(
    performanceOptimizer.createThrottledFunction((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, 16), // ~60fps
    []
  );
  
  return {
    virtualItems,
    visibleItems,
    handleScroll,
    totalHeight: virtualItems.totalHeight,
    offsetY: virtualItems.startIndex * itemHeight
  };
}

export function useLazyLoading(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = performanceOptimizer.createIntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoaded) {
          setIsVisible(true);
          setIsLoaded(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [threshold, isLoaded]);
  
  return { elementRef, isVisible, isLoaded };
}

export function useOfflineOptimization() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const optimizedFetch = useCallback(async (url: string, options?: RequestInit) => {
    if (!isOnline) {
      // Queue the request for later
      setQueueSize(prev => prev + 1);
      throw new Error('Offline - request queued');
    }
    
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (!navigator.onLine) {
        setQueueSize(prev => prev + 1);
      }
      throw error;
    }
  }, [isOnline]);
  
  return {
    isOnline,
    queueSize,
    optimizedFetch
  };
}

// Performance monitoring hook
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceOptimizer.getMetrics());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Measure network latency periodically
    const measureLatency = async () => {
      await performanceOptimizer.measureNetworkLatency();
    };
    
    measureLatency();
    const interval = setInterval(measureLatency, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return metrics;
}

// Export utility functions
export const performanceUtils = {
  // Preload critical resources
  preloadResources: (urls: string[]) => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = url.endsWith('.js') ? 'script' : 
                url.endsWith('.css') ? 'style' : 'fetch';
      document.head.appendChild(link);
    });
  },

  // Optimize images
  optimizeImage: (src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}) => {
    const { width, height, quality = 80, format = 'webp' } = options;
    
    // This would typically integrate with an image optimization service
    let optimizedSrc = src;
    
    if (width || height) {
      optimizedSrc += `?w=${width || ''}&h=${height || ''}`;
    }
    
    optimizedSrc += `&q=${quality}&f=${format}`;
    
    return optimizedSrc;
  },

  // Bundle splitting helper
  loadChunk: async (chunkName: string) => {
    try {
      const module = await import(/* webpackChunkName: "[request]" */ `../chunks/${chunkName}`);
      return module.default;
    } catch (error) {
      console.error(`Failed to load chunk ${chunkName}:`, error);
      return null;
    }
  },

  // Service worker communication
  sendMessageToSW: (message: any) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }
};