import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Wrench,
  MapPin,
  Hash,
  Building,
} from "lucide-react";
import { useSupabaseData } from "@/hooks/use-supabase-data";

interface AssetWithDetails {
  id: string;
  equipment_type_id: string;
  system_id: string;
  serial_number: string;
  status: string;
  // Related data
  equipment_type?: any;
  system?: any;
  location?: any;
}

export function Assets() {
  const { 
    assets, 
    systems, 
    locations, 
    workOrders,
    loading, 
    error, 
    refresh 
  } = useSupabaseData();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [systemFilter, setSystemFilter] = useState("all");
  const [sortBy, setSortBy] = useState("id");

  // Get unique systems for filter
  const uniqueSystems = Array.from(new Set(assets.map(a => a.system_id)))
    .map(id => systems.find(s => s.id === id))
    .filter(Boolean);

  // Combine assets with related data
  const assetsWithDetails: AssetWithDetails[] = assets.map(asset => {
    const system = systems.find(s => s.id === asset.system_id);
    const location = system ? locations.find(l => l.id === system.location_id) : null;
    
    return {
      ...asset,
      system,
      location,
    };
  });

  // Filter and sort assets
  const filteredAssets = assetsWithDetails
    .filter((asset) => {
      const matchesSearch = 
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.system?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
      const matchesSystem = systemFilter === "all" || asset.system_id === systemFilter;
      
      return matchesSearch && matchesStatus && matchesSystem;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "status":
          return a.status.localeCompare(b.status);
        case "system":
          return (a.system?.name || "").localeCompare(b.system?.name || "");
        case "location":
          return (a.location?.name || "").localeCompare(b.location?.name || "");
        default: // id
          return a.id.localeCompare(b.id);
      }
    });

  // Get work order count for each asset
  const getWorkOrderCount = (assetId: string) => {
    return workOrders.filter(wo => wo.asset_id === assetId).length;
  };

  // Get active work orders for asset
  const getActiveWorkOrders = (assetId: string) => {
    return workOrders.filter(
      wo => wo.asset_id === assetId && 
      wo.status !== "Completed" && 
      wo.status !== "เสร็จสิ้น"
    ).length;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Working":
      case "ทำงาน":
        return <CheckCircle className="h-4 w-4" />;
      case "Faulty":
      case "เสีย":
        return <XCircle className="h-4 w-4" />;
      case "Maintenance":
      case "ซ่อมบำรุง":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Working":
      case "ทำงาน":
        return "default" as const;
      case "Faulty":
      case "เสีย":
        return "destructive" as const;
      case "Maintenance":
      case "ซ่อมบำรุง":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Working":
        return "ทำงาน";
      case "Faulty":
        return "เสีย";
      case "Maintenance":
        return "ซ่อมบำรุง";
      default:
        return status;
    }
  };

  // Statistics
  const stats = {
    total: assets.length,
    working: assets.filter(a => a.status === "Working").length,
    faulty: assets.filter(a => a.status === "Faulty").length,
    maintenance: assets.filter(a => a.status === "Maintenance").length,
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
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
    <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">อุปกรณ์</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            จัดการและติดตามอุปกรณ์ทั้งหมด
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="h-8 px-3"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            รีเฟรช
          </Button>
          <Link to="/assets/new">
            <Button size="sm" className="h-8">
              <Plus className="h-3 w-3 mr-1" />
              เพิ่มอุปกรณ์
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ทั้งหมด</p>
                <p className="text-lg sm:text-xl font-bold">{stats.total}</p>
              </div>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ทำงาน</p>
                <p className="text-lg sm:text-xl font-bold text-success">{stats.working}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">เสีย</p>
                <p className="text-lg sm:text-xl font-bold text-destructive">{stats.faulty}</p>
              </div>
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ซ่อมบำรุง</p>
                <p className="text-lg sm:text-xl font-bold text-warning">{stats.maintenance}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="card-elevated">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาอุปกรณ์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="Working">ทำงาน</SelectItem>
                  <SelectItem value="Faulty">เสีย</SelectItem>
                  <SelectItem value="Maintenance">ซ่อมบำรุง</SelectItem>
                </SelectContent>
              </Select>

              <Select value={systemFilter} onValueChange={setSystemFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="ระบบ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกระบบ</SelectItem>
                  {uniqueSystems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="เรียงตาม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">รหัส</SelectItem>
                  <SelectItem value="status">สถานะ</SelectItem>
                  <SelectItem value="system">ระบบ</SelectItem>
                  <SelectItem value="location">สถานที่</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAssets.length === 0 ? (
          <Card className="card-elevated col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข</p>
            </CardContent>
          </Card>
        ) : (
          filteredAssets.map((asset) => {
            const activeWO = getActiveWorkOrders(asset.id);
            const totalWO = getWorkOrderCount(asset.id);
            
            return (
              <Link key={asset.id} to={`/assets/${asset.id}`}>
                <Card className="card-elevated h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                          {asset.id}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          S/N: {asset.serial_number}
                        </p>
                      </div>
                      <Badge
                        variant={getStatusVariant(asset.status)}
                        className="text-xs shrink-0 flex items-center gap-1"
                      >
                        {getStatusIcon(asset.status)}
                        {getStatusText(asset.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* Asset Details */}
                    <div className="space-y-2 text-sm">
                      {asset.system && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building className="h-3 w-3" />
                          <span className="truncate">{asset.system.name}</span>
                        </div>
                      )}
                      {asset.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{asset.location.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Work Order Stats */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Wrench className="h-3 w-3 text-muted-foreground" />
                          <span>{totalWO} งานทั้งหมด</span>
                        </div>
                        {activeWO > 0 && (
                          <div className="flex items-center gap-1 text-warning">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{activeWO} กำลังดำเนินการ</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          // Navigate to create work order
                          window.location.href = `/work-orders/new?asset=${asset.id}`;
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        สร้างใบงาน
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/assets/${asset.id}/edit`;
                        }}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        แก้ไข
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
