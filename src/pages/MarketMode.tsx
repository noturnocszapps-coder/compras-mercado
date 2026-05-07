import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import VoiceAssistant from '../components/VoiceAssistant';
import { ArrowLeft, Check, Camera, Mic, X, Save, ShoppingBag, TrendingDown, Target } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getNowSP } from '../lib/date';
import toast from 'react-hot-toast';

import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { trackEvent, AnalyticsEvent } from '../lib/analytics';

export default function MarketMode() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isVoiceAssistantOpen, closeVoiceAssistant, openVoiceAssistant } = useUI();
  const navigate = useNavigate();
  const [list, setList] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState('');

  const handleVoiceAction = async (action: any) => {
    if (action.action === 'checkItem') {
      try {
        const item = items.find(i => i.name.toLowerCase().includes(action.data.name.toLowerCase()));
        if (item) {
          const { error } = await supabase
            .from('shopping_items')
            .update({ 
               is_checked: true, 
               paid_price: action.data.paidPrice || item.paid_price || item.estimated_price || 0 
            })
            .eq('id', item.id);
          
          if (error) throw error;
        }
      } catch (err) {
        console.error('[MARKET_MODE] Voice action error:', err);
      }
    }
  };

  const categories = [
    'Hortifruti', 'Limpeza', 'Higiene', 'Açougue', 'Bebidas', 'Padaria', 'Frios', 'Congelados', 'Mistura', 'Pet', 'Utilidades'
  ];

  const fetchItems = async () => {
    if (!id || !user) return;
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('list_id', id);
      
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('[MARKET_MODE] Error fetching items:', err);
    }
  };

  useEffect(() => {
    if (!user || !id) return;

    const fetchList = async () => {
      try {
        const { data, error } = await supabase
          .from('shopping_lists')
          .select('*')
          .eq('id', id)
          .maybeSingle(); // Using maybeSingle to avoid 406/single errors
        
        if (error || !data) {
          console.error('[MARKET_MODE] List not found or error:', error);
          navigate('/listas');
          return;
        }
        setList(data);
      } catch (err) {
        console.error('[MARKET_MODE] Critical error fetching list:', err);
        navigate('/listas');
      }
    };

    fetchList();
    fetchItems();

    const subscription = supabase
      .channel(`market_items_${id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'shopping_items',
        filter: `list_id=eq.${id}`
      }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, id]);

  const toggleCheck = async (itemId: string, checked: boolean) => {
    try {
      // Optimistic Update
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_checked: !checked } : i));

      const { error } = await supabase
        .from('shopping_items')
        .update({ is_checked: !checked })
        .eq('id', itemId);
      
      if (error) throw error;
    } catch (err) {
      console.error('[MARKET_MODE] Error toggling check:', err);
      // Revert if error
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_checked: checked } : i));
      toast.error('Erro ao atualizar item');
    }
  };

  const savePrice = async (itemId: string) => {
    const price = parseFloat(tempPrice.replace(',', '.'));
    if (!isNaN(price)) {
      try {
        const { error } = await supabase
          .from('shopping_items')
          .update({ paid_price: price, is_checked: true })
          .eq('id', itemId);
        
        if (error) throw error;
        
        setEditingPrice(null);
        setTempPrice('');
      } catch (err) {
        console.error('[MARKET_MODE] Error saving price:', err);
        toast.error('Erro ao salvar preço');
      }
    }
  };

  const finishShopping = async () => {
    if (!confirm('Deseja finalizar esta compra e atualizar seu estoque?')) return;

    try {
      const checkedItems = items.filter(i => i.is_checked);
      
      // Calculate Stats
      const totalEstimado = items.reduce((acc, item) => acc + (Number(item.estimated_price) || 0) * (Number(item.quantity) || 1), 0);
      const totalPago = checkedItems.reduce((acc, item) => acc + (Number(item.paid_price) || Number(item.estimated_price) || 0) * (Number(item.quantity) || 1), 0);
      const economia = totalEstimado > totalPago ? totalEstimado - totalPago : 0;
      const score = totalEstimado > 0 ? Math.min(100, Math.round((economia / totalEstimado) * 30 + 70)) : 100;

      // 1. Mark list as finished with final stats
      const { error: listError } = await supabase
        .from('shopping_lists')
        .update({ 
          status: 'finished', 
          finished_at: getNowSP().toISOString(),
          real_total: totalPago,
          savings_total: economia,
          economy_score: score
        })
        .eq('id', id!);
      
      if (listError) throw listError;

      trackEvent(AnalyticsEvent.LIST_FINISHED, { id, score, itemsCount: checkedItems.length });

      // 2. Process Items (Inventory + Price History)
      if (checkedItems.length > 0) {
        for (const item of checkedItems) {
          // --- RECORD PRICE HISTORY ---
          await supabase.from('price_history').insert({
            user_id: user!.id,
            product_name: item.name,
            category: item.category,
            market_name: list?.market_name || 'Mercado Geral',
            paid_price: item.paid_price || item.estimated_price || 0,
            purchase_date: getNowSP().toISOString().split('T')[0]
          });

          // --- UPDATE INVENTORY ---
          const { data: existing } = await supabase
            .from('home_inventory')
            .select('*')
            .eq('user_id', user!.id)
            .ilike('name', item.name)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('home_inventory')
              .update({ 
                current_quantity: Number(existing.current_quantity) + Number(item.quantity),
                updated_at: getNowSP().toISOString()
              })
              .eq('id', existing.id);
          } else {
            await supabase
              .from('home_inventory')
              .insert({
                user_id: user!.id,
                name: item.name,
                category: item.category,
                current_quantity: item.quantity,
                minimum_quantity: 1,
                unit: item.unit
              });
          }
        }
      }
      
      toast.success(`Compra finalizada! Score: ${score}/100`, { icon: '🏆' });
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao finalizar compra');
    }
  };

  const finishedItemsCount = items.filter(i => i.is_checked).length;
  const progress = items.length > 0 ? (finishedItemsCount / items.length) * 100 : 0;
  
  const totalGasto = items.reduce((acc, item) => (item.is_checked ? acc + (Number(item.paid_price) || Number(item.estimated_price) || 0) * (Number(item.quantity) || 1) : acc), 0);
  
  const totalEstimado = items.reduce((acc, item) => acc + (Number(item.estimated_price) || 0) * (Number(item.quantity) || 1), 0);

  const economia = totalEstimado > totalGasto ? totalEstimado - totalGasto : 0;

  const categoryStats = categories.map(cat => {
    const catItems = items.filter(i => i.category === cat);
    const finished = catItems.filter(i => i.is_checked).length;
    const total = catItems.length;
    const spent = catItems.reduce((acc, item) => (item.is_checked ? acc + (Number(item.paid_price) || Number(item.estimated_price) || 0) * (Number(item.quantity) || 1) : acc), 0);
    
    return { name: cat, finished, total, spent, progress: total > 0 ? (finished / total) * 100 : 0 };
  }).filter(s => s.total > 0);

  return (
    <div className="flex flex-col gap-8 -mx-6 px-6 bg-[#F0F4F2] min-h-screen-safe pb-safe">
      <VoiceAssistant 
        isOpen={isVoiceAssistantOpen} 
        onClose={closeVoiceAssistant} 
        onAction={handleVoiceAction} 
      />
      {/* Header Fixo */}
      <div className="sticky top-0 bg-primary-dark/95 backdrop-blur-md z-40 -mx-6 px-6 py-6 md:py-10 flex flex-col gap-6 md:gap-10 border-b-4 border-primary pt-safe">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(`/listas/${id}`)} className="px-6 py-3 bg-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-white/20 transition-all">
             <ArrowLeft size={18} strokeWidth={3} />
             Sair do Modo Mercado
          </button>
          <button 
            onClick={finishShopping}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-2xl shadow-emerald-400/20 active:scale-95 transition-all uppercase tracking-tighter"
          >
            FINALIZAR COMPRA
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-light italic leading-none">Total Gasto Agora</p>
              <p className="text-6xl font-black text-white tracking-tighter italic leading-none">
                 <span className="text-2xl not-italic mr-1">R$</span>
                 {totalGasto.toFixed(2).replace('.', ',')}
              </p>
           </div>
           <div className="flex flex-col gap-3 md:items-end">
               <div className="flex items-center gap-4">
                  {economia > 0 && (
                    <div className="text-right px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                       <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Economia</p>
                       <p className="text-sm font-black text-white">{formatCurrency(economia)}</p>
                    </div>
                  )}
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Status</p>
                     <p className="text-2xl font-black text-white italic">{finishedItemsCount} <span className="text-sm not-italic text-white/30 lowercase">de</span> {items.length}</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-black text-primary-light text-xl italic border border-white/10">
                     {Math.round(progress)}%
                  </div>
               </div>
            </div>
        </div>

        <div className="h-4 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/10">
           <motion.div 
             className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]"
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
           />
        </div>
      </div>

      {/* Category Summaries */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryStats.map(stat => (
          <Card key={stat.name} className="p-4 bg-white rounded-3xl border-2 border-slate-50 flex flex-col gap-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{stat.name}</p>
            <div className="flex items-end justify-between">
              <span className="text-lg font-black text-slate-800">{formatCurrency(stat.spent)}</span>
              <span className="text-[10px] font-bold text-primary">{Math.round(stat.progress)}%</span>
            </div>
            <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
               <div className="h-full bg-primary" style={{ width: `${stat.progress}%` }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Grid de Itens XL */}
      <div className="flex flex-col gap-12 pb-40">
        {categories.map(cat => {
           const catItems = items.filter(i => i.category === cat);
           if (catItems.length === 0) return null;

           return (
             <div key={cat} className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-2 h-6 bg-primary rounded-full"></div>
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 italic">{cat}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {catItems.map(item => (
                     <Card 
                       key={item.id} 
                       className={cn(
                          "p-6 flex items-center gap-6 cursor-pointer active:scale-95 transition-all overflow-hidden relative",
                          item.is_checked ? "border-primary bg-emerald-50/50 shadow-inner" : "hover:border-slate-200"
                       )}
                       onClick={() => toggleCheck(item.id, item.is_checked)}
                     >
                        <div className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all flex-shrink-0 relative z-10",
                          item.is_checked ? "bg-primary border-primary text-white" : "bg-slate-50 border-slate-100 text-transparent"
                        )}>
                           <Check size={32} strokeWidth={4} />
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                           <h4 className={cn("text-2xl font-black tracking-tight leading-tight uppercase italic", item.is_checked && "text-primary")}>{item.name}</h4>
                           <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{item.quantity} {item.unit}</span>
                              {item.is_checked && (
                                <span className="text-primary font-black italic">{formatCurrency(item.paid_price || item.estimated_price || 0)}</span>
                              )}
                           </div>
                        </div>
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             setEditingPrice(item.id);
                             setTempPrice(item.paid_price?.toString() || item.estimated_price?.toString() || '');
                          }}
                          className={cn(
                             "w-14 h-14 rounded-2xl flex items-center justify-center transition-all relative z-10",
                             item.is_checked ? "bg-primary/10 text-primary" : "bg-slate-50 text-slate-300"
                          )}
                        >
                           <ShoppingBag size={24} strokeWidth={3} />
                        </button>
                        {item.is_checked && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
                        )}
                     </Card>
                   ))}
                </div>
             </div>
           );
        })}
      </div>

      {/* Price Modal */}
      <Modal 
        isOpen={!!editingPrice} 
        onClose={() => setEditingPrice(null)} 
        title="Valor Pago"
        className="text-center"
      >
          <p className="text-slate-400 font-bold italic -mt-6">Confirme o preço para sua economia semanal.</p>
          
          <div className="relative my-8">
              <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-200">R$</span>
              <input 
                type="text" 
                className="w-full pl-24 pr-8 py-10 bg-slate-50 border-4 border-slate-50 rounded-[40px] outline-none focus:border-primary text-6xl font-black text-slate-900 tracking-tighter italic transition-all"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                autoFocus
                inputMode="decimal"
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline"
                onClick={() => setEditingPrice(null)}
                className="!py-6"
              >
                CANCELAR
              </Button>
              <Button 
                onClick={() => savePrice(editingPrice!)}
                className="!py-6 !text-xl"
              >
                SALVAR VALOR
              </Button>
          </div>
      </Modal>

      {/* Ações Rápidas Mercado */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40">
         <button 
           onClick={openVoiceAssistant}
           className="w-20 h-20 bg-primary text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-emerald-400/50 hover:scale-110 active:scale-90 transition-all rotate-3 hover:rotate-0"
         >
            <Mic size={32} strokeWidth={4} />
         </button>
      </div>
    </div>
  );
}
