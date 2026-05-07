import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Star, Users, Zap, Shield, HelpCircle, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { trackEvent, AnalyticsEvent } from '../lib/analytics';
import { useSubscription } from '../hooks/useSubscription';
import toast from 'react-hot-toast';

export default function Premium() {
  const { user } = useAuth();
  const { isPremium, plan: currentPlan } = useSubscription();
  const [loading, setLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    trackEvent(AnalyticsEvent.PREMIUM_PAGE_VIEW);
  }, []);

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para assinar.');
      return;
    }

    setLoading(plan);
    trackEvent(AnalyticsEvent.CHECKOUT_STARTED, { plan });

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          plan
        })
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      
      window.location.href = url;
    } catch (err: any) {
      toast.error('Erro ao iniciar checkout: ' + err.message);
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-20">
      <div className="text-center flex flex-col gap-4">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="mx-auto w-20 h-20 bg-primary text-white rounded-[32px] flex items-center justify-center shadow-xl shadow-emerald-200 rotate-6 mb-4"
        >
          <Zap size={40} fill="white" strokeWidth={3} />
        </motion.div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
          Compra Fácil <span className="text-primary">Premium</span>
        </h2>
        <p className="text-slate-400 font-bold italic max-w-sm mx-auto">
          Desbloqueie o poder máximo da IA e economize tempo e dinheiro em cada compra.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanCard 
          title="Mensal"
          price="R$ 9,90"
          period="/mês"
          plan="premium_monthly"
          current={currentPlan === 'premium_monthly'}
          features={[
            'Scanner IA ilimitado',
            'Histórico de preços completo',
            'Score de economia avançado',
            'Relatórios com insights IA',
            'Sincronização PWA'
          ]}
          onSubscribe={() => handleSubscribe('premium_monthly')}
          loading={loading === 'premium_monthly'}
        />
        
        <PlanCard 
          title="Anual"
          price="R$ 89,90"
          period="/ano"
          plan="premium_yearly"
          current={currentPlan === 'premium_yearly'}
          featured
          badge="Economize 25%"
          features={[
            'Tudo do plano Mensal',
            'Selo Exclusivo Anual',
            'Prioridade em novos recursos',
            'Suporte Roxou VIP'
          ]}
          onSubscribe={() => handleSubscribe('premium_yearly')}
          loading={loading === 'premium_yearly'}
        />

        <PlanCard 
          title="Família"
          price="R$ 19,90"
          period="/mês"
          plan="family"
          current={currentPlan === 'family'}
          icon={Users}
          features={[
            'Até 5 membros da família',
            'Listas Compartilhadas Realtime',
            'Estoque da Casa Unificado',
            'Insights para a família',
            'Tudo do Premium Individual'
          ]}
          onSubscribe={() => handleSubscribe('family')}
          loading={loading === 'family'}
        />
      </div>

      <Card className="p-10 bg-slate-900 text-white flex flex-col md:flex-row items-center gap-10 overflow-hidden relative" hover={false}>
         <div className="flex-1 flex flex-col gap-4 relative z-10">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Por que ser Premium?</h3>
            <p className="text-slate-400 font-medium">Nosso plano premium foi desenhado para quem valoriza organização e eficiência nos mínimos detalhes. Com a IA Roxou, você não apenas faz listas, você domina seu orçamento.</p>
            <div className="flex flex-wrap gap-4 mt-4">
               <FeatureIcon icon={Shield} label="Seguro" />
               <FeatureIcon icon={Zap} label="Veloz" />
               <FeatureIcon icon={Star} label="Exclusivo" />
            </div>
         </div>
         <div className="w-full md:w-1/3 aspect-square bg-emerald-500/20 rounded-[40px] flex items-center justify-center -rotate-6 blur-3xl absolute -right-20 -bottom-20 pointer-events-none"></div>
      </Card>

      <section className="flex flex-col gap-8">
        <h4 className="text-xl font-black uppercase tracking-widest text-center">FAQ</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FaqItem question="Como funciona o cancelamento?" answer="Você pode cancelar a qualquer momento através do portal do cliente. O acesso premium continuará ativo até o fim do período já pago." />
          <FaqItem question="Tenho suporte no plano free?" answer="Sim, oferecemos suporte básico para todos os usuários através da comunidade Roxou." />
          <FaqItem question="O Pix é aceito?" answer="Sim! Através do Stripe Checkout habilitamos pagamentos via Cartão de Crédito e Pix (quando disponível)." />
          <FaqItem question="Posso mudar de plano depois?" answer="Com certeza. Ao migrar do mensal para o anual, o valor será recalculado automaticamente." />
        </div>
      </section>
    </div>
  );
}

const PlanCard = ({ title, price, period, features, featured, badge, onSubscribe, loading, current, icon: Icon = Star, plan }: any) => (
  <Card 
    className={current ? "border-4 border-primary bg-emerald-50/20 shadow-none scale-105" : "p-0 relative h-full flex flex-col"}
    hover={!current}
  >
    {featured && !current && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap z-10 shadow-xl">
        Mais Escolhido
      </div>
    )}
    
    <div className="p-8 flex flex-col gap-6 flex-1">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h4 className="text-xl font-black uppercase tracking-tight">{title}</h4>
          {badge && <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md mt-1 w-fit">{badge}</span>}
        </div>
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
          <Icon size={24} />
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black tracking-tighter italic">{price}</span>
        <span className="text-xs font-bold text-slate-400 uppercase italic tracking-widest">{period}</span>
      </div>

      <div className="flex flex-col gap-4 py-6 border-y-2 border-slate-50">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-3">
             <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                <Check size={12} strokeWidth={4} />
             </div>
             <span className="text-sm font-bold text-slate-600 leading-tight">{f}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <Button 
          onClick={onSubscribe} 
          disabled={loading || current}
          className={current ? "w-full !bg-slate-100 !text-slate-400 cursor-default shadow-none" : "w-full py-6"}
        >
          {loading ? <Loader2 className="animate-spin" /> : current ? 'PLANO ATUAL' : 'ASSINAR AGORA'}
        </Button>
      </div>
    </div>
  </Card>
);

const FeatureIcon = ({ icon: Icon, label }: any) => (
  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
     <Icon size={16} className="text-primary" />
     <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

const FaqItem = ({ question, answer }: any) => (
  <div className="p-6 bg-slate-50 rounded-[32px] flex flex-col gap-2 hover:bg-white transition-colors border-2 border-transparent hover:border-slate-100 group">
    <div className="flex items-start gap-4">
       <HelpCircle className="text-slate-200 mt-1 flex-shrink-0 group-hover:text-primary transition-colors" size={20} />
       <div className="flex flex-col gap-1">
          <p className="font-black text-slate-900 leading-tight uppercase text-xs">{question}</p>
          <p className="text-sm font-medium text-slate-500">{answer}</p>
       </div>
    </div>
  </div>
);
