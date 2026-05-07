import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Package, MoreVertical, Plus, Trash2, Calendar, Target, AlertTriangle } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Card, Skeleton } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { trackEvent, AnalyticsEvent } from '../lib/analytics';
import toast from 'react-hot-toast';

export default function Inventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'Alimentação', current_quantity: 0, minimum_quantity: 1, unit: 'un', expiration_date: '' });

  const categories = [
    'Hortifruti', 'Limpeza', 'Higiene', 'Açougue', 'Bebidas', 'Padaria', 'Frios', 'Congelados', 'Mistura', 'Pet', 'Utilidades'
  ];

  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    const fetchInventory = async () => {
      try {
        const { data, error } = await supabase
          .from('home_inventory')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('[INVENTORY] Error fetching inventory:', error);
          return;
        }
        
        if (isMounted) {
          setItems(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('[INVENTORY] Critical error in fetchInventory:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInventory();

    const subscription = supabase
      .channel(`inventory_${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'home_inventory',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchInventory();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newItem.name) return;
    try {
      const { error } = await supabase
        .from('home_inventory')
        .insert({
          ...newItem,
          user_id: user.id
        });
      
      if (error) throw error;

      trackEvent(AnalyticsEvent.INVENTORY_UPDATE, { action: 'add', name: newItem.name });
      setShowModal(false);
      setNewItem({ name: '', category: 'Alimentação', current_quantity: 0, minimum_quantity: 1, unit: 'un', expiration_date: '' });
    } catch (err) { 
      console.error(err); 
      alert('Erro ao salvar item no estoque');
    }
  };

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 0) return;
    try {
      const { error } = await supabase
        .from('home_inventory')
        .update({ current_quantity: newQty })
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      console.error('[INVENTORY] Error updating quantity:', err);
      toast.error('Erro ao atualizar quantidade');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Deseja excluir "${name}" do estoque?`)) {
      try {
        const { error } = await supabase
          .from('home_inventory')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        trackEvent(AnalyticsEvent.INVENTORY_UPDATE, { action: 'delete', name });
      } catch (err) {
        console.error('[INVENTORY] Error deleting item:', err);
        toast.error('Erro ao excluir item');
      }
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-3 h-10 bg-primary rounded-full"></div>
           <h2 className="text-4xl font-black tracking-tight uppercase leading-none">Estoque da Casa</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="w-16 h-16 bg-primary text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-emerald-400/30 hover:scale-105 active:scale-95 transition-all"
        >
           <Plus size={32} strokeWidth={4} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <>
            <Skeleton className="h-60 rounded-[40px]" />
            <Skeleton className="h-60 rounded-[40px]" />
            <Skeleton className="h-60 rounded-[40px]" />
          </>
        ) : items.length === 0 ? (
          <div className="col-span-full">
            <Card className="py-32 text-center flex flex-col items-center gap-6 border-4 border-dashed border-slate-100 rounded-[60px] bg-transparent shadow-none" hover={false}>
              <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-100">
                  <Package size={64} strokeWidth={3} />
              </div>
              <div className="flex flex-col gap-2">
                  <p className="font-black text-2xl uppercase tracking-tighter text-slate-400">Despensa Silenciosa</p>
                  <p className="text-slate-400 font-bold italic">Seu estoque aguarda novos suprimentos.</p>
              </div>
              <Button onClick={() => setShowModal(true)} size="lg">ADICIONAR PRIMEIRO ITEM</Button>
            </Card>
          </div>
        ) : (
          items.map(item => {
             const isLow = (item.current_quantity || 0) <= (item.minimum_quantity || 0);
             return (
               <Card key={item.id} className={cn(
                 "p-8 flex flex-col gap-6 relative overflow-hidden group transition-all",
                 isLow ? "border-amber-400 bg-amber-50/50" : "hover:border-primary/50"
               )}>
                  {isLow && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-400"></div>
                  )}
                  
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic mb-1">{item.category}</p>
                        <h4 className="text-2xl font-black text-slate-900 leading-tight uppercase group-hover:text-primary transition-colors">{item.name}</h4>
                     </div>
                     <div className="flex gap-2">
                        {isLow && (
                           <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center animate-pulse">
                              <AlertTriangle size={24} strokeWidth={3} />
                           </div>
                        )}
                        <button 
                          onClick={() => handleDelete(item.id, item.name)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                           <Trash2 size={20} />
                        </button>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white border-2 border-slate-100 rounded-[28px] p-2 pr-6">
                     <div className="flex gap-2">
                        <button 
                          onClick={() => updateQuantity(item.id, (item.current_quantity || 0) - 1)}
                          className="w-14 h-14 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-[20px] flex items-center justify-center font-black text-2xl transition-all active:scale-90"
                        >
                           -
                        </button>
                        <button 
                          onClick={() => updateQuantity(item.id, (item.current_quantity || 0) + 1)}
                          className="w-14 h-14 bg-primary text-white rounded-[20px] flex items-center justify-center font-black text-2xl transition-all shadow-lg shadow-emerald-100 active:scale-90"
                        >
                           +
                        </button>
                     </div>
                     <div className="text-right">
                        <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{item.current_quantity || 0}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{item.unit || 'un'}</p>
                     </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Min: {item.minimum_quantity} {item.unit || 'un'}</span>
                     </div>
                     {item.expiration_date && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                           <Calendar size={12} className="text-slate-400" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{formatDate(item.expiration_date)}</span>
                        </div>
                     )}
                  </div>
               </Card>
             );
          })
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Item">
        <form onSubmit={handleSave} className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Produto</label>
              <input 
                type="text" 
                placeholder="Ex: Leite Ninho" 
                className="bold-input" 
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Qtd Atual</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    className="bold-input" 
                    value={newItem.current_quantity}
                    onChange={e => setNewItem({...newItem, current_quantity: Number(e.target.value)})}
                  />
              </div>
              <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Mínimo</label>
                  <input 
                    type="number" 
                    placeholder="1" 
                    className="bold-input" 
                    value={newItem.minimum_quantity}
                    onChange={e => setNewItem({...newItem, minimum_quantity: Number(e.target.value)})}
                  />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowModal(false)} 
                className="flex-1 py-6"
              >
                CANCELAR
              </Button>
              <Button 
                type="submit" 
                className="flex-1 py-6"
              >
                SALVAR ITEM
              </Button>
            </div>
        </form>
      </Modal>
    </div>
  );
}
