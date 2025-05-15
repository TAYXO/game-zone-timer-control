
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameZoneProvider } from "@/context/GameZoneContext";
import { POSProvider } from "@/context/POSContext";
import Index from "./pages/Index";
import DevicesPage from "./pages/DevicesPage";
import LogsPage from "./pages/LogsPage";
import POSPage from "./pages/POSPage";
import TransactionsPage from "./pages/TransactionsPage";
import SalesSummaryPage from "./pages/SalesSummaryPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GameZoneProvider>
      <POSProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Navbar />
              <Routes>
                <Route path="/" element={<DevicesPage />} />
                <Route path="/logs" element={<LogsPage />} />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/sales-summary" element={<SalesSummaryPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </POSProvider>
    </GameZoneProvider>
  </QueryClientProvider>
);

export default App;
