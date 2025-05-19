import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { POSProvider } from './context/POSContext';
import { GameZoneProvider } from './context/GameZoneContext';
import { PINProvider } from './context/PINContext';
import { usePIN } from './context/PINContext';
import Navbar from './components/Navbar';
import PINLock from './components/PINLock';
import SettingsPage from './pages/SettingsPage';
import POSPage from './pages/POSPage';
import TransactionsPage from './pages/TransactionsPage';
import ExpensesPage from './pages/ExpensesPage';
import SalesSummaryPage from './pages/SalesSummaryPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';
import { Toaster } from "@/components/ui/toaster"

const App = () => {
  const { isPINSet, verifyPIN } = usePIN();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (isPINSet) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
      setIsAppReady(true);
    };

    checkAuthentication();
  }, [isPINSet]);

  const handlePINSubmit = async (pin: string) => {
    const isValid = await verifyPIN(pin);
    if (isValid) {
      setIsAuthenticated(true);
    }
  };

  if (!isAppReady) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <SettingsProvider>
        <PINProvider>
          <GameZoneProvider>
            <POSProvider>
              {isPINSet && !isAuthenticated ? (
                <PINLock onPINSubmit={handlePINSubmit} />
              ) : (
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Navigate to="/pos" />} />
                    <Route path="/pos" element={<POSPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/sales-summary" element={<SalesSummaryPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </>
              )}
            </POSProvider>
          </GameZoneProvider>
        </PINProvider>
      </SettingsProvider>
      <Toaster />
    </Router>
  );
};

export default App;
