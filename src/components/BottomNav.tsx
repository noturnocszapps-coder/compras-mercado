import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, Package, PieChart, Settings, Mic } from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav: React.FC<{ onVoiceClick?: () => void }> = ({ onVoiceClick }) => {
  const items = [
    { icon: Home, label: 'Início', to: '/dashboard' },
    { icon: List, label: 'Listas', to: '/listas' },
    // { icon: Package, label: 'Estoque', to: '/estoque' },
    // { icon: PieChart, label: 'Gastos', to: '/relatorios' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-around items-center z-50 md:hidden pb-safe">
      <div className="flex gap-12 items-center">
         {items.map((item) => (
           <NavLink
             key={item.to}
             to={item.to}
             className={({ isActive }) =>
               cn(
                 "flex flex-col items-center gap-1 transition-all active:scale-90",
                 isActive ? "text-primary scale-110" : "text-slate-300"
               )
             }
           >
             {({ isActive }) => (
               <>
                 <item.icon size={26} strokeWidth={isActive ? 3 : 2} />
                 <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
               </>
             )}
           </NavLink>
         ))}
         
         <NavLink
            to="/configuracoes"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 transition-all active:scale-90",
                isActive ? "text-primary scale-110" : "text-slate-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Settings size={26} strokeWidth={isActive ? 3 : 2} />
                <span className="text-[8px] font-black uppercase tracking-widest">Ajustes</span>
              </>
            )}
          </NavLink>
      </div>

      {/* Voice Assistant disabled for MVP stabilization */}
      {/* <button 
        onClick={onVoiceClick}
        className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center -mt-12 shadow-2xl shadow-blue-400/50 active:scale-90 transition-all border-8 border-[#F0F4F2]"
      >
        <Mic size={28} strokeWidth={4} />
      </button> */}
    </nav>
  );
};
