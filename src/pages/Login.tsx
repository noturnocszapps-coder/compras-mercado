import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      setError('Credenciais inválidas. Verifique seu email e senha.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Erro ao entrar com Google.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F0F4F2]">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl flex flex-col gap-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-primary"></div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
             <LogIn size={32} strokeWidth={3} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight uppercase">Entrar</h1>
            <p className="text-slate-400 font-bold mt-1 tracking-tight">Compra Fácil <span className="text-primary italic">by Roxou</span></p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-black text-center border-2 border-red-100 italic">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 relative">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Seu E-mail</label>
             <div className="relative">
                <Mail className="absolute left-5 top-5 text-slate-300" size={20} />
                <input 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary outline-none font-bold text-lg transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
             </div>
          </div>

          <div className="flex flex-col gap-2 relative">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Sua Senha</label>
             <div className="relative">
                <Lock className="absolute left-5 top-5 text-slate-300" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary outline-none font-bold text-lg transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
             </div>
          </div>

          <button 
            type="submit" 
            className="bold-button-primary w-full py-5 text-xl"
          >
            ENTRAR AGORA
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-50"></div></div>
          <span className="relative px-4 bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest">Ou continue com</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="bold-button-secondary w-full"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
          Acessar com Google
        </button>

        <div className="text-center pt-2">
          <p className="text-slate-400 font-bold mb-2">Ainda não tem uma conta?</p>
          <Link to="/register" className="text-primary font-black text-lg hover:underline underline-offset-8 transition-all uppercase tracking-tight">
            Criar minha conta Grátis
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
