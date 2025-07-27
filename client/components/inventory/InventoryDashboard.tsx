import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Download,
  Plus,
  Eye,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Part,
  StockAlert,
  ReorderRecommendation,
  InventoryDashboardData,
  StockMovement,
} from "@shared/inventory-types";
import { inventoryService } from "@shared/inventory-service";

interface InventoryDashboardProps {
  data: InventoryDashboardData;
  onRefresh?: () => void;
  className?: string;
}

export function InventoryDashboard({
  data,
  onRefresh,
  className = "",
}: InventoryDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate trends and insights
  const insights = useMemo(() => {
    const totalParts = data.summary.totalParts;
    const lowStockPercentage = (data.summary.lowStockCount / totalParts) * 100;
    const outOfStockPercentage = (data.summary.outOfStockCount / totalParts) * 100;
    const healthyStockPercentage = 100 - lowStockPercentage - outOfStockPercentage;

    return {
      lowStockPercentage,
      outOfStockPercentage,
      healthyStockPercentage,
      criticalIssues: data.summary.outOfStockCount + data.alerts.filter(a => a.severity === 'CRITICAL').length,
      needsAttention: data.summary.lowStockCount + data.alerts.filter(a => a.severity === 'HIGH').length,
    };
  }, [data]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `฿${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `฿${(amount / 1000).toFixed(1)}K`;
    }
    return `฿${amount.toLocaleString()}`;
  };

  const getHealthColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">แดชบอร์ดคลังอะไหล่</h2>
          <p className="text-muted-foreground">
            ภาพรวมสถานะสต็อกและการแจ้งเตือน
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">
              {data.summary.totalParts}
            </div>
            <div className="text-sm text-muted-foreground">รายการทั้งหมด</div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(data.summary.totalValue)}
            </div>
            <div className="text-sm text-muted-foreground">มูลค่ารวม</div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="text-2xl font-bold text-warning">
              {data.summary.lowStockCount}
            </div>
            <div className="text-sm text-muted-foreground">สต็อกต่ำ</div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-2xl font-bold text-destructive">
              {data.summary.outOfStockCount}
            </div>
            <div className="text-sm text-muted-foreground">หมดสต็อก</div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-500">
              {data.summary.activeAlerts}
            </div>
            <div className="text-sm text-muted-foreground">การแจ้งเตือน</div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {data.summary.pendingOrders}
            </div>
            <div className="text-sm text-muted-foreground">รอสั่งซื้อ</div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Health Overview */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            สุขภาพคลังอะไหล่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Health Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getHealthColor(insights.healthyStockPercentage)}`}>
                {insights.healthyStockPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">สุขภาพโดยรวม</div>
            </div>

            {/* Health Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  สต็อกปกติ
                </span>
                <span className="font-medium">{insights.healthyStockPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={insights.healthyStockPercentage} className="h-2" />

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  สต็อกต่ำ
                </span>
                <span className="font-medium">{insights.lowStockPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={insights.lowStockPercentage} className="h-2 bg-warning/20" />

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  หมดสต็อก
                </span>
                <span className="font-medium">{insights.outOfStockPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={insights.outOfStockPercentage} className="h-2 bg-destructive/20" />
            </div>

            {/* Action Items */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {insights.criticalIssues}
                </div>
                <div className="text-sm text-muted-foreground">ปัญหาวิกฤติ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {insights.needsAttention}
                </div>
                <div className="text-sm text-muted-foreground">ต้องดูแล</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {data.alerts.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                การแจ้งเตือนสำคัญ
              </CardTitle>
              <Link to="/inventory/alerts">
                <Button variant="outline" size="sm">
                  ดูทั้งหมด
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    alert.severity === 'CRITICAL' ? 'border-destructive/20 bg-destructive/5' :
                    alert.severity === 'HIGH' ? 'border-orange-200 bg-orange-50' :
                    'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'CRITICAL' ? 'bg-destructive text-destructive-foreground' :
                      alert.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                      'bg-warning text-warning-foreground'
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{alert.partName}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.message}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        alert.severity === 'CRITICAL' ? 'destructive' :
                        alert.severity === 'HIGH' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {alert.severity}
                    </Badge>
                    <Link to={`/parts/${alert.partId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reorder Recommendations */}
      {data.reorderRecommendations.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                คำแนะนำการสั่งซื้อ
              </CardTitle>
              <Link to="/inventory/reorder">
                <Button variant="outline" size="sm">
                  ดูทั้งหมด
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.reorderRecommendations.slice(0, 5).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{rec.partName}</div>
                      <Badge
                        variant={
                          rec.urgency === 'IMMEDIATE' ? 'destructive' :
                          rec.urgency === 'HIGH' ? 'default' :
                          rec.urgency === 'MEDIUM' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {rec.urgency === 'IMMEDIATE' ? 'ด่วนมาก' :
                         rec.urgency === 'HIGH' ? 'ด่วน' :
                         rec.urgency === 'MEDIUM' ? 'ปานกลาง' : 'ต่ำ'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {rec.partNumber} • สต็อก: {rec.currentStock} • แนะนำ: {rec.recommendedQuantity}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ราคาประมาณ: {formatCurrency(rec.estimatedCost)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/parts/${rec.partId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      สั่งซื้อ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Used Parts */}
      {data.topUsedParts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                อะไหล่ที่ใช้มากที่สุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topUsedParts.map((part, index) => (
                  <div key={part.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{part.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ใช้ {part.monthlyUsage} {part.unit}/เดือน
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {part.stockQuantity} {part.unit}
                      </div>
                      <div className={`text-sm ${
                        part.status === 'มีสต็อก' ? 'text-success' :
                        part.status === 'สต็อกต่ำ' ? 'text-warning' : 'text-destructive'
                      }`}>
                        {part.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Parts */}
          {data.criticalParts.length > 0 && (
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  อะไหล่สำคัญที่ต้องดูแล
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.criticalParts.map((part) => (
                    <div key={part.id} className="flex items-center justify-between p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
                      <div>
                        <div className="font-medium">{part.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {part.partNumber} • {part.stockQuantity} {part.unit}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          {part.status}
                        </Badge>
                        <Link to={`/parts/${part.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>การดำเนินการด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/parts/new">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Plus className="h-6 w-6" />
                เพิ่มอะไหล่ใหม่
              </Button>
            </Link>
            
            <Link to="/inventory/alerts">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <AlertTriangle className="h-6 w-6" />
                ดูการแจ้งเตือน
              </Button>
            </Link>
            
            <Link to="/inventory/reorder">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <ShoppingCart className="h-6 w-6" />
                จัดการการสั่งซื้อ
              </Button>
            </Link>
            
            <Link to="/inventory/reports">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <BarChart3 className="h-6 w-6" />
                รายงานสต็อก
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}