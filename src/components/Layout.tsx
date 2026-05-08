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
  
  try {
    const { isVoiceAssistantOpen, closeVoiceAssistant, openVoiceAssistant } = useUI();
    const navigate = useNavigate();
    const location = useLocation();

    return (
      <div className="min-h-screen-safe flex flex-col pb-32 md:pb-0 md:pl-72 bg-[#F0F4F2] pb-safe">
        {user && (
          <>
            <Header />
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
                <DesktopNavItem to="/configuracoes" icon="Settings" label="Configurações" />
              </nav>

              <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Apps Roxou</p>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs font-bold text-slate-600">Roxou Eventos</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-bold text-slate-600">Roxou Transporte</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-xs font-bold text-slate-600">Roxou Studio</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4 border-t border-slate-50 pt-8">
                <div className="w-12 h-12 bg-slate-200 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center">
                  <span className="font-black text-slate-500">
                    {profile?.full_name && profile.full_name.length > 0 
                      ? profile.full_name[0].toUpperCase()
                      : profile?.email && profile.email.length > 0
                        ? profile.email[0].toUpperCase()
                        : 'U'
                    }
                  </span>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 leading-tight">{profile?.full_name || profile?.email || 'Usuário'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Status: OK</p>
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
  } catch (err: any) {
    console.error("[LAYOUT_CRASH]", err);
    return (
      <div className="p-20 bg-red-900 text-white font-black">
        LAYOUT CRASHED: {err.message}
      </div>
    );
  }
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
