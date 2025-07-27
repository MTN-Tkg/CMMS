import { useState, useEffect } from "react";
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
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Wrench,
  User,
  MapPin,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSupabaseData } from "@/hooks/use-supabase-data";

interface WorkOrderWithDetails {
  id: string;
  work_type: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  asset_id: string;
  location_id: string;
  system_id: string;
  assigned_to_user_id: string;
  requested_by_user_id: string;
  created_at: string;
  scheduled_date: string;
  completed_at: string;
  wo_number: string;
  estimated_hours: number;
  total_cost: number;
  labor_cost: number;
  parts_cost: number;
  // Related data
  asset?: any;
  location?: any;
  system?: any;
}

export function WorkOrders() {
  const { workOrders, assets, locations, systems, loading, error, refresh } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);

  // Combine work orders with related data
  const workOrdersWithDetails: WorkOrderWithDetails[] = workOrders.map(wo => ({
    ...wo,
    asset: assets.find(a => a.id === wo.asset_id),
    location: locations.find(l => l.id === wo.location_id),
    system: systems.find(s => s.id === wo.system_id),
  }));

  // Filter and sort work orders
  const filteredWorkOrders = workOrdersWithDetails
    .filter((wo) => {
      const matchesSearch = 
        wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.wo_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || wo.priority.toString() === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priority":
          return b.priority - a.priority;
        case "scheduled_date":
          return new Date(a.scheduled_date || 0).getTime() - new Date(b.scheduled_date || 0).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        default: // created_at
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
      case "เสร็จสิ้น":
        return <CheckCircle className="h-4 w-4" />;
      case "In Progress":
      case "กำลังดำเนินการ":
        return <Clock className="h-4 w-4" />;
      case "Overdue":
      case "เกินกำหนด":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "ไม่ระบุ";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = (wo: WorkOrderWithDetails) => {
    if (!wo.scheduled_date || wo.status === "Completed" || wo.status === "เสร็จสิ้น") {
      return false;
    }
    return new Date(wo.scheduled_date) < new Date();
  };

  const handleDelete = async (id: string) => {
    try {
      const { supabase } = await import("../../shared/supabase/client");
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await refresh();
      setDeleteDialogOpen(false);
      setSelectedWorkOrder(null);
    } catch (error) {
      console.error('Error deleting work order:', error);
    }
  };

  // Statistics
  const stats = {
    total: workOrders.length,
    pending: workOrders.filter(wo => wo.status === "Pending" || wo.status === "รอดำเนินการ").length,
    inProgress: workOrders.filter(wo => wo.status === "In Progress" || wo.status === "กำลังดำเนินการ").length,
    completed: workOrders.filter(wo => wo.status === "Completed" || wo.status === "เสร็จสิ้น").length,
    overdue: workOrdersWithDetails.filter(isOverdue).length,
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
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32" />
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
          <h1 className="text-xl sm:text-2xl font-bold">ใบสั่งงาน</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            จัดการและติดตามใบสั่งงานทั้งหมด
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
          <Link to="/work-orders/new">
            <Button size="sm" className="h-8">
              <Plus className="h-3 w-3 mr-1" />
              สร้างใบสั่งงาน
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ทั้งหมด</p>
                <p className="text-lg sm:text-xl font-bold">{stats.total}</p>
              </div>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">รอดำเนินการ</p>
                <p className="text-lg sm:text-xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Calendar className="h-4 w-4 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">กำลังดำเนินการ</p>
                <p className="text-lg sm:text-xl font-bold text-primary">{stats.inProgress}</p>
              </div>
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">เสร็จสิ้น</p>
                <p className="text-lg sm:text-xl font-bold text-success">{stats.completed}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">เกินกำหนด</p>
                <p className="text-lg sm:text-xl font-bold text-destructive">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-destructive" />
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
                placeholder="ค้นหาใบสั่งงาน..."
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
                  <SelectItem value="Pending">รอดำเนินการ</SelectItem>
                  <SelectItem value="In Progress">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="Completed">เสร็จสิ้น</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="ความสำคัญ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="4">วิกฤติ</SelectItem>
                  <SelectItem value="3">สูง</SelectItem>
                  <SelectItem value="2">ปานกลาง</SelectItem>
                  <SelectItem value="1">ต่ำ</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="เรียงตาม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">วันที่สร้าง</SelectItem>
                  <SelectItem value="scheduled_date">วันกำหนด</SelectItem>
                  <SelectItem value="priority">ความสำคัญ</SelectItem>
                  <SelectItem value="status">สถานะ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders List */}
      <div className="space-y-3">
        {filteredWorkOrders.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">ไม่พบใบสั่งงานที่ตรงกับเงื่อนไข</p>
            </CardContent>
          </Card>
        ) : (
          filteredWorkOrders.map((wo) => (
            <Card key={wo.id} className="card-elevated hover:shadow-lg transition-all duration-200 group">
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/work-orders/${wo.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                          {wo.title}
                        </h3>
                        <Badge
                          variant={getPriorityVariant(wo.priority)}
                          className="text-xs px-1.5 py-0 shrink-0"
                        >
                          {getPriorityText(wo.priority)}
                        </Badge>
                        {isOverdue(wo) && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0 shrink-0">
                            เกินกำหนด
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {wo.wo_number} • สร้างเมื่อ {formatDate(wo.created_at)}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getStatusVariant(wo.status)}
                        className="text-xs shrink-0 flex items-center gap-1"
                      >
                        {getStatusIcon(wo.status)}
                        {wo.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/work-orders/edit/${wo.id}`} className="flex items-center">
                              <Edit className="h-4 w-4 mr-2" />
                              แก้ไข
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedWorkOrder(wo.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            ลบ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <Link to={`/work-orders/${wo.id}`}>
                    {/* Description */}
                    {wo.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {wo.description}
                      </p>
                    )}

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {wo.asset && (
                        <div className="flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          <span>{wo.asset.id}</span>
                        </div>
                      )}
                      {wo.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{wo.location.name}</span>
                        </div>
                      )}
                      {wo.scheduled_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>กำหนด: {formatDate(wo.scheduled_date)}</span>
                        </div>
                      )}
                      {wo.estimated_hours > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{wo.estimated_hours} ชม.</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar for In Progress */}
                    {(wo.status === "In Progress" || wo.status === "กำลังดำเนินการ") && (
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: "50%" }} />
                      </div>
                    )}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบใบสั่งงาน</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบใบสั่งงานนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedWorkOrder && handleDelete(selectedWorkOrder)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
