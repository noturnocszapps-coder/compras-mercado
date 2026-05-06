import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error.message);
        navigate('/login');
        return;
      }

      if (session) {
        await refreshProfile();
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, refreshProfile]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0F4F2]">
      <div className="w-16 h-16 bg-primary rounded-[20px] shadow-2xl shadow-emerald-200 flex items-center justify-center animate-bounce mb-6">
        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-slate-900 font-black tracking-tight uppercase mb-1">Compra Fácil</p>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] pl-1">by Roxou</p>
      </div>
    </div>
  );
}
