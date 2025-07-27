import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Plus,
  Eye,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useInventory } from "@/hooks/use-inventory";
import { InventoryDashboard as InventoryDashboardComponent } from "@/components/inventory/InventoryDashboard";
import { toast } from "sonner";

export function InventoryDashboard() {
  const {
    parts,
    alerts,
    recommendations,
    dashboardData,
    isLoading,
    error,
    criticalAlertsCount,
    partsNeedingReorder,
    refreshData,
    acknowledgeAlert,
    createPurchaseOrder,
  } = useInventory();

  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'alerts' | 'reorder'>('dashboard');

  // Handle quick actions
  const handleQuickReorder = async (partId: string, quantity: number) => {
    try {
      await createPurchaseOrder(partId, quantity);
      toast.success('สร้างใบสั่งซื้อเรียบร้อยแล้ว');
    } catch (error) {
      toast.error('ไม่สามารถสร้างใบสั่งซื้อได้');
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      toast.success('รับทราบการแจ้งเตือนแล้ว');
    } catch (error) {
      toast.error('ไม่สามารถรับทราบการแจ้งเตือนได้');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">จัดการคลังอะไหล่</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            ระบบจัดการสต็อกและการแจ้งเตือนอัตโนมัติ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="h-8 px-3"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            รีเฟรช
          </Button>
          <Link to="/parts/new">
            <Button size="sm" className="h-8">
              <Plus className="h-3 w-3 mr-1" />
              เพิ่มอะไหล่
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlertsCount > 0 && (
        <Alert variant="destructive" className="border-l-4 border-l-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">การแจ้งเตือนวิกฤติ</div>
            <div className="text-sm">
              มีการแจ้งเตือนสำคัญ {criticalAlertsCount} รายการ ที่ต้องดำเนินการด่วน
              <Link to="/inventory/alerts" className="ml-2 underline">
                ดูรายละเอียด
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setSelectedTab('dashboard')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
            selectedTab === 'dashboard'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          แดชบอร์ด
        </button>
        <button
          onClick={() => setSelectedTab('alerts')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all relative ${
            selectedTab === 'alerts'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <AlertTriangle className="h-4 w-4 inline mr-2" />
          การแจ้งเตือน
          {criticalAlertsCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
              {criticalAlertsCount}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setSelectedTab('reorder')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
            selectedTab === 'reorder'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingCart className="h-4 w-4 inline mr-2" />
          สั่งซื้อ
          {partsNeedingReorder.length > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
              {partsNeedingReorder.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'dashboard' && dashboardData && (
        <InventoryDashboardComponent
          data={dashboardData}
          onRefresh={refreshData}
        />
      )}

      {selectedTab === 'alerts' && (
        <div className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                การแจ้งเตือนสต็อก
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">ไม่มีการแจ้งเตือนในขณะนี้</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
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
                          {alert.alertType === 'OUT_OF_STOCK' ? (
                            <XCircle className="h-4 w-4" />
                          ) : alert.alertType === 'LOW_STOCK' ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{alert.partName}</div>
                          <div className="text-sm text-muted-foreground">
                            {alert.message}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {alert.recommendedAction}
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
                        <div className="flex gap-1">
                          <Link to={`/parts/${alert.partId}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {!alert.isAcknowledged && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                            >
                              รับทราบ
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'reorder' && (
        <div className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                คำแนะนำการสั่งซื้อ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">ไม่มีรายการที่ต้องสั่งซื้อในขณะนี้</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
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
                          ราคาประมาณ: ฿{rec.estimatedCost.toLocaleString()} • {rec.reasoning}
                        </div>
                        {rec.estimatedStockoutDate && (
                          <div className="text-xs text-destructive mt-1">
                            คาดว่าจะหมดในวันที่: {new Date(rec.estimatedStockoutDate).toLocaleDateString('th-TH')}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/parts/${rec.partId}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleQuickReorder(rec.partId, rec.recommendedQuantity)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          สั่งซื้อ
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">
              {parts.length}
            </div>
            <div className="text-sm text-muted-foreground">รายการทั้งหมด</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="text-2xl font-bold text-warning">
              {parts.filter(p => p.status === 'สต็อกต่ำ').length}
            </div>
            <div className="text-sm text-muted-foreground">สต็อกต่ำ</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-2xl font-bold text-destructive">
              {parts.filter(p => p.status === 'หมดสต็อก').length}
            </div>
            <div className="text-sm text-muted-foreground">หมดสต็อก</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div className="text-2xl font-bold text-success">
              ฿{parts.reduce((sum, p) => sum + p.totalValue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">มูลค่ารวม</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}