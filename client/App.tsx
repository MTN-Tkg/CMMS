import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import { WorkOrders } from "./pages/WorkOrders";
import { WorkOrderDetail } from "./pages/WorkOrderDetail";
import { WorkOrderForm } from "./pages/WorkOrderForm";
import { QRScanner } from "./pages/QRScanner";
import { CreateWorkOrderFromQR } from "./pages/CreateWorkOrderFromQR";
import { Assets } from "./pages/Assets";
import { AssetDetail } from "./pages/AssetDetail";
import { Parts } from "./pages/Parts";
import { PartDetail } from "./pages/PartDetail";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { Schedule } from "./pages/Schedule";
import Reports from "./pages/Reports";
import { Notifications } from "./pages/Notifications";
import { Users } from "./pages/Users";
import { Settings } from "./pages/Settings";
import { DataTransfer } from "./pages/DataTransfer";
import { InventoryAlerts } from "./pages/InventoryAlerts";
import { InventoryDashboard } from "./pages/InventoryDashboard";
import SupabaseTest from "./pages/SupabaseTest";
import { MobileNav } from "./components/MobileNav";
import { PWAInstall, PWAStatus } from "./components/PWAInstall";
import NotFound from "./pages/NotFound";
import PMExecution from "./pages/PMExecution";
import { PMQRScanner } from "./pages/PMQRScanner";
import PreventiveMaintenance from "./pages/PreventiveMaintenance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

const ProtectedRoute = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {session && <MobileNav />}
      {session && <PWAInstall showBanner={true} autoShow={false} />}
      
      <main className={session ? "md:ml-64" : ""}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/work-orders/new" element={<WorkOrderForm />} />
              <Route path="/work-orders/edit/:id" element={<WorkOrderForm />} />
              <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
              <Route path="/qr-scanner" element={<QRScanner />} />
              <Route path="/pm-qr-scanner" element={<PMQRScanner />} />
              <Route
                path="/create-work-order"
                element={<CreateWorkOrderFromQR />}
              />
              <Route path="/assets" element={<Assets />} />
              <Route path="/assets/:id" element={<AssetDetail />} />
              
              <Route path="/preventive-maintenance" element={<PreventiveMaintenance />} />
              <Route path="/pm-execution/:templateId" element={<PMExecution />} />

              <Route path="/schedule" element={<Schedule />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/users" element={<Users />} />
              <Route path="/parts" element={<Parts />} />
              <Route path="/parts/:id" element={<PartDetail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/data-transfer" element={<DataTransfer />} />
              <Route path="/inventory" element={<InventoryDashboard />} />
              <Route path="/inventory/alerts" element={<InventoryAlerts />} />
              <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
              <Route path="/supabase-test" element={<SupabaseTest />} />
              <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

// Prevent duplicate root creation during HMR
const container = document.getElementById("root")!;
const containerWithRoot = container as HTMLElement & { _reactRootContainer?: any };

if (!containerWithRoot._reactRootContainer) {
  const root = createRoot(container);
  containerWithRoot._reactRootContainer = root;
  root.render(<App />);
} else {
  containerWithRoot._reactRootContainer.render(<App />);
}
