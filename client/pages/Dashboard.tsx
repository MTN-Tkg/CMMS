import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Wrench,
  QrCode,
  TrendingUp,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Timer,
  Activity,
  DollarSign,
  Settings,
  Bell,
  Package,
  ShoppingCart,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { StockAlerts } from "@/components/inventory/StockAlerts";
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const {
    dashboardData,
    alerts,
    recommendations,
    criticalAlertsCount,
    isLoading,
    acknowledgeAlert,
    createPurchaseOrder
  } = useInventory();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const metrics: Metric[] = [
    {
      title: "งานค้างส่ง",
      value: 12,
      change: "+3 จากเมื่อวาน",
      trend: "up",
      icon: AlertTriangle,
      color: "text-destructive",
      percentage: 75,
    },
    {
      title: "เสร็จวันนี้",
      value: 8,
      change: "+2 จากเมื่อวาน",
      trend: "up",
      icon: CheckCircle,
      color: "text-success",
      percentage: 85,
    },
    {
      title: "กำลังดำเนินการ",
      value: 15,
      change: "ไม่มีการเปลี่ยนแปลง",
      trend: "stable",
      icon: Clock,
      color: "text-warning",
      percentage: 60,
    },
    {
      title: "ช่างที่ใช้งานได้",
      value: 6,
      change: "พร้อมใช้งานทั้งหมด",
      trend: "stable",
      icon: Users,
      color: "text-primary",
      percentage: 100,
    },
  ];

  const performanceMetrics = [
    {
      title: "อัตราการเสร็จสิ้นตามกำหนด",
      value: "87%",
      target: "90%",
      icon: Target,
      color: "text-success",
    },
    {
      title: "เวลาเฉลี่ยในการซ่อม",
      value: "2.4 ชม.",
      target: "2.0 ชม.",
      icon: Timer,
      color: "text-warning",
    },
    {
      title: "ประสิทธิภาพอุปกรณ์",
      value: "94%",
      target: "95%",
      icon: Activity,
      color: "text-primary",
    },
    {
      title: "ค่าใช้จ่ายรายเดือน",
      value: "₿45K",
      target: "₿50K",
      icon: DollarSign,
      color: "text-success",
    },
  ];

  const recentWorkOrders = [
    {
      id: "WO-2024-001",
      title: "บำรุงรักษาเครื่องยนต์รถแทรกเตอร์",
      status: "กำลังดำเนินการ",
      priority: "สูง",
      assignee: "สมชาย รักงาน",
      dueDate: "15/01/2567",
      progress: 65,
      hoursSpent: 2.5,
      estimatedHours: 4,
    },
    {
      id: "WO-2024-002",
      title: "ตรวจสอบระบบน้ำ",
      status: "รอดำเนินการ",
      priority: "ปานกลาง",
      assignee: "สมหญิง ใจดี",
      dueDate: "16/01/2567",
      progress: 0,
      hoursSpent: 0,
      estimatedHours: 2,
    },
    {
      id: "WO-2024-003",
      title: "เปลี่ยนเข็มขัดเครื่องเก็บเกี่ยว",
      status: "เกินกำหนด",
      priority: "วิกฤติ",
      assignee: "สมศักดิ์ ช่างเก่ง",
      dueDate: "14/01/2567",
      progress: 90,
      hoursSpent: 5.5,
      estimatedHours: 6,
    },
  ];

  const activeAlerts = [
    {
      message: "มีงาน 3 รายการเกินกำหนดแล้ว",
      type: "error",
      time: "5 นาทีที่แล้ว",
    },
    {
      message: "อะไหล่หมดคลัง: ไ��้กรองน้ำมัน",
      type: "warning",
      time: "10 นาทีที่แล้ว",
    },
    { message: "ช่างสมใสเริ่มงานใหม่", type: "info", time: "15 นาทีที่แล้ว" },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "เสร็จสิ้น":
        return "default" as const;
      case "กำลังดำเนินการ":
        return "secondary" as const;
      case "เกินกำหนด":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "วิกฤติ":
        return "destructive" as const;
      case "สูง":
        return "default" as const;
      case "ปานกลาง":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header with Time */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              หน้าหลัก
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              ยินดีต้อนรับ! นี่คือภาพรวมการบำรุงรักษาของคุณ
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>

        {/* Inventory Alerts Banner */}
        {criticalAlertsCount > 0 && (
          <div className="card-elevated rounded-xl p-4 border-l-4 border-l-destructive bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-destructive mb-2">
                  การแจ้งเตือนสต็อกวิกฤติ
                </h3>
                <div className="space-y-1">
                  {alerts.filter(a => a.severity === 'CRITICAL' && !a.isAcknowledged).slice(0, 2).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-destructive">
                        {alert.partName}: {alert.message}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
                {criticalAlertsCount > 2 && (
                  <Link to="/inventory/alerts">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-auto p-0 text-xs text-destructive hover:text-destructive"
                    >
                      ดูทั้งหมด ({criticalAlertsCount} รายการ)
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Traditional Alert Banner */}
        {activeAlerts.length > 0 && (
          <div className="card-elevated rounded-xl p-4 border-l-4 border-l-warning bg-warning/5">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-warning mb-2">
                  การแจ้งเตือนทั่วไป
                </h3>
                <div className="space-y-1">
                  {activeAlerts.slice(0, 2).map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span
                        className={
                          alert.type === "error"
                            ? "text-destructive"
                            : alert.type === "warning"
                              ? "text-warning"
                              : "text-muted-foreground"
                        }
                      >
                        {alert.message}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {alert.time}
                      </span>
                    </div>
                  ))}
                </div>
                {activeAlerts.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-auto p-0 text-xs"
                  >
                    ดูทั้งหมด ({activeAlerts.length} รายการ)
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/qr-scanner" className="group">
            <div className="card-elevated rounded-xl p-4 h-24 flex flex-col items-center justify-center space-y-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <QrCode size={20} className="sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-medium">สแกน QR</span>
            </div>
          </Link>
          <Link to="/work-orders" className="group">
            <div className="card-elevated rounded-xl p-4 h-24 flex flex-col items-center justify-center space-y-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Wrench size={20} className="sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-medium">ใบสั่งงาน</span>
            </div>
          </Link>
          <Link to="/assets" className="group">
            <div className="card-elevated rounded-xl p-4 h-24 flex flex-col items-center justify-center space-y-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Settings size={20} className="sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-medium">อุปกรณ์</span>
            </div>
          </Link>
          <Link to="/schedule" className="group">
            <div className="card-elevated rounded-xl p-4 h-24 flex flex-col items-center justify-center space-y-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Calendar size={20} className="sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-medium">ตารางงาน</span>
            </div>
          </Link>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.title}
                className="metric-card rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </h3>
                  <div
                    className={`p-2 rounded-lg ${
                      metric.color === "text-destructive"
                        ? "bg-destructive/10"
                        : metric.color === "text-success"
                          ? "bg-success/10"
                          : metric.color === "text-warning"
                            ? "bg-warning/10"
                            : "bg-primary/10"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xl sm:text-2xl font-bold">
                    {metric.value}
                  </div>
                  {metric.percentage && (
                    <div className="space-y-1">
                      <Progress value={metric.percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {metric.percentage}% จากเป้าหมาย
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {metric.change}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance Metrics */}
        <div className="card-elevated rounded-xl">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold">
                ประสิทธิภาพการดำเนินงาน
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {performanceMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.title} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                      <span className="text-sm font-medium">
                        {metric.title}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">
                          {metric.value}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          เป้า: {metric.target}
                        </span>
                      </div>
                      <Progress
                        value={
                          metric.title.includes("อัตรา")
                            ? 87
                            : metric.title.includes("ประสิทธิภาพ")
                              ? 94
                              : metric.title.includes("เวลา")
                                ? 75
                                : 90
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Work Orders with Progress */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">
                ใบสั่งงานล่าสุด
              </h2>
              <Link to="/work-orders">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  ดูทั้งหมด
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            {recentWorkOrders.map((wo, index) => (
              <Link key={wo.id} to={`/work-orders/${wo.id}`}>
                <div
                  className={`group cursor-pointer p-4 rounded-lg border hover:border-primary/50 transition-all duration-200 ${
                    index === 0
                      ? "bg-gradient-to-r from-primary/5 to-transparent"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm sm:text-base truncate">
                            {wo.title}
                          </h4>
                          <Badge
                            variant={getPriorityVariant(wo.priority)}
                            className="text-xs"
                          >
                            {wo.priority}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {wo.id} • {wo.assignee}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            กำหนดเสร็จ: {wo.dueDate}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={getStatusVariant(wo.status)}
                        className="text-xs shrink-0"
                      >
                        {wo.status}
                      </Badge>
                    </div>

                    {/* Progress and Time Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          ความคืบหน้า
                        </span>
                        <span className="font-medium">{wo.progress}%</span>
                      </div>
                      <Progress value={wo.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>เวลาใช้: {wo.hoursSpent} ชม.</span>
                        <span>ประมาณการ: {wo.estimatedHours} ชม.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-elevated rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-medium">ประสิทธิภาพสัปดาห์นี้</h3>
                <p className="text-2xl font-bold text-success">+12%</p>
                <p className="text-xs text-muted-foreground">
                  เมื่อเทียบกับสัปดาห์ก่อน
                </p>
              </div>
            </div>
          </div>

          <div className="card-elevated rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-medium">เวลาเฉลี่ยต่องาน</h3>
                <p className="text-2xl font-bold text-warning">2.4 ชม.</p>
                <p className="text-xs text-muted-foreground">
                  ลดลง 0.3 ชม. จากเดือนก่อน
                </p>
              </div>
            </div>
          </div>

          <div className="card-elevated rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">ช่างที่มีภาระงานสูง</h3>
                <p className="text-2xl font-bold text-primary">2 คน</p>
                <p className="text-xs text-muted-foreground">
                  ควรปรับสมดุลภาระงาน
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Alerts Section */}
        {alerts.length > 0 && (
          <div className="card-elevated rounded-xl">
            <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-warning/5 to-transparent">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">
                  การแจ้งเตือนสต็อก
                </h2>
                <Link to="/inventory/alerts">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    ดูทั้งหมด
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <StockAlerts
                alerts={alerts.slice(0, 3)}
                recommendations={recommendations.slice(0, 3)}
                onAcknowledgeAlert={acknowledgeAlert}
                onCreateOrder={createPurchaseOrder}
              />
            </div>
          </div>
        )}

        {/* Reorder Recommendations */}
        {recommendations.length > 0 && (
          <div className="card-elevated rounded-xl">
            <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-transparent">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">
                  คำแนะนำการสั่งซื้อ
                </h2>
                <Link to="/inventory/reorder">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    ดูทั้งหมด
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-3">
              {recommendations.slice(0, 5).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{rec.partName}</h4>
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
                    <div className="text-xs text-muted-foreground">
                      {rec.partNumber} • สต็อก: {rec.currentStock} • แนะนำ: {rec.recommendedQuantity}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {rec.reasoning}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/parts/${rec.partId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => createPurchaseOrder(rec.partId, rec.recommendedQuantity)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      สั่งซื้อ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
