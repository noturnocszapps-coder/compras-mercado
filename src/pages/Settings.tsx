import React from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { User, Bell, Shield, LogOut, Heart, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-8 max-w-xl mx-auto w-full">
      <h2 className="text-2xl font-black">Configurações</h2>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
         <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-primary text-2xl font-black">
            {profile?.name?.[0].toUpperCase() || 'U'}
         </div>
         <div>
            <h3 className="text-xl font-bold">{profile?.name}</h3>
            <p className="text-gray-400 text-sm">{profile?.email}</p>
         </div>
      </div>

      <div className="flex flex-col gap-2">
         <h4 className="text-xs font-black uppercase text-gray-400 px-4">Minha Conta</h4>
         <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <SettingItem icon={User} label="Editar Perfil" />
            <SettingItem icon={Bell} label="Notificações" />
            <SettingItem icon={Shield} label="Privacidade" />
         </div>
      </div>

      <div className="flex flex-col gap-2">
         <h4 className="text-xs font-black uppercase text-gray-400 px-4">Ajuda e Suporte</h4>
         <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <SettingItem icon={Heart} label="Avaliar App" />
            <SettingItem icon={Phone} label="Falar Conosco" />
         </div>
      </div>

      <button 
        onClick={handleLogout}
        className="mt-4 flex items-center justify-center gap-2 bg-red-50 text-red-500 py-4 rounded-2xl font-bold hover:bg-red-100 transition-colors"
      >
        <LogOut size={20} />
        Sair da Conta
      </button>

      <div className="text-center text-gray-300 text-xs py-8">
         Versão 1.0.0 (MVP) • CompraFácil IA
      </div>
    </div>
  );
}

const SettingItem = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
     <div className="flex items-center gap-4">
        <div className="text-gray-400"><Icon size={20} /></div>
        <span className="font-bold text-gray-700">{label}</span>
     </div>
     <div className="text-gray-300">
        <LogOut size={16} className="rotate-180" />
     </div>
  </button>
);
