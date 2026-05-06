import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      await setDoc(doc(db, 'profiles', userCredential.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      setError('Erro ao criar conta. Tente um e-mail diferente.');
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
             <UserPlus size={32} strokeWidth={3} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight uppercase">Cadastrar</h1>
            <p className="text-slate-400 font-bold mt-1 tracking-tight">O seu assistente de compras inteligente</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-black text-center border-2 border-red-100 italic">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 relative">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Seu Nome</label>
             <div className="relative">
                <User className="absolute left-5 top-5 text-slate-300" size={20} />
                <input 
                  type="text" 
                  placeholder="Como devemos te chamar?" 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary outline-none font-bold text-lg transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
             </div>
          </div>

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
                  placeholder="Mínimo 6 caracteres" 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary outline-none font-bold text-lg transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
             </div>
          </div>

          <button 
            type="submit" 
            className="bold-button-primary w-full py-5 text-xl mt-2"
          >
            CONCLUIR CADASTRO
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-slate-400 font-bold mb-2">Já é de casa?</p>
          <Link to="/login" className="text-primary font-black text-lg hover:underline underline-offset-8 transition-all uppercase tracking-tight">
            Voltar para o Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
