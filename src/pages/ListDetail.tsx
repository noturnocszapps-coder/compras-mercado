import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, Trash2, Camera, Mic, CheckCircle, Circle, Archive, Play, Settings2, MoreVertical, Search, Check } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { scanProductImage } from '../lib/ai';
import { parseSmartInput, getSuggestions } from '../lib/parser';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Card, Skeleton } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { trackEvent, AnalyticsEvent } from '../lib/analytics';

export default function ListDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'Alimentação', quantity: 1, unit: 'un', price: 0 });
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Hortifruti', 'Limpeza', 'Higiene', 'Açougue', 'Bebidas', 'Padaria', 'Frios', 'Congelados', 'Mistura', 'Pet', 'Utilidades'
  ];

  const fetchItems = async () => {
    if (!id || !user) return;
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('list_id', id)
      .eq('user_id', user.id);
    
    if (error) console.error('Error fetching items:', error);
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user || !id) return;

    const fetchList = async () => {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        navigate('/listas');
        return;
      }
      setList(data);
    };

    fetchList();
    fetchItems();

    // Real-time subscription for items
    const subscription = supabase
      .channel(`items_list_${id}`)
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

  useEffect(() => {
    if (items.length > 0) {
      updateTotals();
    }
  }, [items]);

  const handleAddItem = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || !id || !newItem.name) return;

    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .insert({
          name: newItem.name.trim(),
          category: newItem.category,
          quantity: newItem.quantity,
          unit: newItem.unit,
          estimated_price: newItem.price || 0,
          list_id: id,
          user_id: user.id,
          is_checked: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success(`${newItem.name} adicionado!`);
      setNewItem({ name: '', category: 'Alimentação', quantity: 1, unit: 'un', price: 0 });
      setShowAddModal(false);
      
      // Optimistic upate
      if (data) setItems(prev => [...prev, data]);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao adicionar item');
    }
  };

  const handleNameChange = (val: string) => {
    setNewItem({ ...newItem, name: val });
    const suggs = getSuggestions(val);
    setSuggestions(suggs);
    setShowSuggestions(suggs.length > 0);

    // Smart parsing preview
    if (val.length > 4) {
      const parsed = parseSmartInput(val);
      if (parsed.name !== val) {
        // Maybe highlight or auto-fill other fields
        setNewItem(prev => ({
          ...prev,
          name: val,
          quantity: parsed.quantity || prev.quantity,
          unit: parsed.unit || prev.unit,
          category: parsed.category !== 'Outros' ? parsed.category : prev.category
        }));
      }
    }
  };

  const applySmartParse = () => {
    const parsed = parseSmartInput(newItem.name);
    setNewItem({
      ...newItem,
      name: parsed.name,
      quantity: parsed.quantity,
      unit: parsed.unit,
      category: parsed.category !== 'Outros' ? parsed.category : newItem.category
    });
    setShowSuggestions(false);
    toast.success('IA: Formato ajustado!');
  };

  const toggleCheck = async (itemId: string, checked: boolean) => {
    // Optimistic update
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_checked: !checked } : i));

    const { error } = await supabase
      .from('shopping_items')
      .update({ is_checked: !checked })
      .eq('id', itemId);
    
    if (error) {
      console.error(error);
      fetchItems(); // Rollback if error
    } else if (!checked) {
      toast.success('Item marcado!', { icon: '✅' });
    }
  };

  const deleteItem = async (itemId: string) => {
    if (confirm('Remover item?')) {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', itemId);
      
      if (error) console.error(error);
    }
  };

  const updateTotals = async () => {
    if (!id || !user) return;
    const estimated = items.reduce((acc, item) => acc + (Number(item.estimated_price) || 0) * (Number(item.quantity) || 1), 0);
    const real = items.filter(i => i.is_checked).reduce((acc, item) => acc + (Number(item.paid_price) || Number(item.estimated_price) || 0) * (Number(item.quantity) || 1), 0);
    
    // Only update list if values changed significantly or to ensure sync
    const { error } = await supabase
      .from('shopping_lists')
      .update({ 
        estimated_total: estimated, 
        real_total: real 
      })
      .eq('id', id);
    
    if (error) console.error('Error updating totals:', error);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        const result = await scanProductImage(base64);
        trackEvent(AnalyticsEvent.PRODUCT_SCAN, { source: 'camera' });
        setNewItem({
          name: result.product_name,
          category: result.category || 'Alimentação',
          quantity: result.quantity || 1,
          unit: result.unit || 'un',
          price: result.promo_price || result.normal_price || 0
        });
        setShowAddModal(true);
      } catch (err) {
        alert('Erro ao escanear com IA. Tente novamente.');
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const finishedItems = items.filter(i => i.is_checked).length;
  const progress = items.length > 0 ? (finishedItems / items.length) * 100 : 0;

  const groupedItems = categories.reduce((acc, cat) => {
    const filtered = items.filter(i => i.category === cat && i.name.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-8 sticky top-0 bg-[#F0F4F2]/80 backdrop-blur-md pt-4 z-40 -mx-6 px-6 pb-6 border-b-2 border-slate-100">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/listas')} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm border-2 border-slate-50">
            <ArrowLeft size={24} strokeWidth={3} />
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/mercado/${id}`)}
              className="px-6 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-200 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={16} fill="white" strokeWidth={3} />
              MODO MERCADO
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-4">
              <div className="w-3 h-10 bg-primary rounded-full"></div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">{list?.name}</h2>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-7 italic">{list?.market_name || 'Supermercado'}</p>
        </div>

        <div className="flex flex-col gap-3">
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              <span>{finishedItems} / {items.length} itens</span>
              <span className="text-primary italic">{Math.round(progress)}% Concluído</span>
           </div>
           <div className="h-4 bg-white/50 border-2 border-white rounded-full overflow-hidden p-0.5">
              <motion.div 
                className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
           </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="bold-card p-2 flex items-center gap-4">
        <div className="pl-6 text-slate-300">
           <Search size={22} strokeWidth={3} />
        </div>
        <input 
          type="text" 
          placeholder="Pesquisar na lista..." 
          className="flex-1 bg-transparent border-none outline-none p-4 text-slate-700 font-bold text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Items List */}
      <div className="flex flex-col gap-10">
        {loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 rounded-[32px]" />
            <Skeleton className="h-24 rounded-[32px]" />
            <Skeleton className="h-24 rounded-[32px]" />
          </div>
        ) : Object.keys(groupedItems).length === 0 ? (
          <div className="py-24">
            <Card className="text-center text-slate-300 flex flex-col items-center gap-6 border-4 border-dashed border-slate-100 rounded-[60px] shadow-none bg-transparent" hover={false}>
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center">
                  <Plus size={48} className="opacity-20" strokeWidth={3} />
              </div>
              <div className="flex flex-col gap-2">
                  <p className="font-black text-2xl uppercase tracking-tight text-slate-400">Lista Silenciosa</p>
                  <p className="font-bold">O que vamos comprar hoje?</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <Button 
                    onClick={() => setShowAddModal(true)} 
                    className="!py-4 !px-10"
                  >
                    DIGITAR ITEM
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()} 
                    className="!py-4 !px-10"
                  >
                    ESCANEAR IA
                  </Button>
              </div>
            </Card>
          </div>
        ) : (
          categories.map(cat => groupedItems[cat] ? (
            <div key={cat} className="flex flex-col gap-6">
               <div className="flex items-center gap-3">
                  <div className="w-6 h-1 bg-slate-200 rounded-full"></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 leading-none">{cat}</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedItems[cat].map(item => (
                    <ItemRow 
                      key={item.id} 
                      item={item} 
                      onToggle={toggleCheck} 
                      onDelete={deleteItem} 
                    />
                  ))}
               </div>
            </div>
          ) : null)
        )}
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-20" />

      {/* Floating Actions */}
      <div className="fixed bottom-28 right-8 flex flex-col gap-4 z-40">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
             "w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center shadow-2xl transition-all active:scale-90 hover:rotate-12",
             scanning && "animate-spin"
           )}
          disabled={scanning}
        >
          <Camera size={28} strokeWidth={3} />
        </button>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-20 h-20 bg-primary text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-emerald-400/50 transition-all active:scale-90 hover:-rotate-12"
        >
          <Plus size={40} strokeWidth={4} />
        </button>
      </div>

      {/* Add Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="Novo Item"
      >
          <form onSubmit={handleAddItem} className="flex flex-col gap-8">
              <div className="flex flex-col gap-2 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Produto</label>
                <div className="flex flex-col gap-1">
                  <input 
                    type="text" 
                    placeholder="Ex: Arroz Tio João ou 2 leite" 
                    className="bold-input"
                    value={newItem.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => {
                      if (newItem.name.match(/\d/)) applySmartParse();
                    }}
                    autoFocus
                    required
                  />
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-white border-2 border-slate-100 rounded-2xl p-2 flex flex-wrap gap-2 shadow-xl absolute top-full left-0 right-0 z-50 mt-2"
                      >
                        {suggestions.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setNewItem({...newItem, name: s});
                              setShowSuggestions(false);
                            }}
                            className="px-4 py-2 bg-slate-50 hover:bg-primary hover:text-white rounded-xl text-xs font-black uppercase transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Qtd</label>
                    <input 
                    type="number" 
                    className="bold-input"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                    min={1}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Unidade</label>
                    <select 
                    className="bold-input appearance-none"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    >
                      <option value="un">Unidade</option>
                      <option value="kg">Quilo (kg)</option>
                      <option value="g">Grama (g)</option>
                      <option value="l">Litro (l)</option>
                      <option value="ml">Mililitro (ml)</option>
                      <option value="caixa">Caixa</option>
                      <option value="pacote">Pacote</option>
                    </select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Categoria</label>
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewItem({...newItem, category: cat})}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                          newItem.category === cat 
                            ? "bg-primary border-primary text-white shadow-lg shadow-emerald-100" 
                            : "bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-100"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-6"
                >
                  CANCELAR
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 py-6"
                >
                  ADICIONAR
                </Button>
              </div>
          </form>
      </Modal>
    </div>
  );
}

interface ItemRowProps {
  item: any;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, onToggle, onDelete }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="h-full"
  >
    <Card 
      className={cn(
        "p-6 flex flex-col gap-4 group transition-all h-full relative overflow-hidden",
        item.is_checked ? "bg-emerald-50/30 border-emerald-100" : "hover:border-primary/50"
      )}
    >
      {item.is_checked && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-emerald-500/5 pointer-events-none"
        />
      )}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <button 
          onClick={() => onToggle(item.id, item.is_checked)}
          className={cn(
            "w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all flex-shrink-0 group/check",
            item.is_checked 
              ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
              : "border-slate-100 bg-slate-50 text-transparent hover:border-primary/30"
          )}
        >
          <Check size={20} className={cn("transition-transform", item.is_checked ? "scale-100" : "scale-0 group-hover/check:scale-75 group-hover/check:text-primary/30")} strokeWidth={4} />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className={cn("text-xl font-black text-slate-800 leading-tight group-hover:text-primary transition-colors", item.is_checked && "line-through italic text-slate-400")}>{item.name}</h4>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1 italic">{item.category}</p>
        </div>
        <button 
          onClick={() => onDelete(item.id)}
          className="text-slate-200 hover:text-red-500 transition-colors p-2 -mr-2 opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={20} strokeWidth={3} />
        </button>
      </div>
      
      <div className="flex items-center justify-between mt-2 pt-4 border-t-2 border-slate-50 relative z-10">
        <div className="flex items-center gap-2">
            <span className="font-black text-slate-900">{item.quantity}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.unit === 'un' ? 'Un' : item.unit}</span>
        </div>
        {(Number(item.estimated_price) > 0 || Number(item.paid_price) > 0) && (
          <div className="text-right">
              <span className="font-black text-primary italic leading-none">{formatCurrency(item.paid_price || item.estimated_price)}</span>
          </div>
        )}
      </div>
    </Card>
  </motion.div>
);
