import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Sparkles, Mic, Camera, 
  ShieldCheck, ArrowRight, Zap, TrendingUp, 
  Package, Smartphone, Globe, Layers, CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden pt-safe">
      {/* Header / Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 pt-safe">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col gap-0">
            <h1 className="text-xl font-black text-slate-900 leading-none">Compra Fácil</h1>
            <span className="text-[8px] font-black uppercase tracking-widest text-primary">by Roxou</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#ecosystem" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Ecossistema</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-xl transition-all">Entrar</Link>
            <Link to="/register" className="bg-primary text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all">Começar Agora</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-emerald-50 rounded-full blur-3xl -z-10 opacity-60"></div>
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center shadow-2xl shadow-emerald-200 rotate-6"
          >
            <ShoppingBag size={40} color="white" strokeWidth={3} />
          </motion.div>

          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="flex flex-col gap-4"
          >
            <h2 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter uppercase italic">
              Economize com <br/>
              <span className="text-primary not-italic">Inteligência Artificial.</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-bold leading-relaxed mt-4">
              Organize compras, controle estoque e descubra onde economizar de verdade usando o cérebro do ecossistema Roxou no seu mercado.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4"
          >
            <Link to="/register" className="bold-button-primary !text-lg !px-12 !py-6 shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3">
              CRIAR MINHA PRIMEIRA LISTA
              <ArrowRight size={24} />
            </Link>
          </motion.div>

          {/* Social Proof / Trust */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200"></div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300"></div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-400"></div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white text-[10px] font-black">+4k</div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pessoas economizando com Compra Fácil</p>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Funcionalidades</span>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">Tudo que você precisa <br/> em um só app.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureItem 
              icon={Camera}
              title="Scanner de Preços"
              desc="Tire foto de etiquetas ou notas fiscais e deixe a IA preencher tudo automaticamente."
              color="emerald"
            />
            <FeatureItem 
              icon={Mic}
              title="IA via Voz"
              desc="Adicione itens à lista ou atualize preços apenas falando naturalmente com o app."
              color="purple"
            />
            <FeatureItem 
              icon={TrendingUp}
              title="Economy Score"
              desc="Acompanhe sua pontuação de economia baseada no histórico de preços e estoque."
              color="blue"
            />
            <FeatureItem 
              icon={Package}
              title="Gestão de Estoque"
              desc="Saiba exatamente o que tem na despensa e receba alertas quando algo estiver acabando."
              color="amber"
            />
            <FeatureItem 
              icon={ShieldCheck}
              title="Nuvem Roxou"
              desc="Seus dados sincronizados em tempo real entre todos os seus dispositivos com segurança."
              color="slate"
            />
            <FeatureItem 
              icon={Zap}
              title="Previsão de Compra"
              desc="Nossa IA prevê quando um item vai acabar baseado no seu consumo médio real."
              color="pink"
            />
          </div>
        </div>
      </section>

      {/* Hero Mockup Section */}
      <section className="py-24 px-6 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-0 opacity-40"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="flex flex-col gap-8 relative z-10">
            <div className="w-16 h-1 bg-primary rounded-full"></div>
            <h3 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase italic">
              O Modo Mercado <br/> que você <br/> <span className="text-primary not-italic">Sempre quis.</span>
            </h3>
            <p className="text-slate-400 text-xl font-medium leading-relaxed italic">
              "Com o Compra Fácil no celular, eu gasto 15 minutos a menos no mercado e economizo em média R$ 120 por mês."
            </p>
            <div className="flex flex-col gap-4">
               {[
                 "Total parcial instantâneo",
                 "Comparação com última compra",
                 "Otimização de trajeto por categoria",
                 "Modo offline resiliente"
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                     <CheckCircle2 size={16} />
                   </div>
                   <span className="font-bold text-slate-200 tracking-tight">{item}</span>
                 </div>
               ))}
            </div>
            <Link to="/register" className="bold-button-primary !py-5 self-start mt-4">EXPERIMENTAR MODO MERCADO</Link>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[44px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-800 rounded-[40px] border-4 border-slate-700/50 shadow-2xl overflow-hidden aspect-[9/16] w-full max-w-[320px] mx-auto">
               <div className="absolute top-0 left-0 w-full h-12 bg-slate-900/50 backdrop-blur flex items-center justify-between px-6 border-b border-white/5">
                 <div className="w-12 h-2 bg-slate-700 rounded-full"></div>
                 <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
               </div>
               <div className="p-6 pt-16 flex flex-col gap-4">
                  <div className="h-20 bg-slate-700/50 rounded-2xl animate-pulse"></div>
                  <div className="h-10 bg-slate-700/30 rounded-xl animate-pulse"></div>
                  <div className="h-40 bg-slate-700/20 rounded-3xl animate-pulse"></div>
                  <div className="mt-auto h-16 bg-primary rounded-2xl animate-pulse"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Roxou */}
      <section id="ecosystem" className="py-32 px-6 bg-[#F0F4F2]">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-16 text-center">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Layers size={20} className="text-purple-600" />
              <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Ecossistema Roxou</span>
            </div>
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
              Conectado <br/> <span className="text-purple-600">com seu Estilo de Vida.</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
            <AppCard 
              name="Roxou Eventos" 
              desc="Sua agenda cultural" 
              color="bg-purple-500" 
              icon={Smartphone}
            />
            <AppCard 
              name="Roxou Transporte" 
              desc="Mobilidade inteligente" 
              color="bg-blue-500" 
              icon={Globe}
              active
            />
            <AppCard 
              name="Compra Fácil" 
              desc="Suas compras com IA" 
              color="bg-emerald-500" 
              icon={ShoppingBag}
              isCurrent
            />
            <AppCard 
              name="Roxou Studio" 
              desc="Gestão de criativos" 
              color="bg-pink-500" 
              icon={Smartphone}
            />
          </div>
          
          <p className="text-slate-400 font-bold max-w-xl italic">
            O Compra Fácil utiliza a tecnologia de nuvem Roxou® para garantir que sua lista de mercado esteja sempre disponível, segura e inteligente.
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6 bg-primary text-white text-center flex flex-col items-center gap-10">
        <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
          PRONTO PARA TER <br/> <span className="text-primary-dark opacity-40">MAIS TEMPO?</span>
        </h3>
        <p className="text-emerald-100 font-bold text-xl max-w-xl leading-relaxed italic">
          "A economia não está em comprar menos, mas em comprar melhor com a ajuda da IA."
        </p>
        <Link to="/register" className="bg-white text-primary px-16 py-7 rounded-[32px] font-black text-2xl uppercase shadow-2xl shadow-emerald-900/20 active:scale-95 transition-all">
          Começar Grátis Agora
        </Link>
        <div className="flex items-center gap-2 text-primary-dark/60 font-black uppercase tracking-widest text-xs">
          <Sparkles size={16} />
          Powered by Gemini 2.0 Flash
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-0">
               <h4 className="text-2xl font-black text-slate-800">Compra Fácil</h4>
               <span className="text-[10px] font-black uppercase tracking-widest text-primary">by Roxou</span>
            </div>
            <p className="text-slate-400 font-medium">A plataforma definitiva para gestão de compras e estoque inteligente no Brasil.</p>
          </div>
          
          <div className="flex flex-col gap-6">
             <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Produto</h5>
             <div className="flex flex-col gap-3">
               <a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Funcionalidades</a>
               <a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Modo Mercado</a>
               <a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Preços</a>
             </div>
          </div>

          <div className="flex flex-col gap-6">
             <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Empresa</h5>
             <div className="flex flex-col gap-3">
               <a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Sobre Roxou</a>
               <a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Privacidade</a>
               <a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Termos</a>
             </div>
          </div>

          <div className="flex flex-col gap-6">
             <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Suporte</h5>
             <div className="flex flex-col gap-3">
               <a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Ajuda</a>
               <a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Contato</a>
               <a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors">Estatuto</a>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-50 text-center flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest">Compra Fácil by Roxou © 2026 • Todos os direitos reservados</p>
          <div className="flex items-center gap-6">
            <div className="w-6 h-6 bg-slate-100 rounded-full"></div>
            <div className="w-6 h-6 bg-slate-100 rounded-full"></div>
            <div className="w-6 h-6 bg-slate-100 rounded-full"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FeatureItem = ({ icon: Icon, title, desc, color }: any) => {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-50 text-slate-600",
    pink: "bg-pink-50 text-pink-600",
  };
  return (
    <div className="group p-10 bg-slate-50/50 rounded-[48px] border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500">
      <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform", colors[color])}>
        <Icon size={32} strokeWidth={3} />
      </div>
      <h4 className="text-2xl font-black text-slate-800 mb-4">{title}</h4>
      <p className="text-slate-500 font-bold leading-relaxed">{desc}</p>
    </div>
  );
};

const AppCard = ({ name, desc, color, icon: Icon, active, isCurrent }: any) => (
  <div className={cn(
    "p-8 rounded-[40px] flex flex-col gap-6 text-left transition-all relative overflow-hidden group",
    isCurrent ? "bg-white shadow-2xl shadow-emerald-900/10 scale-105 z-10 border-2 border-emerald-400" : "bg-white/50 border border-slate-100 hover:bg-white hover:shadow-xl"
  )}>
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-12", color)}>
      <Icon size={28} />
    </div>
    <div>
      <h4 className="text-xl font-black text-slate-900 leading-tight">{name}</h4>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{desc}</p>
    </div>
    {isCurrent && (
      <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
        Atual
      </div>
    )}
  </div>
);
