import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, X, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useSubscription } from '../hooks/useSubscription';
import { trackEvent, AnalyticsEvent } from '../lib/analytics';

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
  fallback?: React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ children, feature, fallback }) => {
  const { isPremium, loading } = useSubscription();
  const [showModal, setShowModal] = React.useState(false);
  const navigate = useNavigate();

  if (loading) return null;

  if (isPremium) {
    return <>{children}</>;
  }

  const handleOpenModal = () => {
    trackEvent(AnalyticsEvent.PREMIUM_GATE_VIEWED, { feature });
    setShowModal(true);
  };

  if (fallback) {
    return (
      <div onClick={handleOpenModal} className="cursor-pointer">
        {fallback}
      </div>
    );
  }

  return (
    <>
      <div onClick={handleOpenModal}>
        <div className="relative group">
          <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[1px] rounded-inherit z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
             <div className="bg-white/90 p-4 rounded-2xl flex items-center gap-2 shadow-xl border border-slate-100">
                <Zap size={16} className="text-primary" fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">RECURSO PREMIUM</span>
             </div>
          </div>
          <div className="pointer-events-none opacity-40 grayscale">
            {children}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[50px] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden text-center"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-300"
              >
                <X size={24} />
              </button>

              <div className="mx-auto w-24 h-24 bg-primary text-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-emerald-200 rotate-6">
                <Zap size={48} fill="white" strokeWidth={3} />
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">IA PREMIUM</h3>
                <p className="text-slate-400 font-bold italic">
                  O recurso <span className="text-slate-900 underline decoration-primary decoration-4 underline-offset-4">{feature}</span> está disponível apenas para membros <span className="text-primary italic">Roxou Premium</span>.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => navigate('/premium')}
                  size="lg"
                  className="w-full flex items-center justify-center gap-3 py-8"
                >
                  CONHECER PLANOS <ChevronRight size={20} />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="w-full"
                >
                  AGORA NÃO
                </Button>
              </div>

              <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-300">
                 <div className="flex items-center gap-2">
                    <ShieldCheck size={14} /> SEM ANÚNCIOS
                 </div>
                 <div className="flex items-center gap-2">
                    <Zap size={14} fill="currentColor" /> MAIS IA
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
