import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { useAuth } from '../context/AuthContext';
import * as LucideIcons from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';
import { supabase } from '../lib/supabase';
import { useUI } from '../context/UIContext';

export const Layout: React.FC = () => {
  const { user, profile } = useAuth();
  const { isVoiceAssistantOpen, closeVoiceAssistant, openVoiceAssistant } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const handleVoiceAction = async (action: any) => {
    console.log('Voice Action:', action);
    if (!user) return;

    if (action.action === 'addItem') {
      const listId = location.pathname.startsWith('/listas/') ? location.pathname.split('/')[2] : null;
      if (listId) {
        const { error } = await supabase
          .from('shopping_items')
          .insert({
            name: action.data.name,
            quantity: action.data.quantity,
            unit: action.data.unit,
            category: action.data.category,
            estimated_price: action.data.price,
            list_id: listId,
            user_id: user.id,
            is_checked: false
          });
        
        if (error) console.error(error);
      } else {
        alert(`O item "${action.data.name}" foi interpretado. Entre em uma lista para adicionar via voz!`);
      }
    } else if (action.action === 'navigate') {
      navigate(action.data.destination);
    }
  };

  return (
    <div className="min-h-screen-safe flex flex-col pb-32 md:pb-0 md:pl-72 bg-[#F0F4F2] pb-safe">
      {user && (
        <>
          <VoiceAssistant 
            isOpen={isVoiceAssistantOpen} 
            onClose={closeVoiceAssistant} 
            onAction={handleVoiceAction} 
          />
          <Header />
          {/* Desktop Nav */}
          <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-emerald-100 flex-col p-8 z-40">
            <div className="flex flex-col gap-1 mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <LucideIcons.ShoppingBag size={24} />
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-800">
                  Compra Fácil
                </h1>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-13">by Roxou</p>
            </div>
            
            <nav className="flex flex-col gap-3">
              <DesktopNavItem to="/dashboard" icon="LayoutDashboard" label="Dashboard" />
              <DesktopNavItem to="/listas" icon="List" label="Minhas Listas" />
              <DesktopNavItem to="/estoque" icon="Package" label="Estoque" />
              <DesktopNavItem to="/relatorios" icon="PieChart" label="Relatórios" />
              <DesktopNavItem to="/configuracoes" icon="Settings" label="Configurações" />
            </nav>

            <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Apps Roxou</p>
              <div className="flex flex-col gap-1">
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-xs font-bold text-slate-600">Roxou Eventos</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-xs font-bold text-slate-600">Roxou Transporte</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-2 h-2 bg-pink-500 rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-xs font-bold text-slate-600">Roxou Studio</span>
                </a>
              </div>
            </div>

            <div className="mt-auto p-6 bg-slate-900 rounded-[32px] text-white shadow-xl shadow-slate-900/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-primary/30 transition-all"></div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Sugestão IA</p>
              <p className="text-sm leading-relaxed font-bold italic relative z-10">
                "O preço do Leite baixou no mercado vizinho. Notificar?"
              </p>
              <button className="mt-4 w-full bg-primary text-white py-3 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-all relative z-10">
                Ver Agora
              </button>
            </div>
            
            <div className="mt-8 flex items-center gap-4 border-t border-slate-50 pt-8">
              <div className="w-12 h-12 bg-slate-200 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center">
                <span className="font-black text-slate-500">{profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 leading-tight">{profile?.full_name || profile?.email || 'Usuário'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Família Oliveira</p>
              </div>
            </div>
          </aside>
        </>
      )}
      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
      {user && <BottomNav onVoiceClick={openVoiceAssistant} />}
    </div>
  );
};

const DesktopNavItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => {
  const Icon = (LucideIcons as any)[icon] || LucideIcons.HelpCircle;
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all",
          isActive 
            ? "nav-item-active" 
            : "text-slate-600 hover:bg-slate-50 font-black text-lg"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={24} strokeWidth={isActive ? 3 : 2.5} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
};
