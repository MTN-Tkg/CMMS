import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
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
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  TrendingDown,
  ShoppingCart,
  Eye,
  Hash,
} from "lucide-react";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { useInventory } from "@/hooks/use-inventory";

export function Parts() {
  const { 
    parts, 
    workOrders,
    loading, 
    error, 
    refresh 
  } = useSupabaseData();

  const {
    createPurchaseOrder
  } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Calculate usage for each part
  const getPartUsage = (partId: string) => {
    // In a real app, this would come from work_order_parts table
    return Math.floor(Math.random() * 10); // Mock data
  };

  // Filter and sort parts
  const filteredParts = parts
    .filter((part) => {
      const matchesSearch = 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStock = true;
      if (stockFilter === "low") {
        matchesStock = part.stock_quantity <= part.min_stock_level && part.stock_quantity > 0;
      } else if (stockFilter === "out") {
        matchesStock = part.stock_quantity === 0;
      } else if (stockFilter === "ok") {
        matchesStock = part.stock_quantity > part.min_stock_level;
      }
      
      return matchesSearch && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "stock":
          return a.stock_quantity - b.stock_quantity;
        case "usage":
          return getPartUsage(b.id) - getPartUsage(a.id);
        default: // name
          return a.name.localeCompare(b.name);
      }
    });

  const getStockStatus = (part: any) => {
    if (part.stock_quantity === 0) {
      return { 
        text: "หมดสต็อก", 
        variant: "destructive" as const, 
        icon: <XCircle className="h-3 w-3" />,
        color: "text-destructive"
      };
    } else if (part.stock_quantity <= part.min_stock_level) {
      return { 
        text: "สต็อกต่ำ", 
        variant: "secondary" as const, 
        icon: <AlertTriangle className="h-3 w-3" />,
        color: "text-warning"
      };
    }
    return { 
      text: "ปกติ", 
      variant: "default" as const, 
      icon: <CheckCircle className="h-3 w-3" />,
      color: "text-success"
    };
  };

  const getStockPercentage = (part: any) => {
    if (part.min_stock_level === 0) return 100;
    const percentage = (part.stock_quantity / (part.min_stock_level * 2)) * 100;
    return Math.min(percentage, 100);
  };

  // Statistics
  const stats = {
    total: parts.length,
    inStock: parts.filter(p => p.stock_quantity > p.min_stock_level).length,
    lowStock: parts.filter(p => p.stock_quantity <= p.min_stock_level && p.stock_quantity > 0).length,
    outOfStock: parts.filter(p => p.stock_quantity === 0).length,
    totalValue: parts.reduce((sum, p) => sum + (p.stock_quantity * 100), 0), // Mock price
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
          <h1 className="text-xl sm:text-2xl font-bold">คลังอะไหล่</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            จัดการและติดตามอะไหล่ทั้งหมด
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
          <Button size="sm" className="h-8">
            <Plus className="h-3 w-3 mr-1" />
            เพิ่มอะไหล่
          </Button>
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
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">สต็อกปกติ</p>
                <p className="text-lg sm:text-xl font-bold text-success">{stats.inStock}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">สต็อกต่ำ</p>
                <p className="text-lg sm:text-xl font-bold text-warning">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">หมดสต็อก</p>
                <p className="text-lg sm:text-xl font-bold text-destructive">{stats.outOfStock}</p>
              </div>
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner for Critical Stock */}
      {stats.outOfStock > 0 && (
        <Alert variant="destructive" className="border-l-4 border-l-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            มีอะไหล่หมดสต็อก {stats.outOfStock} รายการ ควรสั่งซื้อโดยด่วน!
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card className="card-elevated">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาอะไหล่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="สต็อก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="ok">ปกติ</SelectItem>
                  <SelectItem value="low">สต็อกต่ำ</SelectItem>
                  <SelectItem value="out">หมดสต็อก</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="เรียงตาม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">ชื่อ</SelectItem>
                  <SelectItem value="stock">จำนวน</SelectItem>
                  <SelectItem value="usage">การใช้งาน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredParts.length === 0 ? (
          <Card className="card-elevated col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">ไม่พบอะไหล่ที่ตรงกับเงื่อนไข</p>
            </CardContent>
          </Card>
        ) : (
          filteredParts.map((part) => {
            const stockStatus = getStockStatus(part);
            const stockPercentage = getStockPercentage(part);
            const usage = getPartUsage(part.id);
            
            return (
              <Link key={part.id} to={`/parts/${part.id}`}>
                <Card className="card-elevated h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                          {part.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          รหัส: {part.id}
                        </p>
                      </div>
                      <Badge
                        variant={stockStatus.variant}
                        className="text-xs shrink-0 flex items-center gap-1"
                      >
                        {stockStatus.icon}
                        {stockStatus.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* Stock Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">จำนวนคงเหลือ</span>
                        <span className={`font-bold ${stockStatus.color}`}>
                          {part.stock_quantity} ชิ้น
                        </span>
                      </div>
                      <Progress 
                        value={stockPercentage} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>ขั้นต่ำ: {part.min_stock_level} ชิ้น</span>
                        <span>ใช้ไป: {usage} ชิ้น/เดือน</span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-xs">
                        <TrendingDown className="h-3 w-3 text-muted-foreground" />
                        <span>คาดว่าจะหมดใน {Math.max(1, Math.floor(part.stock_quantity / (usage || 1)))} เดือน</span>
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
                          createPurchaseOrder(part.id, part.min_stock_level * 2 - part.stock_quantity);
                        }}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        สั่งซื้อ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        รายละเอียด
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
