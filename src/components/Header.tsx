import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { profile } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-emerald-100 flex items-center justify-between px-6 shadow-sm sticky top-0 z-30 md:hidden pt-safe">
      <div className="flex items-center gap-3">
        <div className="flex flex-col -gap-1">
          <h1 className="text-lg font-black tracking-tight text-slate-800 leading-none">
            Compra Fácil
          </h1>
          <span className="text-[8px] font-black uppercase tracking-widest text-primary">by Roxou</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
          <Search size={20} />
        </button>
        <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-primary overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-500">
            {profile?.full_name && profile.full_name.length > 0 
              ? profile.full_name[0].toUpperCase()
              : profile?.email && profile.email.length > 0
                ? profile.email[0].toUpperCase()
                : 'U'
            }
          </div>
        </div>
      </div>
    </header>
  );
};
