/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { Layout } from './components/Layout';
import { Toaster } from 'react-hot-toast';
import OfflineStatus from './components/OfflineStatus';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './components/ui/Button';

// Global Error Boundary
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[CRITICAL_ERROR]", error, errorInfo);
  }

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-[32px] flex items-center justify-center mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Ops! Algo deu errado.</h1>
          <p className="text-slate-500 font-medium max-w-sm mb-8">
            Encontramos um erro inesperado ao carregar sua experiência Roxou. Tente recarregar a página.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 py-6 px-8 shadow-xl"
          >
            <RefreshCcw size={20} /> RECARREGAR APP
          </Button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import MarketMode from './pages/MarketMode';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AuthCallback from './pages/AuthCallback';
import Premium from './pages/Premium';
import BillingSuccess from './pages/BillingSuccess';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

import { ENV } from './config/env';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function App() {
  useRegisterSW({
    onNeedRefresh() {
      console.log("[PWA] New version available, reloading...");
      window.location.reload();
    },
    onOfflineReady() {
      console.log("[PWA] App ready for offline use.");
    }
  });

  React.useEffect(() => {
    console.log("[BOOT] App mounted successfully.");
    console.log("[BOOT] Environment Configuration:", {
      isProd: ENV.isProd,
      hasSupabase: !!ENV.supabase.url,
      hasStripe: !!ENV.stripe.publicKey,
      appUrl: ENV.appUrl
    });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <UIProvider>
          <Router>
            <OfflineStatus />
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#0f172a',
                  borderRadius: '24px',
                  padding: '16px 24px',
                  fontWeight: 'bold',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                },
              }}
            />
            <Routes>
              <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              
              <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/listas" element={<Lists />} />
                <Route path="/listas/:id" element={<ListDetail />} />
                <Route path="/estoque" element={<Inventory />} />
                <Route path="/relatorios" element={<Reports />} />
                <Route path="/configuracoes" element={<Settings />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/billing/success" element={<BillingSuccess />} />
              </Route>
  
              <Route path="/mercado/:id" element={<PrivateRoute><MarketMode /></PrivateRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </Router>
        </UIProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
