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
import { AlertCircle, RefreshCcw, ShieldAlert } from 'lucide-react';
import { Button } from './components/ui/Button';
import { SAFE_MODE } from './config/features';

console.log("[BOOT_STAGE] App.tsx module loaded");

// Global Error Boundary
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[CRITICAL_REACT_ERROR]", error, errorInfo);
    (this as any).setState({ errorInfo });
  }

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-[32px] flex items-center justify-center mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Erro de Componente</h1>
          <p className="text-slate-500 font-medium max-w-sm mb-4">
            Um componente falhou ao renderizar. Estamos em modo de diagnóstico.
          </p>
          
          <div className="bg-slate-900 text-emerald-400 p-6 rounded-2xl text-left font-mono text-sm mb-8 max-w-2xl overflow-auto w-full">
            <p className="text-red-400 font-bold mb-2">Erro: {(this as any).state.error?.message}</p>
            <p className="text-slate-500 mb-2">Componente Stack:</p>
            <pre className="whitespace-pre-wrap">{(this as any).state.errorInfo?.componentStack}</pre>
          </div>

          <Button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 py-6 px-8 shadow-xl"
          >
            <RefreshCcw size={20} /> TENTAR NOVAMENTE
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
import EcosystemPage from './pages/Ecosystem';

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
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

import { ENV } from './config/env';
// import { useRegisterSW } from 'virtual:pwa-register/react';

export default function App() {
  React.useEffect(() => {
    console.log("[BOOT_STAGE] App mounted");
    console.log("[BOOT_STAGE] SAFE_MODE Active:", SAFE_MODE);
  }, []);

  if (SAFE_MODE) {
    console.log("[BOOT_STAGE] Rendering SAFE_MODE Router");
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <UIProvider>
          <Router>
            {SAFE_MODE && (
              <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
                <div className="bg-red-600 text-white text-[10px] font-black py-1 px-4 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                  <ShieldAlert size={12} /> SAFE MODE: DIAGNÓSTICO ATIVADO
                </div>
              </div>
            )}
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
                {!SAFE_MODE && (
                  <>
                    <Route path="/estoque" element={<Inventory />} />
                    <Route path="/relatorios" element={<Reports />} />
                    <Route path="/configuracoes" element={<Settings />} />
                    <Route path="/premium" element={<Premium />} />
                    <Route path="/billing/success" element={<BillingSuccess />} />
                    <Route path="/ecosystem" element={<EcosystemPage />} />
                  </>
                )}
                {SAFE_MODE && (
                  <Route path="/configuracoes" element={<Settings />} />
                )}
              </Route>
  
              <Route path="/mercado/:id" element={<PrivateRoute><MarketMode /></PrivateRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </UIProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
