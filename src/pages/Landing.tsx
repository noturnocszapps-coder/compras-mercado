import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Mic, Camera, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-20 gap-16 px-6 bg-[#F0F4F2]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-10 max-w-4xl"
      >
        <div className="flex items-center gap-3 bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full border border-emerald-200">
           <Sparkles size={16} className="animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">O Futuro das Compras</span>
        </div>

        <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center shadow-2xl shadow-emerald-200 rotate-6 hover:rotate-0 transition-transform duration-500">
          <ShoppingBag size={48} color="white" strokeWidth={3} />
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1] tracking-tighter uppercase italic">
          SUA COMPRA, <br/>
          <span className="text-primary not-italic">INTELIGENTE.</span>
        </h1>

        <p className="text-slate-500 max-w-xl text-xl font-bold leading-relaxed">
           Tecnologia avançada que entende sua voz, lê etiquetas e economiza seu tempo e dinheiro no mercado.
        </p>

        <div className="flex flex-col w-full gap-4 sm:flex-row sm:justify-center mt-4">
          <Link 
            to="/register" 
            className="bold-button-primary !px-12 !py-6 !text-2xl"
          >
            Começar Grátis
          </Link>
          <Link 
            to="/login" 
            className="bold-button-secondary !px-12 !py-6 !text-2xl"
          >
            Entrar
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
        <FeatureCard 
          icon={Camera} 
          title="Scanner IA" 
          desc="Tire foto de etiquetas para preencher sua lista e comparar preços instantaneamente."
          color="bg-blue-50 text-blue-600"
        />
        <FeatureCard 
          icon={Mic} 
          title="Voz Fluida" 
          desc="Adicione itens ou marque como 'comprado' apenas falando naturalmente com o app."
          color="bg-orange-50 text-orange-600"
        />
        <FeatureCard 
          icon={Sparkles} 
          title="Previsão Real" 
          desc="Nossa IA prevê quando seus itens vão acabar e alerta no melhor momento de compra."
          color="bg-emerald-50 text-emerald-600"
        />
        <FeatureCard 
          icon={ShieldCheck} 
          title="Segurança" 
          desc="Histórico e notas fiscais guardadas com criptografia de ponta a ponta na nuvem."
          color="bg-slate-100 text-slate-600"
        />
      </div>

      <footer className="mt-12 text-slate-300 font-black uppercase tracking-widest text-[10px]">
        CompraFácil IA © 2026 • Simplificando a vida doméstica.
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
  <div className="p-8 bg-white rounded-[40px] border border-emerald-100 text-left flex flex-col gap-6 shadow-xl shadow-emerald-900/5 hover:-translate-y-2 transition-all group">
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", color)}>
      <Icon size={28} strokeWidth={3} />
    </div>
    <div className="flex flex-col gap-2">
      <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-slate-500 font-bold leading-relaxed">{desc}</p>
    </div>
  </div>
);
