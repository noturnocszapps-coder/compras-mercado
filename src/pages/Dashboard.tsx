import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ChevronRight, TrendingUp, Package, Clock, Plus, Sparkles, ShieldCheck, Zap } from 'lucide-react';
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

    // Fetch Active Lists
    const fetchActiveLists = async () => {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) console.error('Error fetching active lists:', error);
      else setActiveLists(data || []);
      setLoading(false);
    };

    // Fetch History
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'finished')
        .order('finished_at', { ascending: false })
        .limit(5);
      
      if (error) console.error('Error fetching history:', error);
      else setHistory(data || []);
    };

    // Fetch Inventory
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from('home_inventory')
        .select('current_quantity, minimum_quantity')
        .eq('user_id', user.id);
      
      if (error) console.error('Error fetching inventory:', error);
      else {
        setInventoryStats({
          total: data.length,
          low: data.filter(i => (i.current_quantity || 0) <= (i.minimum_quantity || 0)).length
        });
      }
    };

    fetchActiveLists();
    fetchHistory();
    fetchInventory();

    // Set up real-time subscription for active lists
    const listsSubscription = supabase
      .channel('public:shopping_lists')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'shopping_lists',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchActiveLists();
        fetchHistory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(listsSubscription);
    };
  }, [user]);

  const chartData = history.slice().reverse().map(list => ({
    name: list.name.length > 8 ? list.name.substring(0, 8) + '...' : list.name,
    gasto: list.real_total || 0,
    previsto: list.estimated_total || 0
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
          value={formatCurrency(history.reduce((acc, l) => acc + (Number(l.real_total) || 0), 0))} 
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
          value={history[0] ? formatDate(history[0].finished_at) : '--'} 
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
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{list.market_name || 'Mercado Geral'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">{formatCurrency(list.estimated_total || 0)}</p>
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

        {/* AI Suggestions Section */}
        <section className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                <h3 className="text-2xl font-black">Inteligência de Recompra</h3>
             </div>
             <div className="text-[10px] font-black uppercase text-purple-400 tracking-widest bg-purple-50 px-3 py-1 rounded-full">Powered by Gemini</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-8 rounded-[40px] border-2 border-purple-50 flex flex-col gap-4 shadow-xl shadow-purple-900/5 relative overflow-hidden group">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                   <Sparkles size={24} />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 uppercase italic">Sugestão de Arroz</h4>
                   <p className="text-sm text-slate-400 font-medium italic">"Baseado no seu histórico, seu Arroz de 5kg deve acabar em 4 dias. Adicionar à próxima lista?"</p>
                </div>
                <button className="bold-button-primary !bg-purple-600 !text-[10px] !py-3 !px-6 !shadow-none self-start">ADICIONAR AGORA</button>
             </div>

             <div className="bg-white p-8 rounded-[40px] border-2 border-blue-50 flex flex-col gap-4 shadow-xl shadow-blue-900/5 relative overflow-hidden group">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 uppercase italic">Economia Detectada</h4>
                   <p className="text-sm text-slate-400 font-medium italic">"Detergente Ypê está com 15% de desconto no mercado que você frequenta. Aproveite para estocar!"</p>
                </div>
                <button className="bold-button-primary !bg-blue-600 !text-[10px] !py-3 !px-6 !shadow-none self-start">VER OFERTA</button>
             </div>

             <div className="bg-white p-8 rounded-[40px] border-2 border-emerald-50 flex flex-col gap-4 shadow-xl shadow-emerald-900/5 relative overflow-hidden group">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                   <Zap size={24} strokeWidth={3} />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 uppercase italic">Hábito de Segunda</h4>
                   <p className="text-sm text-slate-400 font-medium italic">"Toda segunda você compra pão e leite. Quer que eu crie a lista automática de amanhã?"</p>
                </div>
                <button className="bold-button-primary !bg-emerald-600 !text-[10px] !py-3 !px-6 !shadow-none self-start">CRIAR LISTA</button>
             </div>
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
