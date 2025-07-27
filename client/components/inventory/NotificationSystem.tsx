import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bell, AlertTriangle, Package, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Link } from 'react-router-dom';
import { StockAlert, AlertSeverity } from '@shared/inventory-types';
import { useRealTimeAlerts } from '@/hooks/use-inventory';

interface NotificationSystemProps {
  className?: string;
}

export function NotificationSystem({ className = '' }: NotificationSystemProps) {
  const { alerts, isConnected } = useRealTimeAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Show toast notifications for new critical alerts
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.severity === 'CRITICAL' && !dismissedAlerts.has(alert.id)) {
        toast.error(
          `🚨 ${alert.partName}: ${alert.message}`,
          {
            duration: 10000,
            action: {
              label: 'ดูรายละเอียด',
              onClick: () => window.open(`/parts/${alert.partId}`, '_blank'),
            },
          }
        );
      }
    });
  }, [alerts, dismissedAlerts]);

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));
  const criticalCount = visibleAlerts.filter(alert => alert.severity === 'CRITICAL').length;
  const totalCount = visibleAlerts.length;

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const dismissAllAlerts = () => {
    setDismissedAlerts(new Set(alerts.map(alert => alert.id)));
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-destructive';
      case 'HIGH':
        return 'text-orange-500';
      case 'MEDIUM':
        return 'text-warning';
      case 'LOW':
        return 'text-blue-500';
      case 'INFO':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4" />;
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4" />;
      case 'MEDIUM':
        return <Package className="h-4 w-4" />;
      case 'LOW':
        return <Package className="h-4 w-4" />;
      case 'INFO':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 hover:bg-muted/50"
          >
            <Bell className={`h-5 w-5 ${isConnected ? 'text-foreground' : 'text-muted-foreground'}`} />
            {totalCount > 0 && (
              <Badge
                variant={criticalCount > 0 ? 'destructive' : 'secondary'}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {totalCount > 99 ? '99+' : totalCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">การแจ้งเตือนสต็อก</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
                </span>
              </div>
            </div>
            {totalCount > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">
                  {totalCount} การแจ้งเตือน
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissAllAlerts}
                  className="text-xs h-auto p-1"
                >
                  ปิดทั้งหมด
                </Button>
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {visibleAlerts.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  ไม่มีการแจ้งเตือนใหม่
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {visibleAlerts.slice(0, 10).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 hover:bg-muted/50 border-l-2 ${
                      alert.severity === 'CRITICAL' ? 'border-l-destructive bg-destructive/5' :
                      alert.severity === 'HIGH' ? 'border-l-orange-500 bg-orange-50' :
                      'border-l-warning bg-warning/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${getSeverityColor(alert.severity)}`}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium text-sm truncate">
                            {alert.partName}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissAlert(alert.id)}
                            className="h-auto p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {alert.partNumber}
                        </p>
                        <p className="text-sm text-foreground mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(alert.createdAt)}
                          </span>
                          <div className="flex gap-1">
                            <Link to={`/parts/${alert.partId}`}>
                              <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                                ดู
                              </Button>
                            </Link>
                            {(alert.alertType === 'LOW_STOCK' || alert.alertType === 'OUT_OF_STOCK') && (
                              <Button size="sm" className="h-6 px-2 text-xs">
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                สั่งซื้อ
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {visibleAlerts.length > 10 && (
                  <div className="p-3 text-center border-t">
                    <Link to="/inventory/alerts">
                      <Button variant="outline" size="sm" className="text-xs">
                        ดูการแจ้งเตือนทั้งหมด ({visibleAlerts.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {totalCount > 0 && (
            <div className="p-3 border-t bg-muted/30">
              <div className="flex gap-2">
                <Link to="/inventory/alerts" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    จัดการทั้งหมด
                  </Button>
                </Link>
                <Link to="/parts" className="flex-1">
                  <Button size="sm" className="w-full text-xs">
                    ไปที่คลังอะไหล่
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Hook for managing notification preferences
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState({
    enableToasts: true,
    enableSound: false,
    criticalOnly: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // Save to localStorage
    localStorage.setItem('inventory-notification-preferences', JSON.stringify({
      ...preferences,
      [key]: value,
    }));
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('inventory-notification-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    }
  }, []);

  const isQuietTime = () => {
    if (!preferences.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = parseInt(preferences.quietHours.start.replace(':', ''));
    const endTime = parseInt(preferences.quietHours.end.replace(':', ''));
    
    if (startTime > endTime) {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  };

  return {
    preferences,
    updatePreference,
    isQuietTime,
  };
}