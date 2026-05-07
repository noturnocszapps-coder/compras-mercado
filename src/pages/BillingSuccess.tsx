import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { trackEvent, AnalyticsEvent } from '../lib/analytics';

export default function BillingSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent(AnalyticsEvent.CHECKOUT_COMPLETED);
    trackEvent(AnalyticsEvent.SUBSCRIPTION_ACTIVE);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8 py-10">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="w-32 h-32 bg-primary text-white rounded-[48px] flex items-center justify-center shadow-2xl shadow-emerald-200"
      >
        <CheckCircle size={64} strokeWidth={3} />
      </motion.div>

      <div className="flex flex-col gap-4 max-w-md">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
          Premium <span className="text-primary italic">Ativado!</span>
        </h2>
        <p className="text-slate-400 font-bold">
          Parabéns! Sua assinatura foi ativada com sucesso. Você agora tem acesso total ao Compra Fácil Premium.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button onClick={() => navigate('/listas')} className="w-full py-6 flex items-center justify-center gap-3 shadow-xl">
           IR PARA MINHAS LISTAS <ArrowRight size={20} />
        </Button>
        <div className="flex items-center gap-2 justify-center text-[10px] font-black uppercase text-slate-300 tracking-widest">
           <Zap size={12} fill="currentColor" />
           Ativado por Stripe Billing
        </div>
      </div>
    </div>
  );
}
