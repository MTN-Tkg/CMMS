/**
 * Inventory Management Service
 * Handles stock tracking, alerts, and reorder recommendations
 */

import {
  Part,
  StockAlert,
  StockMovement,
  ReorderRecommendation,
  InventoryAlert,
  AlertType,
  AlertSeverity,
  ReorderUrgency,
  MovementType,
  PartStatus,
  StockAnalytics,
  InventoryDashboardData,
  AlertConfiguration,
  NotificationChannel
} from './inventory-types';

export class InventoryService {
  private static instance: InventoryService;
  private alertConfigurations: Map<string, AlertConfiguration> = new Map();
  private activeAlerts: Map<string, StockAlert> = new Map();

  static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }
    return InventoryService.instance;
  }

  /**
   * Calculate stock status based on current levels
   */
  calculateStockStatus(part: Part): PartStatus {
    if (part.stockQuantity <= 0) {
      return 'หมดสต็อก';
    } else if (part.stockQuantity <= part.minStockLevel) {
      return 'สต็อกต่ำ';
    } else {
      return 'มีสต็อก';
    }
  }

  /**
   * Check if part needs reordering
   */
  needsReorder(part: Part): boolean {
    const effectiveReorderPoint = part.customReorderPoint || part.reorderPoint;
    return part.stockQuantity <= effectiveReorderPoint;
  }

  /**
   * Calculate recommended order quantity using EOQ formula
   */
  calculateEOQ(part: Part, annualDemand?: number): number {
    const demand = annualDemand || (part.monthlyUsage * 12);
    const orderingCost = 100; // Default ordering cost
    const holdingCostRate = 0.25; // 25% of unit cost
    const holdingCost = part.unitPrice * holdingCostRate;

    if (demand <= 0 || holdingCost <= 0) {
      return part.economicOrderQuantity || part.maxStockLevel - part.stockQuantity;
    }

    const eoq = Math.sqrt((2 * demand * orderingCost) / holdingCost);
    return Math.max(Math.round(eoq), part.minStockLevel);
  }

  /**
   * Generate stock alerts for a part
   */
  generateStockAlerts(part: Part): StockAlert[] {
    const alerts: StockAlert[] = [];
    const now = new Date().toISOString();

    // Low stock alert
    if (part.stockQuantity <= part.minStockLevel && part.stockQuantity > 0) {
      alerts.push({
        id: `alert-${part.id}-low-stock-${Date.now()}`,
        partId: part.id,
        partNumber: part.partNumber,
        partName: part.name,
        alertType: 'LOW_STOCK',
        severity: part.tags.includes('critical') ? 'CRITICAL' : 'HIGH',
        message: `อะไหล่ ${part.name} (${part.partNumber}) มีสต็อกต่ำ: ${part.stockQuantity} ${part.unit}`,
        currentStock: part.stockQuantity,
        threshold: part.minStockLevel,
        recommendedAction: `สั่งซื้อเพิ่ม ${this.calculateEOQ(part)} ${part.unit}`,
        isActive: true,
        isAcknowledged: false,
        createdAt: now,
        escalationLevel: 0,
        notificationsSent: []
      });
    }

    // Out of stock alert
    if (part.stockQuantity <= 0) {
      alerts.push({
        id: `alert-${part.id}-out-of-stock-${Date.now()}`,
        partId: part.id,
        partNumber: part.partNumber,
        partName: part.name,
        alertType: 'OUT_OF_STOCK',
        severity: 'CRITICAL',
        message: `อะไหล่ ${part.name} (${part.partNumber}) หมดสต็อก`,
        currentStock: part.stockQuantity,
        threshold: 0,
        recommendedAction: `สั่งซื้อด่วน ${this.calculateEOQ(part)} ${part.unit}`,
        isActive: true,
        isAcknowledged: false,
        createdAt: now,
        escalationLevel: 0,
        notificationsSent: []
      });
    }

    // Reorder point alert
    if (this.needsReorder(part)) {
      const effectiveReorderPoint = part.customReorderPoint || part.reorderPoint;
      alerts.push({
        id: `alert-${part.id}-reorder-${Date.now()}`,
        partId: part.id,
        partNumber: part.partNumber,
        partName: part.name,
        alertType: 'REORDER_POINT',
        severity: 'MEDIUM',
        message: `อะไหล่ ${part.name} (${part.partNumber}) ถึงจุดสั่งซื้อ`,
        currentStock: part.stockQuantity,
        threshold: effectiveReorderPoint,
        recommendedAction: `พิจารณาสั่งซื้อ ${this.calculateEOQ(part)} ${part.unit}`,
        isActive: true,
        isAcknowledged: false,
        createdAt: now,
        escalationLevel: 0,
        notificationsSent: []
      });
    }

    // Expiry warning
    if (part.expiryDate) {
      const expiryDate = new Date(part.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        alerts.push({
          id: `alert-${part.id}-expiry-${Date.now()}`,
          partId: part.id,
          partNumber: part.partNumber,
          partName: part.name,
          alertType: 'EXPIRY_WARNING',
          severity: daysUntilExpiry <= 7 ? 'HIGH' : 'MEDIUM',
          message: `อะไหล่ ${part.name} (${part.partNumber}) จะหมดอายุใน ${daysUntilExpiry} วัน`,
          currentStock: part.stockQuantity,
          threshold: daysUntilExpiry,
          recommendedAction: `ใช้อะไหล่ก่อนหมดอายุหรือจัดการสต็อกเก่า`,
          isActive: true,
          isAcknowledged: false,
          createdAt: now,
          escalationLevel: 0,
          notificationsSent: []
        });
      }
    }

    // Overstock alert
    if (part.stockQuantity > part.maxStockLevel * 1.2) {
      alerts.push({
        id: `alert-${part.id}-overstock-${Date.now()}`,
        partId: part.id,
        partNumber: part.partNumber,
        partName: part.name,
        alertType: 'OVERSTOCK',
        severity: 'LOW',
        message: `อะไหล่ ${part.name} (${part.partNumber}) มีสต็อกเกิน: ${part.stockQuantity} ${part.unit}`,
        currentStock: part.stockQuantity,
        threshold: part.maxStockLevel,
        recommendedAction: `พิจารณาลดการสั่งซื้อหรือใช้สต็อกที่มี`,
        isActive: true,
        isAcknowledged: false,
        createdAt: now,
        escalationLevel: 0,
        notificationsSent: []
      });
    }

    return alerts;
  }

  /**
   * Generate reorder recommendations
   */
  generateReorderRecommendations(parts: Part[]): ReorderRecommendation[] {
    const recommendations: ReorderRecommendation[] = [];
    const now = new Date().toISOString();

    parts.forEach(part => {
      if (this.needsReorder(part)) {
        const recommendedQty = this.calculateEOQ(part);
        const daysOfStock = part.monthlyUsage > 0 ? (part.stockQuantity / (part.monthlyUsage / 30)) : 0;
        const estimatedStockoutDate = daysOfStock > 0 
          ? new Date(Date.now() + (daysOfStock * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        let urgency: ReorderUrgency = 'LOW';
        if (part.stockQuantity <= 0) urgency = 'IMMEDIATE';
        else if (part.stockQuantity <= part.minStockLevel) urgency = 'HIGH';
        else if (daysOfStock <= 7) urgency = 'HIGH';
        else if (daysOfStock <= 14) urgency = 'MEDIUM';

        recommendations.push({
          id: `reorder-${part.id}-${Date.now()}`,
          partId: part.id,
          partNumber: part.partNumber,
          partName: part.name,
          currentStock: part.stockQuantity,
          reorderPoint: part.customReorderPoint || part.reorderPoint,
          recommendedQuantity: recommendedQty,
          urgency,
          estimatedStockoutDate: daysOfStock <= 30 ? estimatedStockoutDate : undefined,
          leadTime: part.leadTime,
          supplier: part.supplier,
          estimatedCost: recommendedQty * part.unitPrice,
          reasoning: this.generateReorderReasoning(part, daysOfStock, urgency),
          createdAt: now,
          status: 'PENDING'
        });
      }
    });

    return recommendations.sort((a, b) => {
      const urgencyOrder = { 'IMMEDIATE': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }

  /**
   * Generate reasoning for reorder recommendation
   */
  private generateReorderReasoning(part: Part, daysOfStock: number, urgency: ReorderUrgency): string {
    const reasons: string[] = [];

    if (part.stockQuantity <= 0) {
      reasons.push('สต็อกหมด');
    } else if (part.stockQuantity <= part.minStockLevel) {
      reasons.push('สต็อกต่ำกว่าระดับขั้นต่ำ');
    }

    if (daysOfStock <= 7) {
      reasons.push(`สต็อกเหลือ ${Math.round(daysOfStock)} วัน`);
    }

    if (part.tags.includes('critical')) {
      reasons.push('อะไหล่สำคัญ');
    }

    if (part.leadTime > 7) {
      reasons.push(`Lead time ยาว (${part.leadTime} วัน)`);
    }

    if (part.usageFrequency === 'สูงมาก' || part.usageFrequency === 'สูง') {
      reasons.push('ใช้งานบ่อย');
    }

    return reasons.join(', ') || 'ถึงจุดสั่งซื้อ';
  }

  /**
   * Process stock movement and update part
   */
  processStockMovement(part: Part, movement: Omit<StockMovement, 'id' | 'balanceAfter' | 'performedAt'>): StockMovement {
    const now = new Date().toISOString();
    const newBalance = part.stockQuantity + movement.quantity;
    
    const stockMovement: StockMovement = {
      ...movement,
      id: `movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      balanceAfter: newBalance,
      performedAt: now
    };

    // Update part stock quantity
    part.stockQuantity = newBalance;
    part.updatedAt = now;

    // Update status based on new stock level
    part.status = this.calculateStockStatus(part);

    return stockMovement;
  }

  /**
   * Calculate stock analytics for a part
   */
  calculateStockAnalytics(part: Part, movements: StockMovement[]): StockAnalytics {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Filter movements from last 30 days
    const recentMovements = movements.filter(m => 
      new Date(m.performedAt) >= thirtyDaysAgo && m.movementType === 'ISSUE'
    );

    const totalUsage = recentMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const averageUsage = totalUsage / 30; // Daily average
    
    // Calculate variance
    const dailyUsages = this.groupMovementsByDay(recentMovements);
    const usageVariance = this.calculateVariance(dailyUsages, averageUsage);
    
    // Stock turnover (annual)
    const annualUsage = averageUsage * 365;
    const averageInventory = (part.minStockLevel + part.maxStockLevel) / 2;
    const stockTurnover = averageInventory > 0 ? annualUsage / averageInventory : 0;
    
    // Days of stock
    const daysOfStock = averageUsage > 0 ? part.stockQuantity / averageUsage : 999;
    
    // Forecasted usage (next 30 days)
    const forecastedUsage = this.forecastUsage(part, recentMovements);
    
    // Recommended stock level
    const recommendedStock = Math.max(
      part.minStockLevel,
      Math.ceil(forecastedUsage * (part.leadTime / 30) * 1.2) // 20% safety factor
    );

    return {
      partId: part.id,
      period: '30d',
      averageUsage,
      usageVariance,
      stockTurnover,
      daysOfStock,
      forecastedUsage,
      recommendedStock,
      costAnalysis: {
        holdingCost: part.stockQuantity * part.unitPrice * 0.25 / 12, // Monthly holding cost
        orderingCost: 100, // Estimated ordering cost
        stockoutCost: this.calculateStockoutCost(part),
        totalCost: 0 // Will be calculated
      }
    };
  }

  /**
   * Group stock movements by day
   */
  private groupMovementsByDay(movements: StockMovement[]): number[] {
    const dailyUsage: { [key: string]: number } = {};
    
    movements.forEach(movement => {
      const date = movement.performedAt.split('T')[0];
      dailyUsage[date] = (dailyUsage[date] || 0) + Math.abs(movement.quantity);
    });

    return Object.values(dailyUsage);
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Forecast usage using simple moving average with trend
   */
  private forecastUsage(part: Part, recentMovements: StockMovement[]): number {
    if (recentMovements.length === 0) {
      return part.monthlyUsage;
    }

    // Simple moving average of last 7 days
    const last7Days = recentMovements.slice(-7);
    const avgLast7 = last7Days.reduce((sum, m) => sum + Math.abs(m.quantity), 0) / 7;
    
    // Apply seasonal factors if available
    const currentMonth = new Date().getMonth() + 1;
    const seasonalFactor = part.seasonalFactors?.find(sf => sf.month === currentMonth)?.factor || 1;
    
    return avgLast7 * 30 * seasonalFactor; // Convert to monthly forecast
  }

  /**
   * Calculate estimated stockout cost
   */
  private calculateStockoutCost(part: Part): number {
    // Simplified stockout cost calculation
    const criticalityMultiplier = part.tags.includes('critical') ? 5 : 1;
    const usageMultiplier = part.usageFrequency === 'สูงมาก' ? 3 : 
                           part.usageFrequency === 'สูง' ? 2 : 1;
    
    return part.unitPrice * criticalityMultiplier * usageMultiplier * 0.1;
  }

  /**
   * Get inventory dashboard data
   */
  async getInventoryDashboard(parts: Part[]): Promise<InventoryDashboardData> {
    const alerts = parts.flatMap(part => this.generateStockAlerts(part));
    const reorderRecommendations = this.generateReorderRecommendations(parts);
    
    const summary = {
      totalParts: parts.length,
      totalValue: parts.reduce((sum, part) => sum + part.totalValue, 0),
      lowStockCount: parts.filter(part => part.status === 'สต็อกต่ำ').length,
      outOfStockCount: parts.filter(part => part.status === 'หมดสต็อก').length,
      activeAlerts: alerts.filter(alert => alert.isActive).length,
      pendingOrders: reorderRecommendations.filter(rec => rec.status === 'PENDING').length
    };

    // Get top used parts (by monthly usage)
    const topUsedParts = [...parts]
      .sort((a, b) => b.monthlyUsage - a.monthlyUsage)
      .slice(0, 5);

    // Get critical parts that need attention
    const criticalParts = parts.filter(part => 
      part.tags.includes('critical') && 
      (part.status === 'สต็อกต่ำ' || part.status === 'หมดสต็อก')
    );

    return {
      summary,
      alerts: alerts.slice(0, 10), // Latest 10 alerts
      reorderRecommendations: reorderRecommendations.slice(0, 10),
      recentMovements: [], // Will be populated from actual data
      topUsedParts,
      criticalParts
    };
  }
}

// Export singleton instance
export const inventoryService = InventoryService.getInstance();