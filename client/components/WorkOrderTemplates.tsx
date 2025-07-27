import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  Settings,
  Clock,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface WorkOrderTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: number;
  estimatedHours: number;
  tasks: TemplateTask[];
  parts: TemplatePart[];
  isActive: boolean;
  createdAt: string;
  usageCount: number;
}

interface TemplateTask {
  id: string;
  description: string;
  isCritical: boolean;
  estimatedMinutes: number;
  instructions?: string;
}

interface TemplatePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
}

interface WorkOrderTemplatesProps {
  onSelectTemplate?: (template: WorkOrderTemplate) => void;
  showSelectMode?: boolean;
}

// Mock templates data
const mockTemplates: WorkOrderTemplate[] = [
  {
    id: "tpl-001",
    name: "บำรุงรักษาเครื่องยนต์รถขุด",
    description: "การบำรุงรักษาตามกำหนดสำหรับรถขุด CAT 320D",
    category: "ป้องกัน",
    priority: 2,
    estimatedHours: 4,
    tasks: [
      {
        id: "task-001",
        description: "ตรวจสอบระดับและคุณภาพน้ำมันเครื่อง",
        isCritical: true,
        estimatedMinutes: 30,
        instructions: "ตรวจสอบระดับน้ำมันด้วย dipstick และสังเกตสีและความหนืด"
      },
      {
        id: "task-002", 
        description: "เปลี่ยนไส้กรองน้ำมันเครื่อง",
        isCritical: true,
        estimatedMinutes: 45,
        instructions: "ใช้ไส้กรองตามรุ่นที่กำหนด ตรวจสอบ O-ring"
      },
      {
        id: "task-003",
        description: "ตรวจสอบระบบไฮดรอลิก",
        isCritical: false,
        estimatedMinutes: 60,
        instructions: "ตรวจสอบการรั่วไหลและความดันระบบ"
      }
    ],
    parts: [
      {
        id: "part-001",
        name: "ไส้กรองน้ำมันเครื่อง",
        partNumber: "OF-4553",
        quantity: 1,
        unit: "ชิ้น",
        isOptional: false
      },
      {
        id: "part-002",
        name: "น้ำมันเครื่อง 15W-40",
        partNumber: "EO-1540",
        quantity: 8,
        unit: "ลิตร",
        isOptional: false
      }
    ],
    isActive: true,
    createdAt: "2024-01-15",
    usageCount: 25
  },
  {
    id: "tpl-002",
    name: "ตรวจสอบระบบไฟฟ้า",
    description: "การตรวจสอบระบบไฟฟ้าและอิเล็กทรอนิกส์",
    category: "ตรวจสอบ",
    priority: 1,
    estimatedHours: 2,
    tasks: [
      {
        id: "task-004",
        description: "ตรวจสอบแบตเตอรี่",
        isCritical: true,
        estimatedMinutes: 20,
        instructions: "ตรวจสอบแรงดันและการกัดกร่อนของขั้ว"
      },
      {
        id: "task-005",
        description: "ทดสอบระบบชาร์จ",
        isCritical: false,
        estimatedMinutes: 30,
        instructions: "ใช้มัลติมิเตอร์ตรวจสอบแรงดันขณะเครื่องยนต์ทำงาน"
      }
    ],
    parts: [],
    isActive: true,
    createdAt: "2024-01-10",
    usageCount: 15
  }
];

export function WorkOrderTemplates({ onSelectTemplate, showSelectMode = false }: WorkOrderTemplatesProps) {
  const [templates, setTemplates] = useState<WorkOrderTemplate[]>(mockTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkOrderTemplate | null>(null);

  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
    priority: 2,
    estimatedHours: 1,
    tasks: [] as TemplateTask[],
    parts: [] as TemplatePart[]
  });

  const categories = ["ป้องกัน", "แก้ไข", "ตรวจสอบ", "ติดตั้ง", "อื่นๆ"];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory && template.isActive;
  });

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 4: return "bg-destructive text-destructive-foreground";
      case 3: return "bg-warning text-warning-foreground";
      case 2: return "bg-primary text-primary-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 4: return "วิกฤติ";
      case 3: return "สูง";
      case 2: return "ปานกลาง";
      default: return "ต่ำ";
    }
  };

  const handleSelectTemplate = (template: WorkOrderTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
      // Update usage count
      setTemplates(prev => 
        prev.map(t => 
          t.id === template.id 
            ? { ...t, usageCount: t.usageCount + 1 }
            : t
        )
      );
      toast.success(`ใช้เทมเพลต "${template.name}"`);
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) {
      toast.error("กรุณาระบุชื่อเทมเพลต");
      return;
    }

    const template: WorkOrderTemplate = {
      id: `tpl-${Date.now()}`,
      ...newTemplate,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    };

    setTemplates(prev => [template, ...prev]);
    setNewTemplate({
      name: "",
      description: "",
      category: "",
      priority: 2,
      estimatedHours: 1,
      tasks: [],
      parts: []
    });
    setShowCreateDialog(false);
    toast.success("สร้างเทมเพลตใหม่แล้ว");
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => 
      prev.map(t => 
        t.id === templateId 
          ? { ...t, isActive: false }
          : t
      )
    );
    toast.success("ลบเทมเพลตแล้ว");
  };

  const duplicateTemplate = (template: WorkOrderTemplate) => {
    const newTemplate: WorkOrderTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (สำเนา)`,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    };
    
    setTemplates(prev => [newTemplate, ...prev]);
    toast.success("คัดลอกเทมเพลตแล้ว");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">เทมเพลตใบสั่งงาน</h2>
          <p className="text-sm text-muted-foreground">
            จัดการและใช้เทมเพลตสำหรับสร้างใบสั่งงาน
          </p>
        </div>
        
        {!showSelectMode && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                สร้างเทมเพลต
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>สร้างเทมเพลตใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">ชื่อเทมเพลต *</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="เช่น บำรุงรักษาเครื่องยนต์"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-category">หมวดหมู่</Label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกหมวดหมู่" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="template-description">รายละเอียด</Label>
                  <Textarea
                    id="template-description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="อธิบายรายละเอียดของเทมเพลต"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-priority">ความสำคัญ</Label>
                    <Select
                      value={newTemplate.priority.toString()}
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, priority: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ต่ำ</SelectItem>
                        <SelectItem value="2">ปานกลาง</SelectItem>
                        <SelectItem value="3">สูง</SelectItem>
                        <SelectItem value="4">วิกฤติ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="template-hours">ประมาณการเวลา (ชั่วโมง)</Label>
                    <Input
                      id="template-hours"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={newTemplate.estimatedHours}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleCreateTemplate} className="flex-1">
                    สร้างเทมเพลต
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาเทมเพลต..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="หมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(template.priority)}`}>
                      {getPriorityText(template.priority)}
                    </Badge>
                  </div>
                </div>
                
                {!showSelectMode && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => duplicateTemplate(template)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(template)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {template.estimatedHours} ชม.
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  {template.tasks.length} งาน
                </div>
                <div>ใช้ {template.usageCount} ครั้ง</div>
              </div>

              {template.tasks.some(task => task.isCritical) && (
                <div className="flex items-center gap-1 text-xs text-warning">
                  <AlertTriangle className="h-3 w-3" />
                  มีงานสำคัญ
                </div>
              )}

              {showSelectMode ? (
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  ใช้เทมเพลต
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    ดูรายละเอียด
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    ใช้เทมเพลต
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">ไม่พบเทมเพลต</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || categoryFilter !== "all" 
              ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" 
              : "สร้างเทมเพลตแรกของคุณ"
            }
          </p>
        </div>
      )}
    </div>
  );
}