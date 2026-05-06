import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ChevronRight, Search, Plus, Trash2, Calendar, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Lists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMarket, setNewMarket] = useState('');
  const [newType, setNewType] = useState('Compra Principal');

  const listTypes = [
    'Compra Mensal', 'Compra Semanal', 'Limpeza', 'Hortifruti', 'Churrasco', 'Festa', 'Personalizada'
  ];

  useEffect(() => {
    if (!user) return;

    const fetchLists = async () => {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) console.error('Error fetching lists:', error);
      else setLists(data || []);
      setLoading(false);
    };

    fetchLists();

    // Realtime subscription
    const subscription = supabase
      .channel('lists_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'shopping_lists',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchLists();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName) return;

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .insert({
          name: newName,
          market_name: newMarket,
          user_id: user.id,
          status: 'active',
          estimated_total: 0,
          real_total: 0
        });
      
      if (error) throw error;
      
      setShowNewModal(false);
      setNewName('');
      setNewMarket('');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar lista');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Deseja excluir esta lista?')) {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(error);
        alert('Erro ao excluir lista');
      }
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-3 h-12 bg-primary rounded-full"></div>
          <h2 className="text-4xl font-black tracking-tight">Minhas Listas</h2>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="bold-button-primary"
        >
          <Plus size={24} strokeWidth={3} />
          Nova Lista
        </button>
      </div>

      <div className="bold-card p-2 flex items-center gap-4">
        <div className="pl-6 text-slate-400">
          <Search size={24} />
        </div>
        <input 
          type="text" 
          placeholder="Pesquisar listas..."
          className="flex-1 p-6 font-bold text-lg outline-none bg-transparent"
        />
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-[32px] animate-pulse border border-emerald-50" />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-6 border-4 border-dashed border-slate-100 rounded-[40px]">
             <ShoppingBag size={64} className="text-slate-100" />
             <p className="text-slate-400 text-xl font-bold italic">Sua despensa está solitária. Crie uma lista!</p>
             <button onClick={() => setShowNewModal(true)} className="bold-button-primary">Começar agora</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {lists.map((list) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <Link 
                    to={`/listas/${list.id}`}
                    className="bold-card p-8 flex flex-col gap-6 group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                        list.status === 'active' ? "bg-emerald-50 text-primary" : "bg-slate-100 text-slate-500"
                      )}>
                        <div className={cn("w-2 h-2 rounded-full", list.status === 'active' ? "bg-primary animate-pulse" : "bg-slate-400")}></div>
                        {list.status === 'active' ? 'Ativa' : 'Finalizada'}
                      </div>
                      <button 
                        onClick={(e) => handleDelete(list.id, e)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">{list.name}</h3>
                      <p className="text-sm font-bold text-slate-400 flex items-center gap-2 mt-2">
                        <Target size={16} className="text-slate-200" />
                        {list.market_name || 'Mercado Geral'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Estimado</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(list.estimated_total || 0)}</p>
                      </div>
                      <div className="w-14 h-14 bg-bg-soft rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200 transition-all">
                        <ChevronRight size={24} strokeWidth={3} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-3xl font-black">Nova Lista</h3>
                <p className="text-slate-400 font-bold">O que vamos comprar hoje?</p>
              </div>
              
              <form onSubmit={handleCreateList} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Nome da Lista</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Compra do Mês" 
                    className="bold-input"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mercado (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Carrefour" 
                    className="bold-input"
                    value={newMarket}
                    onChange={(e) => setNewMarket(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {listTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewName(type)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-black transition-all border-2",
                        newName === type 
                          ? "bg-primary text-white border-primary shadow-lg shadow-emerald-100" 
                          : "bg-slate-50 text-slate-400 border-transparent hover:border-slate-100"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowNewModal(false)}
                    className="flex-1 bold-button-secondary py-4"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bold-button-primary py-4"
                  >
                    Criar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
