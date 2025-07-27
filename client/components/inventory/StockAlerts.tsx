import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  Bell,
  X,
  Eye,
  ShoppingCart,
  Package,
  Calendar,
  User,
  ExternalLink,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  StockAlert,
  AlertSeverity,
  AlertType,
  ReorderRecommendation,
} from "@shared/inventory-types";

interface StockAlertsProps {
  alerts: StockAlert[];
  recommendations: ReorderRecommendation[];
  onAcknowledgeAlert?: (alertId: string) => void;
  onCreateOrder?: (partId: string, quantity: number) => void;
  className?: string;
}

export function StockAlerts({
  alerts = [],
  recommendations = [],
  onAcknowledgeAlert,
  onCreateOrder,
  className = "",
}: StockAlertsProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<AlertType | "ALL">("ALL");
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [detailAlert, setDetailAlert] = useState<StockAlert | null>(null);

  // Filter alerts based on selected criteria
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const severityMatch = selectedSeverity === "ALL" || alert.severity === selectedSeverity;
      const typeMatch = selectedType === "ALL" || alert.alertType === selectedType;
      const acknowledgedMatch = showAcknowledged || !alert.isAcknowledged;
      
      return severityMatch && typeMatch && acknowledgedMatch && alert.isActive;
    });
  }, [alerts, selectedSeverity, selectedType, showAcknowledged]);

  // Group alerts by severity
  const alertsBySeverity = useMemo(() => {
    const groups = {
      CRITICAL: filteredAlerts.filter(a => a.severity === 'CRITICAL'),
      HIGH: filteredAlerts.filter(a => a.severity === 'HIGH'),
      MEDIUM: filteredAlerts.filter(a => a.severity === 'MEDIUM'),
      LOW: filteredAlerts.filter(a => a.severity === 'LOW'),
      INFO: filteredAlerts.filter(a => a.severity === 'INFO'),
    };
    return groups;
  }, [filteredAlerts]);

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-destructive text-destructive-foreground';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-warning text-warning-foreground';
      case 'LOW':
        return 'bg-blue-500 text-white';
      case 'INFO':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4" />;
      case 'HIGH':
        return <TrendingDown className="h-4 w-4" />;
      case 'MEDIUM':
        return <Clock className="h-4 w-4" />;
      case 'LOW':
        return <Bell className="h-4 w-4" />;
      case 'INFO':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeLabel = (type: AlertType) => {
    const labels: Record<AlertType, string> = {
      LOW_STOCK: 'สต็อกต่ำ',
      OUT_OF_STOCK: 'หมดสต็อก',
      REORDER_POINT: 'จุดสั่งซื้อ',
      EXPIRY_WARNING: 'ใกล้หมดอายุ',
      OVERSTOCK: 'สต็อกเกิน',
      USAGE_ANOMALY: 'การใช้ผิดปกติ',
      PRICE_CHANGE: 'ราคาเปลี่ยน',
      SUPPLIER_ISSUE: 'ปัญหาผู้จำหน่าย',
    };
    return labels[type] || type;
  };

  const handleAcknowledgeAlert = (alert: StockAlert) => {
    if (onAcknowledgeAlert) {
      onAcknowledgeAlert(alert.id);
      toast.success(`รับทราบการแจ้งเตือน: ${alert.partName}`);
    }
  };

  const handleCreateOrder = (alert: StockAlert) => {
    if (onCreateOrder) {
      // Extract recommended quantity from the recommendation message
      const recommendedQty = parseInt(alert.recommendedAction.match(/\d+/)?.[0] || '10');
      onCreateOrder(alert.partId, recommendedQty);
      toast.success(`สร้างใบสั่งซื้อสำหรับ ${alert.partName}`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Summary */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              การแจ้งเตือนสต็อก
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                รีเฟรช
              </Button>
              <Badge variant="secondary">
                {filteredAlerts.length} รายการ
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {Object.entries(alertsBySeverity).map(([severity, severityAlerts]) => (
              <div
                key={severity}
                className={`p-3 rounded-lg text-center cursor-pointer transition-all hover:scale-105 ${
                  selectedSeverity === severity ? 'ring-2 ring-primary' : ''
                } ${getSeverityColor(severity as AlertSeverity)}`}
                onClick={() => setSelectedSeverity(severity as AlertSeverity)}
              >
                <div className="text-lg font-bold">{severityAlerts.length}</div>
                <div className="text-xs opacity-90">
                  {severity === 'CRITICAL' ? 'วิกฤติ' :
                   severity === 'HIGH' ? 'สูง' :
                   severity === 'MEDIUM' ? 'ปานกลาง' :
                   severity === 'LOW' ? 'ต่ำ' : 'ข้อมูล'}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as AlertType | "ALL")}
              className="px-3 py-1 bg-background border rounded-md text-sm"
            >
              <option value="ALL">ประเภททั้งหมด</option>
              <option value="LOW_STOCK">สต็อกต่ำ</option>
              <option value="OUT_OF_STOCK">หมดสต็อก</option>
              <option value="REORDER_POINT">จุดสั่งซื้อ</option>
              <option value="EXPIRY_WARNING">ใกล้หมดอายุ</option>
              <option value="OVERSTOCK">สต็อกเกิน</option>
            </select>
            
            <Button
              variant={showAcknowledged ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAcknowledged(!showAcknowledged)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              แสดงที่รับทราบแล้ว
            </Button>

            {(selectedSeverity !== "ALL" || selectedType !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSeverity("ALL");
                  setSelectedType("ALL");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                ล้างตัวกรอง
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-2">ไม่มีการแจ้งเตือน</h3>
              <p className="text-muted-foreground">
                {alerts.length === 0 
                  ? "ไม่มีการแจ้งเตือนในขณะนี้" 
                  : "ไม่มีการแจ้งเตือนที่ตรงกับเงื่อนไขที่เลือก"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`card-elevated transition-all hover:shadow-lg ${
                alert.severity === 'CRITICAL' ? 'ring-2 ring-destructive/20' :
                alert.severity === 'HIGH' ? 'ring-2 ring-orange-200' : ''
              } ${
                alert.isAcknowledged ? 'opacity-75' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Alert Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm sm:text-base truncate">
                            {alert.partName}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {getAlertTypeLabel(alert.alertType)}
                          </Badge>
                          {alert.isAcknowledged && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              รับทราบแล้ว
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                          {alert.partNumber} • {formatTimeAgo(alert.createdAt)}
                        </p>
                        <p className="text-sm text-foreground">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>รายละเอียดการแจ้งเตือน</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">อะไหล่:</span>
                                <div className="font-medium">{alert.partName}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">รหัส:</span>
                                <div className="font-medium">{alert.partNumber}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">สต็อกปัจจุบัน:</span>
                                <div className="font-medium">{alert.currentStock}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">เกณฑ์:</span>
                                <div className="font-medium">{alert.threshold}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">ความรุนแรง:</span>
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-muted-foreground">สถานะ:</span>
                                <div className="font-medium">
                                  {alert.isAcknowledged ? 'รับทราบแล้ว' : 'รอรับทราบ'}
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">คำแนะนำ:</span>
                              <div className="font-medium mt-1">{alert.recommendedAction}</div>
                            </div>
                            <div className="flex gap-2">
                              <Link to={`/parts/${alert.partId}`}>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  ดูอะไหล่
                                </Button>
                              </Link>
                              {!alert.isAcknowledged && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAcknowledgeAlert(alert)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  รับทราบ
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {!alert.isAcknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledgeAlert(alert)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Stock Level Indicator */}
                  {(alert.alertType === 'LOW_STOCK' || alert.alertType === 'OUT_OF_STOCK') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>สต็อกปัจจุบัน: {alert.currentStock}</span>
                        <span className="text-muted-foreground">
                          เกณฑ์: {alert.threshold}
                        </span>
                      </div>
                      <Progress 
                        value={Math.max(0, (alert.currentStock / Math.max(alert.threshold * 2, 1)) * 100)} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Recommended Action */}
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm">
                      <span className="text-muted-foreground">คำแนะนำ: </span>
                      <span className="font-medium">{alert.recommendedAction}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Link to={`/parts/${alert.partId}`}>
                      <Button variant="outline" size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        ดูอะไหล่
                      </Button>
                    </Link>
                    
                    {(alert.alertType === 'LOW_STOCK' || alert.alertType === 'OUT_OF_STOCK' || alert.alertType === 'REORDER_POINT') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateOrder(alert)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        สั่งซื้อ
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reorder Recommendations */}
      {recommendations.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              คำแนะนำการสั่งซื้อ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{rec.partName}</div>
                    <div className="text-sm text-muted-foreground">
                      {rec.partNumber} • สต็อก: {rec.currentStock} • แนะนำ: {rec.recommendedQuantity}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {rec.reasoning}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCreateOrder?.(rec.partId, rec.recommendedQuantity)}
                    >
                      สั่งซื้อ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}