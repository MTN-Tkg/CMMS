import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Wrench,
  DollarSign,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { assetMaintenanceService } from "../../shared/work-order-service";

interface AssetMaintenanceScheduleProps {
  assetId: string;
  className?: string;
  showHistory?: boolean;
  showDowntime?: boolean;
}

interface MaintenanceItem {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  priority: string;
  estimatedDuration: string;
  estimatedCost: number;
  description?: string;
}

interface MaintenanceHistoryItem {
  id: string;
  date: string;
  type: string;
  title: string;
  description: string;
  technician: string;
  duration: string;
  cost: number;
  status: string;
  parts: string[];
}

interface DowntimeData {
  downtime: number;
  availability: number;
  totalDowntimeHours?: number;
}

export function AssetMaintenanceSchedule({ 
  assetId, 
  className,
  showHistory = true,
  showDowntime = true
}: AssetMaintenanceScheduleProps) {
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<MaintenanceItem[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistoryItem[]>([]);
  const [downtimeData, setDowntimeData] = useState<DowntimeData>({ downtime: 0, availability: 100 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'analytics'>('upcoming');

  useEffect(() => {
    loadMaintenanceData();
  }, [assetId]);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [upcoming, history, downtime] = await Promise.all([
        assetMaintenanceService.getUpcomingMaintenance(assetId),
        showHistory ? assetMaintenanceService.getMaintenanceHistory(assetId) : Promise.resolve([]),
        showDowntime ? assetMaintenanceService.calculateDowntime(assetId) : Promise.resolve({ downtime: 0, availability: 100 })
      ]);

      setUpcomingMaintenance(upcoming);
      setMaintenanceHistory(history);
      setDowntimeData(downtime);
    } catch (err) {
      console.error('Error loading maintenance data:', err);
      setError('ไม่สามารถโหลดข้อมูลการบำรุงรักษาได้');
      
      // Fallback to mock data
      setUpcomingMaintenance([
        {
          id: '1',
          title: 'เปลี่ยนไส้กรองอากาศ',
          type: 'ป้องกัน',
          dueDate: '20/01/2567',
          priority: 'ปานกลาง',
          estimatedDuration: '1 ชั่วโมง',
          estimatedCost: 1500,
          description: 'เปลี่ยนไส้กรองอากาศตามกำหนด'
        },
        {
          id: '2',
          title: 'ตรวจสอบระบบเบรก',
          type: 'ตรวจสอบ',
          dueDate: '25/01/2567',
          priority: 'สูง',
          estimatedDuration: '2 ชั่วโมง',
          estimatedCost: 2000,
          description: 'ตรวจสอบประสิทธิภาพระบบเบรก'
        }
      ]);
      
      if (showHistory) {
        setMaintenanceHistory([
          {
            id: 'WO-2024-001',
            date: '05/01/2567',
            type: 'ป้องกัน',
            title: 'เปลี่ยนน้ำมันเครื่อง',
            description: 'เปลี่ยนน้ำมันเครื่องและไส้กรองตามกำหนด',
            technician: 'สมชาย รักงาน',
            duration: '3 ชั่วโมง',
            cost: 3500,
            status: 'เสร็จสิ้น',
            parts: ['น้ำมันเครื่อง 15W-40', 'ไส้กรองน้ำมัน']
          }
        ]);
      }
      
      if (showDowntime) {
        setDowntimeData({ downtime: 4.8, availability: 95.2, totalDowntimeHours: 12.5 });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'วิกฤติ':
        return 'destructive';
      case 'สูง':
        return 'destructive';
      case 'ปานกลาง':
        return 'default';
      case 'ต่ำ':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ป้องกัน':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'แก้ไข':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'ตรวจสอบ':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate.split('/').reverse().join('-'));
    return due < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate.split('/').reverse().join('-'));
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card className={`card-elevated ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            การบำรุงรักษา
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-3 w-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-elevated ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            การบำรุงรักษา
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={activeTab === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('upcoming')}
            >
              กำลังจะมาถึง
            </Button>
            {showHistory && (
              <Button
                variant={activeTab === 'history' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('history')}
              >
                ประวัติ
              </Button>
            )}
            {showDowntime && (
              <Button
                variant={activeTab === 'analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('analytics')}
              >
                วิเคราะห์
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upcoming Maintenance Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-3">
            {upcomingMaintenance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>ไม่มีงานบำรุงรักษาที่กำลังจะมาถึง</p>
              </div>
            ) : (
              upcomingMaintenance.map((maintenance) => {
                const daysUntil = getDaysUntilDue(maintenance.dueDate);
                const overdue = isOverdue(maintenance.dueDate);
                
                return (
                  <div key={maintenance.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-medium">{maintenance.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {maintenance.description}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge
                          variant={getPriorityColor(maintenance.priority) as any}
                          className="shrink-0"
                        >
                          {maintenance.priority}
                        </Badge>
                        <div
                          className={`inline-flex px-2 py-1 rounded text-xs border ${getTypeColor(maintenance.type)}`}
                        >
                          {maintenance.type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className={overdue ? 'text-destructive font-medium' : ''}>
                            {maintenance.dueDate}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {overdue ? `เกิน ${Math.abs(daysUntil)} วัน` : `อีก ${daysUntil} วัน`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{maintenance.estimatedDuration}</div>
                          <div className="text-xs text-muted-foreground">ประมาณเวลา</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>฿{maintenance.estimatedCost.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">ประมาณค่าใช้จ่าย</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <Plus className="h-3 w-3 mr-1" />
                          สร้างใบงาน
                        </Button>
                      </div>
                    </div>
                    
                    {overdue && (
                      <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        งานนี้เกินกำหนดแล้ว ควรดำเนินการโดยเร็ว
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && showHistory && (
          <div className="space-y-3">
            {maintenanceHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีประวัติการบำรุงรักษา</p>
              </div>
            ) : (
              maintenanceHistory.map((record) => (
                <div key={record.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <h4 className="font-medium">{record.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {record.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex px-2 py-1 rounded text-xs border ${getTypeColor(record.type)}`}
                      >
                        {record.type}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {record.date}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">ช่าง:</span>
                      <div className="font-medium">{record.technician}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ระยะเวลา:</span>
                      <div className="font-medium">{record.duration}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ค่าใช้จ่าย:</span>
                      <div className="font-medium">฿{record.cost.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">สถานะ:</span>
                      <div className="font-medium text-success">{record.status}</div>
                    </div>
                  </div>
                  
                  {record.parts.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-muted-foreground">อะไหล่ที่ใช้:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {record.parts.map((part, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && showDowntime && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">ความพร้อมใช้งาน</span>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-2xl font-bold text-success mb-2">
                    {downtimeData.availability}%
                  </div>
                  <Progress value={downtimeData.availability} className="h-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">เวลาหยุดทำงาน</span>
                    <TrendingDown className="h-4 w-4 text-warning" />
                  </div>
                  <div className="text-2xl font-bold text-warning mb-2">
                    {downtimeData.downtime}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {downtimeData.totalDowntimeHours} ชั่วโมง (30 วันที่ผ่านมา)
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium">สรุปประสิทธิภาพ</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">งานบำรุงรักษาที่เสร็จสิ้น:</span>
                    <span className="font-medium">{maintenanceHistory.length} งาน</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">งานที่กำลังจะมาถึง:</span>
                    <span className="font-medium">{upcomingMaintenance.length} งาน</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">งานที่เกินกำหนด:</span>
                    <span className="font-medium text-destructive">
                      {upcomingMaintenance.filter(m => isOverdue(m.dueDate)).length} งาน
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}