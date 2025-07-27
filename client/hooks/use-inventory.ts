import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Part,
  StockAlert,
  ReorderRecommendation,
  InventoryDashboardData,
  StockMovement,
  AlertConfiguration,
} from '@shared/inventory-types';
import { inventoryService } from '@shared/inventory-service';
import { toast } from 'sonner';

// Mock data for development - replace with actual API calls
const mockParts: Part[] = [
  {
    id: "PT-001",
    partNumber: "OF-4553",
    name: "ไส้กรองน้ำมันเครื่อง",
    category: "ไส้กรอง",
    subcategory: "ไส้กรองน้ำมัน",
    description: "ไส้กรองน้ำมันเครื่องสำหรับรถแทรกเตอร์ Kubota",
    brand: "Kubota",
    supplier: "บริษัท กูโบต้า จำกัด",
    supplierContact: "02-123-4567",
    stockQuantity: 8, // Low stock to trigger alert
    minStockLevel: 10,
    maxStockLevel: 50,
    reorderPoint: 15,
    safetyStock: 5,
    economicOrderQuantity: 25,
    unitPrice: 450,
    averageCost: 425,
    lastPurchasePrice: 445,
    currency: "บาท",
    unit: "ชิ้น",
    location: "A1-B2-C3",
    binLocation: "ชั้น 2, ช่อง 15",
    status: "สต็อกต่ำ",
    condition: "ใหม่",
    lastOrderDate: "15/12/2566",
    lastReceiveDate: "20/12/2566",
    lastUsageDate: "10/01/2567",
    leadTime: 7,
    usageFrequency: "สูง",
    monthlyUsage: 8,
    totalUsed: 45,
    totalValue: 3600,
    compatibleAssets: ["TRACT-001", "TRACT-002"],
    expiryDate: undefined,
    warranty: "6 เดือน",
    manufactureDate: "01/10/2566",
    image: "/placeholder.svg",
    tags: ["critical", "consumable", "filter"],
    specifications: {
      dimensions: "10x8x5 ซม.",
      weight: "250 กรัม",
      material: "กระดาษกรอง",
      efficiency: "99.5%",
    },
    alertsEnabled: true,
    customReorderPoint: undefined,
    seasonalFactors: undefined,
    criticality: "สูง",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    createdBy: "system",
    updatedBy: "admin",
  },
  {
    id: "PT-002",
    partNumber: "EO-1540",
    name: "น้ำมันเครื่อง 15W-40",
    category: "น้ำมัน",
    subcategory: "น้ำมันเครื่อง",
    description: "น้ำมันเครื่องสำหรับเครื่องยนต์ดีเซล",
    brand: "Shell",
    supplier: "บริษัท เชลล์ ไทยแลนด์ จำกัด",
    supplierContact: "02-234-5678",
    stockQuantity: 125,
    minStockLevel: 50,
    maxStockLevel: 200,
    reorderPoint: 75,
    safetyStock: 25,
    economicOrderQuantity: 100,
    unitPrice: 280,
    averageCost: 275,
    lastPurchasePrice: 285,
    currency: "บาท",
    unit: "ลิตร",
    location: "B2-C1-D4",
    binLocation: "ชั้น 1, ช่อง 8",
    status: "มีสต็อก",
    condition: "ใหม่",
    lastOrderDate: "20/12/2566",
    lastReceiveDate: "25/12/2566",
    lastUsageDate: "12/01/2567",
    leadTime: 3,
    usageFrequency: "สูงมาก",
    monthlyUsage: 35,
    totalUsed: 180,
    totalValue: 35000,
    compatibleAssets: ["TRACT-001", "TRACT-002", "HARV-003"],
    expiryDate: "15/12/2567",
    warranty: undefined,
    manufactureDate: "01/11/2566",
    image: "/placeholder.svg",
    tags: ["critical", "consumable", "lubricant"],
    specifications: {
      viscosity: "15W-40",
      type: "Mineral",
      capacity: "20 ลิตร/ถัง",
      standard: "API CF-4",
    },
    alertsEnabled: true,
    customReorderPoint: undefined,
    seasonalFactors: undefined,
    criticality: "สูง",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    createdBy: "system",
    updatedBy: "admin",
  },
  {
    id: "PT-003",
    partNumber: "BP-7832",
    name: "เข็มขัดลำเลียง",
    category: "อะไหล่เครื่องจักร",
    subcategory: "เข็มขัด",
    description: "เข็มขัดลำเลียงสำหรับเครื่องเก็บเกี่ยว",
    brand: "Gates",
    supplier: "บริษัท เกทส์ ไทยแลนด์ จำกัด",
    supplierContact: "02-345-6789",
    stockQuantity: 0, // Out of stock to trigger alert
    minStockLevel: 5,
    maxStockLevel: 15,
    reorderPoint: 8,
    safetyStock: 3,
    economicOrderQuantity: 10,
    unitPrice: 2500,
    averageCost: 2450,
    lastPurchasePrice: 2500,
    currency: "บาท",
    unit: "เส้น",
    location: "C1-D2-E1",
    binLocation: "ชั้น 3, ช่อง 5",
    status: "หมดสต็อก",
    condition: "ใหม่",
    lastOrderDate: "28/11/2566",
    lastReceiveDate: "05/12/2566",
    lastUsageDate: "08/01/2567",
    leadTime: 21,
    usageFrequency: "ต่ำ",
    monthlyUsage: 1,
    totalUsed: 3,
    totalValue: 0,
    compatibleAssets: ["HARV-003"],
    expiryDate: undefined,
    warranty: "24 เดือน",
    manufactureDate: "01/09/2566",
    image: "/placeholder.svg",
    tags: ["mechanical", "belt", "harvester"],
    specifications: {
      length: "2.5 เมตร",
      width: "15 ซม.",
      material: "ยางสังเคราะห์",
      strength: "500 N/mm",
    },
    alertsEnabled: true,
    customReorderPoint: undefined,
    seasonalFactors: undefined,
    criticality: "ปานกลาง",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    createdBy: "system",
    updatedBy: "admin",
  },
];

export function useInventory() {
  const [parts, setParts] = useState<Part[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
  const [dashboardData, setDashboardData] = useState<InventoryDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, this would be API calls
      // For now, we'll use mock data and generate alerts
      const partsData = mockParts;
      
      // Update part statuses based on current stock
      const updatedParts = partsData.map(part => ({
        ...part,
        status: inventoryService.calculateStockStatus(part),
        updatedAt: new Date().toISOString(),
      }));

      // Generate alerts for all parts
      const allAlerts = updatedParts.flatMap(part => 
        inventoryService.generateStockAlerts(part)
      );

      // Generate reorder recommendations
      const reorderRecs = inventoryService.generateReorderRecommendations(updatedParts);

      // Get dashboard data
      const dashboard = await inventoryService.getInventoryDashboard(updatedParts);

      setParts(updatedParts);
      setAlerts(allAlerts);
      setRecommendations(reorderRecs);
      setDashboardData(dashboard);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      toast.error('ไม่สามารถโหลดข้อมูลคลังอะไหล่ได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              isAcknowledged: true, 
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: 'current-user' // Replace with actual user
            }
          : alert
      ));
      
      toast.success('รับทราบการแจ้งเตือนแล้ว');
    } catch (err) {
      toast.error('ไม่สามารถรับทราบการแจ้งเตือนได้');
    }
  }, []);

  // Update stock quantity
  const updateStock = useCallback(async (partId: string, quantity: number, reason: string) => {
    try {
      const partIndex = parts.findIndex(p => p.id === partId);
      if (partIndex === -1) {
        throw new Error('ไม่พบอะไหล่');
      }

      const part = parts[partIndex];
      const movement: Omit<StockMovement, 'id' | 'balanceAfter' | 'performedAt'> = {
        partId,
        movementType: quantity > 0 ? 'RECEIPT' : 'ISSUE',
        quantity,
        reference: `ADJ-${Date.now()}`,
        reason,
        performedBy: 'current-user', // Replace with actual user
      };

      const stockMovement = inventoryService.processStockMovement(part, movement);
      
      // Update parts state
      const updatedParts = [...parts];
      updatedParts[partIndex] = part;
      setParts(updatedParts);

      // Regenerate alerts for the updated part
      const newAlerts = inventoryService.generateStockAlerts(part);
      setAlerts(prev => [
        ...prev.filter(a => a.partId !== partId),
        ...newAlerts
      ]);

      // Update dashboard data
      const dashboard = await inventoryService.getInventoryDashboard(updatedParts);
      setDashboardData(dashboard);

      toast.success(`ปรับสต็อก ${part.name} เรียบร้อยแล้ว`);
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถปรับสต็อกได้');
    }
  }, [parts]);

  // Create purchase order
  const createPurchaseOrder = useCallback(async (partId: string, quantity: number) => {
    try {
      const part = parts.find(p => p.id === partId);
      if (!part) {
        throw new Error('ไม่พบอะไหล่');
      }

      // In a real app, this would create a purchase order via API
      // For now, we'll just show a success message and update the part status
      const updatedParts = parts.map(p => 
        p.id === partId 
          ? { ...p, status: 'สั่งซื้อแล้ว' as const, updatedAt: new Date().toISOString() }
          : p
      );
      
      setParts(updatedParts);

      // Remove related alerts since we've taken action
      setAlerts(prev => prev.filter(a => a.partId !== partId));

      toast.success(`สร้างใบสั่งซื้อ ${part.name} จำนวน ${quantity} ${part.unit} เรียบร้อยแล้ว`);
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถสร้างใบสั่งซื้อได้');
    }
  }, [parts]);

  // Get filtered alerts
  const getFilteredAlerts = useCallback((filters: {
    severity?: string;
    type?: string;
    acknowledged?: boolean;
  }) => {
    return alerts.filter(alert => {
      if (filters.severity && filters.severity !== 'ALL' && alert.severity !== filters.severity) {
        return false;
      }
      if (filters.type && filters.type !== 'ALL' && alert.alertType !== filters.type) {
        return false;
      }
      if (filters.acknowledged !== undefined && alert.isAcknowledged !== filters.acknowledged) {
        return false;
      }
      return alert.isActive;
    });
  }, [alerts]);

  // Get critical alerts count
  const criticalAlertsCount = useMemo(() => {
    return alerts.filter(alert => 
      alert.isActive && !alert.isAcknowledged && alert.severity === 'CRITICAL'
    ).length;
  }, [alerts]);

  // Get parts needing reorder
  const partsNeedingReorder = useMemo(() => {
    return parts.filter(part => inventoryService.needsReorder(part));
  }, [parts]);

  return {
    // Data
    parts,
    alerts,
    recommendations,
    dashboardData,
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    loadInventoryData,
    acknowledgeAlert,
    updateStock,
    createPurchaseOrder,
    
    // Computed values
    criticalAlertsCount,
    partsNeedingReorder,
    getFilteredAlerts,
    
    // Utilities
    refreshData: loadInventoryData,
  };
}

// Hook for real-time alerts (would use WebSocket in production)
export function useRealTimeAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In a real app, this would establish a WebSocket connection
    // For now, we'll simulate real-time updates
    const interval = setInterval(() => {
      // Simulate receiving new alerts
      const mockAlert: StockAlert = {
        id: `alert-${Date.now()}`,
        partId: 'PT-001',
        partNumber: 'OF-4553',
        partName: 'ไส้กรองน้ำมันเครื่อง',
        alertType: 'LOW_STOCK',
        severity: 'HIGH',
        message: 'สต็อกต่ำกว่าเกณฑ์ที่กำหนด',
        currentStock: 5,
        threshold: 10,
        recommendedAction: 'สั่งซื้อเพิ่ม 25 ชิ้น',
        isActive: true,
        isAcknowledged: false,
        createdAt: new Date().toISOString(),
        escalationLevel: 0,
        notificationsSent: [],
      };

      // Only add if we don't already have recent alerts for this part
      setAlerts(prev => {
        const hasRecentAlert = prev.some(alert => 
          alert.partId === mockAlert.partId && 
          Date.now() - new Date(alert.createdAt).getTime() < 300000 // 5 minutes
        );
        
        if (hasRecentAlert) return prev;
        
        return [mockAlert, ...prev.slice(0, 9)]; // Keep only 10 most recent
      });
    }, 60000); // Check every minute

    setIsConnected(true);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  return {
    alerts,
    isConnected,
  };
}