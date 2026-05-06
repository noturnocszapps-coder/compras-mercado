import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Package, MoreVertical, Plus, Trash2, Calendar, Target, AlertTriangle } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Inventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'Alimentação', currentQuantity: 0, minimumQuantity: 1, unit: 'un', expirationDate: '' });

  const categories = [
    'Alimentação', 'Carnes e Mistura', 'Hortifruti', 'Bebidas', 'Padaria', 
    'Higiene Pessoal', 'Limpeza', 'Pet', 'Bebê', 'Farmácia', 'Cuidados', 'Outros'
  ];

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'home_inventory'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newItem.name) return;
    try {
      await addDoc(collection(db, 'home_inventory'), {
        ...newItem,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setShowModal(false);
      setNewItem({ name: '', category: 'Alimentação', currentQuantity: 0, minimumQuantity: 1, unit: 'un', expirationDate: '' });
    } catch (err) { console.error(err); }
  };

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 0) return;
    await updateDoc(doc(db, 'home_inventory', id), { currentQuantity: newQty });
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
             Array(3).fill(0).map((_, i) => <div key={i} className="h-60 bg-white/50 animate-pulse rounded-[40px] border-2 border-white" />)
        ) : items.length === 0 ? (
          <div className="col-span-full py-32 text-center flex flex-col items-center gap-6 border-4 border-dashed border-slate-100 rounded-[60px]">
             <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-100">
                <Package size={64} strokeWidth={3} />
             </div>
             <div className="flex flex-col gap-2">
                <p className="font-black text-2xl uppercase tracking-tighter text-slate-400">Despensa Silenciosa</p>
                <p className="text-slate-400 font-bold italic">Seu estoque aguarda novos suprimentos.</p>
             </div>
             <button onClick={() => setShowModal(true)} className="bold-button-primary !px-12 !py-4">ADICIONAR PRIMEIRO ITEM</button>
          </div>
        ) : (
          items.map(item => {
             const isLow = item.currentQuantity <= item.minimumQuantity;
             return (
               <div key={item.id} className={cn(
                 "bold-card p-8 flex flex-col gap-6 relative overflow-hidden group transition-all",
                 isLow ? "border-amber-400 bg-amber-50/30" : "hover:border-primary/50"
               )}>
                  {isLow && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-400"></div>
                  )}
                  
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic mb-1">{item.category}</p>
                        <h4 className="text-2xl font-black text-slate-900 leading-tight uppercase group-hover:text-primary transition-colors">{item.name}</h4>
                     </div>
                     {isLow && (
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center animate-pulse">
                           <AlertTriangle size={24} strokeWidth={3} />
                        </div>
                     )}
                  </div>
                  
                  <div className="flex items-center justify-between bg-white border-2 border-slate-100 rounded-[28px] p-2 pr-6">
                     <div className="flex gap-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.currentQuantity - 1)}
                          className="w-14 h-14 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-[20px] flex items-center justify-center font-black text-2xl transition-all active:scale-90"
                        >
                           -
                        </button>
                        <button 
                          onClick={() => updateQuantity(item.id, item.currentQuantity + 1)}
                          className="w-14 h-14 bg-primary text-white rounded-[20px] flex items-center justify-center font-black text-2xl transition-all shadow-lg shadow-emerald-100 active:scale-90"
                        >
                           +
                        </button>
                     </div>
                     <div className="text-right">
                        <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{item.currentQuantity}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{item.unit}</p>
                     </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Min: {item.minimumQuantity} {item.unit}</span>
                     </div>
                     {item.expirationDate && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                           <Calendar size={12} className="text-slate-400" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{formatDate(item.expirationDate)}</span>
                        </div>
                     )}
                  </div>
               </div>
             );
          })
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{scale:0.9, opacity: 0}} 
               animate={{scale:1, opacity: 1}} 
               className="bg-white w-full max-w-lg rounded-[50px] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-3 bg-primary"></div>
                
                <div className="flex flex-col gap-1">
                   <h3 className="text-4xl font-black uppercase tracking-tighter">Novo Item</h3>
                   <p className="text-slate-400 font-bold italic">Abasteça sua despensa inteligente.</p>
                </div>

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
                            value={newItem.currentQuantity}
                            onChange={e => setNewItem({...newItem, currentQuantity: Number(e.target.value)})}
                         />
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Mínimo</label>
                         <input 
                            type="number" 
                            placeholder="1" 
                            className="bold-input" 
                            value={newItem.minimumQuantity}
                            onChange={e => setNewItem({...newItem, minimumQuantity: Number(e.target.value)})}
                         />
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                     <button 
                       type="button" 
                       onClick={() => setShowModal(false)} 
                       className="bold-button-secondary flex-1 py-6 font-black"
                     >
                        CANCELAR
                     </button>
                     <button 
                        type="submit" 
                        className="bold-button-primary flex-1 py-6 font-black uppercase"
                     >
                        SALVAR ITEM
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
