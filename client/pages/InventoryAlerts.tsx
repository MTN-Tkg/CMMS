import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Download,
  Settings,
  ArrowLeft,
  Eye,
  ShoppingCart,
  Package,
  X,
  Star,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StockAlerts } from "@/components/inventory/StockAlerts";
import { useInventory } from "@/hooks/use-inventory";
import {
  AlertSeverity,
  AlertType,
  StockAlert,
} from "@shared/inventory-types";

export function InventoryAlerts() {
  const navigate = useNavigate();
  const {
    alerts,
    recommendations,
    isLoading,
    acknowledgeAlert,
    createPurchaseOrder,
    refreshData,
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<AlertType | "ALL">("ALL");
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter alerts based on search and filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = !searchTerm || 
        alert.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity = selectedSeverity === "ALL" || alert.severity === selectedSeverity;
      const matchesType = selectedType === "ALL" || alert.alertType === selectedType;
      const matchesAcknowledged = showAcknowledged || !alert.isAcknowledged;

      return matchesSearch && matchesSeverity && matchesType && matchesAcknowledged && alert.isActive;
    });
  }, [alerts, searchTerm, selectedSeverity, selectedType, showAcknowledged]);

  // Group alerts by severity for summary
  const alertSummary = useMemo(() => {
    const summary = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0,
      total: 0,
      unacknowledged: 0,
    };

    alerts.forEach(alert => {
      if (alert.isActive) {
        summary[alert.severity]++;
        summary.total++;
        if (!alert.isAcknowledged) {
          summary.unacknowledged++;
        }
      }
    });

    return summary;
  }, [alerts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBulkAcknowledge = async () => {
    const unacknowledgedAlerts = filteredAlerts.filter(alert => !alert.isAcknowledged);
    
    for (const alert of unacknowledgedAlerts) {
      await acknowledgeAlert(alert.id);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSeverity("ALL");
    setSelectedType("ALL");
    setShowAcknowledged(false);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">กำลังโหลดการแจ้งเตือน...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">การแจ้งเตือนสต็อก</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              จัดการและติดตามการแจ้งเตือนคลังอะไหล่
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
              ส่งออก
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              ตั้งค่า
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4">
          <Card 
            className={`metric-card cursor-pointer transition-all hover:scale-105 ${
              selectedSeverity === "ALL" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedSeverity("ALL")}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {alertSummary.total}
              </div>
              <div className="text-sm text-muted-foreground">ทั้งหมด</div>
            </CardContent>
          </Card>

          <Card 
            className={`metric-card cursor-pointer transition-all hover:scale-105 ${
              selectedSeverity === "CRITICAL" ? "ring-2 ring-destructive" : ""
            }`}
            onClick={() => setSelectedSeverity("CRITICAL")}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">
                {alertSummary.CRITICAL}
              </div>
              <div className="text-sm text-muted-foreground">วิกฤติ</div>
            </CardContent>
          </Card>

          <Card 
            className={`metric-card cursor-pointer transition-all hover:scale-105 ${
              selectedSeverity === "HIGH" ? "ring-2 ring-orange-500" : ""
            }`}
            onClick={() => setSelectedSeverity("HIGH")}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">
                {alertSummary.HIGH}
              </div>
              <div className="text-sm text-muted-foreground">สูง</div>
            </CardContent>
          </Card>

          <Card 
            className={`metric-card cursor-pointer transition-all hover:scale-105 ${
              selectedSeverity === "MEDIUM" ? "ring-2 ring-warning" : ""
            }`}
            onClick={() => setSelectedSeverity("MEDIUM")}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {alertSummary.MEDIUM}
              </div>
              <div className="text-sm text-muted-foreground">ปานกลาง</div>
            </CardContent>
          </Card>

          <Card 
            className={`metric-card cursor-pointer transition-all hover:scale-105 ${
              selectedSeverity === "LOW" ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedSeverity("LOW")}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">
                {alertSummary.LOW}
              </div>
              <div className="text-sm text-muted-foreground">ต่ำ</div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {alertSummary.unacknowledged}
              </div>
              <div className="text-sm text-muted-foreground">รอรับทราบ</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="card-elevated">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ค้นหาการแจ้งเตือน อะไหล่ หรือข้อความ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-0 shadow-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as AlertType | "ALL")}
                >
                  <SelectTrigger className="w-40 bg-background/50">
                    <SelectValue placeholder="ประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">ประเภททั้งหมด</SelectItem>
                    <SelectItem value="LOW_STOCK">สต็อกต่ำ</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">หมดสต็อก</SelectItem>
                    <SelectItem value="REORDER_POINT">จุดสั่งซื้อ</SelectItem>
                    <SelectItem value="EXPIRY_WARNING">ใกล้หมดอายุ</SelectItem>
                    <SelectItem value="OVERSTOCK">สต็อกเกิน</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showAcknowledged ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAcknowledged(!showAcknowledged)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  รับทราบแล้ว
                </Button>

                {(searchTerm || selectedSeverity !== "ALL" || selectedType !== "ALL" || showAcknowledged) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    ล้างตัวกรอง
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                แสดง {filteredAlerts.length} จาก {alertSummary.total} รายการ
              </p>
              {filteredAlerts.some(alert => !alert.isAcknowledged) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkAcknowledge}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  รับทราบทั้งหมด
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <StockAlerts
          alerts={filteredAlerts}
          recommendations={recommendations}
          onAcknowledgeAlert={acknowledgeAlert}
          onCreateOrder={createPurchaseOrder}
        />

        {/* Quick Actions */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>การดำเนินการด่วน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/parts">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <Package className="h-6 w-6" />
                  จัดการอะไหล่
                </Button>
              </Link>
              
              <Link to="/inventory/reorder">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  สั่งซื้ออะไหล่
                </Button>
              </Link>
              
              <Link to="/inventory/settings">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <Settings className="h-6 w-6" />
                  ตั้งค่าการแจ้งเตือน
                </Button>
              </Link>
              
              <Link to="/inventory/reports">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <TrendingDown className="h-6 w-6" />
                  รายงานสต็อก
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}