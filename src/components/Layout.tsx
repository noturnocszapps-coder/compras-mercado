import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { useAuth } from '../context/AuthContext';
import * as LucideIcons from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

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
        await addDoc(collection(db, 'shopping_items'), {
          ...action.data,
          listId,
          userId: user.uid,
          isChecked: false,
          createdAt: new Date().toISOString()
        });
      } else {
        alert(`O item "${action.data.name}" foi interpretado. Entre em uma lista para adicionar via voz!`);
      }
    } else if (action.action === 'navigate') {
      navigate(action.data.destination);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0 md:pl-72 bg-[#F0F4F2]">
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
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <LucideIcons.ShoppingBag size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-primary-dark">
                COMPRAFÁCIL <span className="text-primary-light">IA</span>
              </h1>
            </div>
            
            <nav className="flex flex-col gap-3">
              <DesktopNavItem to="/dashboard" icon="LayoutDashboard" label="Dashboard" />
              <DesktopNavItem to="/listas" icon="List" label="Minhas Listas" />
              <DesktopNavItem to="/estoque" icon="Package" label="Estoque" />
              <DesktopNavItem to="/relatorios" icon="PieChart" label="Relatórios" />
              <DesktopNavItem to="/configuracoes" icon="Settings" label="Configurações" />
            </nav>

            <div className="mt-auto p-6 bg-blue-600 rounded-[32px] text-white shadow-xl shadow-blue-500/20">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Sugestão IA</p>
              <p className="text-sm leading-relaxed font-bold italic">
                "O preço do Arroz baixou 12% no Carrefour hoje. Adicionar?"
              </p>
              <button className="mt-4 w-full bg-white text-blue-600 py-3 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-all">
                Ver Ofertas
              </button>
            </div>
            
            <div className="mt-8 flex items-center gap-4 border-t border-slate-50 pt-8">
              <div className="w-12 h-12 bg-slate-200 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center">
                <span className="font-black text-slate-500">{profile?.name?.[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 leading-tight">{profile?.name}</p>
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
