import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  Square,
  Clock,
  Timer,
  Save,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User
} from "lucide-react";
import { toast } from "sonner";

interface TimeEntry {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  description: string;
  userId: string;
  userName: string;
  taskId?: string;
  taskName?: string;
  isActive: boolean;
}

interface TimeTrackingProps {
  workOrderId: string;
  estimatedHours: number;
  actualHours: number;
  onTimeUpdate: (newActualHours: number) => void;
  timeEntries?: TimeEntry[];
  onTimeEntriesUpdate?: (entries: TimeEntry[]) => void;
  readOnly?: boolean;
}

export function TimeTracking({
  workOrderId,
  estimatedHours,
  actualHours,
  onTimeUpdate,
  timeEntries = [],
  onTimeEntriesUpdate,
  readOnly = false
}: TimeTrackingProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    hours: "",
    minutes: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && currentSession) {
      interval = setInterval(() => {
        const startTime = new Date(currentSession.startTime).getTime();
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, currentSession]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}ชม. ${mins}น.`;
    }
    return `${mins}น.`;
  };

  const startTimer = () => {
    if (readOnly) return;
    
    const newSession: TimeEntry = {
      id: `session-${Date.now()}`,
      startTime: new Date().toISOString(),
      duration: 0,
      description: "",
      userId: "current-user",
      userName: "Current User", // In real app, get from auth context
      isActive: true
    };

    setCurrentSession(newSession);
    setIsTimerRunning(true);
    setElapsedTime(0);
    toast.success("เริ่มจับเวลาแล้ว");
  };

  const pauseTimer = () => {
    if (!currentSession) return;
    
    setIsTimerRunning(false);
    toast.info("หยุดจับเวลาชั่วคราว");
  };

  const stopTimer = () => {
    if (!currentSession) return;
    
    const endTime = new Date().toISOString();
    const duration = Math.floor(elapsedTime / 60); // Convert to minutes
    
    const completedEntry: TimeEntry = {
      ...currentSession,
      endTime,
      duration,
      isActive: false
    };

    // Add to time entries
    const updatedEntries = [...timeEntries, completedEntry];
    if (onTimeEntriesUpdate) {
      onTimeEntriesUpdate(updatedEntries);
    }

    // Update total actual hours
    const totalMinutes = updatedEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const newActualHours = Math.round((totalMinutes / 60) * 100) / 100;
    onTimeUpdate(newActualHours);

    setCurrentSession(null);
    setIsTimerRunning(false);
    setElapsedTime(0);
    toast.success(`บันทึกเวลา ${formatDuration(duration)} แล้ว`);
  };

  const addManualEntry = () => {
    const hours = parseFloat(manualEntry.hours) || 0;
    const minutes = parseFloat(manualEntry.minutes) || 0;
    const totalMinutes = (hours * 60) + minutes;

    if (totalMinutes <= 0) {
      toast.error("กรุณาระบุเวลาที่ใช้");
      return;
    }

    if (!manualEntry.description.trim()) {
      toast.error("กรุณาระบุรายละเอียดงาน");
      return;
    }

    const newEntry: TimeEntry = {
      id: `manual-${Date.now()}`,
      startTime: `${manualEntry.date}T08:00:00.000Z`,
      endTime: `${manualEntry.date}T${String(8 + hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`,
      duration: totalMinutes,
      description: manualEntry.description,
      userId: "current-user",
      userName: "Current User",
      isActive: false
    };

    const updatedEntries = [...timeEntries, newEntry];
    if (onTimeEntriesUpdate) {
      onTimeEntriesUpdate(updatedEntries);
    }

    // Update total actual hours
    const totalActualMinutes = updatedEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const newActualHours = Math.round((totalActualMinutes / 60) * 100) / 100;
    onTimeUpdate(newActualHours);

    setManualEntry({
      hours: "",
      minutes: "",
      description: "",
      date: new Date().toISOString().split('T')[0]
    });
    setShowLogDialog(false);
    toast.success(`บันทึกเวลา ${formatDuration(totalMinutes)} แล้ว`);
  };

  const deleteTimeEntry = (entryId: string) => {
    const updatedEntries = timeEntries.filter(entry => entry.id !== entryId);
    if (onTimeEntriesUpdate) {
      onTimeEntriesUpdate(updatedEntries);
    }

    // Update total actual hours
    const totalMinutes = updatedEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const newActualHours = Math.round((totalMinutes / 60) * 100) / 100;
    onTimeUpdate(newActualHours);

    toast.success("ลบรายการเวลาแล้ว");
  };

  const totalActualMinutes = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalActualHours = totalActualMinutes / 60;
  const estimatedMinutes = estimatedHours * 60;
  const progressPercent = estimatedMinutes > 0 ? Math.min((totalActualMinutes / estimatedMinutes) * 100, 100) : 0;
  const isOvertime = totalActualHours > estimatedHours;
  const variance = totalActualHours - estimatedHours;
  const variancePercent = estimatedHours > 0 ? (variance / estimatedHours) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Timer Controls */}
      {!readOnly && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="h-4 w-4" />
              จับเวลาทำงาน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Timer Display */}
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-primary mb-2">
                {formatTime(elapsedTime)}
              </div>
              {currentSession && (
                <p className="text-sm text-muted-foreground">
                  เริ่มเมื่อ {new Date(currentSession.startTime).toLocaleTimeString('th-TH')}
                </p>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex gap-2 justify-center">
              {!currentSession ? (
                <Button onClick={startTimer} className="bg-success hover:bg-success/90">
                  <Play className="h-4 w-4 mr-2" />
                  เริ่มจับเวลา
                </Button>
              ) : (
                <>
                  <Button
                    variant={isTimerRunning ? "destructive" : "default"}
                    onClick={isTimerRunning ? pauseTimer : () => setIsTimerRunning(true)}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        หยุดชั่วคราว
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        ดำเนินการต่อ
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={stopTimer}>
                    <Square className="h-4 w-4 mr-2" />
                    หยุดและบันทึก
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            สรุปเวลาทำงาน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>ความคืบหน้า</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress 
              value={progressPercent} 
              className={`h-2 ${isOvertime ? 'bg-destructive/20' : ''}`}
            />
          </div>

          {/* Time Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">ประมาณการ</div>
              <div className="text-lg font-bold">{estimatedHours} ชม.</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">ใช้จริง</div>
              <div className={`text-lg font-bold ${isOvertime ? 'text-destructive' : 'text-success'}`}>
                {Math.round(totalActualHours * 100) / 100} ชม.
              </div>
            </div>
          </div>

          {/* Variance */}
          {variance !== 0 && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/30">
              {isOvertime ? (
                <>
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    เกินประมาณการ {Math.abs(variance).toFixed(1)} ชม. ({Math.abs(variancePercent).toFixed(1)}%)
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">
                    ต่ำกว่าประมาณการ {Math.abs(variance).toFixed(1)} ชม. ({Math.abs(variancePercent).toFixed(1)}%)
                  </span>
                </>
              )}
            </div>
          )}

          {/* Manual Entry Button */}
          {!readOnly && (
            <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  บันทึกเวลาด้วยตนเอง
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>บันทึกเวลาทำงาน</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="entry-date">วันที่</Label>
                    <Input
                      id="entry-date"
                      type="date"
                      value={manualEntry.date}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entry-hours">ชั่วโมง</Label>
                      <Input
                        id="entry-hours"
                        type="number"
                        min="0"
                        step="1"
                        value={manualEntry.hours}
                        onChange={(e) => setManualEntry(prev => ({ ...prev, hours: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="entry-minutes">นาที</Label>
                      <Input
                        id="entry-minutes"
                        type="number"
                        min="0"
                        max="59"
                        step="1"
                        value={manualEntry.minutes}
                        onChange={(e) => setManualEntry(prev => ({ ...prev, minutes: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="entry-description">รายละเอียดงาน</Label>
                    <Textarea
                      id="entry-description"
                      value={manualEntry.description}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="อธิบายงานที่ทำในช่วงเวลานี้..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={addManualEntry} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      บันทึก
                    </Button>
                    <Button variant="outline" onClick={() => setShowLogDialog(false)}>
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {/* Time Entries Log */}
      {timeEntries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              ประวัติการทำงาน ({timeEntries.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{entry.userName}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(entry.duration)}
                      </Badge>
                      {entry.isActive && (
                        <Badge className="text-xs bg-success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          กำลังทำงาน
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {entry.description || "ไม่มีรายละเอียด"}
                    </p>
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.startTime).toLocaleDateString('th-TH')} • 
                      {new Date(entry.startTime).toLocaleTimeString('th-TH', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {entry.endTime && (
                        <> - {new Date(entry.endTime).toLocaleTimeString('th-TH', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</>
                      )}
                    </div>
                  </div>

                  {!readOnly && !entry.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTimeEntry(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}