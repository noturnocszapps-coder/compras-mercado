import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import VoiceAssistant from '../components/VoiceAssistant';
import { ArrowLeft, Check, Camera, Mic, X, Save, ShoppingBag } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

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
      const item = items.find(i => i.name.toLowerCase().includes(action.data.name.toLowerCase()));
      if (item) {
        await updateDoc(doc(db, 'shopping_items', item.id), { 
           isChecked: true, 
           paidPrice: action.data.paidPrice || item.price || 0 
        });
      }
    }
  };

  const categories = [
    'Alimentação', 'Carnes e Mistura', 'Hortifruti', 'Bebidas', 'Padaria', 
    'Higiene Pessoal', 'Limpeza', 'Pet', 'Bebê', 'Farmácia', 'Cuidados', 'Outros'
  ];

  useEffect(() => {
    if (!user || !id) return;

    const unsubList = onSnapshot(doc(db, 'shopping_lists', id), (doc) => {
      setList({ id: doc.id, ...doc.data() });
    });

    const qItems = query(
      collection(db, 'shopping_items'),
      where('listId', '==', id),
      where('userId', '==', user.uid)
    );

    const unsubItems = onSnapshot(qItems, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubList();
      unsubItems();
    };
  }, [user, id]);

  const toggleCheck = async (itemId: string, checked: boolean) => {
     // If checking, maybe open price input if not set? 
     // For now, just toggle
    await updateDoc(doc(db, 'shopping_items', itemId), { isChecked: !checked });
    updateTotals();
  };

  const savePrice = async (itemId: string) => {
    const price = parseFloat(tempPrice.replace(',', '.'));
    if (!isNaN(price)) {
      await updateDoc(doc(db, 'shopping_items', itemId), { paidPrice: price, isChecked: true });
      setEditingPrice(null);
      setTempPrice('');
      updateTotals();
    }
  };

  const updateTotals = async () => {
    if (!id || !user) return;
    const realTotal = items.reduce((acc, item) => (item.isChecked ? acc + (item.paidPrice || item.price || 0) * (item.quantity || 1) : acc), 0);
    await updateDoc(doc(db, 'shopping_lists', id), { realTotal });
  };

  const finishShopping = async () => {
    if (confirm('Deseja finalizar esta compra?')) {
      await updateDoc(doc(db, 'shopping_lists', id!), { 
        status: 'finished', 
        finishedAt: new Date().toISOString() 
      });
      navigate('/dashboard');
    }
  };

  const finishedItems = items.filter(i => i.isChecked).length;
  const progress = items.length > 0 ? (finishedItems / items.length) * 100 : 0;
  const totalGasto = items.reduce((acc, item) => (item.isChecked ? acc + (item.paidPrice || item.price || 0) * (item.quantity || 1) : acc), 0);

  return (
    <div className="flex flex-col gap-8 -mx-6 px-6 bg-[#F0F4F2] min-h-screen">
      <VoiceAssistant 
        isOpen={isVoiceAssistantOpen} 
        onClose={closeVoiceAssistant} 
        onAction={handleVoiceAction} 
      />
      {/* Header Fixo */}
      <div className="sticky top-0 bg-primary-dark/95 backdrop-blur-md z-40 -mx-6 px-6 py-6 md:py-10 flex flex-col gap-6 md:gap-10 border-b-4 border-primary">
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
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Itens Adquiridos</p>
                    <p className="text-2xl font-black text-white italic">{finishedItems} <span className="text-sm not-italic text-white/30 lowercase">de</span> {items.length}</p>
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
                     <div 
                       key={item.id} 
                       className={cn(
                          "bold-card p-6 flex items-center gap-6 cursor-pointer active:scale-95 transition-all",
                          item.isChecked ? "border-primary bg-emerald-50 shadow-inner" : "hover:border-slate-200"
                       )}
                       onClick={() => toggleCheck(item.id, item.isChecked)}
                     >
                        <div className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all flex-shrink-0",
                          item.isChecked ? "bg-primary border-primary text-white" : "bg-slate-50 border-slate-100 text-transparent"
                        )}>
                           <Check size={32} strokeWidth={4} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className={cn("text-2xl font-black tracking-tight leading-tight uppercase italic", item.isChecked && "text-primary")}>{item.name}</h4>
                           <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{item.quantity} {item.unit}</span>
                              {item.isChecked && (
                                <span className="text-primary font-black italic">{formatCurrency(item.paidPrice || item.price || 0)}</span>
                              )}
                           </div>
                        </div>
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             setEditingPrice(item.id);
                             setTempPrice(item.paidPrice?.toString() || item.price?.toString() || '');
                          }}
                          className={cn(
                             "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                             item.isChecked ? "bg-primary/10 text-primary" : "bg-slate-50 text-slate-300"
                          )}
                        >
                           <ShoppingBag size={24} strokeWidth={3} />
                        </button>
                     </div>
                   ))}
                </div>
             </div>
           );
        })}
      </div>

      {/* Price Modal */}
      <AnimatePresence>
        {editingPrice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ scale: 0.9, y: 50, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.9, y: 50, opacity: 0 }}
               className="bg-white w-full max-w-lg rounded-[60px] p-12 shadow-2xl flex flex-col gap-8 relative overflow-hidden text-center"
             >
                <div className="absolute top-0 left-0 w-full h-3 bg-primary"></div>
                
                <div className="flex flex-col gap-2">
                   <h3 className="text-4xl font-black uppercase tracking-tighter">Valor Pago</h3>
                   <p className="text-slate-400 font-bold italic">Confirme o preço para sua economia semanal.</p>
                </div>
                
                <div className="relative">
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
                   <button 
                      onClick={() => setEditingPrice(null)}
                      className="bold-button-secondary !py-6"
                   >
                      CANCELAR
                   </button>
                   <button 
                      onClick={() => savePrice(editingPrice)}
                      className="bold-button-primary !py-6 !text-xl"
                   >
                      SALVAR VALOR
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ações Rápidas Mercado */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40">
         <button 
           onClick={openVoiceAssistant}
           className="w-20 h-20 bg-primary text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-emerald-400/50 hover:scale-110 active:scale-90 transition-all rotate-3 hover:rotate-0"
         >
            <Mic size={32} strokeWidth={4} />
         </button>
         <button className="w-20 h-20 bg-blue-600 text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-400/50 hover:scale-110 active:scale-90 transition-all -rotate-3 hover:rotate-0">
            <Camera size={32} strokeWidth={4} />
         </button>
      </div>
    </div>
  );
}
