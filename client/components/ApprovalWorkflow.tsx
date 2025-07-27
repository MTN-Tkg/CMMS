import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  CheckCircle,
  XCircle,
  Clock,
  User,
  MessageSquare,
  Send,
  AlertTriangle,
  FileText,
  ArrowRight,
  Undo2
} from "lucide-react";
import { toast } from "sonner";

interface ApprovalStep {
  id: string;
  name: string;
  description: string;
  approverRole: string;
  approverName?: string;
  approverId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedAt?: string;
  comments?: string;
  isRequired: boolean;
  order: number;
}

interface ApprovalWorkflowProps {
  workOrderId: string;
  workOrderTitle: string;
  currentStatus: string;
  approvalSteps: ApprovalStep[];
  onApprovalUpdate: (steps: ApprovalStep[], newStatus: string) => void;
  canApprove?: boolean;
  currentUserRole?: string;
  readOnly?: boolean;
}

// Mock approval workflow templates
const workflowTemplates = {
  'maintenance': [
    {
      id: 'step-1',
      name: 'การอนุมัติเบื้องต้น',
      description: 'ตรวจสอบความจำเป็นและความเหมาะสมของงาน',
      approverRole: 'supervisor',
      status: 'pending' as const,
      isRequired: true,
      order: 1
    },
    {
      id: 'step-2', 
      name: 'การอนุมัติงบประมาณ',
      description: 'อนุมัติค่าใช้จ่ายและงบประมาณ',
      approverRole: 'manager',
      status: 'pending' as const,
      isRequired: true,
      order: 2
    },
    {
      id: 'step-3',
      name: 'การอนุมัติด้านความปลอดภัย',
      description: 'ตรวจสอบมาตรการความปลอดภัย',
      approverRole: 'safety_officer',
      status: 'pending' as const,
      isRequired: false,
      order: 3
    }
  ],
  'emergency': [
    {
      id: 'step-1',
      name: 'การอนุมัติฉุกเฉิน',
      description: 'อนุมัติงานฉุกเฉินโดยด่วน',
      approverRole: 'manager',
      status: 'pending' as const,
      isRequired: true,
      order: 1
    }
  ]
};

export function ApprovalWorkflow({
  workOrderId,
  workOrderTitle,
  currentStatus,
  approvalSteps,
  onApprovalUpdate,
  canApprove = false,
  currentUserRole = 'technician',
  readOnly = false
}: ApprovalWorkflowProps) {
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedStep, setSelectedStep] = useState<ApprovalStep | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalComments, setApprovalComments] = useState('');
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);

  const getStepStatusColor = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'skipped':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStepStatusIcon = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'skipped':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStepStatusText = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'rejected':
        return 'ไม่อนุมัติ';
      case 'pending':
        return 'รออนุมัติ';
      case 'skipped':
        return 'ข้าม';
      default:
        return 'รออนุมัติ';
    }
  };

  const canUserApproveStep = (step: ApprovalStep) => {
    if (readOnly || !canApprove) return false;
    if (step.status !== 'pending') return false;
    
    // Check if user role matches approver role
    const roleMapping: Record<string, string[]> = {
      'supervisor': ['supervisor', 'manager'],
      'manager': ['manager'],
      'safety_officer': ['safety_officer', 'manager'],
      'technician': ['technician']
    };

    return roleMapping[step.approverRole]?.includes(currentUserRole) || false;
  };

  const getCurrentStep = () => {
    return approvalSteps.find(step => step.status === 'pending' && step.isRequired) || 
           approvalSteps.find(step => step.status === 'pending');
  };

  const isWorkflowComplete = () => {
    const requiredSteps = approvalSteps.filter(step => step.isRequired);
    return requiredSteps.every(step => step.status === 'approved');
  };

  const isWorkflowRejected = () => {
    return approvalSteps.some(step => step.status === 'rejected' && step.isRequired);
  };

  const handleApproval = () => {
    if (!selectedStep) return;

    if (approvalAction === 'reject' && !approvalComments.trim()) {
      toast.error('กรุณาระบุเหตุผลในการไม่อนุมัติ');
      return;
    }

    const updatedSteps = approvalSteps.map(step => {
      if (step.id === selectedStep.id) {
        return {
          ...step,
          status: (approvalAction === 'approve' ? 'approved' : 'rejected') as ApprovalStep['status'],
          approvedAt: new Date().toISOString(),
          comments: approvalComments,
          approverName: 'Current User', // In real app, get from auth context
          approverId: 'current-user-id'
        };
      }
      return step;
    });

    // Determine new work order status
    let newStatus = currentStatus;
    if (approvalAction === 'reject') {
      newStatus = 'Rejected';
    } else if (isWorkflowComplete()) {
      newStatus = 'Approved';
    } else {
      newStatus = 'Pending Approval';
    }

    onApprovalUpdate(updatedSteps, newStatus);
    
    setShowApprovalDialog(false);
    setSelectedStep(null);
    setApprovalComments('');
    
    toast.success(
      approvalAction === 'approve' 
        ? 'อนุมัติเรียบร้อยแล้ว' 
        : 'ไม่อนุมัติและส่งกลับแล้ว'
    );
  };

  const handleSkipStep = (step: ApprovalStep) => {
    if (step.isRequired) {
      toast.error('ไม่สามารถข้ามขั้นตอนที่จำเป็นได้');
      return;
    }

    const updatedSteps = approvalSteps.map(s => {
      if (s.id === step.id) {
        return {
          ...s,
          status: 'skipped' as const,
          approvedAt: new Date().toISOString(),
          approverName: 'Current User',
          approverId: 'current-user-id'
        };
      }
      return s;
    });

    onApprovalUpdate(updatedSteps, currentStatus);
    toast.success('ข้ามขั้นตอนแล้ว');
  };

  const handleResetWorkflow = () => {
    const resetSteps = approvalSteps.map(step => ({
      ...step,
      status: 'pending' as const,
      approvedAt: undefined,
      comments: undefined,
      approverName: undefined,
      approverId: undefined
    }));

    onApprovalUpdate(resetSteps, 'Pending Approval');
    toast.success('รีเซ็ตขั้นตอนการอนุมัติแล้ว');
  };

  const getWorkflowProgress = () => {
    const totalSteps = approvalSteps.filter(step => step.isRequired).length;
    const completedSteps = approvalSteps.filter(step => 
      step.isRequired && (step.status === 'approved' || step.status === 'skipped')
    ).length;
    
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };

  return (
    <div className="space-y-4">
      {/* Workflow Status Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              สถานะการอนุมัติ
            </CardTitle>
            
            {!readOnly && canApprove && (
              <div className="flex gap-2">
                <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Undo2 className="h-4 w-4 mr-2" />
                      รีเซ็ต
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>รีเซ็ตขั้นตอนการอนุมัติ</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        การรีเซ็ตจะทำให้ขั้นตอนการอนุมัติทั้งหมดกลับสู่สถานะเริ่มต้น 
                        และต้องเริ่มกระบวนการอนุมัติใหม่
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          variant="destructive" 
                          onClick={handleResetWorkflow}
                          className="flex-1"
                        >
                          ยืนยันรีเซ็ต
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowWorkflowDialog(false)}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <h4 className="font-medium">{workOrderTitle}</h4>
              <p className="text-sm text-muted-foreground">รหัส: {workOrderId}</p>
            </div>
            <div className="text-right">
              <Badge className={getStepStatusColor(
                isWorkflowRejected() ? 'rejected' : 
                isWorkflowComplete() ? 'approved' : 'pending'
              )}>
                {isWorkflowRejected() ? 'ไม่อนุมัติ' : 
                 isWorkflowComplete() ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(getWorkflowProgress())}% เสร็จสิ้น
              </div>
            </div>
          </div>

          {/* Current Step Highlight */}
          {!isWorkflowComplete() && !isWorkflowRejected() && (
            <div className="p-3 border-l-4 border-l-warning bg-warning/5 rounded-r-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm">ขั้นตอนปัจจุบัน</span>
              </div>
              {getCurrentStep() && (
                <p className="text-sm text-muted-foreground">
                  {getCurrentStep()?.name} - รอการอนุมัติจาก {getCurrentStep()?.approverRole}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ขั้นตอนการอนุมัติ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {approvalSteps
              .sort((a, b) => a.order - b.order)
              .map((step, index) => (
                <div key={step.id} className="relative">
                  {/* Connection Line */}
                  {index < approvalSteps.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />
                  )}
                  
                  <div className="flex items-start gap-4 p-4 rounded-lg border">
                    {/* Step Icon */}
                    <div className={`p-2 rounded-full ${getStepStatusColor(step.status)}`}>
                      {getStepStatusIcon(step.status)}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {step.name}
                            {step.isRequired && (
                              <Badge variant="outline" className="text-xs">
                                จำเป็น
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                        
                        <Badge className={getStepStatusColor(step.status)}>
                          {getStepStatusText(step.status)}
                        </Badge>
                      </div>

                      {/* Approver Info */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>
                          {step.approverName || `รอการอนุมัติจาก ${step.approverRole}`}
                        </span>
                        {step.approvedAt && (
                          <span>
                            • {new Date(step.approvedAt).toLocaleDateString('th-TH')}
                          </span>
                        )}
                      </div>

                      {/* Comments */}
                      {step.comments && (
                        <div className="p-2 bg-muted/30 rounded text-sm">
                          <div className="flex items-center gap-1 mb-1">
                            <MessageSquare className="h-3 w-3" />
                            <span className="font-medium">ความเห็น:</span>
                          </div>
                          <p>{step.comments}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {canUserApproveStep(step) && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedStep(step);
                              setApprovalAction('approve');
                              setShowApprovalDialog(true);
                            }}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            อนุมัติ
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedStep(step);
                              setApprovalAction('reject');
                              setShowApprovalDialog(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            ไม่อนุมัติ
                          </Button>
                          {!step.isRequired && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSkipStep(step)}
                            >
                              <ArrowRight className="h-4 w-4 mr-2" />
                              ข้าม
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'อนุมัติงาน' : 'ไม่อนุมัติงาน'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStep && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium">{selectedStep.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedStep.description}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="approval-comments">
                ความเห็น {approvalAction === 'reject' && '*'}
              </Label>
              <Textarea
                id="approval-comments"
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder={
                  approvalAction === 'approve' 
                    ? 'ความเห็นเพิ่มเติม (ไม่บังคับ)' 
                    : 'กรุณาระบุเหตุผลในการไม่อนุมัติ'
                }
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleApproval} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                {approvalAction === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowApprovalDialog(false)}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}