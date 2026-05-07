import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { listService } from '../services/listService';
import { ShoppingBag, ChevronRight, Search, Plus, Trash2, Calendar, Target, Loader2, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Card, Skeleton } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { trackEvent, AnalyticsEvent } from '../lib/analytics';
import { useSubscription } from '../hooks/useSubscription';
import { FREE_LIMITS } from '../lib/premium';

export default function Lists() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMarket, setNewMarket] = useState('');
  const [newType, setNewType] = useState('Compra Principal');

  const listTypes = [
    'Compra Mensal', 'Compra Semanal', 'Limpeza', 'Hortifruti', 'Churrasco', 'Festa', 'Personalizada'
  ];

  const fetchLists = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      // We don't check isMounted here because it might be called from handleCreateList
      // but inside useEffect we will wrap it.
      
      if (error) {
        console.error('[LISTS] Error fetching lists:', error);
        setLists([]);
      } else {
        setLists(data || []);
      }
    } catch (err) {
      console.error('[LISTS] Critical error fetching lists:', err);
      setLists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const safeFetch = async () => {
      await fetchLists();
      if (!isMounted) return;
    };

    safeFetch();

    if (!user) return;

    // Realtime subscription
    const channel = supabase.channel(`lists_page_${user.id}`);
    
    channel
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'shopping_lists',
        filter: `user_id=eq.${user.id}`
      }, () => {
        if (isMounted) fetchLists();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleCreateList = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmedName = newName.trim();
    
    if (!trimmedName) {
      toast.error('Digite um nome para a lista.');
      return;
    }
    
    if (!user) {
      toast.error('Sessão expirada. Faça login novamente.');
      return;
    }

    if (!isPremium && lists.length >= FREE_LIMITS.max_active_lists) {
      toast.error(`Limite de ${FREE_LIMITS.max_active_lists} listas atingido no plano Free.`);
      navigate('/premium');
      return;
    }

    setIsCreating(true);
    const creationToast = toast.loading('Criando lista...');

    // Timeout de segurança: 12 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), 12000)
    );

    try {
      console.log("[CREATE_LIST] Enviando para service:", {
        name: trimmedName,
        market_name: newMarket.trim() || null,
        user_id: user.id
      });

      const responsePromise = listService.createList({
        name: trimmedName,
        market_name: newMarket.trim() || null,
        user_id: user.id
      });

      // Race between the service and the timeout
      const response: any = await Promise.race([responsePromise, timeoutPromise]);
      const { data, error } = response;
      
      if (error) {
        console.error("[CREATE_LIST_UI_ERROR]", error);
        // Show real message for debugging in dev
        const message = error.message || 'Não foi possível criar a lista.';
        throw new Error(message);
      }
      
      console.log("[CREATE_LIST_UI_SUCCESS]", data);
      
      trackEvent(AnalyticsEvent.LIST_CREATED, { market: newMarket });
      toast.success('Lista criada com sucesso!', { id: creationToast });
      
      // CLOSE MODAL IMMEDIATELY
      setShowNewModal(false);
      setNewName('');
      setNewMarket('');
      
      // Update local state immediately for better UX
      if (data) {
        setLists(prev => [data, ...prev]);
      }
    } catch (err: any) {
      console.error('Create List Error:', err);
      const errorMessage = err.message === 'TIMEOUT' 
        ? 'A operação demorou muito. Tente novamente.' 
        : (err.message || 'Não foi possível criar a lista.');
        
      toast.error(errorMessage, { id: creationToast });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Deseja excluir esta lista?')) return;

    const deletingToast = toast.loading('Excluindo...');
    
    try {
      const { error } = await listService.deleteList(id);
      
      if (error) throw error;
      
      toast.success('Lista excluída', { id: deletingToast });
      setLists(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      console.error('Delete List Error:', err);
      toast.error('Erro ao excluir lista', { id: deletingToast });
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showNewModal) {
        if (e.key === 'Escape') setShowNewModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNewModal]);

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
              <Skeleton key={i} className="h-48 rounded-[32px]" />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="py-32 px-10">
            <Card className="text-center flex flex-col items-center gap-8 border-4 border-dashed border-slate-100 rounded-[60px] bg-white/30 backdrop-blur-sm shadow-none" hover={false}>
              <div className="w-24 h-24 bg-primary text-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-emerald-200 rotate-3">
                  <ShoppingBag size={48} strokeWidth={3} />
              </div>
              <div className="flex flex-col gap-2">
                  <p className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Nada por aqui</p>
                  <p className="text-slate-400 font-bold italic">Crie sua primeira lista e deixe a IA inteligente organizar suas compras.</p>
              </div>
              <div className="flex flex-col gap-4 w-full max-w-xs">
                  <Button onClick={() => setShowNewModal(true)} size="lg" className="w-full">
                    CRIAR PRIMEIRA LISTA
                  </Button>
                  <div className="flex items-center gap-2 justify-center text-[10px] font-black uppercase text-slate-300 tracking-widest">
                    <Sparkles size={12} />
                    Sugerido pela IA
                  </div>
              </div>
            </Card>
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
                    className="group"
                  >
                    <Card className="p-8 flex flex-col gap-6 h-full">
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
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
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

                      <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                        <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Estimado</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(list.estimated_total || 0)}</p>
                        </div>
                        <div className="w-14 h-14 bg-bg-soft rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200 transition-all">
                          <ChevronRight size={24} strokeWidth={3} />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Nova Lista">
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
                disabled={isCreating}
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
                disabled={isCreating}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {listTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewName(type)}
                  disabled={isCreating}
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
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowNewModal(false)}
                disabled={isCreating}
                className="flex-1 py-4"
              >
                Voltar
              </Button>
              <Button 
                type="submit" 
                isLoading={isCreating}
                className="flex-1 py-4"
              >
                Criar
              </Button>
            </div>
          </form>
      </Modal>
    </div>
  );
}
