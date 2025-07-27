import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  QrCode,
  Activity,
  Settings,
  Package,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { useInventory } from "@/hooks/use-inventory";

interface Metric {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "stable";
  icon: any;
  color: string;
  percentage?: number;
}

export function Dashboard() {
  const {
    metrics,
    recentWorkOrders,
    criticalAlerts,
    loading,
    error,
    refresh
  } = useSupabaseData();

  const {
    criticalAlertsCount,
    partsNeedingReorder,
    dashboardData
  } = useInventory();

  // แสดงเฉพาะ metrics ที่สำคัญ
  const dashboardMetrics: Metric[] = [
    {
      title: "งานค้างส่ง",
      value: metrics.overdueWorkOrders,
      change: `จากทั้งหมด ${metrics.totalWorkOrders} งาน`,
      trend: metrics.overdueWorkOrders > 0 ? "up" : "stable",
      icon: AlertTriangle,
      color: "text-destructive",
      percentage: metrics.totalWorkOrders > 0 ? (metrics.overdueWorkOrders / metrics.totalWorkOrders) * 100 : 0,
    },
    {
      title: "กำลังดำเนินการ",
      value: metrics.inProgressWorkOrders,
      change: `${metrics.pendingWorkOrders} รอดำเนินการ`,
      trend: "stable",
      icon: Clock,
      color: "text-warning",
      percentage: metrics.totalWorkOrders > 0 ? (metrics.inProgressWorkOrders / metrics.totalWorkOrders) * 100 : 0,
    },
    {
      title: "อุปกรณ์เสีย",
      value: metrics.faultyAssets,
      change: `จากทั้งหมด ${metrics.totalAssets} เครื่อง`,
      trend: metrics.faultyAssets > 0 ? "down" : "stable",
      icon: AlertCircle,
      color: "text-destructive",
      percentage: metrics.totalAssets > 0 ? (metrics.faultyAssets / metrics.totalAssets) * 100 : 0,
    },
    {
      title: "อะไหล่ต่ำกว่าเกณฑ์",
      value: metrics.lowStockParts,
      change: `จากทั้งหมด ${metrics.totalParts} รายการ`,
      trend: metrics.lowStockParts > 0 ? "down" : "stable",
      icon: Package,
      color: "text-warning",
      percentage: metrics.totalParts > 0 ? (metrics.lowStockParts / metrics.totalParts) * 100 : 0,
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
      case "เสร็จสิ้น":
        return "default" as const;
      case "In Progress":
      case "กำลังดำเนินการ":
        return "secondary" as const;
      case "Overdue":
      case "เกินกำหนด":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getPriorityVariant = (priority: number) => {
    switch (priority) {
      case 4:
        return "destructive" as const;
      case 3:
        return "default" as const;
      case 2:
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 4:
        return "วิกฤติ";
      case 3:
        return "สูง";
      case 2:
        return "ปานกลาง";
      default:
        return "ต่ำ";
    }
  };

  const formatWorkOrderDate = (dateString: string) => {
    if (!dateString) return "ไม่ระบุ";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              หน้าหลัก CMMS
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              ระบบบริหารจัดการการบำรุงรักษา
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="h-8 px-3 self-end sm:self-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            รีเฟรช
          </Button>
        </div>

        {/* Critical Alerts Banner */}
        {(criticalAlerts.length > 0 || criticalAlertsCount > 0) && (
          <Alert variant="destructive" className="border-l-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">การแจ้งเตือนวิกฤติ</div>
              <div className="text-sm">
                {criticalAlerts.length > 0 && criticalAlerts[0].message}
                {criticalAlertsCount > 0 && (
                  <span className="block mt-1">
                    มีการแจ้งเตือนสต็อกวิกฤติ {criticalAlertsCount} รายการ
                    <Link to="/inventory/alerts" className="ml-2 underline">
                      ดูรายละเอียด
                    </Link>
                  </span>
                )}
                {criticalAlerts.length > 1 && (
                  <Link to="/notifications" className="ml-2 underline">
                    (+{criticalAlerts.length - 1} รายการ)
                  </Link>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Link to="/qr-scanner" className="group">
            <div className="card-elevated rounded-lg p-3 sm:p-4 h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 active:scale-95">
              <QrCode size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs font-medium">สแกน QR</span>
            </div>
          </Link>
          <Link to="/work-orders/new" className="group">
            <div className="card-elevated rounded-lg p-3 sm:p-4 h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 active:scale-95">
              <Wrench size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs font-medium">สร้างงาน</span>
            </div>
          </Link>
          <Link to="/assets" className="group">
            <div className="card-elevated rounded-lg p-3 sm:p-4 h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 active:scale-95">
              <Settings size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs font-medium">อุปกรณ์</span>
            </div>
          </Link>
          <Link to="/parts" className="group">
            <div className="card-elevated rounded-lg p-3 sm:p-4 h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 active:scale-95 relative">
              <Package size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs font-medium">อะไหล่</span>
              {criticalAlertsCount > 0 && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
              )}
            </div>
          </Link>
        </div>

        {/* Main Metrics Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {dashboardMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                  <span className="text-xs text-muted-foreground">
                    {metric.percentage?.toFixed(0)}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg sm:text-xl font-bold">
                    {metric.value}
                  </div>
                  <h3 className="text-xs font-medium text-muted-foreground">
                    {metric.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {metric.change}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Work Orders - Mobile Optimized */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">
                ใบสั่งงานที่ต้องดำเนินการ
              </CardTitle>
              <Link to="/work-orders">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  ดูทั้งหมด
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentWorkOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                ไม่มีใบสั่งงานที่ต้องดำเนินการ
              </p>
            ) : (
              recentWorkOrders
                .filter(wo => wo.status !== "Completed" && wo.status !== "เสร็จสิ้น")
                .slice(0, 5)
                .map((wo) => (
                  <Link key={wo.id} to={`/work-orders/${wo.id}`}>
                    <div className="p-3 rounded-lg border hover:border-primary/50 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {wo.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {wo.wo_number} • {formatWorkOrderDate(wo.scheduled_date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getPriorityVariant(wo.priority)}
                            className="text-xs"
                          >
                            {getPriorityText(wo.priority)}
                          </Badge>
                          <Badge
                            variant={getStatusVariant(wo.status)}
                            className="text-xs"
                          >
                            {wo.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
            )}
          </CardContent>
        </Card>

        {/* Summary Stats - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <div>
                <h3 className="font-medium text-sm">อัตราเสร็จสิ้น</h3>
                <p className="text-xl font-bold text-success">
                  {metrics.totalWorkOrders > 0 
                    ? ((metrics.completedWorkOrders / metrics.totalWorkOrders) * 100).toFixed(0)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.completedWorkOrders} จาก {metrics.totalWorkOrders} งาน
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">อุปกรณ์พร้อมใช้</h3>
                <p className="text-xl font-bold text-primary">
                  {metrics.totalAssets > 0 
                    ? ((metrics.workingAssets / metrics.totalAssets) * 100).toFixed(0)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.workingAssets} จาก {metrics.totalAssets} เครื่อง
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Package className="h-4 w-4 text-warning" />
              </div>
              <div>
                <h3 className="font-medium text-sm">สต็อกปกติ</h3>
                <p className="text-xl font-bold text-warning">
                  {metrics.totalParts > 0 
                    ? (((metrics.totalParts - metrics.lowStockParts - metrics.outOfStockParts) / metrics.totalParts) * 100).toFixed(0)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.lowStockParts} รายการต่ำกว่าเกณฑ์
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Inventory Quick Overview */}
        {dashboardData && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  ภาพรวมคลังอะไหล่
                </CardTitle>
                <Link to="/inventory">
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    ดูทั้งหมด
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {dashboardData.summary.totalParts}
                  </div>
                  <div className="text-xs text-muted-foreground">รายการทั้งหมด</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-warning">
                    {dashboardData.summary.lowStockCount}
                  </div>
                  <div className="text-xs text-muted-foreground">สต็อกต่ำ</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-destructive">
                    {dashboardData.summary.outOfStockCount}
                  </div>
                  <div className="text-xs text-muted-foreground">หมดสต็อก</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {dashboardData.summary.pendingOrders}
                  </div>
                  <div className="text-xs text-muted-foreground">รอสั่งซื้อ</div>
                </div>
              </div>
              
              {partsNeedingReorder.length > 0 && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium mb-2">อะไหล่ที่ต้องสั่งซื้อด่วน:</div>
                  <div className="space-y-1">
                    {partsNeedingReorder.slice(0, 3).map((part) => (
                      <div key={part.id} className="flex items-center justify-between text-xs">
                        <span className="truncate">{part.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {part.stockQuantity} {part.unit}
                        </span>
                      </div>
                    ))}
                    {partsNeedingReorder.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        และอีก {partsNeedingReorder.length - 3} รายการ
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
