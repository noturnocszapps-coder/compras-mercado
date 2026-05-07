import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { Layout } from './components/Layout';
import { Toaster } from 'react-hot-toast';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
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
    console.error("[CRITICAL_REACT_ERROR]", error, errorInfo);
  }

  handleRecovery = () => {
    console.log("[RECOVERY] Clearing session and redirecting to login");
    sessionStorage.clear();
    localStorage.removeItem("comprafacil_safe_error");
    window.location.href = "/login";
  };

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-[32px] flex items-center justify-center mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Ops! Algo deu errado.</h1>
          <p className="text-slate-500 font-medium max-w-sm mb-8">
            Encontramos um erro inesperado. Vamos tentar restaurar sua sessão.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button 
              onClick={this.handleRecovery}
              className="flex items-center justify-center gap-2 py-6 px-8 shadow-xl"
            >
              <RefreshCcw size={20} /> RECARREGAR APP
            </Button>
            <Button 
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="flex items-center justify-center gap-2 py-6 px-8 border-2"
            >
              <Home size={20} /> VOLTAR PARA INÍCIO
            </Button>
          </div>
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

const LoadingScreen = ({ text = 'Carregando...' }: { text?: string }) => {
  const [showRecovery, setShowRecovery] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowRecovery(true);
      console.log("[RECOVERY] Loading timeout reached (8s)");
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleClear = () => {
    console.log("[RECOVERY] Clearing state and going to login");
    sessionStorage.clear();
    localStorage.removeItem('comprafacil_safe_error');
    window.location.href = '/login';
  };

  if (showRecovery) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-[32px] flex items-center justify-center mb-6 animate-pulse">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Muito tempo esperado?</h1>
        <p className="text-slate-500 font-medium max-w-sm mb-8">
          O carregamento está demorando demais. Isso pode ser um problema de conexão ou sessão.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 py-4 shadow-xl">
            <RefreshCcw size={18} /> TENTAR RECARREGAR
          </Button>
          <Button onClick={handleClear} variant="outline" className="flex items-center justify-center gap-2 py-4 border-2">
            LIMPAR DADOS E IR PARA LOGIN
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="ghost" className="font-bold text-slate-400">
            VOLTAR AO INÍCIO
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{text}</p>
    </div>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen text="Verificando acesso..." />;
  
  if (!user) {
    console.log("[ROUTE_GUARD] No user found, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UIProvider>
          <Router>
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
                <Route path="/ecosystem" element={<EcosystemPage />} />
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
