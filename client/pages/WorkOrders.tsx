import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Filter,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  X,
  SlidersHorizontal,
  Download,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const workOrders = [
  {
    id: "WO-2024-001",
    title: "บำรุงรักษาเครื่องยนต์รถแทรกเตอร์",
    description: "ตรวจสอบบำรุงรักษาตามกำหนดสำหรับรถขุด CAT 320D",
    status: "กำลังดำเนินการ",
    priority: "สูง",
    assignee: "สมชาย รักงาน",
    asset: "CAT-320D-001",
    location: "ไร่ A",
    dueDate: "15/01/2567",
    estimatedHours: 4,
    type: "ป้องกัน",
    createdDate: "10/01/2567",
  },
  {
    id: "WO-2024-002",
    title: "ตรวจสอบระบบน้ำ",
    description: "ตรวจสอบปั๊มน้ำและวาล์วระบบน้ำประจำสัปดาห์",
    status: "รอดำเนินการ",
    priority: "ปานกลาง",
    assignee: "สมหญิง ใจดี",
    asset: "PUMP-IR-001",
    location: "จุดควบคุมน้ำ",
    dueDate: "16/01/2567",
    estimatedHours: 2,
    type: "ป้องกั���",
    createdDate: "11/01/2567",
  },
  {
    id: "WO-2024-003",
    title: "เปลี่ยนเข็มขัดเครื่องเก็บเกี่ยว",
    description: "เปลี่ยนเข็มขัดลำเลียงที่สึกหรอของเครื่องเก็บเกี่ยว",
    status: "เกินกำหนด",
    priority: "วิกฤติ",
    assignee: "สมศักดิ์ ช่างเก่ง",
    asset: "HARV-001",
    location: "โรงซ่อม",
    dueDate: "14/01/2567",
    estimatedHours: 6,
    type: "แก้ไข",
    createdDate: "09/01/2567",
  },
  {
    id: "WO-2024-004",
    title: "ปรับเทียบเครื่องใส่ปุ๋ย",
    description: "การปรับเทียบอุปกรณ์ใส่ปุ๋ยประจำปี",
    status: "เสร็จสิ้น",
    priority: "ต่ำ",
    assignee: "สมใส ขยันดี",
    asset: "FERT-SPR-001",
    location: "อู่เครื่องจักร",
    dueDate: "13/01/2567",
    estimatedHours: 3,
    type: "ป้องกัน",
    createdDate: "08/01/2567",
  },
  {
    id: "WO-2024-005",
    title: "ตรวจสอบระบบไฟฟ้า",
    description: "ตรวจสอบระบบไฟฟ้าและแบตเตอรี่รถแทรกเตอร์",
    status: "รอดำเนินการ",
    priority: "ปานกลาง",
    assignee: "สมคิด ช่วยงาน",
    asset: "TRAC-JD-001",
    location: "ไร่ B",
    dueDate: "18/01/2567",
    estimatedHours: 3,
    type: "ตรวจสอบ",
    createdDate: "12/01/2567",
  },
  {
    id: "WO-2024-006",
    title: "ซ่อมแซมระบบระบายน้ำ",
    description: "ซ่อมท่อรั่วและแก้ไขปัญหาการระบายน้ำ",
    status: "กำลังดำเนินการ",
    priority: "สูง",
    assignee: "สมบูรณ์ เก่งกาจ",
    asset: "DRAIN-SYS-001",
    location: "ไร่ C",
    dueDate: "17/01/2567",
    estimatedHours: 8,
    type: "แก้ไข",
    createdDate: "13/01/2567",
  },
];

interface FilterState {
  status: string;
  priority: string;
  assignee: string;
  type: string;
  location: string;
  dateRange: string;
}

export function WorkOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    status: "All",
    priority: "All",
    assignee: "All",
    type: "All",
    location: "All",
    dateRange: "All",
  });
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get unique values for filter options
  const statusOptions = [
    "All",
    ...Array.from(new Set(workOrders.map((wo) => wo.status))),
  ];
  const priorityOptions = [
    "All",
    ...Array.from(new Set(workOrders.map((wo) => wo.priority))),
  ];
  const assigneeOptions = [
    "All",
    ...Array.from(new Set(workOrders.map((wo) => wo.assignee))),
  ];
  const typeOptions = [
    "All",
    ...Array.from(new Set(workOrders.map((wo) => wo.type))),
  ];
  const locationOptions = [
    "All",
    ...Array.from(new Set(workOrders.map((wo) => wo.location))),
  ];

  const filteredWorkOrders = workOrders
    .filter((wo) => {
      const matchesSearch =
        wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "All" || wo.status === filters.status;
      const matchesPriority =
        filters.priority === "All" || wo.priority === filters.priority;
      const matchesAssignee =
        filters.assignee === "All" || wo.assignee === filters.assignee;
      const matchesType = filters.type === "All" || wo.type === filters.type;
      const matchesLocation =
        filters.location === "All" || wo.location === filters.location;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesAssignee &&
        matchesType &&
        matchesLocation
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "dueDate":
          comparison =
            new Date(a.dueDate.split("/").reverse().join("-")).getTime() -
            new Date(b.dueDate.split("/").reverse().join("-")).getTime();
          break;
        case "priority":
          const priorityOrder = { วิกฤติ: 4, สูง: 3, ปานกลาง: 2, ต่ำ: 1 };
          comparison =
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status, "th");
          break;
        case "title":
          comparison = a.title.localeCompare(b.title, "th");
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "เสร็จสิ้น":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "กำลังดำเนินการ":
        return <Clock className="h-4 w-4 text-warning" />;
      case "เกินกำหนด":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

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

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: "All",
      priority: "All",
      assignee: "All",
      type: "All",
      location: "All",
      dateRange: "All",
    });
    setSearchTerm("");
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "All",
  ).length;

  const getStatusCounts = () => {
    const counts = workOrders.reduce(
      (acc, wo) => {
        acc[wo.status] = (acc[wo.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">ใบสั่งงาน</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              จัดการและติดตามงานบำรุงรักษา ({filteredWorkOrders.length} รายการ)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              ส่งออก
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </Button>
            <Link to="/work-orders/new">
              <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                สร้างใบสั่งงานใหม่
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              status: "รอดำเนินการ",
              count: statusCounts["รอดำเนินการ"] || 0,
              color: "bg-slate-100 text-slate-700",
            },
            {
              status: "กำลังดำเนินการ",
              count: statusCounts["กำลังดำเนิ��การ"] || 0,
              color: "bg-warning/10 text-warning",
            },
            {
              status: "เสร็จสิ้น",
              count: statusCounts["เสร็จสิ้น"] || 0,
              color: "bg-success/10 text-success",
            },
            {
              status: "เกินกำหนด",
              count: statusCounts["เกินกำหนด"] || 0,
              color: "bg-destructive/10 text-destructive",
            },
          ].map((item) => (
            <div
              key={item.status}
              className={`card-elevated rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-105 ${
                filters.status === item.status ? "ring-2 ring-primary" : ""
              }`}
              onClick={() =>
                updateFilter(
                  "status",
                  filters.status === item.status ? "All" : item.status,
                )
              }
            >
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.count}
              </div>
              <div className="text-sm text-muted-foreground">{item.status}</div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="card-elevated rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ค้นหาใบสั่งงาน ผู้รับผิดชอบ อุปกรณ์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-0 shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background/50 relative"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    ตัวกรอง
                    {activeFilterCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                      >
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">ตัวกรองขั้นสูง</h4>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          ล้างทั้งหมด
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-xs">สถานะ</Label>
                        <Select
                          value={filters.status}
                          onValueChange={(value) =>
                            updateFilter("status", value)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status === "All" ? "ทั้งหมด" : status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">ควา��สำคัญ</Label>
                        <Select
                          value={filters.priority}
                          onValueChange={(value) =>
                            updateFilter("priority", value)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {priority === "All" ? "ทั้งหมด" : priority}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">ผู้รับผิดชอบ</Label>
                        <Select
                          value={filters.assignee}
                          onValueChange={(value) =>
                            updateFilter("assignee", value)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {assigneeOptions.map((assignee) => (
                              <SelectItem key={assignee} value={assignee}>
                                {assignee === "All" ? "ทั้งหมด" : assignee}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">ประเภทงาน</Label>
                        <Select
                          value={filters.type}
                          onValueChange={(value) => updateFilter("type", value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {typeOptions.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type === "All" ? "ทั้งหมด" : type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">สถานที่</Label>
                        <Select
                          value={filters.location}
                          onValueChange={(value) =>
                            updateFilter("location", value)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {locationOptions.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location === "All" ? "ทั้งหมด" : location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-");
                  setSortBy(field);
                  setSortOrder(order as "asc" | "desc");
                }}
              >
                <SelectTrigger className="w-40 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate-asc">กำหนดเสร็จ ↑</SelectItem>
                  <SelectItem value="dueDate-desc">กำหนดเสร็จ ↓</SelectItem>
                  <SelectItem value="priority-desc">ความสำคัญ ↓</SelectItem>
                  <SelectItem value="priority-asc">ความสำคัญ ↑</SelectItem>
                  <SelectItem value="status-asc">สถานะ ↑</SelectItem>
                  <SelectItem value="title-asc">ชื่องาน ↑</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">
                ตัวกรองที่ใช้:
              </span>
              {Object.entries(filters).map(
                ([key, value]) =>
                  value !== "All" && (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key === "status" && "สถานะ: "}
                      {key === "priority" && "ความสำคัญ: "}
                      {key === "assignee" && "ผู้รับผิดชอบ: "}
                      {key === "type" && "ประเภท: "}
                      {key === "location" && "สถานที่: "}
                      {value}
                      <button
                        onClick={() =>
                          updateFilter(key as keyof FilterState, "All")
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ),
              )}
            </div>
          )}
        </div>

        {/* Work Orders List */}
        <div className="space-y-3">
          {filteredWorkOrders.map((wo, index) => (
            <div
              key={wo.id}
              className={`card-elevated rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                wo.status === "เกินกำหนด" ? "ring-2 ring-destructive/20" : ""
              } ${
                wo.priority === "วิกฤติ"
                  ? "border-l-4 border-l-destructive"
                  : wo.priority === "สูง"
                    ? "border-l-4 border-l-warning"
                    : ""
              }`}
            >
              <div className="p-4 sm:p-5">
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(wo.status)}
                        <h3 className="font-semibold text-sm sm:text-base truncate">
                          {wo.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {wo.id} • สร้างเมื่อ {wo.createdDate}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Badge
                        variant={getPriorityVariant(wo.priority)}
                        className="text-xs"
                      >
                        {wo.priority}
                      </Badge>
                      <Badge
                        variant={getStatusVariant(wo.status)}
                        className="text-xs"
                      >
                        {wo.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {wo.description}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{wo.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>กำหนด: {wo.dueDate}</span>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">อุปกรณ์:</span>{" "}
                      <span className="font-medium">{wo.asset}</span>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">สถานที่:</span>{" "}
                      <span className="font-medium">{wo.location}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {wo.type} • ประมาณ {wo.estimatedHours} ชม.
                    </div>
                    <Link to={`/work-orders/${wo.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm hover:bg-primary hover:text-primary-foreground"
                      >
                        ดูรายละเอียด
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredWorkOrders.length === 0 && (
          <div className="card-elevated rounded-xl">
            <div className="text-center py-12 px-4">
              <div className="text-muted-foreground mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              </div>
              <h3 className="text-lg font-medium mb-2">ไม่พบใบสั่งงาน</h3>
              <p className="text-muted-foreground mb-4">
                ไม่พบใบสั่งงานที่ตรงกับเงื่อนไขการค้นหาและตัวกรองที่เลือก
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                ล้างตัวกรองทั้งหมด
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
