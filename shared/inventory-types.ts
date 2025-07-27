/**
 * Enhanced inventory management types for CMMS
 */

// Core inventory interfaces
export interface Part {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  brand: string;
  supplier: string;
  supplierContact?: string;
  
  // Stock information
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  safetyStock: number;
  economicOrderQuantity: number;
  
  // Pricing
  unitPrice: number;
  averageCost: number;
  lastPurchasePrice: number;
  currency: string;
  unit: string;
  
  // Location and status
  location: string;
  binLocation?: string;
  status: PartStatus;
  condition: PartCondition;
  
  // Dates and timing
  lastOrderDate?: string;
  lastReceiveDate?: string;
  lastUsageDate?: string;
  leadTime: number;
  
  // Usage patterns
  usageFrequency: UsageFrequency;
  monthlyUsage: number;
  totalUsed: number;
  totalValue: number;
  
  // Additional info
  compatibleAssets: string[];
  expiryDate?: string;
  warranty?: string;
  manufactureDate?: string;
  image?: string;
  tags: string[];
  specifications: Record<string, string>;
  
  // Enhanced tracking fields
  alertsEnabled: boolean;
  customReorderPoint?: number;
  seasonalFactors?: SeasonalFactor[];
  criticality: PartCriticality;
  
  // Audit fields
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface StockAlert {
  id: string;
  partId: string;
  partNumber: string;
  partName: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  currentStock: number;
  threshold: number;
  recommendedAction: string;
  isActive: boolean;
  isAcknowledged: boolean;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  escalationLevel: number;
  notificationsSent: NotificationLog[];
}

export interface StockMovement {
  id: string;
  partId: string;
  movementType: MovementType;
  quantity: number;
  balanceAfter: number;
  reference?: string;
  workOrderId?: string;
  purchaseOrderId?: string;
  reason: string;
  cost?: number;
  performedBy: string;
  performedAt: string;
  location?: string;
  notes?: string;
}

export interface ReorderRecommendation {
  id: string;
  partId: string;
  partNumber: string;
  partName: string;
  currentStock: number;
  reorderPoint: number;
  recommendedQuantity: number;
  urgency: ReorderUrgency;
  estimatedStockoutDate?: string;
  leadTime: number;
  supplier: string;
  estimatedCost: number;
  reasoning: string;
  createdAt: string;
  status: RecommendationStatus;
}

export interface InventoryAlert {
  id: string;
  type: InventoryAlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  partIds: string[];
  isGlobal: boolean;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  actionRequired: boolean;
  actionUrl?: string;
}

export interface SeasonalFactor {
  month: number;
  factor: number; // Multiplier for normal usage
  description?: string;
}

export interface NotificationLog {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  sentAt: string;
  status: NotificationStatus;
  retryCount: number;
}

// Enums and types
export type PartStatus = 'มีสต็อก' | 'สต็อกต่ำ' | 'หมดสต็อก' | 'สั่งซื้อแล้ว' | 'ระงับการใช้';

export type PartCondition = 'ใหม่' | 'ใช้แล้ว' | 'ซ่อมแซม' | 'เสื่อมสภาพ';

export type UsageFrequency = 'สูงมาก' | 'สูง' | 'ปานกลาง' | 'ต่ำ' | 'ไม่ค่อยใช้';

export type PartCriticality = 'วิกฤติ' | 'สูง' | 'ปานกลาง' | 'ต่ำ';

export type AlertType = 
  | 'LOW_STOCK' 
  | 'OUT_OF_STOCK' 
  | 'REORDER_POINT' 
  | 'EXPIRY_WARNING' 
  | 'OVERSTOCK' 
  | 'USAGE_ANOMALY'
  | 'PRICE_CHANGE'
  | 'SUPPLIER_ISSUE';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type MovementType = 
  | 'RECEIPT' 
  | 'ISSUE' 
  | 'ADJUSTMENT' 
  | 'TRANSFER' 
  | 'RETURN' 
  | 'SCRAP' 
  | 'CYCLE_COUNT';

export type ReorderUrgency = 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RecommendationStatus = 'PENDING' | 'APPROVED' | 'ORDERED' | 'REJECTED' | 'EXPIRED';

export type InventoryAlertType = 
  | 'STOCK_SHORTAGE' 
  | 'BULK_EXPIRY' 
  | 'SUPPLIER_DELAY' 
  | 'COST_INCREASE' 
  | 'SYSTEM_MAINTENANCE';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'WEBHOOK';

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED';

// Configuration interfaces
export interface AlertConfiguration {
  id: string;
  partId?: string; // null for global settings
  alertType: AlertType;
  isEnabled: boolean;
  threshold?: number;
  customMessage?: string;
  notificationChannels: NotificationChannel[];
  recipients: string[];
  escalationRules: EscalationRule[];
  cooldownPeriod: number; // minutes
  createdAt: string;
  updatedAt: string;
}

export interface EscalationRule {
  level: number;
  delayMinutes: number;
  recipients: string[];
  channels: NotificationChannel[];
  requiresAcknowledgment: boolean;
}

// Analytics interfaces
export interface StockAnalytics {
  partId: string;
  period: string;
  averageUsage: number;
  usageVariance: number;
  stockTurnover: number;
  daysOfStock: number;
  forecastedUsage: number;
  recommendedStock: number;
  costAnalysis: {
    holdingCost: number;
    orderingCost: number;
    stockoutCost: number;
    totalCost: number;
  };
}

// API response types
export interface InventoryDashboardData {
  summary: {
    totalParts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    activeAlerts: number;
    pendingOrders: number;
  };
  alerts: StockAlert[];
  reorderRecommendations: ReorderRecommendation[];
  recentMovements: StockMovement[];
  topUsedParts: Part[];
  criticalParts: Part[];
}

export interface AlertsResponse {
  alerts: StockAlert[];
  total: number;
  unacknowledged: number;
  critical: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}