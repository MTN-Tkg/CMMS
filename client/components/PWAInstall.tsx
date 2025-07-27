import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Download,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  X,
  Share,
  Home,
  Settings,
} from "lucide-react";
import {
  pwaManager,
  networkMonitor,
  type PWAInstallationState,
} from "@/utils/pwa";
import { useToast } from "@/hooks/use-toast";

interface PWAInstallProps {
  showBanner?: boolean;
  autoShow?: boolean;
}

export function PWAInstall({
  showBanner = true,
  autoShow = false,
}: PWAInstallProps) {
  const [installState, setInstallState] = useState<PWAInstallationState | null>(
    null,
  );
  const [isOnline, setIsOnline] = useState(true);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for installation state changes
    const unsubscribeInstall =
      pwaManager.onInstallationStateChange(setInstallState);

    // Listen for network changes
    const unsubscribeNetwork = networkMonitor.onStatusChange(setIsOnline);

    return () => {
      unsubscribeInstall();
      unsubscribeNetwork();
    };
  }, []);

  useEffect(() => {
    if (autoShow && installState?.canInstall && !installState.isInstalled) {
      setShowInstallDialog(true);
    }
  }, [autoShow, installState]);


  const handleInstall = async () => {
    if (!installState?.canInstall) {
      return;
    }

    setIsInstalling(true);
    try {
      const installed = await pwaManager.promptInstall();

      if (installed) {
        toast({ title: "ติดตั้งแอปสำเร็จแล้ว!" });
        setShowInstallDialog(false);
      } else {
        toast({ title: "การติดตั้งถูกยกเลิก" });
      }
    } catch (error) {
      console.error("Installation failed:", error);
      toast({ title: "เกิดข้อผิดพลาดในการติดตั้ง" });
    } finally {
      setIsInstalling(false);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await pwaManager.requestNotificationPermission();

      if (permission === "granted") {
        toast({ title: "เปิดใช้การแจ้งเตือนแล้ว" });
      } else if (permission === "denied") {
        toast({ title: "การแจ้งเตือนถูกปฏิเสธ" });
      }
    } catch (error) {
      console.error("Notification permission failed:", error);
      toast({ title: "ไม่สามารถขอสิทธิ์การแจ้งเตือนได้" });
    }
  };

  if (!installState) {
    return null;
  }

  // Don't show if already installed
  if (installState.isInstalled) {
    return null;
  }

  // Install banner
  const InstallBanner = () => {
    if (!showBanner || !installState.canInstall) {
      return null;
    }

    return (
      <Card className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 shadow-lg border-primary">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">ติดตั้งแอป CMMS</h4>
                <p className="text-xs text-muted-foreground">
                  เพื่อใช้งานแบบออฟไลน์และประสบการณ์ที่ดีขึ้น
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" onClick={() => setShowInstallDialog(true)}>
                ติดตั้ง
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstallDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // iOS Installation Instructions
  const IOSInstructions = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Smartphone className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="font-medium">วิธีติดตั้งบน iOS</h3>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            1
          </div>
          <div>
            <div className="font-medium">เปิด Safari</div>
            <div className="text-muted-foreground">
              เข้าใช้งานเว็บไซต์ผ่าน Safari
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            2
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              กดปุ่ม Share <Share className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground">
              กดปุ่มแชร์ที่ด้านล่างของหน้าจอ
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            3
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              เลือก "Add to Home Screen" <Home className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground">
              เลื่อนลงหาตัวเลือก "เพิ่มที่หน้าจอ Home"
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            4
          </div>
          <div>
            <div className="font-medium">ยืนยันการติดตั้ง</div>
            <div className="text-muted-foreground">
              กดปุ่ม "เพ��่ม" เพื่อติดตั้งแอป
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Android Installation Instructions
  const AndroidInstructions = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Smartphone className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="font-medium">วิธีติดตั้งบน Android</h3>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            1
          </div>
          <div>
            <div className="font-medium">เปิด Chrome Browser</div>
            <div className="text-muted-foreground">
              เข้าใช้งานเว็บไซต์ผ่าน Chrome
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            2
          </div>
          <div>
            <div className="font-medium">มอ��หา Banner การติดตั้ง</div>
            <div className="text-muted-foreground">
              จะมี popup หรือ banner แจ้งให้ติดตั้งแอป
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            3
          </div>
          <div>
            <div className="font-medium">กดปุ่ม "ติดตั้ง"</div>
            <div className="text-muted-foreground">กดยืนยันการติดตั้งแอป</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            4
          </div>
          <div>
            <div className="font-medium">เสร็จสิ้น</div>
            <div className="text-muted-foreground">แอปจะปรากฏในหน้าจอหลัก</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <InstallBanner />

      {/* Install Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              ติดตั้ง CMMS Mobile Pro
            </DialogTitle>
            <DialogDescription>
              ติดตั้งแอปเพื่อใช้งานแบบออฟไลน์และประสบการณ์ที่ดีขึ้น
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Network Status */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">
                    เชื่อมต่ออินเทอร์เน็ต
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    ไม่ได้เชื่อมต่ออินเทอร์เน็ต
                  </span>
                </>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2">
              <h4 className="font-medium">คุณสมบัติของแอป:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>ใช้งานแบบออฟไลน์</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>ซิงค์ข้อมูลอัตโนมัติ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>การแจ้งเตือนแบบ Push</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>เข้าถึงได้จากหน้าจอหลัก</span>
                </div>
              </div>
            </div>

            {/* Install Button */}
            {installState.canInstall ? (
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="w-full"
              >
                {isInstalling ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    กำลังติดตั้ง...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    ติดตั้งแอป
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto text-warning mb-2" />
                  <p className="text-sm text-muted-foreground">
                    ไม่สามารถติดตั้งอัตโนมัติได้
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowInstructions(true)}
                  className="w-full"
                >
                  ดูวิธีติดตั้���ด้วยตนเอง
                </Button>
              </div>
            )}

            {/* Notification Permission */}
            <Button
              variant="outline"
              onClick={requestNotificationPermission}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              เปิดใช้การแจ้งเตือน
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Installation Instructions */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>วิธีติดตั้งแอป</DialogTitle>
            <DialogDescription>
              ทำตามขั้นตอนเพื่อติดตั้งแอปด้วยตนเอง
            </DialogDescription>
          </DialogHeader>

          {installState.isIOS ? <IOSInstructions /> : <AndroidInstructions />}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowInstructions(false)}
              className="flex-1"
            >
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// PWA Status indicator component
export function PWAStatus() {
  const [installState, setInstallState] = useState<PWAInstallationState | null>(
    null,
  );
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribeInstall =
      pwaManager.onInstallationStateChange(setInstallState);
    const unsubscribeNetwork = networkMonitor.onStatusChange(setIsOnline);

    return () => {
      unsubscribeInstall();
      unsubscribeNetwork();
    };
  }, []);

  if (!installState) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Installation Status */}
      {installState.isInstalled ? (
        <Badge className="bg-success text-success-foreground">
          <Smartphone className="h-3 w-3 mr-1" />
          ติดตั้งแล้ว
        </Badge>
      ) : installState.canInstall ? (
        <Badge variant="outline">
          <Download className="h-3 w-3 mr-1" />
          สามารถติดตั้งได้
        </Badge>
      ) : (
        <Badge variant="secondary">
          <Monitor className="h-3 w-3 mr-1" />
          เบราว์เซอร์
        </Badge>
      )}

      {/* Network Status */}
      {isOnline ? (
        <Badge className="bg-success text-success-foreground">
          <Wifi className="h-3 w-3 mr-1" />
          ออนไลน์
        </Badge>
      ) : (
        <Badge variant="destructive">
          <WifiOff className="h-3 w-3 mr-1" />
          ออฟไลน์
        </Badge>
      )}
    </div>
  );
}
