import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Settings,
  QrCode,
  Menu,
  X,
  Calendar,
  BarChart3,
  Bell,
  Users,
  Download,
  Wrench,
  AlertTriangle,
  Cog,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { NotificationSystem } from "./inventory/NotificationSystem";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { useInventory } from "@/hooks/use-inventory";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { path: "/", label: "หน้าหลัก", icon: LayoutDashboard },
  { path: "/work-orders", label: "ใบสั่งงาน", icon: ClipboardList },
  { path: "/preventive-maintenance", label: "PM System", icon: Shield },
  { path: "/pm-qr-scanner", label: "PM Scanner", icon: QrCode },
  { path: "/assets", label: "อุปกรณ์", icon: Wrench },
  { path: "/parts", label: "คลังอะไหล่", icon: Package },
  { path: "/inventory", label: "จัดการสต็อก", icon: BarChart3 },
  { path: "/inventory/alerts", label: "แจ้งเตือนสต็อก", icon: AlertTriangle },
  { path: "/schedule", label: "ตารางงาน", icon: Calendar },
  { path: "/reports", label: "รายงาน", icon: BarChart3 },
  { path: "/notifications", label: "การแจ้งเตือน", icon: Bell },
  { path: "/users", label: "ผู้ใช้งาน", icon: Users },
  { path: "/settings", label: "ตั้งค่า", icon: Settings },
  { path: "/data-transfer", label: "จัดการข้อมูล", icon: Download },
  { path: "/qr-scanner", label: "QR ทั่วไป", icon: QrCode },
];

export function MobileNav() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { metrics, criticalAlerts } = useSupabaseData();
  const { criticalAlertsCount } = useInventory();

  // Calculate notification counts
  const notificationCounts = {
    workOrders: metrics.overdueWorkOrders + metrics.pendingWorkOrders,
    assets: metrics.faultyAssets,
    parts: metrics.lowStockParts + metrics.outOfStockParts,
    alerts: criticalAlertsCount,
  };

  const getNotificationCount = (path: string) => {
    switch (path) {
      case "/work-orders":
        return notificationCounts.workOrders;
      case "/assets":
        return notificationCounts.assets;
      case "/parts":
        return notificationCounts.parts;
      case "/inventory":
      case "/inventory/alerts":
        return notificationCounts.alerts;
      case "/notifications":
        return notificationCounts.alerts;
      default:
        return 0;
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="glass-nav p-3 sm:p-4 flex items-center justify-between md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center shadow-lg">
              <Cog className="w-5 h-5 text-primary-foreground animate-spin-slow" />
            </div>
            <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl"></div>
          </div>
          <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            CMMS Mobile
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationSystem />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 active:scale-95 relative"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            {(notificationCounts.workOrders + notificationCounts.assets + notificationCounts.parts) > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Side Menu */}
      <nav
        className={cn(
          "fixed top-0 left-0 h-full w-80 glass-nav transform transition-transform duration-300 z-50 md:hidden",
          isMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
                <Cog className="w-6 h-6 text-primary-foreground animate-spin-slow" />
              </div>
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                CMMS Mobile Pro
              </h2>
              <p className="text-xs text-muted-foreground">Maintenance System</p>
            </div>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 p-3 sm:p-4 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg"
                      : "hover:bg-muted/50 active:scale-[0.98]",
                  )}
                >
                  <div className="relative">
                    <Icon size={18} />
                    {getNotificationCount(item.path) > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {getNotificationCount(item.path)}
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 glass-nav">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
                  <Cog className="w-6 h-6 text-primary-foreground animate-spin-slow" />
                </div>
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  CMMS Pro
                </h2>
                <p className="text-xs text-muted-foreground">Maintenance System</p>
              </div>
            </div>
            <NotificationSystem />
          </div>
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg"
                      : "hover:bg-muted/50",
                  )}
                >
                  <div className="relative">
                    <Icon size={18} />
                    {getNotificationCount(item.path) > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {getNotificationCount(item.path) > 9 ? '9+' : getNotificationCount(item.path)}
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t-0 p-1.5 md:hidden z-30">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const notificationCount = getNotificationCount(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 relative",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground active:scale-95",
                )}
              >
                <div className="relative">
                  <Icon size={18} />
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 truncate font-medium">
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
