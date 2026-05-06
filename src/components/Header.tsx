import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { profile } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-emerald-100 flex items-center justify-between px-6 shadow-sm sticky top-0 z-30 md:hidden">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <span className="font-black">CF</span>
        </div>
        <h1 className="text-xl font-black tracking-tight text-primary-dark uppercase">
          COMPRAFÁCIL <span className="text-primary-light">IA</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
          <Search size={20} />
        </button>
        <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-primary overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-500">
            {profile?.name?.[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
