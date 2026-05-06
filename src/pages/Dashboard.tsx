import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ChevronRight, TrendingUp, Package, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeLists, setActiveLists] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [inventoryStats, setInventoryStats] = useState({ total: 0, low: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Active Lists
    const qActive = query(
      collection(db, 'shopping_lists'),
      where('userId', '==', user.uid),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubscribeLists = onSnapshot(qActive, (snapshot) => {
      setActiveLists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // History (last 5 finished)
    const qHistory = query(
      collection(db, 'shopping_lists'),
      where('userId', '==', user.uid),
      where('status', '==', 'finished'),
      orderBy('finishedAt', 'desc'),
      limit(5)
    );

    getDocs(qHistory).then(snapshot => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Inventory
    const qInv = query(collection(db, 'home_inventory'), where('userId', '==', user.uid));
    getDocs(qInv).then(snapshot => {
      const items = snapshot.docs.map(doc => doc.data());
      setInventoryStats({
        total: items.length,
        low: items.filter(i => (i.currentQuantity || 0) <= (i.minimumQuantity || 0)).length
      });
    });

    return () => unsubscribeLists();
  }, [user]);

  const chartData = history.slice().reverse().map(list => ({
    name: list.name.length > 8 ? list.name.substring(0, 8) + '...' : list.name,
    gasto: list.realTotal || 0,
    previsto: list.estimatedTotal || 0
  }));

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-gray-900">Bom dia! ☀️</h2>
        <p className="text-gray-500">O que vamos comprar hoje?</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="Total este mês" 
          value={formatCurrency(history.reduce((acc, l) => acc + (l.realTotal || 0), 0))} 
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          icon={ShoppingBag} 
          label="Listas Ativas" 
          value={activeLists.length.toString()} 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          icon={Package} 
          label="Estoque Baixo" 
          value={inventoryStats.low.toString()} 
          color="bg-amber-50 text-amber-600"
        />
        <StatCard 
          icon={Clock} 
          label="Última Compra" 
          value={history[0] ? formatDate(history[0].finishedAt) : '--'} 
          color="bg-slate-100 text-slate-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Lists Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h3 className="text-2xl font-black">Listas Ativas</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {activeLists.length === 0 && !loading ? (
              <div className="p-12 bg-white rounded-[32px] border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                <ShoppingBag size={48} className="text-slate-200" />
                <p className="text-slate-400 font-bold">Nenhuma lista ativa no momento</p>
                <Link to="/listas" className="bg-primary text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all">
                  Nova Lista
                </Link>
              </div>
            ) : (
              activeLists.map(list => (
                <Link 
                  key={list.id} 
                  to={`/listas/${list.id}`}
                  className="bold-card p-6 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                      <ShoppingBag size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{list.name}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{list.marketName || 'Mercado Geral'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">{formatCurrency(list.estimatedTotal || 0)}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Estimado</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Chart Section */}
        <section className="bold-card p-8 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
            <h3 className="text-2xl font-black">Gastos Recentes</h3>
          </div>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    itemStyle={{ fontWeight: '900', color: '#0f172a' }}
                    formatter={(val: number) => [formatCurrency(val), "Gasto"]}
                  />
                  <Bar dataKey="gasto" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#059669' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300 font-bold italic">
                Finalize compras para ver seus dados
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <Link 
        to="/listas" 
        className="fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-[20px] flex items-center justify-center shadow-2xl shadow-emerald-400 z-40 transition-transform active:scale-90 md:hidden"
      >
        <Plus size={32} strokeWidth={3} />
      </Link>
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
  <div className="bold-card p-6 flex flex-col gap-4">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", color)}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);
