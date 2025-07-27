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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { path: "/", label: "หน้าหลัก", icon: LayoutDashboard },
  { path: "/work-orders", label: "ใบสั่งงาน", icon: ClipboardList },
  { path: "/assets", label: "อุปกรณ์", icon: Package },
  { path: "/parts", label: "คลังอะไหล่", icon: Settings },
  { path: "/schedule", label: "ตารางงาน", icon: Calendar },
  { path: "/reports", label: "รายงาน", icon: BarChart3 },
  { path: "/notifications", label: "การแจ้งเตือน", icon: Bell },
  { path: "/users", label: "ผู้ใช้งาน", icon: Users },
  { path: "/settings", label: "ตั้งค่า", icon: Settings },
  { path: "/data-transfer", label: "จัดการข้อมูล", icon: Download },
  { path: "/qr-scanner", label: "สแกน QR", icon: QrCode },
];

export function MobileNav() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="glass-nav p-4 flex items-center justify-between md:hidden sticky top-0 z-40">
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          CMMS Mobile Pro
        </h1>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-primary/10 rounded-xl transition-all duration-200 hover:scale-105"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
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
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-8">
            CMMS Mobile Pro
          </h2>
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
                    "flex items-center space-x-3 p-4 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg"
                      : "hover:bg-muted/50 hover:scale-105",
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 glass-nav">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-8">
            CMMS Mobile Pro
          </h2>
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg"
                      : "hover:bg-muted/50 hover:scale-105",
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t-0 p-2 md:hidden z-30">
        <div className="flex justify-around">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-0 flex-1",
                  isActive
                    ? "text-primary bg-primary/10 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                )}
              >
                <Icon size={18} />
                <span className="text-xs mt-1 truncate font-medium">
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
