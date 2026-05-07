import React from 'react';
import { Layers, Smartphone, Globe, ShoppingBag, ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function Ecosystem() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="rounded-full w-10 h-10 p-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Ecossistema Roxou</h2>
      </div>

      <div className="bg-white rounded-[40px] p-8 border border-emerald-100 shadow-xl shadow-emerald-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -translate-y-32 translate-x-32 blur-3xl opacity-60"></div>
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="w-16 h-1 bg-primary rounded-full"></div>
          <h3 className="text-3xl font-black tracking-tight leading-none uppercase">
            Sua Vida <br/> <span className="text-primary italic">Sincronizada.</span>
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            O Compra Fácil faz parte de uma família de aplicativos dedicados a simplificar sua rotina com inteligência e elegância.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EcosystemItem 
          name="Roxou Eventos" 
          desc="Toda a cultura da sua cidade em um só lugar. Ingressos, agenda e notificações inteligentes." 
          color="bg-purple-500" 
          icon={Layers}
        />
        <EcosystemItem 
          name="Roxou Transporte" 
          desc="Mobilidade urbana simplificada. Compare preços e tempos de chegada em tempo real." 
          color="bg-blue-500" 
          icon={Globe}
        />
        <EcosystemItem 
          name="Compra Fácil" 
          desc="A inteligência por trás da sua despensa. Economia real com o cérebro do ecossistema." 
          color="bg-emerald-500" 
          icon={ShoppingBag}
          isCurrent
        />
        <EcosystemItem 
          name="Roxou Studio" 
          desc="Onde a criatividade encontra a organização. Gestão de projetos para criativos modernos." 
          color="bg-pink-500" 
          icon={Smartphone}
        />
      </div>

      <div className="mt-8 p-10 bg-slate-900 rounded-[48px] text-white text-center flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10 opacity-50"></div>
        <Layers size={48} className="text-primary mb-2" />
        <h4 className="text-2xl font-black uppercase tracking-tighter italic">Nuvem Roxou®</h4>
        <p className="text-slate-400 font-bold max-w-sm">
          Todos os seus dados são protegidos e sincronizados pela nossa infraestrutura proprietária.
        </p>
        <Button className="mt-4 bg-white text-slate-900 hover:bg-slate-50 bold-button py-6 px-10">
          CONHECER MAIS
        </Button>
      </div>
    </div>
  );
}

function EcosystemItem({ name, desc, color, icon: Icon, isCurrent }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "p-8 rounded-[40px] border flex flex-col gap-6 transition-all group relative overflow-hidden",
        isCurrent ? "bg-white border-emerald-200 shadow-xl shadow-emerald-900/5" : "bg-white/50 border-slate-100 hover:bg-white hover:border-slate-200"
      )}
    >
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12", color)}>
        <Icon size={28} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="text-xl font-black text-slate-900">{name}</h4>
          {isCurrent && (
            <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-500 px-2 py-0.5 rounded-full">
              Instalado
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 font-medium mt-2 leading-tight">{desc}</p>
      </div>
      
      {!isCurrent && (
        <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
          Saiba mais <ExternalLink size={14} />
        </button>
      )}
    </motion.div>
  );
}
