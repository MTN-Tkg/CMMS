import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QrCode,
  Camera,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  MapPin,
  Calendar,
  Settings,
  Flashlight,
  RotateCcw,
  X,
  Search,
  Keyboard,
  History,
  FileSearch,
  Download,
  Printer,
  Share2,
  Plus,
  Eye,
  Edit,
  Copy,
  Package,
  User,
  FileText,
  PlayCircle,
  PauseCircle,
  Save,
  Upload,
  Camera as CameraIcon,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../shared/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Asset {
  id: string;
  equipment_type_id: string;
  system_id: string;
  systems?: {
    company_id: string;
  };
  equipment_types?: {
    name: string;
  };
}
// Types for PM Template system
interface PMTemplate {
  id: string;
  company_id: string;
  system_id: string;
  equipment_type_id: string;
  name: string;
  frequency_type: string;
  frequency_value: number;
  estimated_minutes: number;
  remarks?: string;
  template_code?: string;
}

interface PMTemplateDetail {
  id: string;
  pm_template_id: string;
  step_number: number;
  task_description: string;
  expected_input_type: string;
  standard_text_expected?: string;
  standard_min_value?: number;
  standard_max_value?: number;
  is_critical: boolean;
  remarks?: string;
}

interface WorkOrderTask {
  id: string;
  work_order_id: string;
  description: string;
  is_completed: boolean;
  is_critical?: boolean;
  actual_value_text?: string | null;
  actual_value_numeric?: number | null;
  completed_at?: string | null;
  // Store template details for reference during execution
  template_detail?: PMTemplateDetail;
}

export function PMQRScanner() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCode = searchParams.get("code");

  const [activeTab, setActiveTab] = useState("scanner");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [scannedCode, setScannedCode] = useState(preselectedCode || "");
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [scanHistory, setScanHistory] = useState<string[]>([]);

  // PM Template data
  const [pmTemplates, setPmTemplates] = useState<PMTemplate[]>([]);
  const [foundAsset, setFoundAsset] = useState<Asset | null>(null);
  const [showTemplateSelectionDialog, setShowTemplateSelectionDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PMTemplate | null>(null);
  const [templateDetails, setTemplateDetails] = useState<PMTemplateDetail[]>([]);
  const [workOrderTasks, setWorkOrderTasks] = useState<WorkOrderTask[]>([]);
  const [currentWorkOrderId, setCurrentWorkOrderId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Task execution state
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskResults, setTaskResults] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  // Load PM templates from database
  useEffect(() => {
    loadPMTemplates();
  }, []);

  const loadPMTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('pm_templates')
        .select(`
          *,
          systems(name, name_th),
          equipment_types(name, name_th)
        `)
        .order('name');

      if (error) throw error;
      setPmTemplates(data || []);
    } catch (error) {
      console.error('Error loading PM templates:', error);
      toast.error('ไม่สามารถโหลดข้อมูล PM Template ได้');
    }
  };

  // Search for PM template by QR code
  const searchPMTemplate = async (qrCode: string) => {
    if (!session) {
      toast.error("Please log in to search for PM Templates.");
      return;
    }
    setLoading(true);
    setPmTemplates([]); // Clear previous results
    setSelectedTemplate(null);

    try {
      console.log('🔍 Searching for PM Templates with QR code:', qrCode);

      // Parse and normalize QR code format
      let companyCode = '';
      let systemCode = '';
      let equipmentCode = '';
      let searchPattern = qrCode;

      // Handle different QR code formats
      if (qrCode.includes('-') && qrCode.split('-').length >= 3) {
        const parts = qrCode.split('-');
        
        // If code starts with PMT-, extract the middle part (LAK-SYS001-EQ001)
        if (qrCode.startsWith('PMT-') && parts.length >= 4) {
          companyCode = parts[1];      // LAK
          systemCode = parts[2];       // SYS001
          equipmentCode = parts[3];    // EQ001
        } else if (parts.length === 3) {
          // Direct format: LAK-SYS001-EQ001 or LAK-SYS001-EQ01
          companyCode = parts[0];      // LAK
          systemCode = parts[1];       // SYS001
          equipmentCode = parts[2];    // EQ001 or EQ01
        }

        // Normalize equipment code to 3 digits (EQ01 -> EQ001)
        if (equipmentCode.match(/^EQ\d{1,2}$/)) {
          const num = equipmentCode.replace('EQ', '');
          equipmentCode = `EQ${num.padStart(3, '0')}`;
        }
        
        console.log('📋 Parsed QR Code:', { companyCode, systemCode, equipmentCode, original: qrCode });
      }

      // Try to find matching PM templates directly
      let query = supabase
        .from('pm_templates')
        .select(`
          *,
          systems(id, name, name_th),
          equipment_types(id, name, name_th)
        `);

      let templates = [];

      // Strategy 1: Search by parsed components
      if (companyCode && systemCode && equipmentCode) {
        // Try different equipment formats: EQ001, EQ-001
        const equipmentWithDash = equipmentCode.replace(/^EQ(\d+)$/, 'EQ-$1');
        const equipmentWithoutDash = equipmentCode.replace(/^EQ-(\d+)$/, 'EQ$1');
        
        console.log('🔧 Equipment formats to try:', { equipmentCode, equipmentWithDash, equipmentWithoutDash });
        
        const { data: foundTemplates, error } = await query
          .eq('company_id', companyCode)
          .eq('system_id', systemCode)
          .or(`equipment_type_id.eq.${equipmentCode},equipment_type_id.eq.${equipmentWithDash},equipment_type_id.eq.${equipmentWithoutDash}`);

        if (error) throw error;
        templates = foundTemplates || [];
      }

      // Strategy 2: Direct template ID or code search as fallback
      if (templates.length === 0) {
        const { data: directTemplates, error: directError } = await supabase
          .from('pm_templates')
          .select(`
            *,
            systems(id, name, name_th),
            equipment_types(id, name, name_th)
          `)
          .or(`id.eq.${qrCode},template_code.eq.${qrCode}`);

        if (directError) throw directError;
        templates = directTemplates || [];
      }

      if (templates && templates.length > 0) {
        console.log(`✅ Found ${templates.length} PM Template(s).`);
        toast.success(`พบ ${templates.length} PM Template ที่ตรงกัน`);

        setPmTemplates(templates); // Store all found templates

        // If only one, select it automatically. If more, show a selection dialog.
        if (templates.length === 1) {
          const selected = templates[0];
          await handleTemplateSelection(selected);
        } else {
          // Show template selection dialog for multiple templates
          console.log('🔄 Multiple templates found, showing selection dialog...');
          setShowTemplateSelectionDialog(true);
          setActiveTab("search"); // Switch to search tab to show available templates
        }
      } else {
        console.log('❌ No PM Templates found for:', { qrCode, companyCode, systemCode, equipmentCode });
        toast.error(`ไม่พบ PM Template สำหรับรหัส: ${qrCode}`);
        
        // Show debug info
        console.log('🔍 Available PM Templates (first 5):');
        const { data: debugTemplates } = await supabase
          .from('pm_templates')
          .select('id, name, company_id, system_id, equipment_type_id')
          .limit(5);
        console.table(debugTemplates);
        
        setActiveTab("search"); // Switch to search tab so user can find one manually
      }
    } catch (error) {
      console.error('❌ Error in searchPMTemplate:', error);
      toast.error(`เกิดข้อผิดพลาดในการค้นหา: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  
  const handleTemplateSelection = async (template: PMTemplate) => {
    setSelectedTemplate(template);
    await loadTemplateDetails(template.id);
    setShowTemplateSelectionDialog(false);
    setActiveTab("template");
    toast.success(`เลือก Template: ${template.name}`);
  };

  // Load template details
  const loadTemplateDetails = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('pm_template_details')
        .select('*')
        .eq('pm_template_id', templateId)
        .order('step_number');

      if (error) throw error;
      setTemplateDetails(data || []);
    } catch (error) {
      console.error('Error loading template details:', error);
      toast.error('ไม่สามารถโหลดรายละเอียดงานได้');
    }
  };

  // Ensures a user profile exists, creating one if necessary.
  const ensureUserProfile = async (user: SupabaseUser) => {
    // First try to get the profile by user_id (not id)
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // error.code 'PGRST116' means no rows found, which is an expected outcome.
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user profile:', error);
      throw new Error(`Could not verify user profile: ${error.message}`);
    }

    if (!profile) {
      console.log(`Profile not found for user ${user.id}. Creating one.`);
      
      // Extract name from email if no metadata available
      const emailName = user.email?.split('@')[0] || 'User';
      const nameParts = emailName.split('.');
      const firstName = nameParts[0] || emailName;
      const lastName = nameParts[1] || '';
      
      // Create new profile with proper structure
      const newProfile = {
        user_id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || firstName,
        last_name: user.user_metadata?.last_name || lastName,
        role: 'technician', // Default role for PM execution
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: createdProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (insertError) {
        // If it's a unique constraint error, the profile might already exist
        if (insertError.code === '23505') {
          console.log('Profile already exists, fetching it...');
          // Try to fetch again
          const { data: existingProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (fetchError || !existingProfile) {
            throw new Error(`Could not fetch existing profile: ${fetchError?.message}`);
          }
          
          return existingProfile;
        }
        
        console.error('Error creating user profile:', insertError);
        throw new Error(`Could not create user profile: ${insertError.message}`);
      }
      
      return createdProfile;
    }
    
    return profile;
  };

  // Create work order and tasks
  const startPMExecution = async () => {
    if (!selectedTemplate || templateDetails.length === 0) {
      toast.error('ไม่พบข้อมูล PM Template');
      return;
    }

    if (!user) {
      toast.error('ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่อีกครั้ง');
      return;
    }

    setLoading(true);
    try {
      // Ensure user profile exists and get the profile
      const profile = await ensureUserProfile(user);

      // Create work order using profile.id (not user.id)
      const workOrderId = `WO-PM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const workOrderData = {
        id: workOrderId,
        work_type: 'PM',
        title: `PM: ${selectedTemplate.name}`,
        description: selectedTemplate.remarks || '',
        status: 'in_progress',
        priority: 2,
        pm_template_id: selectedTemplate.id,
        estimated_hours: Math.ceil(selectedTemplate.estimated_minutes / 60),
        created_at: new Date().toISOString(),
        requested_by_user_id: profile.id, // Use profile.id, not user.id
        assigned_to_user_id: profile.id,  // Use profile.id, not user.id
      };

      const { data: workOrder, error: woError } = await supabase
        .from('work_orders')
        .insert(workOrderData)
        .select()
        .single();

      if (woError) throw woError;

      setCurrentWorkOrderId(workOrder.id);

      // Create work order tasks from template details
      // Map to the actual work_order_tasks table structure
      const tasksForDB = templateDetails.map((detail, index) => ({
        id: `${workOrder.id}-${index + 1}`, // Generate task ID
        work_order_id: workOrder.id,
        description: detail.task_description, // Map task_description to description
        is_completed: false, // New tasks start as not completed
        is_critical: detail.is_critical || false,
        // Don't set actual values yet - these will be filled during execution
        actual_value_text: null,
        actual_value_numeric: null,
        completed_at: null,
        // Don't include template_detail in DB insert - it's not a column
      }));

      const { data: createdTasks, error: tasksError } = await supabase
        .from('work_order_tasks')
        .insert(tasksForDB)
        .select();

      if (tasksError) throw tasksError;

      // Map the created tasks with their corresponding template details
      const tasksWithDetails = (createdTasks || []).map((task, index) => ({
        ...task,
        template_detail: templateDetails[index], // Add template detail reference for UI use
      }));

      setWorkOrderTasks(tasksWithDetails);
      setIsExecuting(true);
      setCurrentTaskIndex(0);
      setActiveTab("execution");
      
      toast.success('เริ่มการบำรุงรักษาเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error starting PM execution:', error);
      toast.error('ไม่สามารถเริ่มการบำรุงรักษาได้');
    } finally {
      setLoading(false);
    }
  };

  // Update task result
  const updateTaskResult = async (taskId: string, updates: {
    is_completed?: boolean;
    actual_value_text?: string | null;
    actual_value_numeric?: number | null;
    completed_at?: string | null;
  }) => {
    try {
      const { error } = await supabase
        .from('work_order_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setWorkOrderTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );

      toast.success('บันทึกผลการทำงานเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error updating task result:', error);
      toast.error('ไม่สามารถบันทึกผลการทำงานได้');
    }
  };

  // Complete current task and move to next
  const completeCurrentTask = async (result: any) => {
    const currentTask = workOrderTasks[currentTaskIndex];
    if (!currentTask) return;

    const taskUpdate = {
      is_completed: true,
      actual_value_text: result.value || result.notes || '',
      actual_value_numeric: result.numericValue || null,
      completed_at: new Date().toISOString(),
    };

    await updateTaskResult(currentTask.id, taskUpdate);

    // Move to next task
    if (currentTaskIndex < workOrderTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      // All tasks completed
      await completeWorkOrder();
    }
  };

  // Complete entire work order
  const completeWorkOrder = async () => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', currentWorkOrderId);

      if (error) throw error;

      toast.success('การบำรุงรักษาเสร็จสิ้นแล้ว');
      setIsExecuting(false);
      setActiveTab("summary");
    } catch (error) {
      console.error('Error completing work order:', error);
      toast.error('ไม่สามารถปิดงานได้');
    }
  };

  // Simulate QR scan
  const simulateQRScan = (code: string) => {
    console.log('📱 QR Code scanned:', code);
    setScannedCode(code);
    setIsCameraActive(false);

    // Add to history
    setScanHistory(prev => {
      const newHistory = [code, ...prev.filter(c => c !== code)].slice(0, 10);
      return newHistory;
    });

    // Show loading state
    toast.info(`กำลังค้นหา PM Template สำหรับ: ${code}`);

    // Search for PM template
    searchPMTemplate(code);
  };


  // Filter templates for search
  const filteredTemplates = useMemo(() => {
    if (!searchTerm) return pmTemplates;

    return pmTemplates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.template_code && template.template_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [pmTemplates, searchTerm]);

  useEffect(() => {
    if (preselectedCode) {
      setScannedCode(preselectedCode);
      searchPMTemplate(preselectedCode);
    }
  }, [preselectedCode]);

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">PM QR Scanner</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              สแกน QR Code เพื่อเริ่มการบำรุงรักษาตามแผน
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/qr-scanner">
              <Button variant="outline" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                QR Scanner ทั่วไป
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="scanner">สแกน</TabsTrigger>
            <TabsTrigger value="search">ค้นหา</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="execution">ปฏิบัติงาน</TabsTrigger>
            <TabsTrigger value="summary">สรุป</TabsTrigger>
          </TabsList>

          {/* Scanner Tab */}
          <TabsContent value="scanner" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  สแกน QR Code PM Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera View Simulation */}
                <div className="relative aspect-square max-w-sm mx-auto bg-black rounded-lg overflow-hidden">
                  {isCameraActive ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                        <div className="absolute inset-0 border-2 border-primary rounded-lg animate-pulse" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm text-center">
                          วาง QR Code PM Template<br />ในกรอบ
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          กดเริ่มสแกนเพื่อเปิดกล้อง
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Controls */}
                <div className="flex justify-center gap-3">
                  <Button
                    variant={isCameraActive ? "destructive" : "default"}
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    className="px-6"
                  >
                    {isCameraActive ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        หยุดสแกน
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        เริ่มสแกน
                      </>
                    )}
                  </Button>
                  {isCameraActive && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsFlashlightOn(!isFlashlightOn)}
                        className={isFlashlightOn ? "bg-yellow-100" : ""}
                      >
                        <Flashlight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Manual Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-border flex-1" />
                    <span className="text-sm text-muted-foreground">หรือ</span>
                    <div className="h-px bg-border flex-1" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      ป้อนรหัส PM Template
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="เช่น LAK-SYS001-EQ001 หรือ PMT-LAK-SYS001-EQ001-MTH"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          if (manualCode) {
                            simulateQRScan(manualCode);
                            setManualCode("");
                          }
                        }}
                        disabled={!manualCode || loading}
                      >
                        <Keyboard className="h-4 w-4 mr-2" />
                        ค้นหา
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Scan History */}
                {scanHistory.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-px bg-border flex-1" />
                      <span className="text-sm text-muted-foreground">ประวัติการสแกน</span>
                      <div className="h-px bg-border flex-1" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        <History className="h-4 w-4 inline mr-1" />
                        QR Code ที่สแกนล่าสุด
                      </label>
                      <div className="space-y-1">
                        {scanHistory.slice(0, 5).map((code, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm cursor-pointer hover:bg-muted/50"
                            onClick={() => simulateQRScan(code)}
                          >
                            <span className="font-mono">{code}</span>
                            <Button variant="ghost" size="sm">
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  ค้นหา PM Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="ค้นหาด้วยชื่อ, รหัส PM Template..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => {
                        console.log('🔄 Template selected from search:', template.name);
                        handleTemplateSelection(template);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-primary" />
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {template.frequency_type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {template.id} • {template.estimated_minutes} นาที
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Company: {template.company_id} • System: {template.system_id} • Equipment: {template.equipment_type_id}
                          </div>
                          {template.remarks && (
                            <div className="text-xs text-muted-foreground">
                              {template.remarks}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredTemplates.length === 0 && searchTerm && (
                    <div className="text-center py-8">
                      <FileSearch className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        ไม่พบ PM Template ที่ตรงกับ "{searchTerm}"
                      </p>
                    </div>
                  )}

                  {filteredTemplates.length === 0 && !searchTerm && pmTemplates.length === 0 && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        กรุณาสแกน QR Code หรือค้นหา PM Template
                      </p>
                      <Button
                        variant="outline"
                        className="mt-3"
                        onClick={() => setActiveTab("scanner")}
                      >
                        เริ่มสแกน QR Code
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Template Tab */}
          <TabsContent value="template" className="space-y-4">
            {selectedTemplate ? (
              <>
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      PM Template Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {selectedTemplate.id} • {selectedTemplate.estimated_minutes} นาที
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {selectedTemplate.frequency_type}
                        </Badge>
                        <Badge variant="outline">
                          ทุก {selectedTemplate.frequency_value} {selectedTemplate.frequency_type}
                        </Badge>
                      </div>
                    </div>

                    {selectedTemplate.remarks && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm font-medium mb-1">หมายเหตุ:</div>
                        <div className="text-sm">{selectedTemplate.remarks}</div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <Button 
                        onClick={startPMExecution}
                        disabled={loading || templateDetails.length === 0}
                        className="flex-1"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        เริ่มการบำรุงรักษา
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Template Tasks */}
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      รายการงานที่ต้องทำ ({templateDetails.length} งาน)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {templateDetails.map((detail, index) => (
                        <div key={detail.id} className="p-3 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {detail.step_number}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{detail.task_description}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                ประเภท: {detail.expected_input_type}
                                {detail.is_critical === true && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    สำคัญ
                                  </Badge>
                                )}
                              </div>
                              {detail.remarks && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {detail.remarks}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="card-elevated">
                <CardContent className="text-center py-12">
                  <QrCode className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    กรุณาสแกน QR Code หรือเลือก PM Template
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => setActiveTab("scanner")}
                  >
                    เริ่มสแกนใหม่
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Execution Tab */}
          <TabsContent value="execution" className="space-y-4">
            {isExecuting && workOrderTasks.length > 0 ? (
              <TaskExecutionInterface
                tasks={workOrderTasks}
                currentIndex={currentTaskIndex}
                onTaskComplete={completeCurrentTask}
                onUpdateTask={updateTaskResult}
              />
            ) : (
              <Card className="card-elevated">
                <CardContent className="text-center py-12">
                  <PlayCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    ยังไม่ได้เริ่มการบำรุงรักษา
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => setActiveTab("template")}
                  >
                    กลับไปเลือก Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  สรุปการบำรุงรักษา
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-success" />
                  <h3 className="text-lg font-semibold mb-2">การบำรุงรักษาเสร็จสิ้น</h3>
                  <p className="text-muted-foreground">
                    งานบำรุงรักษาตามแผนได้ดำเนินการเสร็จสิ้นแล้ว
                  </p>
                </div>

                <div className="flex gap-2 justify-center">
                  <Button onClick={() => navigate('/work-orders')}>
                    <FileText className="h-4 w-4 mr-2" />
                    ดูรายงาน
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setTemplateDetails([]);
                      setWorkOrderTasks([]);
                      setIsExecuting(false);
                      setCurrentTaskIndex(0);
                      setActiveTab("scanner");
                    }}
                  >
                    เริ่มงานใหม่
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Template Selection Dialog - Always render when showTemplateSelectionDialog is true */}
      <PMTemplateSelectionDialog
        isOpen={showTemplateSelectionDialog}
        onOpenChange={setShowTemplateSelectionDialog}
        templates={pmTemplates}
        asset={foundAsset}
        onSelectTemplate={handleTemplateSelection}
      />
    </div>
  );
}

// Task Execution Interface Component
interface TaskExecutionInterfaceProps {
  tasks: WorkOrderTask[];
  currentIndex: number;
  onTaskComplete: (result: any) => void;
  onUpdateTask: (taskId: string, result: Partial<WorkOrderTask>) => void;
}

function TaskExecutionInterface({
  tasks,
  currentIndex,
  onTaskComplete,
  onUpdateTask
}: TaskExecutionInterfaceProps) {
  const [taskResult, setTaskResult] = useState({
    value: '',
    status: 'pass' as 'pass' | 'fail' | 'warning' | 'na',
    notes: '',
    duration: 0,
  });
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isTaskStarted, setIsTaskStarted] = useState(false);

  const currentTask = tasks[currentIndex];
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const progress = (completedTasks / tasks.length) * 100;

  useEffect(() => {
    if (currentTask && !isTaskStarted) {
      setTaskResult({
        value: '',
        status: 'pass',
        notes: '',
        duration: 0,
      });
      setStartTime(null);
      setIsTaskStarted(false);
    }
  }, [currentIndex]);

  const startTask = async () => {
    if (!currentTask) return;
    
    setStartTime(new Date());
    setIsTaskStarted(true);
    
    // For now, we'll just track in local state since the table doesn't have a started_at field
    setIsTaskStarted(true);
  };

  const completeTask = async () => {
    if (!currentTask || !startTime) return;

    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 60000);
    
    const result = {
      ...taskResult,
      duration,
    };

    await onTaskComplete(result);
    setIsTaskStarted(false);
  };

  const skipTask = async () => {
    if (!currentTask) return;

    await onUpdateTask(currentTask.id, {
      is_completed: true,
      actual_value_text: 'ข้ามการทำงาน',
      completed_at: new Date().toISOString(),
    });

    // Move to next task
    if (currentIndex < tasks.length - 1) {
      // This should be handled by parent component
    }
  };

  if (!currentTask) {
    return (
      <Card className="card-elevated">
        <CardContent className="text-center py-12">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
          <p className="text-lg font-semibold mb-2">งานทั้งหมดเสร็จสิ้น</p>
          <p className="text-muted-foreground">
            การบำรุงรักษาตามแผนได้ดำเนินการครบถ้วนแล้ว
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">ความคืบหน้า</span>
            <span className="text-sm text-muted-foreground">
              {completedTasks} / {tasks.length} งาน
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Task */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              {currentIndex + 1}
            </div>
            งานที่ {currentIndex + 1}: {currentTask.description}
            {currentTask.is_critical === true && (
              <Badge variant="destructive" className="ml-2">
                สำคัญ
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Task Info */}
          {currentTask.template_detail && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-sm">
                <div><strong>ประเภทการป้อนข้อมูล:</strong> {currentTask.template_detail.expected_input_type || 'ข้อความ'}</div>
                {currentTask.template_detail.standard_text_expected && (
                  <div><strong>ค่าที่คาดหวัง:</strong> {currentTask.template_detail.standard_text_expected}</div>
                )}
                {(currentTask.template_detail.standard_min_value || currentTask.template_detail.standard_max_value) && (
                  <div>
                    <strong>ช่วงค่า:</strong> {currentTask.template_detail.standard_min_value} - {currentTask.template_detail.standard_max_value}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Task Controls */}
          {!isTaskStarted ? (
            <div className="flex gap-2">
              <Button onClick={startTask} className="flex-1">
                <PlayCircle className="h-4 w-4 mr-2" />
                เริ่มงาน
              </Button>
              <Button variant="outline" onClick={skipTask}>
                ข้าม
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Result Input */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">ผลการตรวจสอบ</label>
                  {currentTask.template_detail?.expected_input_type === 'boolean' ? (
                    <div className="flex gap-2 mt-1">
                      <Button
                        variant={taskResult.value === 'true' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTaskResult(prev => ({ ...prev, value: 'true' }))}
                      >
                        ผ่าน
                      </Button>
                      <Button
                        variant={taskResult.value === 'false' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTaskResult(prev => ({ ...prev, value: 'false' }))}
                      >
                        ไม่ผ่าน
                      </Button>
                    </div>
                  ) : currentTask.template_detail?.expected_input_type === 'select' ? (
                    <Select
                      value={taskResult.value}
                      onValueChange={(value) => setTaskResult(prev => ({ ...prev, value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="เลือกผลลัพธ์" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ปกติ">ปกติ</SelectItem>
                        <SelectItem value="ผิดปกติ">ผิดปกติ</SelectItem>
                        <SelectItem value="ต้องซ่อม">ต้องซ่อม</SelectItem>
                        <SelectItem value="เปลี่ยนใหม่">เปลี่ยนใหม่</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={taskResult.value}
                      onChange={(e) => setTaskResult(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="ป้อนผลการตรวจสอบ"
                      className="mt-1"
                      type={currentTask.template_detail?.expected_input_type === 'number' ? 'number' : 'text'}
                    />
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">สถานะผลลัพธ์</label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={taskResult.status === 'pass' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTaskResult(prev => ({ ...prev, status: 'pass' }))}
                      className="text-success"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      ผ่าน
                    </Button>
                    <Button
                      variant={taskResult.status === 'warning' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTaskResult(prev => ({ ...prev, status: 'warning' }))}
                      className="text-warning"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      เตือน
                    </Button>
                    <Button
                      variant={taskResult.status === 'fail' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTaskResult(prev => ({ ...prev, status: 'fail' }))}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      ไม่ผ่าน
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">หมายเหตุ</label>
                  <Textarea
                    value={taskResult.notes}
                    onChange={(e) => setTaskResult(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="บันทึกรายละเอียดเพิ่มเติม..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="text-sm font-medium">ถ่ายรูปประกอบ (ถ้ามี)</label>
                  <div className="mt-1 border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <CameraIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">แตะเพื่อถ่ายรูป</p>
                  </div>
                </div>
              </div>

              {/* Complete Task */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={completeTask}
                  disabled={!taskResult.value}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  บันทึกและดำเนินการต่อ
                </Button>
                <Button variant="outline" onClick={skipTask}>
                  ข้าม
                </Button>
              </div>
            </div>
          )}

          {/* Timer */}
          {startTime && (
            <div className="text-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              เริ่มงานเมื่อ: {startTime.toLocaleTimeString('th-TH')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task List */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base">รายการงานทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`p-2 rounded-lg border ${
                  index === currentIndex
                    ? 'border-primary bg-primary/5'
                    : task.is_completed
                    ? 'border-success bg-success/5'
                    : 'border-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    task.is_completed
                      ? 'bg-success text-white'
                      : index === currentIndex
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {task.is_completed ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{task.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {task.is_completed && task.actual_value_text && (
                        <>ผลลัพธ์: {task.actual_value_text}</>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.is_completed ? 'default' :
                      index === currentIndex ? 'secondary' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {task.is_completed ? 'เสร็จ' :
                     index === currentIndex ? 'กำลังทำ' : 'รอ'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// PM Template Selection Dialog Component
interface PMTemplateSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  templates: PMTemplate[];
  asset: Asset | null;
  onSelectTemplate: (template: PMTemplate) => void;
}

function PMTemplateSelectionDialog({
  isOpen,
  onOpenChange,
  templates,
  asset,
  onSelectTemplate,
}: PMTemplateSelectionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>เลือก PM Template</DialogTitle>
          <div className="text-sm text-muted-foreground pt-2">
            <p>พบ PM Template มากกว่า 1 รายการ</p>
            {asset && (
              <p className="font-medium">{asset.id} ({asset.equipment_types?.name})</p>
            )}
            <p className="mt-1">กรุณาเลือกรายการที่ต้องการดำเนินการ</p>
          </div>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-3 p-1">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="hover:border-primary cursor-pointer transition-all"
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent className="p-4">
                <h4 className="font-semibold">{template.name}</h4>
                <p className="text-sm text-muted-foreground">{template.id}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">{template.frequency_type}</Badge>
                  <Badge variant="outline">
                    ทุก {template.frequency_value} {template.frequency_type}
                  </Badge>
                  <Badge variant="outline">{template.estimated_minutes} นาที</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}