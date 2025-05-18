import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GameZoneProvider } from "@/context/GameZoneContext";
import { POSProvider } from "@/context/POSContext";
import { PINProvider, usePIN } from "@/context/PINContext";
import Index from "./pages/Index";
import DevicesPage from "./pages/DevicesPage";
import LogsPage from "./pages/LogsPage";
import POSPage from "./pages/POSPage";
import TransactionsPage from "./pages/TransactionsPage";
import SalesSummaryPage from "./pages/SalesSummaryPage";
import PINLockPage from "./pages/PINLockPage";
import PINManagementPage from "./pages/PINManagementPage";
import ExpensesPage from "./pages/ExpensesPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLocked, isPINSet } = usePIN();
  
  if (isLocked && isPINSet) {
    return <Navigate to="/lock" replace />;
  }
  
  return <>{children}</>;
};

// Main app with providers
const AppContent = () => {
  return (
    <PINProvider>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/lock" element={<PINLockPage />} />
          <Route path="/pin-management" element={<PINManagementPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <DevicesPage />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/logs" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <LogsPage />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/pos" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <POSPage />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/transactions" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <TransactionsPage />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/sales-summary" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <SalesSummaryPage />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/expenses" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <ExpensesPage />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </PINProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GameZoneProvider>
      <POSProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </POSProvider>
    </GameZoneProvider>
  </QueryClientProvider>
);

export default App;
